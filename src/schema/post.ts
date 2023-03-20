import Prisma from '@prisma/client'
import { hasRoleInSchoolId, hasRoleToUserId } from '../helpers/auth'
import { prisma } from '../prisma'
import { builder } from './builder'
import { createFilterInput } from './filter'
import { createPage, createPageArgs, createPageObjectRef } from './page'
import { User } from './user'

export const Post = builder.objectRef<Prisma.Prisma.PostGetPayload<{ include: { media: true } }>>('Post')
export const PostPage = createPageObjectRef(Post)

export const PostFilter = createFilterInput(
  Post,
  (t) => ({
    flagged: t.boolean({ required: false }),
  }),
  ({ flagged }) => {
    const where: Prisma.Prisma.PostWhereInput = {}

    if (flagged === true) {
      where.analysis = { items: { some: { flagged: true } } }
    } else if (flagged === false) {
      where.analysis = { items: { every: { flagged: false } } }
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
    flagged: t.boolean({
      resolve: (obj) => {
        return !!obj.items.find((e) => e.flagged)
      },
    }),
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
    url: t.exposeString('url'),
    type: t.expose('type', { type: MediaTypeEnum }),
  }),
})

Post.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    url: t.exposeString('url'),
    text: t.exposeString('text'),
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
          prisma.post.findMany({ ...args, where, orderBy, include: { media: true } }),
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
        include: { media: true },
      })
    },
  }),
}))
