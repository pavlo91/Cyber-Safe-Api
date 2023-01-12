import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated, select } from '../../helpers/parse'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Query {
      children(page: Page, filter: RelationshipFilter, order: RelationshipOrder): PaginatedRelationship!
    }
  `,
  resolvers: {
    Query: {
      children: withAuth('parent', (obj, { page, filter, order }, { prisma, user }, info) => {
        const where: Prisma.RelationshipWhereInput = {
          ...filter,
          parentUserId: user.id,
        }
        const orderBy: Prisma.RelationshipOrderByWithRelationInput = { ...order }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.relationship.findMany({ ...args, ...select(info, 'Relationship', 'nodes'), where, orderBy }),
            prisma.relationship.count({ where }),
          ])
        )
      }),
    },
  },
})
