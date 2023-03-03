import { composeWebURL } from '../helpers/url'
import { sendEmail } from '../libs/postmark'
import { prisma } from '../prisma'

type NotificationData = {
  body: string
  url?: string
}

const NotificationMap = {
  userRespondedToStaffUserRole: async (userId: string, response: 'accept' | 'decline') => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
    const displayName = user.name || user.email

    return {
      body:
        response === 'accept'
          ? `${displayName} has accepted their staff role`
          : `${displayName} has declined their staff role`,
      url: composeWebURL('/dashboard/staff/users', {}),
    }
  },
  userRespondedToMemberUserRole: async (userId: string, response: 'accept' | 'decline', toRole: 'ADMIN' | 'COACH') => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
    const displayName = user.name || user.email

    return {
      body:
        response === 'accept'
          ? `${displayName} has accepted their member role`
          : `${displayName} has declined their member role`,
      url:
        toRole === 'ADMIN'
          ? composeWebURL('/dashboard/admin/members', {})
          : composeWebURL('/dashboard/coach/members', {}),
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
