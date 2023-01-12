import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type User {
      id: ID!
      createdAt: DateTime!
      email: String!
      name: String!
      isStaff: Boolean!
      isConfirmed: Boolean!
      memberships: [Membership!]!
      parents: [Relationship!]!
      children: [Relationship!]!
    }

    type PaginatedUser {
      page: PageInfo!
      nodes: [User!]!
    }

    input UserFilter {
      createdAt: DateTimeFilter
      email: StringFilter
      name: StringFilter
      isStaff: BooleanFilter
      isConfirmed: BooleanFilter
    }

    input UserOrder {
      createdAt: OrderDirection
      email: OrderDirection
      name: OrderDirection
      isStaff: OrderDirection
      isConfirmed: OrderDirection
    }

    input UserUpdate {
      email: String
      name: String
      isStaff: Boolean
      isConfirmed: Boolean
    }

    input ProfileUpdate {
      email: String
      password: String
      name: String
    }
  `,
})
