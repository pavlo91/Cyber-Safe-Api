import { Prisma, UserRoleType } from '@prisma/client'
import prisma from '../libs/prisma'
import { sendEmailTemplate } from './email'
import { EmailSettingKey, emailSettingValueFor } from './email-setting'
import { composeWebURL } from './url'

type Data = {
  body: string
  url?: string
  title?: string
}

export async function sendNotification(
  userId: string | string[] | Promise<string | string[]>,
  data: Data | ((user: Prisma.UserGetPayload<{ include: { roles: true } }>) => Data),
  emailSetting?: EmailSettingKey
) {
  const awaitedUserId = await userId
  const awaitedUserIdArray = Array.isArray(awaitedUserId) ? awaitedUserId : [awaitedUserId]

  const users = await prisma.user.findMany({
    where: { id: { in: awaitedUserIdArray } },
    include: {
      roles: true,
      emailSettings: true,
    },
  })

  for (const user of users) {
    const { body, url, title } = typeof data === 'function' ? data(user) : data

    await prisma.notification.create({
      data: { body, url, userId: user.id },
    })

    if (!emailSetting || emailSettingValueFor(emailSetting, user.emailSettings)) {
      sendEmailTemplate(user.email, 'notification', { body, url, title })
    }
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
    .then((users) => users.map((user) => user.id))
}

export async function sendFlaggedPostNotification(
  post: Prisma.PostGetPayload<{
    include: {
      user: {
        include: {
          parentRoles: {
            include: {
              userRole: true
            }
          }
          roles: {
            include: {
              schoolRole: {
                include: {
                  school: true
                }
              }
            }
          }
        }
      }
    }
  }>
) {
  // Get only the first school for now
  const school = post.user.roles.find((e) => !!e.schoolRole)?.schoolRole?.school

  if (!school) {
    return
  }

  const adminIds = await getMemberIds(school.id, ['ADMIN'])
  const coachIds = await getMemberIds(school.id, ['COACH'])
  const parentIds = post.user.parentRoles.map((e) => e.userRole.userId)

  function formatURL(userId: string) {
    if (adminIds.includes(userId)) {
      return composeWebURL('/dashboard/admin/posts/:postId', { postId: post.id })
    }
    if (coachIds.includes(userId)) {
      return composeWebURL('/dashboard/coach/posts/:postId', { postId: post.id })
    }
    if (parentIds.includes(userId)) {
      return composeWebURL('/dashboard/parent/posts/:postId', { postId: post.id })
    }
  }

  switch (post.severity) {
    case 'NONE':
      await sendNotification(
        [...adminIds, ...coachIds, ...parentIds],
        (user) => ({
          title: `A post from ${post.user.name} has been analyzed`,
          body: `A post from ${post.user.name} in school ${school.name} has been analyzed`,
          url: formatURL(user.id),
        }),
        'receivePostNoneSeverity'
      )
      break
    case 'LOW':
      await sendNotification(
        [...adminIds, ...coachIds, ...parentIds],
        (user) => ({
          title: `A post from ${post.user.name} has a concern`,
          body: `A post from ${post.user.name} in school ${school.name} has a concern`,
          url: formatURL(user.id),
        }),
        'receivePostLowSeverity'
      )
      break
    case 'HIGH':
      await sendNotification(
        [...adminIds, ...coachIds, ...parentIds],
        (user) => ({
          title: `A post from ${post.user.name} needs action`,
          body: `A post from ${post.user.name} in school ${school.name} needs action`,
          url: formatURL(user.id),
        }),
        'receivePostHighSeverity'
      )
      break
  }
}
