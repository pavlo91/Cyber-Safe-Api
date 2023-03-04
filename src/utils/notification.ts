import { Prisma } from '@prisma/client'
import { composeWebURL } from '../helpers/url'
import { sendEmail } from '../libs/postmark'
import { prisma } from '../prisma'

type NotificationData = {
  body: string
  url?: string
}

const NotificationMap = {
  userRespondedToStaffUserRole: (userRole: Prisma.UserRoleGetPayload<{ include: { user: true } }>) => {
    const { user } = userRole
    const displayName = user.name || user.email

    return {
      body:
        userRole.status === 'ACCEPTED'
          ? `${displayName} has accepted their staff role`
          : `${displayName} has declined their staff role`,
      url: composeWebURL('/dashboard/staff/users', { search: user.email }),
    }
  },
  userRespondedToMemberUserRole: (
    userRole: Prisma.UserRoleGetPayload<{ include: { user: true } }>,
    schoolRole: 'ADMIN' | 'COACH'
  ) => {
    const { user } = userRole
    const displayName = user.name || user.email
    const displayRole = userRole.type === 'ADMIN' ? 'admin' : userRole.type === 'COACH' ? 'coach' : 'athlete'

    return {
      body:
        userRole.status === 'ACCEPTED'
          ? `${displayName} has accepted their ${displayRole} role`
          : `${displayName} has declined their ${displayRole} role`,
      url:
        schoolRole === 'ADMIN'
          ? composeWebURL('/dashboard/admin/members', { search: user.email })
          : composeWebURL('/dashboard/coach/members', { search: user.email }),
    }
  },
} satisfies Record<string, (...args: any[]) => NotificationData | Promise<NotificationData>>

type NotificationMap = typeof NotificationMap

export async function sendNotification<K extends keyof NotificationMap>(
  userId: string | string[],
  type: K,
  ...args: Parameters<NotificationMap[K]>
) {
  const userIds = Array.isArray(userId) ? userId : [userId]

  // @ts-ignore
  const data = await NotificationMap[type](...args)

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ ...data, userId })),
  })

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  })

  sendEmail(
    users.map((user) => user.id),
    'notification',
    data.body,
    data.url
  )
}

export async function getStaffIds() {
  const users = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          type: 'STAFF',
          status: 'ACCEPTED',
        },
      },
    },
  })

  return users.map((user) => user.id)
}

type SchoolRole = 'ADMIN' | 'COACH' | 'ATHLETE'

export async function getSchoolMemberIds(type: SchoolRole | SchoolRole[], schoolId: string) {
  const types = Array.isArray(type) ? type : [type]

  const users = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          status: 'ACCEPTED',
          type: { in: types },
          schoolRole: { schoolId },
        },
      },
    },
  })

  return users.map((user) => user.id)
}
