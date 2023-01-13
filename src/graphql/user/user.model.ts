import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type User {
      id: ID!
      createdAt: DateTime!
      email: String!
      emailConfirmed: Boolean!
      name: String!
      roles: [UserRole!]!
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
  `,
})
