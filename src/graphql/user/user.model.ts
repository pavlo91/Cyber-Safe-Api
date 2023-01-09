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
      facebook: Facebook
      membership: Membership
    }

    type PaginatedUser {
      page: PageInfo!
      nodes: [User!]!
    }

    input UserFilter {
      id: StringFilter
      createdAt: DateTimeFilter
      email: StringFilter
      name: StringFilter
      isStaff: BooleanFilter
      facebook: FacebookFilter
      isConfirmed: BooleanFilter
      membership: MembershipFilter
    }

    input UserOrder {
      createdAt: OrderDirection
      email: OrderDirection
      name: OrderDirection
      isStaff: OrderDirection
      isConfirmed: OrderDirection
      membership: MembershipOrder
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
