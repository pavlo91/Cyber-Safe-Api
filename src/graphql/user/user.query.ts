import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'
import { UserOrder } from '../../types/graphql'
import { UserInclude } from './user.include'

function parseUserOrder(order: UserOrder | undefined | null) {
  if (!order) return

  const orderBy: Prisma.UserOrderByWithRelationInput = {}

  if (order.createdAt) orderBy.createdAt = order.createdAt
  if (order.email) orderBy.email = order.email
  if (order.name) orderBy.name = order.name

  return orderBy
}

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Query {
      users(page: Page, order: UserOrder): PaginatedUser!
    }
  `,
  resolvers: {
    Query: {
      users: withAuth('staff', (obj, { page, order }, { prisma }, info) => {
        const where: Prisma.UserWhereInput = {}

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.user.findMany({
              ...args,
              where,
              include: UserInclude,
              orderBy: parseUserOrder(order),
            }),
            prisma.user.count({ where }),
          ])
        )
      }),
    },
  },
})
