import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { TeamInclude } from './team.include'

export default createGraphQLModule({
  typeDefs: gql`
    type Team {
      id: ID!
      createdAt: DateTime!
      name: String!
      memberCount: Int!
    }

    type PaginatedTeam {
      page: PageInfo!
      nodes: [Team!]!
    }

    input TeamOrder {
      createdAt: OrderDirection
      name: OrderDirection
      memberCount: OrderDirection
    }

    input TeamCreate {
      name: String!
    }
  `,
  resolvers: {
    Team: {
      memberCount(obj: Prisma.TeamGetPayload<TeamInclude>) {
        return obj._count.roles
      },
    },
  },
})
