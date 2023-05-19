import { Prisma, UserRoleType } from '@prisma/client'
import prisma from '../libs/prisma'
import { sendEmailTemplate } from './email'
import { emailSettingValueFor } from './email-setting'
import { composeWebURL } from './url'

type Data = {
  body: string
  url?: string
}

export async function sendNotification(
  userId: string | string[] | Promise<string | string[]>,
  data: Data | ((user: Prisma.UserGetPayload<{ include: { roles: true } }>) => Data)
) {
  const awaitedUserId = await userId
  const awaitedUserIdArray = Array.isArray(awaitedUserId) ? awaitedUserId : [awaitedUserId]

  const users = await prisma.user.findMany({
    where: { id: { in: awaitedUserIdArray } },
    include: { roles: true },
  })

  for (const user of users) {
    const { body, url } = typeof data === 'function' ? data(user) : data

    await prisma.notification.create({
      data: { body, url, userId: user.id },
    })

    sendEmailTemplate(user.email, 'notification', { body, url })
  }
}

export function getStaffIds() {
  return prisma.user
    .findMany({ where: { roles: { some: { type: 'STAFF', status: 'ACCEPTED' } } } })
    .then((users) => users.map((user) => user.id))
}

export function getMemberIds(schoolId: string, roles: UserRoleType[]) {
  return prisma.user
    .findMany({ where: { roles: { some: { type: { in: roles }, status: 'ACCEPTED', schoolRole: { schoolId } } } } })
    .then((users) => users.map((user) => user.email))
}

export async function sendFlaggedPostNotification(
  post: Prisma.PostGetPayload<{ include: { user: { include: { roles: { include: { schoolRole: true } } } } } }>
) {
  const schoolIds = post.user.roles.filter((role) => !!role.schoolRole).map((role) => role.schoolRole!.schoolId)

  const users = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          status: 'ACCEPTED',
          type: { in: ['ADMIN', 'COACH'] },
          schoolRole: { schoolId: { in: schoolIds } },
        },
      },
    },
    include: {
      emailSettings: true,
    },
  })

  const to = users
    .filter((user) => emailSettingValueFor('receivePostFlagged', user.emailSettings))
    .map((user) => user.id)

  await sendNotification(to, (user) => ({
    body: `A post created by ${post.user.name} has been flagged`,
    url: composeWebURL('/dashboard/:role/posts/:postId', {
      role: user.roles.find((e) => e.type === 'ADMIN') ? 'admin' : 'coach',
      postId: post.id,
    }),
  }))
}
