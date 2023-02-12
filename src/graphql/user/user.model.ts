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
      avatar: Image
      roles: [UserRole!]!
      parentRole: ParentRole
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
      parentRole: withAuth('parent', (obj: Prisma.UserGetPayload<UserInclude>, args, { user }, info) => {
        const role = obj.parentRoles.find((e) => e.userRole.userId === user.id)
        return role?.userRole
      }),
      parentCount(obj: Prisma.UserGetPayload<UserInclude>) {
        return obj.parentRoles.length
      },
    },
  },
})
