import { Image } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import storage from '../libs/storage'
import { checkAuth, hasRoleInSchool, isSameUser, isStaff } from '../utils/auth'

export const GQLUpdateImageForEnum = pothos.enumType('UpdateImageForEnum', {
  values: ['USER_AVATAR', 'SCHOOL_LOGO', 'SCHOOL_COVER'] as const,
})

export const GQLImage = pothos.loadableObjectRef<Image, string>('Image', {
  load: async (keys) => {
    const images = await prisma.image.findMany({ where: { id: { in: keys } } })
    return keys.map((key) => images.find((image) => image.id === key)!)
  },
})

GQLImage.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    url: t.exposeString('url'),
  }),
})

pothos.mutationFields((t) => ({
  updateImage: t.fieldWithInput({
    type: GQLImage,
    input: {
      uploadId: t.input.id(),
      for: t.input.field({ type: GQLUpdateImageForEnum }),
      forId: t.input.id(),
    },
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(
        () => input.for === 'USER_AVATAR' && isSameUser(input.forId, user),
        () => input.for === 'SCHOOL_LOGO' && hasRoleInSchool(input.forId, user, ['ADMIN', 'COACH']),
        () => input.for === 'SCHOOL_COVER' && hasRoleInSchool(input.forId, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

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
          blobName = storage.getRandomBlobName('users', input.forId, 'images')
          break

        case 'SCHOOL_LOGO':
        case 'SCHOOL_COVER':
          blobName = storage.getRandomBlobName('schools', input.forId, 'images')
          break
      }

      const { blobURL } = await storage.moveBlob(upload.blobURL, 'public', blobName)

      return await prisma.$transaction(async (prisma) => {
        await prisma.upload.delete({
          where: { id: upload.id },
        })

        if (image) {
          await prisma.image.delete({ where: { id: image.id } })
        }

        return await prisma.image.create({
          data: {
            url: blobURL,
            userAvatar: input.for === 'USER_AVATAR' ? { connect: { id: input.forId } } : undefined,
            schoolLogo: input.for === 'SCHOOL_LOGO' ? { connect: { id: input.forId } } : undefined,
            schoolCover: input.for === 'SCHOOL_COVER' ? { connect: { id: input.forId } } : undefined,
          },
        })
      })
    },
  }),
  removeImage: t.boolean({
    args: {
      id: t.arg.id(),
    },
    resolve: async (obj, { id }, { user }) => {
      const image = await prisma.image.findUniqueOrThrow({
        where: { id },
        include: {
          userAvatar: true,
          schoolLogo: true,
          schoolCover: true,
        },
      })

      await checkAuth(
        () => !!image.userAvatar && isSameUser(image.userAvatar.id, user),
        () => !!image.schoolLogo && hasRoleInSchool(image.schoolLogo.id, user, ['ADMIN', 'COACH']),
        () => !!image.schoolCover && hasRoleInSchool(image.schoolCover.id, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      await prisma.image.delete({ where: { id } })

      return true
    },
  }),
}))
