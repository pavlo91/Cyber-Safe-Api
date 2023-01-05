import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuthMember } from '../../helpers/auth'
import { paginated, select } from '../../helpers/graphql'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Query {
      members(page: Page, filter: MembershipFilter, order: MembershipOrder): PaginatedUser!
    }
  `,
  resolvers: {
    Query: {
      members: withAuthMember('admin', async (obj, { page, filter, order }, { prisma, organization }, info) => {
        const where: Prisma.MembershipWhereInput = {
          ...filter,
          organizationId: organization.id,
        }
        const orderBy: Prisma.MembershipOrderByWithRelationInput = { ...order }

        const data = await paginated(page, (args) =>
          prisma.$transaction([
            prisma.membership.findMany({
              ...args,
              where,
              orderBy,
              select: { user: { ...select(info, 'User', 'nodes') } },
            }),
            prisma.membership.count({ where }),
          ])
        )

        return {
          ...data,
          nodes: data.nodes.map((e) => e.user),
        }
      }),
    },
  },
})
