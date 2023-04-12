import Prisma, { UserRoleType } from '@prisma/client'
import { hasRoleInSchoolId, hasRoleToUserId } from '../helpers/auth'
import { prisma } from '../prisma'
import { logActivity } from '../utils/activity'
import { getSchoolMemberIds, getStaffIds, sendNotification } from '../utils/notification'
import { builder } from './builder'
import { School } from './school'
import { User } from './user'

export async function createUserRoleIfNone(data: {
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

    logActivity('INVITE_USER', data.userId)
  }

  return userRole
}

export const UserRoleTypeEnum = builder.enumType('UserRoleTypeEnum', {
  values: ['STAFF', 'ADMIN', 'COACH', 'STUDENT', 'PARENT'] as const,
})

export const SchoolRoleTypeEnum = builder.enumType('SchoolRoleTypeEnum', {
  values: ['ADMIN', 'COACH', 'STUDENT'] as const,
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
    id: t.exposeID('id'),
    type: t.expose('type', { type: UserRoleTypeEnum }),
    status: t.expose('status', { type: UserRoleStatusEnum }),
  }),
})

SchoolRole.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
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
    id: t.exposeID('id'),
    type: t.expose('type', { type: UserRoleTypeEnum }),
    status: t.expose('status', { type: UserRoleStatusEnum }),
    childUser: t.field({
      type: User,
      resolve: ({ parentRole }) => parentRole!.childUser,
    }),
  }),
})

export const UserRole = builder.unionType('UserRole', {
  types: [AnyUserRole, SchoolRole, ParentRole],
  resolveType: (userRole) => {
    switch (userRole.type) {
      case 'ADMIN':
      case 'COACH':
      case 'STUDENT':
        return SchoolRole
      case 'PARENT':
        return ParentRole
      default:
        return AnyUserRole
    }
  },
})

type InvitedRole = {
  type: UserRoleType
  schoolName?: string
  schoolLogoURL?: string
  isNewUser: boolean
}

const InvitedRole = builder.objectRef<InvitedRole>('InvitedRole')

InvitedRole.implement({
  fields: (t) => ({
    type: t.expose('type', { type: UserRoleTypeEnum }),
    schoolName: t.exposeString('schoolName', { nullable: true }),
    schoolLogoURL: t.exposeString('schoolLogoURL', { nullable: true }),
    isNewUser: t.exposeBoolean('isNewUser'),
  }),
})

builder.queryFields((t) => ({
  invitedRole: t.field({
    type: InvitedRole,
    args: {
      token: t.arg.string(),
    },
    resolve: async (obj, { token }) => {
      const role = await prisma.userRole
        .findFirstOrThrow({
          where: {
            statusToken: token,
            status: 'PENDING',
          },
          include: {
            user: true,
            schoolRole: {
              include: {
                school: {
                  include: {
                    logo: true,
                  },
                },
              },
            },
          },
        })
        .catch(() => {
          throw new Error('No pending invite found')
        })

      return {
        type: role.type,
        schoolName: role.schoolRole?.school.name,
        schoolLogoURL: role.schoolRole?.school.logo?.url,
        isNewUser: !role.user.password,
      }
    },
  }),
}))

builder.mutationFields((t) => ({
  createUserRole: t.fieldWithInput({
    authScopes: (obj, { input }, { user }) => {
      if (input.type !== 'STAFF' && !input.relationId) {
        throw new Error('Input is not valid')
      }

      switch (input.type) {
        case 'ADMIN':
          if (hasRoleInSchoolId(input.relationId!, user, ['ADMIN'])) {
            return true
          }
          break

        case 'COACH':
        case 'STUDENT':
          if (hasRoleInSchoolId(input.relationId!, user, ['ADMIN', 'COACH'])) {
            return true
          }
          break

        case 'PARENT':
          if (hasRoleToUserId(input.relationId!, user, ['ADMIN', 'COACH'])) {
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
      relationId: t.input.id({ required: false }),
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
        case 'STUDENT':
          await createUserRoleIfNone({
            userId: user.id,
            type: input.type,
            schoolRole: { schoolId: input.relationId! },
          })
          break

        case 'PARENT':
          await createUserRoleIfNone({
            userId: user.id,
            type: input.type,
            parentRole: { childUserId: input.relationId! },
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
        case 'STUDENT':
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
  respondToInvitedRole: t.boolean({
    args: {
      token: t.arg.string(),
      accept: t.arg.boolean(),
      name: t.arg.string({ required: false }),
      password: t.arg.string({ required: false }),
    },
    resolve: async (obj, { token, accept, name, password }) => {
      let role = await prisma.userRole.findFirstOrThrow({
        where: {
          statusToken: token,
          status: 'PENDING',
        },
        include: {
          user: true,
          schoolRole: true,
        },
      })

      if (accept) {
        if (!role.user.password) {
          if (!name || !password) {
            throw new Error('New user requires name and password')
          }

          await prisma.user.update({
            where: { id: role.userId },
            data: { name, password },
          })
        }

        role = await prisma.userRole.update({
          where: { id: role.id },
          data: {
            statusToken: null,
            status: 'ACCEPTED',
          },
          include: {
            user: true,
            schoolRole: true,
          },
        })
      } else {
        role = await prisma.userRole.update({
          where: { id: role.id },
          data: {
            statusToken: null,
            status: 'DECLINED',
          },
          include: {
            user: true,
            schoolRole: true,
          },
        })
      }

      switch (role.type) {
        case 'STAFF':
          sendNotification(await getStaffIds(), 'userRespondedToStaffUserRole', role)
          break

        case 'ADMIN':
        case 'COACH':
        case 'STUDENT':
          sendNotification(
            await getSchoolMemberIds('ADMIN', role.schoolRole!.schoolId),
            'userRespondedToMemberUserRole',
            role,
            'ADMIN'
          )
          sendNotification(
            await getSchoolMemberIds('COACH', role.schoolRole!.schoolId),
            'userRespondedToMemberUserRole',
            role,
            'COACH'
          )
          break

        default:
          break
      }

      logActivity('INVITE_USER_RESPONDED', role.userId)

      return true
    },
  }),
}))
