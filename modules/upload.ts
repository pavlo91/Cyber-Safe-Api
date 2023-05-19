import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import storage from '../libs/storage'
import { checkAuth, isUser } from '../utils/auth'

type Header = {
  key: string
  value: string
}

type Upload = { id: string } & Awaited<ReturnType<(typeof storage)['signUploadURL']>>

export const GQLHeader = pothos.objectRef<Header>('Header')
export const GQLUpload = pothos.objectRef<Upload>('Upload')

GQLHeader.implement({
  fields: (t) => ({
    key: t.exposeString('key'),
    value: t.exposeString('value'),
  }),
})

GQLUpload.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    url: t.exposeString('url'),
    method: t.exposeString('method'),
    headers: t.field({
      type: [GQLHeader],
      resolve: ({ headers }) => {
        return Object.entries(headers).map(([key, value]) => ({ key, value }))
      },
    }),
  }),
})

pothos.mutationFields((t) => ({
  prepareUpload: t.field({
    type: GQLUpload,
    resolve: async (obj, args, { user }) => {
      await checkAuth(() => isUser(user))

      const signedUpload = await storage.signUploadURL()

      const upload = await prisma.upload.create({
        data: {
          userId: user!.id,
          blobURL: signedUpload.blobURL,
        },
      })

      return {
        ...signedUpload,
        id: upload.id,
      }
    },
  }),
}))
