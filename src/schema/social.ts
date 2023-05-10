import Prisma from '@prisma/client'
import { SocialKeys, getSocialProvider } from '../libs/social'
import { prisma } from '../prisma'
import { builder } from './builder'

export const SocialName = builder.enumType('SocialName', {
  values: SocialKeys,
})

export const Twitter = builder.objectRef<Prisma.Twitter>('Twitter')

Twitter.implement({
  fields: (t) => ({
    id: t.exposeID('twitterId'),
    username: t.exposeString('twitterUsername'),
  }),
})

export const Facebook = builder.objectRef<Prisma.Facebook>('Facebook')

Facebook.implement({
  fields: (t) => ({
    id: t.exposeID('facebookId'),
    username: t.exposeString('facebookUsername'),
  }),
})

export const Social = builder.unionType('Social', {
  types: [Twitter, Facebook],
  resolveType: (obj) => {
    if ('twitterId' in obj) return Twitter
    if ('facebookId' in obj) return Facebook
  },
})

builder.mutationFields((t) => ({
  authWithSocial: t.string({
    authScopes: {
      user: true,
    },
    args: {
      name: t.arg({ type: SocialName }),
    },
    resolve: (obj, { name }, { user }) => {
      return getSocialProvider(name).getAuthorizationURL(user!.id)
    },
  }),
  removeSocial: t.boolean({
    authScopes: {
      user: true,
    },
    args: {
      name: t.arg({ type: SocialName }),
    },
    resolve: async (obj, { name }, { user }) => {
      switch (name) {
        case 'twitter':
          await prisma.twitter.deleteMany({ where: { user: { id: user!.id } } })
          break
        case 'facebook':
          await prisma.facebook.deleteMany({ where: { user: { id: user!.id } } })
          break
      }

      return true
    },
  }),
}))
