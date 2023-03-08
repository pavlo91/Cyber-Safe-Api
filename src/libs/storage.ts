import { Storage } from '@google-cloud/storage'
import * as Prisma from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import { fromBuffer } from 'file-type'
import { config } from '../config'
import { prisma } from '../prisma'
import { randomToken } from '../utils/crypto'

const STORAGE_METHOD = 'PUT'
const STORAGE_HEADERS: Record<string, string> = {}

const client = config.storage.credentials ? new Storage({ credentials: config.storage.credentials }) : undefined

const uploadBucket = config.storage.uploadBucket ? client?.bucket(config.storage.uploadBucket) : undefined
const dataBucket = config.storage.dataBucket ? client?.bucket(config.storage.dataBucket) : undefined

uploadBucket?.setCorsConfiguration([
  {
    origin: ['*'],
    maxAgeSeconds: 3600,
    responseHeader: ['*'],
    method: ['GET', 'PUT'],
  },
])

export function getStorageTempBlobName(userId: string) {
  return ['temp', 'users', userId, randomToken()].join('/')
}

export function getStorageBlobName(...paths: string[]) {
  return ['uploads', ...paths, randomToken()].join('/')
}

export async function storagePrepareForUpload(blobName: string) {
  if (!client || !uploadBucket) {
    throw new Error('Storage client not initialized')
  }

  const blob = uploadBucket.file(blobName)

  const [url] = await blob.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 30 * 60 * 1000,
  })

  return {
    url,
    method: STORAGE_METHOD,
    headers: STORAGE_HEADERS,
  }
}

export async function storageSaveUpload(blobName: string, newBlobName: string) {
  if (!client || !uploadBucket) {
    throw new Error('Storage client not initialized')
  }

  const blob = uploadBucket.file(blobName)

  const [buffer] = await blob.download({ start: 0, end: 40 })
  const type = await fromBuffer(buffer)

  const ext = type?.ext ? '.' + type.ext : ''
  const mime = type?.mime ?? 'application/octet-stream'

  const newBlob = uploadBucket.file(newBlobName + ext)

  await blob.move(newBlob)
  await newBlob.makePublic()

  return {
    mime,
    url: newBlob.publicUrl(),
  }
}

export async function storageSaveMedia(media: Prisma.Media, post: Prisma.Post) {
  if (!client || !dataBucket) {
    throw new Error('Storage client not initialized')
  }

  const { data } = (await axios.get(media.url, { responseType: 'arraybuffer' })) as AxiosResponse<ArrayBuffer>
  const type = await fromBuffer(data)

  const ext = type?.ext ? '.' + type.ext : ''
  const mime = type?.mime ?? 'application/octet-stream'

  const blobName = ['posts', post.id, 'media', media.id].join('/')
  const blob = dataBucket.file(blobName + ext)

  await blob.save(Buffer.from(data), {
    contentType: mime,
  })

  await prisma.media.update({
    where: { id: media.id },
    data: { blobName: blob.cloudStorageURI.toString() },
  })

  return { data, blob }
}
