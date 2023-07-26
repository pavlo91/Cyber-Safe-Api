import { ArgBuilder, InputShapeFromFields } from '@pothos/core'
import { Prisma, User } from '@prisma/client'
import pothos, { DefaultSchemaType } from '../libs/pothos'
import prisma from '../libs/prisma'
import smser from '../libs/smser'
import storage from '../libs/storage'
import { logActivity } from '../utils/activity'
import { checkAuth, hasRoleInSchool, hasRoleToUser, isParentToUser, isSameUser, isStaff, isUser } from '../utils/auth'
import { randomToken } from '../utils/crypto'
import { GQLImage } from './image'
import { GQLSocial } from './social'
import { GQLUserRole, GQLUserRoleStatusEnum, GQLUserRoleTypeEnum } from './user-role'
import { createFilterInput } from './utils/filter'
import { createOrderInput } from './utils/order'
import { createPage, createPageArgs, createPageObjectRef } from './utils/page'

export const GQLUsersFromEnum = pothos.enumType('UsersFromEnum', {
  values: ['SCHOOL', 'PARENT', 'CHILD'] as const,
})

export const GQLUser = pothos.loadableObjectRef<User, string>('User', {
  load: async (keys) => {
    const users = await prisma.user.findMany({ where: { id: { in: keys } } })
    return keys.map((key) => users.find((user) => user.id === key)!)
  },
})

export const GQLUserPage = createPageObjectRef(GQLUser)

export const GQLUserOrder = createOrderInput(
  GQLUser,
  (t) => ({
    createdAt: t.order(),
    name: t.order(),
    email: t.order(),
    roles: t.order(),
  }),
  ({ createdAt, name, email, roles }) => {
    const orderBy: Prisma.UserOrderByWithRelationInput[] = []

    if (createdAt) orderBy.push({ createdAt })
    if (name) orderBy.push({ name })
    if (email) orderBy.push({ email })
    if (roles) orderBy.push({ roles: { _count: roles } })

    return orderBy
  }
)

export const UserFilter = createFilterInput(
  GQLUser,
  (t) => ({
    from: t.field({ type: GQLUsersFromEnum, required: false }),
    fromId: t.id({ required: false }),
    search: t.string({ required: false }),
    roles: t.field({ type: [GQLUserRoleTypeEnum], required: false }),
  }),
  ({ from, fromId, search, roles }) => {
    const where: Prisma.UserWhereInput = {}

    if (roles) {
      where.roles = { some: { type: { in: roles } } }
    }

    if (from && fromId) {
      switch (from) {
        case 'SCHOOL':
          where.roles = {
            some: {
              type: roles ? { in: roles } : undefined,
              schoolRole: { schoolId: fromId },
            },
          }
          break

        case 'PARENT':
          where.parentRoles = { some: { userRole: { userId: fromId } } }
          break

        case 'CHILD':
          where.roles = { some: { parentRole: { childUserId: fromId } } }
          break
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    return where
  }
)

function createRolesArgs(arg: ArgBuilder<DefaultSchemaType>) {
  return {
    status: arg({ type: GQLUserRoleStatusEnum, required: false }),
  }
}

type RolesArgs = InputShapeFromFields<ReturnType<typeof createRolesArgs>>

GQLUser.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    email: t.exposeString('email'),
    name: t.exposeString('name'),
    phoneNumber: t.exposeString('phoneNumber', { nullable: true }),
    parentalApproval: t.exposeBoolean('parentalApproval', { nullable: true }),
    score: t.exposeFloat('score'),
    avatar: t.field({
      type: GQLImage,
      nullable: true,
      resolve: (user) => user.avatarId,
    }),
    roles: t.loadableList({
      type: GQLUserRole,
      args: {
        ...createRolesArgs(t.arg),
      },
      resolve: (user, args) => [user.id, JSON.stringify(args)].join(';'),
      load: async (keys: string[]) => {
        const results = keys.map((key) => {
          const [id, args] = key.split(';')
          return [id, args as RolesArgs] as const
        })
        const userRoles = await prisma.userRole.findMany({
          where: { userId: { in: results.map(([id]) => id) } },
          include: {
            schoolRole: { include: { school: true } },
            parentRole: { include: { childUser: true } },
          },
        })
        return results.map(([userId, { status }]) =>
          userRoles.filter((userRole) => userRole.userId === userId && (!status || userRole.status === status))
        )
      },
    }),
    notificationCount: t.int({
      resolve: async (user) => {
        return prisma.notification.count({
          where: { unread: true, userId: user.id },
        })
      },
    }),
    platforms: t.field({
      type: [GQLSocial],
      resolve: async (user) => {
        const userWithSocial = await prisma.user.findUniqueOrThrow({
          where: { id: user.id },
          include: {
            twitter: true,
            facebook: true,
            instagram: true,
            tiktok: true,
          },
        })

        return [
          userWithSocial.twitter,
          userWithSocial.facebook,
          userWithSocial.instagram,
          userWithSocial.tiktok,
        ].filter((e) => !!e) as any[]
      },
    }),
  }),
})

pothos.queryFields((t) => ({
  users: t.field({
    type: GQLUserPage,
    args: {
      ...createPageArgs(t.arg),
      order: t.arg({ type: GQLUserOrder, required: false }),
      filter: t.arg({ type: UserFilter, required: false }),
    },
    resolve: async (obj, { page, order, filter }, { user }) => {
      await checkAuth(
        () => filter?.from === 'SCHOOL' && hasRoleInSchool(filter.fromId!, user),
        () => filter?.from === 'PARENT' && isSameUser(filter.fromId!, user),
        () => filter?.from === 'CHILD' && isSameUser(filter.fromId!, user),
        () => filter?.from === 'CHILD' && hasRoleToUser(filter.fromId!, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      const where = UserFilter.toFilter(filter)
      const orderBy = GQLUserOrder.toOrder(order)

      return await createPage(page, (args) =>
        prisma.$transaction([prisma.user.findMany({ ...args, where, orderBy }), prisma.user.count({ where })])
      )
    },
  }),
  user: t.field({
    type: GQLUser,
    args: {
      id: t.arg.id(),
    },
    resolve: async (obj, { id }, { user }) => {
      await checkAuth(
        () => isSameUser(id, user),
        () => hasRoleToUser(id, user),
        () => isParentToUser(id, user),
        () => isStaff(user)
      )

      return await prisma.user.findUniqueOrThrow({ where: { id } })
    },
  }),
}))

pothos.mutationFields((t) => ({
  updateUser: t.fieldWithInput({
    type: GQLUser,
    args: {
      id: t.arg.id(),
    },
    input: {
      name: t.input.string({ required: false }),
      newEmail: t.input.string({ required: false }),
      newPhoneNumber: t.input.string({ required: false }),
    },
    resolve: async (obj, { id, input }, { user }) => {
      await checkAuth(
        () => isSameUser(id, user),
        () => isStaff(user)
      )

      if (typeof input.newPhoneNumber === 'string' || input.newPhoneNumber === null) {
        await prisma.$transaction(async (prisma) => {
          await prisma.pendingPhoneNumbers.deleteMany({
            where: { userId: user!.id },
          })

          if (typeof input.newPhoneNumber === 'string') {
            const pendingPhoneNumber = await prisma.pendingPhoneNumbers.create({
              data: {
                userId: user!.id,
                token: randomToken(),
                phoneNumber: input.newPhoneNumber!,
              },
            })

            await smser.send(pendingPhoneNumber.phoneNumber, `Your verification code is: ${pendingPhoneNumber.token}`, {
              userId: pendingPhoneNumber.userId,
            })
          } else if (input.newPhoneNumber === null) {
            await prisma.user.update({
              where: { id },
              data: { phoneNumber: null },
            })
          }
        })
      }

      return await prisma.user.update({
        where: { id },
        data: {
          name: input.name ?? undefined,
          newEmail: input.newEmail ?? undefined,
        },
      })
    },
  }),
  validatePhoneNumber: t.boolean({
    args: {
      token: t.arg.string(),
    },
    resolve: async (obj, { token }, { user }) => {
      await checkAuth(() => isUser(user))

      await prisma.$transaction(async (prisma) => {
        const pendingPhoneNumber = await prisma.pendingPhoneNumbers
          .findFirstOrThrow({
            where: {
              token,
              userId: user!.id,
              expiresAt: { gt: new Date() },
            },
          })
          .catch(() => {
            throw new Error('Verification code is not valid or is expired')
          })

        await prisma.user.update({
          where: { id: user!.id },
          data: { phoneNumber: pendingPhoneNumber.phoneNumber },
        })

        await prisma.pendingPhoneNumbers.delete({
          where: { id: pendingPhoneNumber.id },
        })
      })

      return true
    },
  }),
  updateUserParentalApproval: t.boolean({
    args: {
      id: t.arg.id(),
      approve: t.arg.boolean(),
      signatureUploadId: t.arg.id({ required: false }),
    },
    resolve: async (obj, { id, approve, signatureUploadId }, { req, user }) => {
      await checkAuth(() => isParentToUser(id, user))

      if (approve) {
        if (!signatureUploadId) {
          throw new Error('Signature required for approving child')
        }

        const upload = await prisma.upload.findUniqueOrThrow({
          where: { id: signatureUploadId },
        })

        const blobName = storage.getRandomBlobName('users', user!.id, 'signatures')
        const { blobURL } = await storage.moveBlob(upload.blobURL, 'private', blobName)

        const { id: signatureId } = await prisma.$transaction(async (prisma) => {
          await prisma.upload.delete({
            where: { id: upload.id },
          })
          return await prisma.image.create({
            data: { url: blobURL },
          })
        })

        await prisma.parentConsent.create({
          data: {
            signatureId,
            version: 'v1', // This is a filler for now
            childUserId: id,
            parentUserId: user!.id,
            ip: req.ip ?? req.headers['x-forwarded-for'] ?? '127.0.0.1',
          },
        })
      }

      await prisma.user.update({
        where: { id },
        data: { parentalApproval: approve },
      })

      logActivity('PARENTAL_APPROVAL', id)

      return true
    },
  }),
}))
