import Prisma from '@prisma/client'
import * as TwitterLib from '../libs/twitter'
import { prisma } from '../prisma'
import { builder } from './builder'

export const Twitter = builder.objectRef<Prisma.Twitter>('Twitter')

Twitter.implement({
  fields: (t) => ({
    id: t.exposeID('twitterId'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    username: t.exposeString('twitterUsername'),
  }),
})

builder.mutationFields((t) => ({
  authWithTwitter: t.string({
    authScopes: {
      user: true,
    },
    resolve: (obj, args, { user }) => {
      return TwitterLib.getAuthURLForUserId(user!.id)
    },
  }),
  removeTwitter: t.boolean({
    authScopes: {
      user: true,
    },
    args: {
      id: t.arg.id(),
    },
    resolve: (obj, { id }, { user }) => {
      return prisma.twitter
        .deleteMany({
          where: { OR: [{ id }, { twitterId: id }] },
        })
        .then(() => true)
    },
  }),
}))
