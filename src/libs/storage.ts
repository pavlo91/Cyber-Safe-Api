import { BlobSASPermissions, BlobServiceClient } from '@azure/storage-blob'
import { fromBuffer } from 'file-type'

import ms from 'ms'
import { Config } from '../config'
import { Logger } from '../utils/logger'

const STORAGE_TEMP = 'temp'
const STORAGE_UPLOAD = 'upload'
const STORAGE_METHOD = 'PUT'
const STORAGE_HEADERS = [
  {
    key: 'x-ms-blob-type',
    value: 'BlockBlob',
  },
]

const StorageError = new Error('Error while uploading to storage')

export class Storage {
  static shared = new Storage(Config.storage.connectionString!)

  private logger = Logger.label('storage')
  private client: BlobServiceClient

  constructor(connectionString: string) {
    this.client = BlobServiceClient.fromConnectionString(connectionString)
  }

  async prepareForUpload(blobName: string) {
    try {
      const container = this.client.getContainerClient(STORAGE_TEMP)
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
      this.logger.error('Error while preparing for upload: %s', error)
      throw StorageError
    }
  }

  async saveUpload(blobName: string) {
    try {
      const tempContainer = this.client.getContainerClient(STORAGE_TEMP)
      const tempBlob = tempContainer.getBlockBlobClient(blobName)

      const buffer = await tempBlob.downloadToBuffer(0, 40)
      const type = await fromBuffer(buffer)

      const ext = type?.ext ? '.' + type.ext : ''
      const mime = type?.mime ?? 'application/octet-stream'

      const container = this.client.getContainerClient(STORAGE_UPLOAD)
      await container.createIfNotExists({ access: 'blob' })

      const blob = container.getBlockBlobClient(blobName + ext)

      await blob.syncCopyFromURL(tempBlob.url)
      await tempBlob.deleteIfExists()

      return {
        mime,
        url: blob.url,
      }
    } catch (error) {
      this.logger.error('Error while saving upload: %s', error)
      throw StorageError
    }
  }
}
