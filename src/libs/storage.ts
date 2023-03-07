import { BlobSASPermissions, BlobServiceClient } from '@azure/storage-blob'
import * as Prisma from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import { fromBuffer } from 'file-type'
import ms from 'ms'
import { config } from '../config'
import { prisma } from '../prisma'
import { randomToken } from '../utils/crypto'

const STORAGE_TEMP = 'temp'
const STORAGE_UPLOAD = 'uploads'
const STORAGE_MEDIA = 'media'
const STORAGE_METHOD = 'PUT'
const STORAGE_HEADERS: Record<string, string> = {
  'x-ms-blob-type': 'BlockBlob',
}

const StorageError = new Error('Error while uploading to storage')

const client = config.storage.connectionString
  ? BlobServiceClient.fromConnectionString(config.storage.connectionString)
  : undefined

export function getStorageTempBlobName(userId: string) {
  return ['users', userId, randomToken()].join('/')
}

export function getStorageBlobName(...paths: string[]) {
  return [...paths, randomToken()].join('/')
}

export async function storagePrepareForUpload(blobName: string) {
  try {
    if (!client) {
      throw new Error('Client was not initialized')
    }

    const container = client.getContainerClient(STORAGE_TEMP)
    await container.createIfNotExists()

    const blob = container.getBlockBlobClient(blobName)

    const url = await blob.generateSasUrl({
      permissions: BlobSASPermissions.parse('acrw'),
      expiresOn: new Date(Date.now() + ms('15 minutes')),
    })

    return {
      url,
      method: STORAGE_METHOD,
      headers: STORAGE_HEADERS,
    }
  } catch (error) {
    console.error(`Error while preparing for upload: ${error}`)
    throw StorageError
  }
}

export async function storageSaveUpload(blobName: string, newBlobName: string) {
  try {
    if (!client) {
      throw new Error('Client was not initialized')
    }

    const tempContainer = client.getContainerClient(STORAGE_TEMP)
    const tempBlob = tempContainer.getBlockBlobClient(blobName)

    const buffer = await tempBlob.downloadToBuffer(0, 40)
    const type = await fromBuffer(buffer)

    const ext = type?.ext ? '.' + type.ext : ''
    const mime = type?.mime ?? 'application/octet-stream'

    const container = client.getContainerClient(STORAGE_UPLOAD)
    await container.createIfNotExists({ access: 'blob' })

    const blob = container.getBlockBlobClient(newBlobName + ext)

    await blob.syncCopyFromURL(tempBlob.url)
    await tempBlob.deleteIfExists()

    return {
      mime,
      url: blob.url,
    }
  } catch (error) {
    console.error(`Error while saving upload: ${error}`)
    throw StorageError
  }
}

export async function storageSaveMedia(media: Prisma.Media) {
  try {
    if (!client) {
      throw new Error('Client was not initialized')
    }

    const container = client.getContainerClient(STORAGE_MEDIA)
    await container.createIfNotExists()

    const { data } = (await axios.get(media.url, { responseType: 'arraybuffer' })) as AxiosResponse<ArrayBuffer>
    const type = await fromBuffer(data)

    const ext = type?.ext ? '.' + type.ext : ''
    const mime = type?.mime ?? 'application/octet-stream'

    const blobName = getStorageBlobName(media.id)
    const blob = container.getBlockBlobClient(blobName + ext)

    await blob.uploadData(data, {
      blobHTTPHeaders: { blobContentType: mime },
    })

    await prisma.media.update({
      where: { id: media.id },
      data: { blobName: blob.name },
    })

    return { data, blob }
  } catch (error) {
    console.error(`Error while saving upload: ${error}`)
    throw StorageError
  }
}
