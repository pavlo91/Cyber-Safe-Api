import { Notification, Prisma } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, isUser } from '../utils/auth'
import { createPage, createPageArgs, createPageObjectRef } from './utils/page'

export const GQLNotification = pothos.objectRef<Notification>('Notification')
export const GQLNotificationPage = createPageObjectRef(GQLNotification)

GQLNotification.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    body: t.exposeString('body'),
    url: t.exposeString('url', { nullable: true }),
  }),
})

pothos.queryFields((t) => ({
  notifications: t.field({
    type: GQLNotificationPage,
    args: {
      ...createPageArgs(t.arg),
    },
    resolve: async (obj, { page }, { user }) => {
      await checkAuth(() => isUser(user))

      const where: Prisma.NotificationWhereInput = {
        unread: true,
        userId: user!.id,
      }

      const orderBy: Prisma.NotificationOrderByWithRelationInput = { createdAt: 'desc' }

      return createPage(page, (args) =>
        prisma.$transaction([
          prisma.notification.findMany({ ...args, where, orderBy }),
          prisma.notification.count({ where }),
        ])
      )
    },
  }),
}))

pothos.mutationFields((t) => ({
  readNotifications: t.field({
    type: 'Boolean',
    resolve: async (obj, args, { user }) => {
      await checkAuth(() => isUser(user))

      await prisma.notification.updateMany({
        where: {
          unread: true,
          userId: user!.id,
        },
        data: {
          unread: false,
        },
      })

      return true
    },
  }),
}))
