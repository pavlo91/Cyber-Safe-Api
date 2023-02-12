import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'
import { SchoolInclude } from './school.include'
import { parseSchoolOrder, parseSchoolSearch } from './school.utils'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Query {
      schools(page: Page, order: SchoolOrder, search: String): PaginatedSchool!
      school(id: ID!): School!
    }
  `,
  resolvers: {
    Query: {
      schools: withAuth('staff', (obj, { page, order, search }, { prisma }, info) => {
        const where: Prisma.SchoolWhereInput = {
          ...parseSchoolSearch(search),
        }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.school.findMany({
              ...args,
              where,
              include: SchoolInclude,
              orderBy: parseSchoolOrder(order),
            }),
            prisma.school.count({ where }),
          ])
        )
      }),
      school: withAuth('any', (obj, { id }, { prisma }, info) => {
        return prisma.school.findUniqueOrThrow({
          where: { id },
          include: SchoolInclude,
        })
      }),
    },
  },
})
