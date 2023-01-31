import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Query {
      notifications(page: Page): PaginatedNotification!
      notificationsCount: Int!
    }
  `,
  resolvers: {
    Query: {
      notifications: withAuth('any', (obj, { page }, { prisma, user, team }, info) => {
        const where: Prisma.NotificationWhereInput = {
          unread: true,
          userId: user.id,
          teamId: team?.id,
        }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.notification.findMany({ ...args, where, orderBy: { createdAt: 'desc' } }),
            prisma.notification.count({ where }),
          ])
        )
      }),
      notificationsCount: withAuth('any', (obj, args, { prisma, user, team }, info) => {
        return prisma.notification.count({
          where: {
            unread: true,
            userId: user.id,
            teamId: team?.id,
          },
        })
      }),
    },
  },
})
