import Prisma from '@prisma/client'
import { prisma } from '../prisma'
import { builder } from './builder'
import { createPage, createPageArgs, createPageObjectRef } from './page'

export const Notification = builder.objectRef<Prisma.Notification>('Notification')
export const NotificationPage = createPageObjectRef(Notification)

Notification.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    body: t.exposeString('body'),
    url: t.exposeString('url', { nullable: true }),
  }),
})

builder.queryFields((t) => ({
  notifications: t.field({
    authScopes: {
      user: true,
    },
    type: NotificationPage,
    args: {
      ...createPageArgs(t.arg),
    },
    resolve: async (obj, { page }, { user }) => {
      const where: Prisma.Prisma.NotificationWhereInput = {
        unread: true,
        userId: user!.id,
      }

      const orderBy: Prisma.Prisma.NotificationOrderByWithRelationInput = { createdAt: 'desc' }

      return createPage(page, (args) =>
        prisma.$transaction([
          prisma.notification.findMany({ ...args, where, orderBy }),
          prisma.notification.count({ where }),
        ])
      )
    },
  }),
}))

builder.mutationFields((t) => ({
  readNotifications: t.field({
    authScopes: {
      user: true,
    },
    type: 'Boolean',
    resolve: (obj, args, { user }) => {
      return prisma.notification
        .updateMany({
          where: {
            unread: true,
            userId: user!.id,
          },
          data: {
            unread: false,
          },
        })
        .then(() => true)
    },
  }),
}))
