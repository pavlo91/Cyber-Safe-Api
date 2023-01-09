import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuth, withAuthMember } from '../../helpers/auth'
import { paginated, select } from '../../helpers/parse'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Query {
      members(page: Page, filter: UserFilter, order: UserOrder): PaginatedUser!
      users(page: Page, filter: UserFilter, order: UserOrder): PaginatedUser!
    }
  `,
  resolvers: {
    Query: {
      members: withAuthMember('any', (obj, { page, filter, order }, { prisma, organization }, info) => {
        const where: Prisma.UserWhereInput = {
          ...filter,
          membership: {
            ...filter?.membership,
            organizationId: organization.id,
          },
        }
        const orderBy: Prisma.UserOrderByWithRelationInput = { ...order }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.user.findMany({ ...args, ...select(info, 'User', 'nodes'), where, orderBy }),
            prisma.user.count({ where }),
          ])
        )
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
