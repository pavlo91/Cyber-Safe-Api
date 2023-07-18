import { Prisma, UserRole, UserRoleType } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { logActivity } from '../utils/activity'
import { checkAuth, hasRoleInSchool, hasRoleToUser, isStaff } from '../utils/auth'
import { randomToken } from '../utils/crypto'
import { sendUserRoleConfirmationEmail } from '../utils/email'
import { getMemberIds, getStaffIds, sendNotification } from '../utils/notification'
import { composeWebURL } from '../utils/url'
import { GQLUserWithToken } from './auth'
import { GQLSchool } from './school'
import { GQLUser } from './user'

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
  } satisfies Prisma.UserRoleInclude

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
        statusToken: randomToken(),
        schoolRole: data.schoolRole && { create: { ...data.schoolRole } },
        parentRole: data.parentRole && { create: { ...data.parentRole } },
      },
    })

    sendUserRoleConfirmationEmail(userRole)

    logActivity('INVITE_USER', data.userId)
  }

  return userRole
}

export const GQLUserRoleTypeEnum = pothos.enumType('UserRoleTypeEnum', {
  values: ['STAFF', 'ADMIN', 'COACH', 'STUDENT', 'PARENT'] as const,
})

export const GQLSchoolRoleTypeEnum = pothos.enumType('SchoolRoleTypeEnum', {
  values: ['ADMIN', 'COACH', 'STUDENT'] as const,
})

export const GQLUserRoleStatusEnum = pothos.enumType('UserRoleStatusEnum', {
  values: ['PENDING', 'ACCEPTED', 'DECLINED'] as const,
})

export const GQLAnyUserRole = pothos.objectRef<UserRole>('AnyUserRole')
export const GQLSchoolRole =
  pothos.objectRef<Prisma.UserRoleGetPayload<{ include: { schoolRole: { include: { school: true } } } }>>('SchoolRole')
export const GQLParentRole =
  pothos.objectRef<Prisma.UserRoleGetPayload<{ include: { parentRole: { include: { childUser: true } } } }>>(
    'ParentRole'
  )

GQLAnyUserRole.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: GQLUserRoleTypeEnum }),
    status: t.expose('status', { type: GQLUserRoleStatusEnum }),
  }),
})

GQLSchoolRole.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: GQLUserRoleTypeEnum }),
    status: t.expose('status', { type: GQLUserRoleStatusEnum }),
    school: t.field({
      type: GQLSchool,
      resolve: ({ schoolRole }) => schoolRole!.school,
    }),
  }),
})

GQLParentRole.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: GQLUserRoleTypeEnum }),
    status: t.expose('status', { type: GQLUserRoleStatusEnum }),
    childUser: t.field({
      type: GQLUser,
      resolve: ({ parentRole }) => parentRole!.childUser,
    }),
  }),
})

export const GQLUserRole = pothos.unionType('UserRole', {
  types: [GQLAnyUserRole, GQLSchoolRole, GQLParentRole],
  resolveType: (userRole) => {
    switch (userRole.type) {
      case 'ADMIN':
      case 'COACH':
      case 'STUDENT':
        return GQLSchoolRole
      case 'PARENT':
        return GQLParentRole
      default:
        return GQLAnyUserRole
    }
  },
})

type InvitedRole = {
  type: UserRoleType
  schoolName?: string
  schoolLogoURL?: string
  isNewUser: boolean
}

const GQLInvitedRole = pothos.objectRef<InvitedRole>('InvitedRole')

GQLInvitedRole.implement({
  fields: (t) => ({
    type: t.expose('type', { type: GQLUserRoleTypeEnum }),
    schoolName: t.exposeString('schoolName', { nullable: true }),
    schoolLogoURL: t.exposeString('schoolLogoURL', { nullable: true }),
    isNewUser: t.exposeBoolean('isNewUser'),
  }),
})

pothos.queryFields((t) => ({
  invitedRole: t.field({
    type: GQLInvitedRole,
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

pothos.mutationFields((t) => ({
  createUserRole: t.fieldWithInput({
    type: GQLUser,
    input: {
      email: t.input.string(),
      type: t.input.field({ type: GQLUserRoleTypeEnum }),
      relationId: t.input.id({ required: false }),
    },
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(
        () => input.type === 'ADMIN' && !!input.relationId && hasRoleInSchool(input.relationId, user, ['ADMIN']),
        () =>
          input.type === 'COACH' && !!input.relationId && hasRoleInSchool(input.relationId, user, ['ADMIN', 'COACH']),
        () =>
          input.type === 'STUDENT' && !!input.relationId && hasRoleInSchool(input.relationId, user, ['ADMIN', 'COACH']),
        () =>
          input.type === 'PARENT' && !!input.relationId && hasRoleToUser(input.relationId, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      let foundUser = await prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!foundUser) {
        foundUser = await prisma.user.create({
          data: {
            email: input.email,
            name: input.email,
          },
        })
      }

      switch (input.type) {
        case 'STAFF':
          await createUserRoleIfNone({
            userId: foundUser.id,
            type: input.type,
          })
          break

        case 'ADMIN':
        case 'COACH':
        case 'STUDENT':
          await createUserRoleIfNone({
            userId: foundUser.id,
            type: input.type,
            schoolRole: { schoolId: input.relationId! },
          })
          break

        case 'PARENT':
          await createUserRoleIfNone({
            userId: foundUser.id,
            type: input.type,
            parentRole: { childUserId: input.relationId! },
          })
          break
      }

      return foundUser
    },
  }),
  removeUserRole: t.boolean({
    args: {
      id: t.arg.id(),
    },
    resolve: async (obj, { id }, { user }) => {
      const userRole = await prisma.userRole.findUniqueOrThrow({
        where: { id },
        include: {
          schoolRole: true,
          parentRole: true,
        },
      })

      await checkAuth(
        () =>
          userRole.type === 'ADMIN' &&
          !!userRole.schoolRole &&
          hasRoleInSchool(userRole.schoolRole.schoolId, user, ['ADMIN']),
        () =>
          userRole.type === 'COACH' &&
          !!userRole.schoolRole &&
          hasRoleInSchool(userRole.schoolRole.schoolId, user, ['ADMIN', 'COACH']),
        () =>
          userRole.type === 'STUDENT' &&
          !!userRole.schoolRole &&
          hasRoleInSchool(userRole.schoolRole.schoolId, user, ['ADMIN', 'COACH']),
        () =>
          userRole.type === 'PARENT' &&
          !!userRole.parentRole &&
          hasRoleToUser(userRole.parentRole.childUserId, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      await prisma.userRole.delete({ where: { id } })

      return true
    },
  }),
  respondToInvitedRole: t.field({
    type: GQLUserWithToken,
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
          if (accept) {
            sendNotification(getStaffIds(), {
              body: `${role.user.name} has accepted their staff role`,
              url: composeWebURL('/dashboard/staff/users'),
            })
          }
          break

        case 'ADMIN':
        case 'COACH':
        case 'STUDENT':
          if (accept) {
            sendNotification(getMemberIds(role.schoolRole!.schoolId, ['ADMIN', 'COACH']), (user) => ({
              body: `${role.user.name} has accepted their member role`,
              url: user.roles.find((e) => e.type === 'ADMIN' && e.status === 'ACCEPTED')
                ? composeWebURL('/dashboard/admin/members')
                : composeWebURL('/dashboard/coach/members'),
            }))
          }

          break

        default:
          break
      }

      logActivity('INVITE_USER_RESPONDED', role.userId)

      return role.user
    },
  }),
}))
