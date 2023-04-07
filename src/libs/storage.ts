import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as Prisma from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import { fromBuffer } from 'file-type'
import { Stream } from 'stream'
import { config } from '../config'
import { prisma } from '../prisma'
import { randomToken } from '../utils/crypto'

const STORAGE_METHOD = 'PUT'
const STORAGE_HEADERS: Record<string, string> = {}

const client = new S3Client({
  region: config.storage.region,
  credentials: {
    accessKeyId: config.storage.accessKey!,
    secretAccessKey: config.storage.secretKey!,
  },
})

export function getStorageTempBlobName(userId: string) {
  return ['temp', 'users', userId, randomToken()].join('/')
}

export function getStorageBlobName(...paths: string[]) {
  return ['uploads', ...paths, randomToken()].join('/')
}

export async function storagePrepareForUpload(blobName: string) {
  const command = new PutObjectCommand({
    Key: blobName,
    Bucket: config.storage.bucketUpload,
  })

  const url = await getSignedUrl(client, command, { expiresIn: 3600 })

  return {
    url,
    method: STORAGE_METHOD,
    headers: STORAGE_HEADERS,
  }
}

function getObjectURL(bucket: string, key: string) {
  return `http://s3.${config.storage.region}.amazonaws.com/${bucket}/${key}`
}

export async function storageGetTempUploadStream(blobName: string) {
  const blob = await client.send(
    new GetObjectCommand({
      Key: blobName,
      Bucket: config.storage.bucketUpload,
    })
  )

  const body = await blob.Body!.transformToByteArray()
  const buffer = Buffer.from(body)
  const stream = Stream.Readable.from(buffer)

  return { stream }
}

export async function storageSaveUpload(blobName: string, newBlobName: string) {
  const blob = await client.send(
    new GetObjectCommand({
      Key: blobName,
      Range: '0-40',
      Bucket: config.storage.bucketUpload,
    })
  )

  const body = await blob.Body!.transformToByteArray()
  const type = await fromBuffer(body)

  const ext = type?.ext ? '.' + type.ext : ''
  const mime = type?.mime ?? 'application/octet-stream'

  await client.send(
    new CopyObjectCommand({
      Key: newBlobName + ext,
      Bucket: config.storage.bucketUpload,
      CopySource: getObjectURL(config.storage.bucketUpload, blobName),
    })
  )

  await client.send(
    new DeleteObjectCommand({
      Key: blobName,
      Bucket: config.storage.bucketUpload,
    })
  )

  return {
    mime,
    url: getObjectURL(config.storage.bucketUpload, newBlobName + ext),
  }
}

export async function storageSaveMedia(media: Prisma.Media, post: Prisma.Post) {
  const { data } = (await axios.get(media.url, { responseType: 'arraybuffer' })) as AxiosResponse<Buffer>
  const type = await fromBuffer(data)

  const ext = type?.ext ? '.' + type.ext : ''
  const mime = type?.mime ?? 'application/octet-stream'

  const blobName = ['users', post.userId, 'posts', post.id, 'media', media.id].join('/')

  const blob = await client.send(
    new PutObjectCommand({
      Body: data,
      ContentType: mime,
      Key: blobName + ext,
      Bucket: config.storage.bucketMedia,
    })
  )

  await prisma.media.update({
    where: { id: media.id },
    data: { blobName: blobName + ext },
  })

  return { data, blob }
}

export async function storageSavePost(post: Prisma.Post) {
  const blobName = ['users', post.userId, 'posts', post.id + '.txt'].join('/')

  const blob = await client.send(
    new PutObjectCommand({
      Key: blobName,
      Body: post.text,
      ContentType: 'text/plain',
      Bucket: config.storage.bucketMedia,
    })
  )

  await prisma.post.update({
    where: { id: post.id },
    data: { blobName },
  })

  return { blob }
}

export async function storageSignMediaURL(blobName: string) {
  const command = new GetObjectCommand({
    Key: blobName,
    Bucket: config.storage.bucketMedia,
  })

  return await getSignedUrl(client, command, { expiresIn: 3600 })
}
