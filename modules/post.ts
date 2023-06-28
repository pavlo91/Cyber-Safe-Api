import { Media, Prisma } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import storage from '../libs/storage'
import { ActionKeys, executeAction } from '../utils/actions'
import { checkAuth, hasRoleInSchool, hasRoleToUser, isSameUser, isStaff, isUser } from '../utils/auth'
import { analyzePost } from '../utils/moderator'
import { createTwitterPost } from '../utils/twitter'
import { GQLSocialNameEnum } from './social'
import { GQLUser } from './user'
import { createFilterInput } from './utils/filter'
import { createPage, createPageArgs, createPageObjectRef } from './utils/page'

export const GQLPost = pothos.objectRef<
  Prisma.PostGetPayload<{
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
export const GQLPostPage = createPageObjectRef(GQLPost)

export const GQLAnalysisItemSeverityEnum = pothos.enumType('AnalysisItemSeverityEnum', {
  values: ['NONE', 'LOW', 'HIGH'] as const,
})

export const GQLPostFilter = createFilterInput(
  GQLPost,
  (t) => ({
    severity: t.field({ type: GQLAnalysisItemSeverityEnum, required: false }),
  }),
  ({ severity }) => {
    const where: Prisma.PostWhereInput = {}

    if (!!severity) {
      where.severity = severity
    }

    return where
  }
)

export const GQLFlag = pothos.loadableObjectRef<Prisma.AnalysisGetPayload<{ include: { items: true } }>, string>(
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

GQLFlag.implement({
  fields: (t) => ({
    severity: t.field({
      type: GQLAnalysisItemSeverityEnum,
      resolve: (obj) => {
        if (!!obj.items.find((e) => e.severity === 'HIGH')) {
          return 'HIGH'
        }
        if (!!obj.items.find((e) => e.severity === 'LOW')) {
          return 'LOW'
        }
        return 'NONE'
      },
    }),
    reasons: t.stringList({
      resolve: (obj) => {
        return obj.items.filter((e) => !!e.reason).map((e) => e.reason!)
      },
    }),
  }),
})

export const GQLMedia = pothos.objectRef<Media>('Media')

export const GQLMediaTypeEnum = pothos.enumType('MediaTypeEnum', {
  values: ['IMAGE', 'VIDEO'] as const,
})

GQLMedia.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.expose('type', { type: GQLMediaTypeEnum }),
    url: t.string({
      resolve: async (media) => {
        if (media.blobURL) {
          return await storage.signDownloadURL(media.blobURL).catch(() => media.url)
        }
        return media.url
      },
    }),
  }),
})

export const GQLAction = pothos.objectRef<
  Prisma.ActionGetPayload<{
    include: { type: true; user: true }
  }>
>('Action')

GQLAction.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    name: t.string({ resolve: ({ type }) => type.name }),
    user: t.expose('user', { type: GQLUser, nullable: true }),
  }),
})

GQLPost.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    url: t.exposeString('url'),
    text: t.exposeString('text'),
    platform: t.field({
      type: GQLSocialNameEnum,
      nullable: true,
      resolve: (post) => {
        if (!!post.twitterId) {
          return 'TWITTER'
        }
        if (!!post.facebookId) {
          return 'FACEBOOK'
        }
        if (!!post.instagramId) {
          return 'INSTAGRAM'
        }
        if (!!post.tiktokId) {
          return 'TIKTOK'
        }
      },
    }),
    severity: t.expose('severity', { type: GQLAnalysisItemSeverityEnum }),
    manualReview: t.exposeBoolean('manualReview'),
    flag: t.field({
      type: GQLFlag,
      nullable: true,
      resolve: (post) => post.id,
    }),
    user: t.field({
      type: GQLUser,
      resolve: (post) => post.userId,
    }),
    media: t.expose('media', { type: [GQLMedia] }),
    latestAction: t.string({
      nullable: true,
      resolve: (post) => {
        const actions = post.actions.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())
        return actions[0]?.type.name
      },
    }),
    actions: t.field({
      type: [GQLAction],
      resolve: (post) => {
        return post.actions.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())
      },
    }),
  }),
})

pothos.queryFields((t) => ({
  posts: t.field({
    type: GQLPostPage,
    args: {
      schoolId: t.arg.id({ required: false }),
      userId: t.arg.id({ required: false }),
      ...createPageArgs(t.arg),
      filter: t.arg({ type: GQLPostFilter, required: false }),
    },
    resolve: async (obj, { schoolId, userId, page, filter }, { user }) => {
      await checkAuth(
        () => !!schoolId && hasRoleInSchool(schoolId, user, ['ADMIN', 'COACH']),
        () => !!userId && isSameUser(userId, user),
        () => !!userId && hasRoleToUser(userId, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      const where: Prisma.PostWhereInput = { ...GQLPostFilter.toFilter(filter) }
      const orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: 'desc' }

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
      if (userId) {
        where.userId = userId
      }

      return await createPage(page, (args) =>
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
    type: GQLPost,
    args: {
      id: t.arg.id(),
    },
    resolve: async (obj, { id }, { user }) => {
      const post = await prisma.post.findUniqueOrThrow({
        where: { id },
      })

      await checkAuth(
        () => hasRoleToUser(post.userId, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      return await prisma.post.findUniqueOrThrow({
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

export const GQLActionEnum = pothos.enumType('ActionEnum', {
  values: ActionKeys,
})

pothos.mutationFields((t) => ({
  executeAction: t.boolean({
    args: {
      type: t.arg({ type: GQLActionEnum }),
      postId: t.arg.id(),
    },
    resolve: async (obj, { type, postId }, { user }) => {
      await checkAuth(() => isUser(user))

      await executeAction(type, postId, user!.id)

      return true
    },
  }),
  simulateNewFlaggedPost: t.fieldWithInput({
    type: 'Boolean',
    input: {
      userId: t.input.id(),
      severe: t.input.boolean(),
    },
    resolve: async (obj, { input: { userId, severe } }, { user }) => {
      await checkAuth(() => isStaff(user))

      let twitter = await prisma.twitter.findFirst({
        where: { user: { id: userId } },
        include: { user: true },
      })

      if (!twitter) {
        twitter = await prisma.twitter.create({
          data: {
            twitterAccessToken: '',
            twitterRefreshToken: '',
            twitterUsername: 'simulation',
            user: { connect: { id: userId } },
            twitterTokenExpiresAt: new Date(),
            twitterId: 'simulation-' + new Date().valueOf(),
          },
          include: { user: true },
        })
      }

      await createTwitterPost(twitter, {
        media: [],
        url: 'simulation',
        createdAt: new Date(),
        text: 'This is a simulation',
        externalId: 'simulation-' + new Date().valueOf(),
      }).then((post) => analyzePost(post.id, { simulateSeverity: severe ? 'HIGH' : 'LOW' }))

      return true
    },
  }),
}))
