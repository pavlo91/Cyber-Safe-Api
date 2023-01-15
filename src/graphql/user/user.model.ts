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
      teamRole: TeamRole
      parentRole: ParentRole
      childRole: ParentRole
      parentCount: Int!
    }

    type PaginatedUser {
      page: PageInfo!
      nodes: [User!]!
    }

    input UserOrder {
      createdAt: OrderDirection
      email: OrderDirection
      name: OrderDirection
      parentCount: OrderDirection
    }

    input UserCreate {
      name: String!
    }
  `,
  resolvers: {
    User: {
      teamRole: withAuth('any', (obj: Prisma.UserGetPayload<UserInclude>, args, { req }, info) => {
        const teamId = req.headers['x-team-id']

        if (typeof teamId === 'string') {
          return obj.roles.find((e) => e.teamRole && e.teamRole.teamId === teamId)
        }
      }),
      parentRole: withAuth('any', (obj: Prisma.UserGetPayload<UserInclude>, args, ctx, info) => {
        return obj.roles.find((e) => e.parentRole)
      }),
      childRole: withAuth('parent', (obj: Prisma.UserGetPayload<UserInclude>, args, { user }, info) => {
        return user.roles.find((e) => e.parentRole && e.parentRole.childUserId === obj.id)
      }),
      parentCount(obj: Prisma.UserGetPayload<UserInclude>) {
        return obj.parentRoles.length
      },
    },
  },
})
