import { Prisma } from '@prisma/client'
import logger from '../libs/logger'
import prisma from '../libs/prisma'
import smser from '../libs/smser'
import { NotificationSettingKey, notificationSettingValueFor } from './notification-setting'

export async function sendSMS(
  userId: string | string[] | Promise<string | string[]>,
  message: string | ((user: Prisma.UserGetPayload<{ include: { roles: true } }>) => string),
  key: NotificationSettingKey
) {
  const awaitedUserId = await userId
  const awaitedUserIdArray = Array.isArray(awaitedUserId) ? awaitedUserId : [awaitedUserId]

  const users = await prisma.user.findMany({
    where: { id: { in: awaitedUserIdArray } },
    include: {
      roles: true,
      notificationSettings: true,
    },
  })

  for (const user of users) {
    if (!user.phoneNumber) {
      logger.debug('Skipping user %s because he has no phone number', user.id)
      continue
    }

    if (!notificationSettingValueFor(key, user.notificationSettings)) {
      logger.debug('Skipping user %s because he does not have %s active', user.id, key)
      continue
    }

    const messageValue = typeof message === 'function' ? message(user) : message

    await smser.send(user.phoneNumber, messageValue)
  }
}
