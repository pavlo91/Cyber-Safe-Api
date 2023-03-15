import Prisma from '@prisma/client'
import { hasRoleInSchoolId } from '../helpers/auth'
import { prisma } from '../prisma'
import { builder } from './builder'
import { createPage, createPageArgs, createPageObjectRef } from './page'

export const Post = builder.objectRef<Prisma.Post>('Post')
export const PostPage = createPageObjectRef(Post)

Post.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    text: t.exposeString('text'),
    flagged: t.loadable({
      type: 'Boolean',
      resolve: (post) => post.id,
      load: async (keys: string[]) => {
        const analysis = await prisma.analysis.findMany({
          include: { items: true },
          where: { postId: { in: keys } },
        })
        return keys.map((key) => {
          const foundAnalysis = analysis.find((analysis) => analysis.id === key)

          if (foundAnalysis) {
            return foundAnalysis.items.reduce((prev, curr) => prev || curr.flagged, false)
          }

          return false
        })
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
