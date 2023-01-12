import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuthMembership } from '../../helpers/auth'
import { paginated, select } from '../../helpers/parse'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Query {
      members(page: Page, filter: MembershipFilter, order: MembershipOrder): PaginatedMembership!
    }
  `,
  resolvers: {
    Query: {
      members: withAuthMembership('any', (obj, { page, filter, order }, { prisma, organization }, info) => {
        const where: Prisma.MembershipWhereInput = {
          ...filter,
          organizationId: organization.id,
        }
        const orderBy: Prisma.MembershipOrderByWithRelationInput = { ...order }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.membership.findMany({ ...args, ...select(info, 'Membership', 'nodes'), where, orderBy }),
            prisma.membership.count({ where }),
          ])
        )
      }),
    },
  },
})
