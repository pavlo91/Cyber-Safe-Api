import Prisma from '@prisma/client'
import { hasRoleInSchoolId, isSameUserId } from '../helpers/auth'
import { getStorageBlobName, storageSaveUpload } from '../libs/storage'
import { prisma } from '../prisma'
import { builder } from './builder'

export const UpdateImageForEnum = builder.enumType('UpdateImageForEnum', {
  values: ['USER_AVATAR', 'SCHOOL_LOGO', 'SCHOOL_COVER'] as const,
})

export const Image = builder.loadableObjectRef<Prisma.Image, string>('Image', {
  load: async (keys) => {
    const images = await prisma.image.findMany({ where: { id: { in: keys } } })
    return keys.map((key) => images.find((image) => image.id === key)!)
  },
})

Image.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    url: t.exposeString('url'),
  }),
})

builder.mutationFields((t) => ({
  updateImage: t.fieldWithInput({
    authScopes: async (obj, { input }, { user }) => {
      switch (input.for) {
        case 'USER_AVATAR':
          if (isSameUserId(input.forId, user)) {
            return true
          }
          break

        case 'SCHOOL_LOGO':
        case 'SCHOOL_COVER':
          if (hasRoleInSchoolId(input.forId, user, ['ADMIN', 'COACH'])) {
            return true
          }
          break
      }

      return { staff: true }
    },
    type: Image,
    input: {
      uploadId: t.input.id(),
      for: t.input.field({ type: UpdateImageForEnum }),
      forId: t.input.id(),
    },
    resolve: async (obj, { input }) => {
      const upload = await prisma.upload.findUniqueOrThrow({ where: { id: input.uploadId } })

      const image = await prisma.image.findFirst({
        where: {
          userAvatar: input.for === 'USER_AVATAR' ? { id: input.forId } : undefined,
          schoolLogo: input.for === 'SCHOOL_LOGO' ? { id: input.forId } : undefined,
          schoolCover: input.for === 'SCHOOL_COVER' ? { id: input.forId } : undefined,
        },
      })

      let blobName

      switch (input.for) {
        case 'USER_AVATAR':
          blobName = getStorageBlobName('users', input.forId)
          break

        case 'SCHOOL_LOGO':
        case 'SCHOOL_COVER':
          blobName = getStorageBlobName('schools', input.forId)
          break
      }

      const { url } = await storageSaveUpload(upload.blobName, blobName)

      return await prisma.$transaction(async (prisma) => {
        await prisma.upload.delete({
          where: { id: upload.id },
        })

        if (image) {
          await prisma.image.delete({ where: { id: image.id } })
        }

        return await prisma.image.create({
          data: {
            url,
            userAvatar: input.for === 'USER_AVATAR' ? { connect: { id: input.forId } } : undefined,
            schoolLogo: input.for === 'SCHOOL_LOGO' ? { connect: { id: input.forId } } : undefined,
            schoolCover: input.for === 'SCHOOL_COVER' ? { connect: { id: input.forId } } : undefined,
          },
        })
      })
    },
  }),
  removeImage: t.boolean({
    authScopes: async (obj, { id }, { user }) => {
      const image = await prisma.image.findUniqueOrThrow({
        where: { id },
        include: { userAvatar: true, schoolLogo: true, schoolCover: true },
      })

      if (image.userAvatar && isSameUserId(image.userAvatar.id, user)) {
        return true
      }
      if (image.schoolLogo && hasRoleInSchoolId(image.schoolLogo.id, user, ['ADMIN', 'COACH'])) {
        return true
      }
      if (image.schoolCover && hasRoleInSchoolId(image.schoolCover.id, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    args: {
      id: t.arg.id(),
    },
    resolve: (obj, { id }) => {
      return prisma.image.delete({ where: { id } }).then(() => true)
    },
  }),
}))
