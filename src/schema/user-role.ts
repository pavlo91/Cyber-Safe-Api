import Prisma, { UserRoleType } from '@prisma/client'
import { hasRoleInSchoolId, hasRoleToUserId } from '../helpers/auth'
import { prisma } from '../prisma'
import { builder } from './builder'
import { School } from './school'
import { User } from './user'

async function createUserRoleIfNone(data: {
  userId: string
  type: UserRoleType
  schoolRole?: { schoolId: string }
  parentRole?: { childUserId: string }
}) {
  const include = {
    user: true,
    schoolRole: { include: { school: true } },
    parentRole: { include: { childUser: true } },
  } satisfies Prisma.Prisma.UserRoleInclude

  let userRole = await prisma.userRole.findFirst({
    include,
    where: {
      type: data.type,
      userId: data.userId,
      schoolRole: data.schoolRole,
      parentRole: data.parentRole,
    },
  })

  if (!userRole) {
    userRole = await prisma.userRole.create({
      include,
      data: {
        type: data.type,
        userId: data.userId,
        schoolRole: data.schoolRole && { create: { ...data.schoolRole } },
        parentRole: data.parentRole && { create: { ...data.parentRole } },
      },
    })
  }

  return userRole
}

export const UserRoleTypeEnum = builder.enumType('UserRoleTypeEnum', {
  values: ['STAFF', 'ADMIN', 'COACH', 'ATHLETE', 'PARENT'] as const,
})

export const UserRoleStatusEnum = builder.enumType('UserRoleStatusEnum', {
  values: ['PENDING', 'ACCEPTED', 'DECLINED'] as const,
})

export const AnyUserRole = builder.objectRef<Prisma.UserRole>('AnyUserRole')
export const SchoolRole =
  builder.objectRef<Prisma.Prisma.UserRoleGetPayload<{ include: { schoolRole: { include: { school: true } } } }>>(
    'SchoolRole'
  )
export const ParentRole =
  builder.objectRef<Prisma.Prisma.UserRoleGetPayload<{ include: { parentRole: { include: { childUser: true } } } }>>(
    'ParentRole'
  )

AnyUserRole.implement({
  fields: (t) => ({
    type: t.expose('type', { type: UserRoleTypeEnum }),
    status: t.expose('status', { type: UserRoleStatusEnum }),
  }),
})

SchoolRole.implement({
  fields: (t) => ({
    type: t.expose('type', { type: UserRoleTypeEnum }),
    status: t.expose('status', { type: UserRoleStatusEnum }),
    school: t.field({
      type: School,
      resolve: ({ schoolRole }) => schoolRole!.school,
    }),
  }),
})

ParentRole.implement({
  fields: (t) => ({
    type: t.expose('type', { type: UserRoleTypeEnum }),
    status: t.expose('status', { type: UserRoleStatusEnum }),
    school: t.field({
      type: User,
      resolve: ({ parentRole }) => parentRole!.childUser,
    }),
  }),
})

export const UserRole = builder.unionType('UserRole', {
  types: [AnyUserRole, SchoolRole],
  resolveType: (userRole) => {
    switch (userRole.type) {
      case 'ADMIN':
      case 'COACH':
      case 'ATHLETE':
        return SchoolRole
      case 'PARENT':
        return ParentRole
      default:
        return AnyUserRole
    }
  },
})

builder.mutationFields((t) => ({
  createUserRole: t.fieldWithInput({
    authScopes: (obj, { input }, { user }) => {
      if (input.type !== 'STAFF' && !input.typeId) {
        throw new Error('Input is not valid')
      }

      switch (input.type) {
        case 'ADMIN':
          if (hasRoleInSchoolId(input.typeId!, user, ['ADMIN'])) {
            return true
          }
          break

        case 'COACH':
        case 'ATHLETE':
          if (hasRoleInSchoolId(input.typeId!, user, ['ADMIN', 'COACH'])) {
            return true
          }
          break

        case 'PARENT':
          if (hasRoleToUserId(input.typeId!, user, ['ADMIN', 'COACH'])) {
            return true
          }
          break

        default:
          break
      }

      return { staff: true }
    },
    type: User,
    input: {
      email: t.input.string(),
      type: t.input.field({ type: UserRoleTypeEnum }),
      typeId: t.input.id({ required: false }),
    },
    resolve: async (obj, { input }) => {
      let user = await prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: input.email,
            name: '',
          },
        })
      }

      switch (input.type) {
        case 'STAFF':
          await createUserRoleIfNone({
            userId: user.id,
            type: input.type,
          })
          break

        case 'ADMIN':
        case 'COACH':
        case 'ATHLETE':
          await createUserRoleIfNone({
            userId: user.id,
            type: input.type,
            schoolRole: { schoolId: input.typeId! },
          })
          break

        case 'PARENT':
          await createUserRoleIfNone({
            userId: user.id,
            type: input.type,
            parentRole: { childUserId: input.typeId! },
          })
          break
      }

      return user
    },
  }),
  removeUserRole: t.boolean({
    authScopes: async (obj, { id }, { user }) => {
      const userRole = await prisma.userRole.findUniqueOrThrow({
        where: { id },
        include: {
          schoolRole: true,
          parentRole: true,
        },
      })

      switch (userRole.type) {
        case 'STAFF':
          return { staff: true }

        case 'ADMIN':
        case 'COACH':
        case 'ATHLETE':
          if (userRole.schoolRole && hasRoleInSchoolId(userRole.schoolRole.schoolId, user, ['ADMIN', 'COACH'])) {
            return true
          }
          break

        case 'PARENT':
          if (userRole.parentRole && hasRoleToUserId(userRole.parentRole.childUserId, user, ['ADMIN', 'COACH'])) {
            return true
          }
          break
      }

      return { staff: true }
    },
    args: {
      id: t.arg.id(),
    },
    resolve: (obj, { id }) => {
      return prisma.userRole.delete({ where: { id } }).then(() => true)
    },
  }),
}))
