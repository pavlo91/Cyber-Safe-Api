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
import { fromBuffer } from 'file-type'
import { Stream } from 'stream'
import config from '../config'
import { randomToken } from '../utils/crypto'

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
    const [container, ...blobComponents] = url.pathname.split('/')
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

    const req = await this.client.send(
      new GetObjectCommand({
        Range: '0-40',
        Key: parsedBlobURL.blob,
        Bucket: container === 'public' ? this.config.publicBucket : this.config.privateBucket,
      })
    )

    const body = await req.Body!.transformToByteArray()
    const type = await fromBuffer(body)

    const ext = type?.ext ? '.' + type.ext : ''
    const mime = type?.mime ?? 'application/octet-stream'

    await this.client.send(
      new CopyObjectCommand({
        Key: blob + ext,
        Bucket: container,
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
      blobURL: this.getBlobURL(container, blob + ext),
    }
  }

  async uploadFromURL(url: string, container: Container, blob: string) {
    const { data } = (await axios.get(url, { responseType: 'arraybuffer' })) as AxiosResponse<Buffer>
    const type = await fromBuffer(data)

    const ext = type?.ext ? '.' + type.ext : ''
    const mime = type?.mime ?? 'application/octet-stream'

    await this.client.send(
      new PutObjectCommand({
        Body: data,
        Key: blob + ext,
        ContentType: mime,
        Bucket: container === 'public' ? this.config.publicBucket : this.config.privateBucket,
      })
    )

    return {
      mime,
      blobURL: this.getBlobURL(container, blob + ext),
    }
  }

  async uploadText(text: string, container: Container, blob: string) {
    await this.client.send(
      new PutObjectCommand({
        Body: text,
        Key: blob + '.txt',
        ContentType: 'text/plain',
        Bucket: container === 'public' ? this.config.publicBucket : this.config.privateBucket,
      })
    )

    return {
      mime: 'text/plain',
      blobURL: this.getBlobURL(container, blob + '.txt'),
    }
  }
}

const { region, accessKey, secretKey, publicBucket, privateBucket } = config.amazon.storage

const storage = new AmazonStorage({ region, accessKey: accessKey!, secretKey: secretKey!, publicBucket, privateBucket })

export default storage
