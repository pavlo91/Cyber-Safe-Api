import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuth, withAuthMembership } from '../../helpers/auth'
import { paginated, select } from '../../helpers/parse'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Query {
      organizations(page: Page, filter: OrganizationFilter, order: OrganizationOrder): PaginatedOrganization!
      organization: Organization!
    }
  `,
  resolvers: {
    Query: {
      organizations: withAuth('staff', (obj, { page, filter, order }, { prisma }, info) => {
        const where: Prisma.OrganizationWhereInput = { ...filter }
        const orderBy: Prisma.OrganizationOrderByWithRelationInput = { ...order }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.organization.findMany({ ...args, ...select(info, 'Organization', 'nodes'), where, orderBy }),
            prisma.organization.count({ where }),
          ])
        )
      }),
      organization: withAuthMembership('admin', (obj, args, { prisma, organization }, info) => {
        return prisma.organization.findUniqueOrThrow({
          ...select(info, 'Organization'),
          where: { id: organization.id },
        })
      }),
    },
  },
})
