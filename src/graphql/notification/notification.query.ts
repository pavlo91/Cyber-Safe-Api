import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Query {
      notifications(page: Page, unread: Boolean = true): PaginatedNotification!
    }
  `,
  resolvers: {
    Query: {
      notifications: withAuth('any', async (obj, { page, unread }, { prisma, user }, info) => {
        const where: Prisma.NotificationWhereInput = {
          unread,
          userId: user.id,
        }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.notification.findMany({ ...args, where, orderBy: { createdAt: 'desc' } }),
            prisma.notification.count({ where }),
          ])
        )
      }),
    },
  },
})
