import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { paginated } from '../../helpers/parse'
import { TeamInclude } from './team.include'
import { parseTeamOrder } from './team.utils'

export default createGraphQLModule({
  typeDefs: gql`
    type Query {
      teams(page: Page, order: TeamOrder): PaginatedTeam!
      team(id: ID!): Team!
    }
  `,
  resolvers: {
    Query: {
      teams: withAuth('staff', (obj, { page, order }, { prisma }, info) => {
        const where: Prisma.TeamWhereInput = {}

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
