import { Storage } from '@google-cloud/storage'
import * as Prisma from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import { fromBuffer } from 'file-type'
import { config } from '../config'
import { prisma } from '../prisma'
import { randomToken } from '../utils/crypto'

const STORAGE_METHOD = 'PUT'
const STORAGE_HEADERS: Record<string, string> = {}

const client = new Storage({
  credentials: config.storage.credentials,
})

const uploadBucket = client.bucket(config.storage.uploadBucket)
const dataBucket = client.bucket(config.storage.dataBucket)

const cors = [
  {
    origin: ['*'],
    maxAgeSeconds: 3600,
    responseHeader: ['*'],
    method: ['GET', 'PUT'],
  },
]

uploadBucket.setCorsConfiguration(cors)
dataBucket.setCorsConfiguration(cors)

export function getStorageTempBlobName(userId: string) {
  return ['temp', 'users', userId, randomToken()].join('/')
}

export function getStorageBlobName(...paths: string[]) {
  return ['uploads', ...paths, randomToken()].join('/')
}

export async function storagePrepareForUpload(blobName: string) {
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

export async function storageSaveMedia(media: Prisma.Media) {
  const { data } = (await axios.get(media.url, { responseType: 'arraybuffer' })) as AxiosResponse<ArrayBuffer>
  const type = await fromBuffer(data)

  const ext = type?.ext ? '.' + type.ext : ''
  const mime = type?.mime ?? 'application/octet-stream'

  const blobName = getStorageBlobName(media.id)

  const [blob] = await dataBucket.upload(blobName + ext, {
    contentType: mime,
  })

  await prisma.media.update({
    where: { id: media.id },
    data: { blobName: blob.name },
  })

  return { data, blob }
}
