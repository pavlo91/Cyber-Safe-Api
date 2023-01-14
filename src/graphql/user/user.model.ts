import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { UserInclude } from './user.include'

export default createGraphQLModule({
  typeDefs: gql`
    type User {
      id: ID!
      createdAt: DateTime!
      email: String!
      emailConfirmed: Boolean!
      name: String!
      roles: [UserRole!]!
      teamRoles: [UserRole!]!
    }

    type PaginatedUser {
      page: PageInfo!
      nodes: [User!]!
    }

    input UserOrder {
      createdAt: OrderDirection
      email: OrderDirection
      name: OrderDirection
    }

    input UserCreate {
      name: String!
    }
  `,
  resolvers: {
    User: {
      teamRoles: withAuth('any', (obj: Prisma.UserGetPayload<UserInclude>, args, { req }, info) => {
        const teamId = req.headers['x-team-id']

        if (typeof teamId === 'string') {
          return obj.roles.filter((e) => e.teamRole && e.teamRole.teamId === teamId)
        }

        return []
      }),
    },
  },
})
