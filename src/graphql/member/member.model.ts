import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'
import { UserInclude } from '../user/user.include'
import { parseUserOrder } from '../user/user.utils'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Query {
      members(page: Page, order: UserOrder): PaginatedUser!
    }
  `,
  resolvers: {
    Query: {
      members: withAuth('member', (obj, { page, order }, { prisma, team }, info) => {
        const where: Prisma.UserWhereInput = {
          roles: { some: { teamRole: { teamId: team.id } } },
        }

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
