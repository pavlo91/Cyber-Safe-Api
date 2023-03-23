import Prisma from '@prisma/client'
import { hasRoleInSchoolId, hasRoleToUserId } from '../helpers/auth'
import { storageSignMediaURL } from '../libs/storage'
import { prisma } from '../prisma'
import { ActionKeys, executeAction } from '../utils/actions'
import { builder } from './builder'
import { createFilterInput } from './filter'
import { createPage, createPageArgs, createPageObjectRef } from './page'
import { User } from './user'

export type Platform = 'TWITTER' | 'UNKNOWN'
export const PlatformEnum = builder.enumType('PlatformEnum', {
  values: ['TWITTER', 'UNKNOWN'] as const,
})

export const Post = builder.objectRef<
  Prisma.Prisma.PostGetPayload<{
    include: {
      media: true
      actions: {
        include: {
          type: true
          user: true
        }
      }
    }
  }>
>('Post')
export const PostPage = createPageObjectRef(Post)

export const PostFilter = createFilterInput(
  Post,
  (t) => ({
    flagged: t.boolean({ required: false }),
  }),
  ({ flagged }) => {
    const where: Prisma.Prisma.PostWhereInput = {}

    if (typeof flagged === 'boolean') {
      where.flagged = flagged
    }

    return where
  }
)

export const Flag = builder.loadableObjectRef<Prisma.Prisma.AnalysisGetPayload<{ include: { items: true } }>, string>(
  'Flag',
  {
    load: async (keys) => {
      const analysis = await prisma.analysis.findMany({
        include: { items: true },
        where: { postId: { in: keys } },
      })
      return keys.map((key) => analysis.find((analysis) => analysis.postId === key)!)
    },
  }
)

Flag.implement({
  fields: (t) => ({
    reasons: t.stringList({
      resolve: (obj) => {
        return obj.items.filter((e) => !!e.reason).map((e) => e.reason!)
      },
    }),
  }),
})

export const Media = builder.objectRef<Prisma.Media>('Media')

export const MediaTypeEnum = builder.enumType('MediaTypeEnum', {
  values: ['IMAGE', 'VIDEO'] as const,
})

Media.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: MediaTypeEnum }),
    url: t.string({
      resolve: (media) => {
        if (media.blobName) {
          return storageSignMediaURL(media.blobName)
        }
        return media.url
      },
    }),
  }),
})

export const Action = builder.objectRef<
  Prisma.Prisma.ActionGetPayload<{
    include: { type: true; user: true }
  }>
>('Action')

Action.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    name: t.string({ resolve: ({ type }) => type.name }),
    user: t.expose('user', { type: User, nullable: true }),
  }),
})

Post.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    url: t.exposeString('url'),
    text: t.exposeString('text'),
    platform: t.field({
      type: PlatformEnum,
      resolve: (post) => {
        if (!!post.twitterId) {
          return 'TWITTER'
        }
        return 'UNKNOWN'
      },
    }),
    flagged: t.exposeBoolean('flagged'),
    manualReview: t.exposeBoolean('manualReview'),
    flag: t.field({
      type: Flag,
      nullable: true,
      resolve: (post) => post.id,
    }),
    user: t.field({
      type: User,
      resolve: (post) => post.userId,
    }),
    media: t.expose('media', { type: [Media] }),
    latestAction: t.string({
      nullable: true,
      resolve: (post) => {
        const actions = post.actions.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())
        return actions[0]?.type.name
      },
    }),
    actions: t.field({
      type: [Action],
      resolve: (post) => {
        return post.actions.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())
      },
    }),
  }),
})

builder.queryFields((t) => ({
  posts: t.field({
    authScopes: (obj, { schoolId }, { user }) => {
      if (schoolId && hasRoleInSchoolId(schoolId, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    type: PostPage,
    args: {
      schoolId: t.arg.id({ required: false }),
      ...createPageArgs(t.arg),
      filter: t.arg({ type: PostFilter, required: false }),
    },
    resolve: (obj, { schoolId, page, filter }) => {
      const where: Prisma.Prisma.PostWhereInput = { ...PostFilter.toFilter(filter) }
      const orderBy: Prisma.Prisma.PostOrderByWithRelationInput = { createdAt: 'desc' }

      if (schoolId) {
        where.user = {
          roles: {
            some: {
              status: 'ACCEPTED',
              schoolRole: { schoolId },
            },
          },
        }
      }

      return createPage(page, (args) =>
        prisma.$transaction([
          prisma.post.findMany({
            ...args,
            where,
            orderBy,
            include: {
              media: true,
              actions: {
                include: {
                  type: true,
                  user: true,
                },
              },
            },
          }),
          prisma.post.count({ where }),
        ])
      )
    },
  }),
  post: t.field({
    authScopes: async (obj, { id }, { user }) => {
      const post = await prisma.post.findUniqueOrThrow({
        where: { id },
      })

      if (hasRoleToUserId(post.userId, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    type: Post,
    args: {
      id: t.arg.id(),
    },
    resolve: (obj, { id }) => {
      return prisma.post.findUniqueOrThrow({
        where: { id },
        include: {
          media: true,
          actions: {
            include: {
              type: true,
              user: true,
            },
          },
        },
      })
    },
  }),
}))

export const ActionEnum = builder.enumType('ActionEnum', {
  values: ActionKeys,
})

builder.mutationFields((t) => ({
  executeAction: t.boolean({
    authScopes: {
      user: true,
    },
    args: {
      type: t.arg({ type: ActionEnum }),
      postId: t.arg.id(),
    },
    resolve: (obj, { type, postId }, { user }) => {
      return executeAction(type, postId, user!.id).then(() => true)
    },
  }),
}))
