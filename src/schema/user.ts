import { ArgBuilder, InputShapeFromFields } from '@pothos/core'
import Prisma from '@prisma/client'
import { hasRoleInSchoolId, hasRoleToUserId, isParentToUserId, isSameUserId } from '../helpers/auth'
import { prisma } from '../prisma'
import { builder, DefaultSchemaType } from './builder'
import { createFilterInput } from './filter'
import { Image } from './image'
import { createOrderInput } from './order'
import { createPage, createPageArgs, createPageObjectRef } from './page'
import { Twitter } from './twitter'
import { UserRole, UserRoleStatusEnum, UserRoleTypeEnum } from './user-role'

export const UsersFromEnum = builder.enumType('UsersFromEnum', {
  values: ['SCHOOL', 'PARENT', 'CHILD'] as const,
})

export const User = builder.loadableObjectRef<Prisma.User, string>('User', {
  load: async (keys) => {
    const users = await prisma.user.findMany({ where: { id: { in: keys } } })
    return keys.map((key) => users.find((user) => user.id === key)!)
  },
})
export const UserPage = createPageObjectRef(User)

export const UserOrder = createOrderInput(
  User,
  (t) => ({
    createdAt: t.order(),
    name: t.order(),
    email: t.order(),
    roles: t.order(),
  }),
  ({ createdAt, name, email, roles }) => {
    const orderBy: Prisma.Prisma.UserOrderByWithRelationInput[] = []

    if (createdAt) orderBy.push({ createdAt })
    if (name) orderBy.push({ name })
    if (email) orderBy.push({ email })
    if (roles) orderBy.push({ roles: { _count: roles } })

    return orderBy
  }
)

export const UserFilter = createFilterInput(
  User,
  (t) => ({
    from: t.field({ type: UsersFromEnum, required: false }),
    fromId: t.id({ required: false }),
    search: t.string({ required: false }),
    roles: t.field({ type: [UserRoleTypeEnum], required: false }),
  }),
  ({ from, fromId, search, roles }) => {
    const where: Prisma.Prisma.UserWhereInput = {}

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
    status: arg({ type: UserRoleStatusEnum, required: false }),
  }
}

type RolesArgs = InputShapeFromFields<ReturnType<typeof createRolesArgs>>

User.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    email: t.exposeString('email'),
    emailConfirmed: t.exposeBoolean('emailConfirmed'),
    name: t.exposeString('name'),
    avatar: t.field({
      type: Image,
      nullable: true,
      resolve: (user) => user.avatarId,
    }),
    roles: t.loadableList({
      type: UserRole,
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
    twitter: t.field({
      type: Twitter,
      nullable: true,
      resolve: (user) => {
        return prisma.twitter.findUnique({
          where: { userId: user.id },
        })
      },
    }),
  }),
})

builder.queryFields((t) => ({
  users: t.field({
    authScopes: (obj, { filter }, { user }) => {
      if (filter?.from && filter?.fromId) {
        switch (filter.from) {
          case 'SCHOOL':
            if (hasRoleInSchoolId(filter.fromId, user)) {
              return true
            }
            break

          case 'PARENT':
            if (isSameUserId(filter.fromId, user)) {
              return true
            }
            break

          case 'CHILD':
            if (isSameUserId(filter.fromId, user) || hasRoleToUserId(filter.fromId, user, ['ADMIN', 'COACH'])) {
              return true
            }
            break
        }
      }

      return { staff: true }
    },
    type: UserPage,
    args: {
      ...createPageArgs(t.arg),
      order: t.arg({ type: UserOrder, required: false }),
      filter: t.arg({ type: UserFilter, required: false }),
    },
    resolve: (obj, { page, order, filter }) => {
      const where = UserFilter.toFilter(filter)
      const orderBy = UserOrder.toOrder(order)

      return createPage(page, (args) =>
        prisma.$transaction([prisma.user.findMany({ ...args, where, orderBy }), prisma.user.count({ where })])
      )
    },
  }),
  user: t.field({
    authScopes: (obj, { id }, { user }) => {
      if (isSameUserId(id, user) || hasRoleToUserId(id, user) || isParentToUserId(id, user)) {
        return true
      }

      return { staff: true }
    },
    type: User,
    args: {
      id: t.arg.id(),
    },
    resolve: (obj, { id }) => {
      return prisma.user.findUniqueOrThrow({
        where: { id },
      })
    },
  }),
}))

builder.mutationFields((t) => ({
  updateUser: t.fieldWithInput({
    authScopes: (obj, { id }, { user }) => {
      if (isSameUserId(id, user)) {
        return true
      }

      return { staff: true }
    },
    type: User,
    args: {
      id: t.arg.id(),
    },
    input: {
      name: t.input.string({ required: false }),
      newEmail: t.input.string({ required: false }),
    },
    resolve: (obj, { id, input }) => {
      return prisma.user.update({
        where: { id },
        data: {
          name: input.name ?? undefined,
          newEmail: input.newEmail ?? undefined,
        },
      })
    },
  }),
}))
