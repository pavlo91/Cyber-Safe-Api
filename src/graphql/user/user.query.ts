import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated, select } from '../../helpers/graphql'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Query {
      me: User!
      users(page: Page, filter: UserFilter, order: UserOrder): PaginatedUser!
    }
  `,
  resolvers: {
    Query: {
      me: withAuth('any', (obj, args, { prisma, user }, info) => {
        return prisma.user.findUniqueOrThrow({
          ...select(info, 'User'),
          where: { id: user.id },
        })
      }),
      users: withAuth('staff', (obj, { page, filter, order }, { prisma }, info) => {
        const where: Prisma.UserWhereInput = { ...filter }
        const orderBy: Prisma.UserOrderByWithRelationInput = { ...order }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.user.findMany({ ...args, ...select(info, 'User', 'nodes'), where, orderBy }),
            prisma.user.count({ where }),
          ])
        )
      }),
    },
  },
})
