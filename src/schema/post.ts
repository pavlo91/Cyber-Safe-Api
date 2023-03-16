import Prisma from '@prisma/client'
import { hasRoleInSchoolId } from '../helpers/auth'
import { prisma } from '../prisma'
import { builder } from './builder'
import { createPage, createPageArgs, createPageObjectRef } from './page'

export const Post = builder.objectRef<Prisma.Post>('Post')
export const PostPage = createPageObjectRef(Post)

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
    },
    resolve: (obj, { schoolId, page }) => {
      const where: Prisma.Prisma.PostWhereInput = {}
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
        prisma.$transaction([prisma.post.findMany({ ...args, where, orderBy }), prisma.post.count({ where })])
      )
    },
  }),
}))
