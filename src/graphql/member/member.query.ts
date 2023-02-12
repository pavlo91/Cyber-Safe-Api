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
      members(page: Page, order: UserOrder, search: String): PaginatedUser!
      member(id: ID!): User!
    }
  `,
  resolvers: {
    Query: {
      members: withAuth('member', (obj, { page, order, search }, { prisma, school }, info) => {
        const where: Prisma.UserWhereInput = {
          ...parseUserSearch(search),
          roles: { some: { schoolRole: { schoolId: school.id } } },
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
                    role: {
                      in: ['ADMIN', 'COACH', 'ATHLETE'],
                    },
                    schoolRole: {
                      schoolId: school.id,
                    },
                  },
                },
              },
            }),
            prisma.user.count({ where }),
          ])
        )
      }),
      member: withAuth('member', (obj, { id }, { prisma, school }, info) => {
        return prisma.user.findFirstOrThrow({
          where: {
            id,
            roles: { some: { schoolRole: { schoolId: school.id } } },
          },
          include: {
            ...UserInclude,
            roles: {
              ...UserInclude.roles,
              where: {
                role: {
                  in: ['ADMIN', 'COACH', 'ATHLETE'],
                },
                schoolRole: {
                  schoolId: school.id,
                },
              },
            },
          },
        })
      }),
    },
  },
})
