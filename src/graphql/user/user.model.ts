import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Facebook {
      token: String!
    }

    type User {
      id: ID!
      email: String!
      name: String!
      isStaff: Boolean!
      isConfirmed: Boolean!
      facebook: Facebook
      membership: Membership
    }

    type PaginatedUser {
      page: PageInfo!
      nodes: [User!]!
    }

    input UserFilter {
      createdAt: DateTimeFilter
      email: StringFilter
      name: StringFilter
      isStaff: Boolean
      isConfirmed: Boolean
    }

    input UserOrder {
      createdAt: OrderDirection
      email: OrderDirection
      name: OrderDirection
      isStaff: OrderDirection
      isConfirmed: OrderDirection
    }
  `,
})
