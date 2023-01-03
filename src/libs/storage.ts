import azure from "azure-storage";
import path from "path";
import querystring from "querystring";
import fs from "fs";
import mime from "mime";
import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { FileUpload } from "graphql-upload";

import StoredFile, { MimeType } from "../entities/stored-file";

const blobService = config.storage.connectionString
  ? azure.createBlobService(config.storage.connectionString)
  : undefined;
const blobServiceInfo = ((config.storage.connectionString || "") as string)
  .split(";")
  .map(a => querystring.parse(a))
  .reduce((a, b) => ({ ...a, ...b }));

export function verifyMimeType(mimeType: string): MimeType {
  if (Object.values(MimeType).includes(mimeType as MimeType)) {
    return mimeType as MimeType;
  }

  throw new Error(`Unsupported MIME type "${mimeType}"`);
}

/**
 * Accepts a FileUpload promise from graphql-upload which allows
 * the frontend to easily upload files in a request
 */
export async function completeGraphqlUpload(upload: Promise<FileUpload>): Promise<StoredFile> {
  const output = await upload;

  return uploadFileFromStream(output.createReadStream(), verifyMimeType(output.mimetype), output.filename);
}

export function uploadFileFromPath(filePath: string): Promise<StoredFile> {
  const mimeType = mime.getType(path.extname(filePath));

  if (!mimeType) {
    throw new Error(`Unable to resolve MIME type from path "${filePath}"`);
  }

  return uploadFileFromStream(fs.createReadStream(filePath), verifyMimeType(mimeType), path.basename(filePath));
}

/**
 * Returns a URL endpoint that a file can be uploaded to via a PUT request
 */
export function generateSignedUploadUrl(name: string, expiry?: Date): { signedUrl: string; publicUrl: string } {
  if (!blobService) {
    throw new Error("Azure service not initialized");
  }

  const startDate = new Date();
  const endDate = expiry || new Date(new Date().getTime() + 1000 * 60 * 60); // Expires in 1-hour if none specified

  const signedUrl = blobService.getUrl(
    config.storage.container,
    name,
    blobService.generateSharedAccessSignature(config.storage.container, name, {
      AccessPolicy: {
        Permissions: azure.BlobUtilities.SharedAccessPermissions.WRITE,
        Start: startDate,
        Expiry: endDate
      }
    })
  );

  const publicUrl = `${blobServiceInfo.DefaultEndpointsProtocol}://${blobServiceInfo.AccountName}.blob.${blobServiceInfo.EndpointSuffix}/${config.storage.container}/${name}`;

  return { signedUrl, publicUrl };
}

/**
 * Accepts a stream and some file information and returns a StoredFile instance with a
 * URL pointing to a completely uploaded file. File will need to be saved to DB by caller.
 */
export async function uploadFileFromStream(
  stream: Readable,
  mimeType: MimeType,
  filename: string
): Promise<StoredFile> {
  if (!blobService) {
    throw new Error("Azure service not initialized");
  }

  const filePath = `${uuidv4()}${path.extname(filename)}`;
  const finalPath = `${blobServiceInfo.DefaultEndpointsProtocol}://${blobServiceInfo.AccountName}.blob.${blobServiceInfo.EndpointSuffix}/${filePath}`;

  return new Promise<StoredFile>((resolve, reject) => {
    blobService.createContainerIfNotExists(config.storage.container, () => {
      blobService.createBlockBlobFromStream(config.storage.container, filePath, stream, stream.readableLength, err => {
        if (err) {
          return reject(err);
        }

        const file = new StoredFile();
        file.originalName = filename;
        file.mimeType = mimeType;
        file.url = finalPath;

        resolve(file);
      });
    });
  });
}

export async function deleteBlobFromContainer(blobName: string): Promise<void> {
  if (!blobService) {
    throw new Error("Azure service not initialized");
  }

  return new Promise((resolve, reject) => {
    blobService.deleteBlobIfExists(config.storage.container, blobName, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}
