import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'
import { TeamInclude } from './team.include'
import { parseTeamOrder, parseTeamSearch } from './team.utils'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Query {
      teams(page: Page, order: TeamOrder, search: String): PaginatedTeam!
      team(id: ID!): Team!
    }
  `,
  resolvers: {
    Query: {
      teams: withAuth('staff', (obj, { page, order, search }, { prisma }, info) => {
        const where: Prisma.TeamWhereInput = {
          ...parseTeamSearch(search),
        }

        return paginated(page, (args) =>
          prisma.$transaction([
            prisma.team.findMany({
              ...args,
              where,
              include: TeamInclude,
              orderBy: parseTeamOrder(order),
            }),
            prisma.team.count({ where }),
          ])
        )
      }),
      team: withAuth('any', (obj, { id }, { prisma }, info) => {
        return prisma.team.findUniqueOrThrow({
          where: { id },
          include: TeamInclude,
        })
      }),
    },
  },
})
