import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import axios, { AxiosResponse } from 'axios'
import { format } from 'date-fns'
import { Stream } from 'stream'
import config from '../config'
import { randomToken } from '../utils/crypto'

async function fileTypeFromBuffer(buffer: Uint8Array | ArrayBuffer) {
  const fileType = await (eval('import("file-type")') as Promise<typeof import('file-type')>)
  return await fileType.fileTypeFromBuffer(buffer)
}

type Container = 'public' | 'private'

class AmazonStorage {
  private client: S3Client

  constructor(
    private config: {
      region: string
      accessKey: string
      secretKey: string
      publicBucket: string
      privateBucket: string
    }
  ) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey!,
        secretAccessKey: config.secretKey!,
      },
    })
  }

  getRandomBlobName(...paths: string[]) {
    return [...paths, randomToken()].join('/')
  }

  getBlobURL(container: string, blob: string) {
    return `http://s3.${this.config.region}.amazonaws.com/${container}/${blob}`
  }

  parseBlobURL(blobURL: string) {
    const url = new URL(blobURL)
    const [container, ...blobComponents] = url.pathname.substring(1).split('/')
    const blob = blobComponents.join('/')

    return { container, blob }
  }

  async signUploadURL() {
    const blob = this.getRandomBlobName('temp', format(new Date(), 'YYYY-MM-DD'))

    const command = new PutObjectCommand({
      Key: blob,
      Bucket: this.config.privateBucket,
    })

    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 })

    return {
      url,
      method: 'PUT',
      headers: {} as Record<string, string>,
      blobURL: this.getBlobURL(this.config.privateBucket, blob),
    }
  }

  async signDownloadURL(blobURL: string) {
    const { container, blob } = this.parseBlobURL(blobURL)

    const command = new GetObjectCommand({
      Key: blob,
      Bucket: container,
    })

    return await getSignedUrl(this.client, command, { expiresIn: 3600 })
  }

  async getStream(blobURL: string) {
    const { container, blob } = this.parseBlobURL(blobURL)

    const res = await this.client.send(
      new GetObjectCommand({
        Key: blob,
        Bucket: container,
      })
    )

    const body = await res.Body!.transformToByteArray()
    const buffer = Buffer.from(body)
    const stream = Stream.Readable.from(buffer)

    return stream
  }

  async moveBlob(blobURL: string, container: Container, blob: string) {
    const parsedBlobURL = this.parseBlobURL(blobURL)

    const bucket = container === 'public' ? this.config.publicBucket : this.config.privateBucket

    const req = await this.client.send(
      new GetObjectCommand({
        Range: '0-40',
        Bucket: bucket,
        Key: parsedBlobURL.blob,
      })
    )

    const body = await req.Body!.transformToByteArray()
    const type = await fileTypeFromBuffer(body)

    const ext = type?.ext ? '.' + type.ext : ''
    const mime = type?.mime ?? 'application/octet-stream'

    await this.client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: blob + ext,
        CopySource: blobURL,
      })
    )

    await this.client.send(
      new DeleteObjectCommand({
        Key: parsedBlobURL.blob,
        Bucket: parsedBlobURL.container,
      })
    )

    return {
      mime,
      blobURL: this.getBlobURL(bucket, blob + ext),
    }
  }

  async uploadFromURL(url: string, container: Container, blob: string) {
    const { data } = (await axios.get(url, { responseType: 'arraybuffer' })) as AxiosResponse<Buffer>
    const type = await fileTypeFromBuffer(data)

    const ext = type?.ext ? '.' + type.ext : ''
    const mime = type?.mime ?? 'application/octet-stream'

    const bucket = container === 'public' ? this.config.publicBucket : this.config.privateBucket

    await this.client.send(
      new PutObjectCommand({
        Body: data,
        Bucket: bucket,
        Key: blob + ext,
        ContentType: mime,
      })
    )

    return {
      mime,
      blobURL: this.getBlobURL(bucket, blob + ext),
    }
  }

  async uploadText(text: string, container: Container, blob: string) {
    const bucket = container === 'public' ? this.config.publicBucket : this.config.privateBucket

    await this.client.send(
      new PutObjectCommand({
        Body: text,
        Bucket: bucket,
        Key: blob + '.txt',
        ContentType: 'text/plain',
      })
    )

    return {
      mime: 'text/plain',
      blobURL: this.getBlobURL(bucket, blob + '.txt'),
    }
  }
}

const { region, accessKey, secretKey, publicBucket, privateBucket } = config.amazon.storage

const storage = new AmazonStorage({ region, accessKey: accessKey!, secretKey: secretKey!, publicBucket, privateBucket })

export default storage
