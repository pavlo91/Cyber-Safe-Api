import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'
import { UserInclude } from '../user/user.include'
import { parseUserOrder, parseUserSearch } from '../user/user.utils'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Query {
      parents(childId: ID!, page: Page, order: UserOrder, search: String): PaginatedUser!
      children(page: Page, order: UserOrder, search: String): PaginatedUser!
    }
  `,
  resolvers: {
    Query: {
      parents: withAuth('member', (obj, { childId, page, order, search }, { prisma }, info) => {
        const where: Prisma.UserWhereInput = {
          ...parseUserSearch(search),
          roles: { some: { parentRole: { childUserId: childId } } },
        }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.user.findMany({
              ...args,
              where,
              orderBy: parseUserOrder(order),
              include: {
                ...UserInclude,
                roles: {
                  ...UserInclude.roles,
                  where: {
                    role: 'PARENT',
                    parentRole: {
                      childUserId: childId,
                    },
                  },
                },
              },
            }),
            prisma.user.count({ where }),
          ])
        )
      }),
      children: withAuth('parent', (obj, { page, order, search }, { prisma, user }, info) => {
        const where: Prisma.UserWhereInput = {
          ...parseUserSearch(search),
          parentRoles: { some: { userRole: { userId: user.id } } },
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
