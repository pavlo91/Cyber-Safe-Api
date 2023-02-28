import { getStorageTempBlobName, storagePrepareForUpload } from '../libs/storage'
import { prisma } from '../prisma'
import { builder } from './builder'

type Header = {
  key: string
  value: string
}

type Upload = { id: string } & Awaited<ReturnType<typeof storagePrepareForUpload>>

export const Header = builder.objectRef<Header>('Header')
export const Upload = builder.objectRef<Upload>('Upload')

Header.implement({
  fields: (t) => ({
    key: t.exposeString('key'),
    value: t.exposeString('value'),
  }),
})

Upload.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    url: t.exposeString('url'),
    method: t.exposeString('method'),
    headers: t.field({
      type: [Header],
      resolve: ({ headers }) => {
        return Object.keys(headers).map((key) => ({ key, value: headers[key] }))
      },
    }),
  }),
})

builder.mutationFields((t) => ({
  prepareUpload: t.field({
    authScopes: {
      user: true,
    },
    type: Upload,
    resolve: async (obj, args, { user }) => {
      const upload = await prisma.upload.create({
        data: {
          userId: user!.id,
          blobName: getStorageTempBlobName(user!.id),
        },
      })

      return {
        id: upload.id,
        ...(await storagePrepareForUpload(upload.blobName)),
      }
    },
  }),
}))
