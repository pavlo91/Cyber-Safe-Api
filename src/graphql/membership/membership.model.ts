import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Membership {
      user: User!
      organization: Organization!
      createdAt: DateTime!
      isAdmin: Boolean!
    }

    type PaginatedMembership {
      page: PageInfo!
      nodes: [Membership!]!
    }

    input MembershipFilter {
      user: UserFilter
      organization: OrganizationFilter
      createdAt: DateTimeFilter
      isAdmin: BooleanFilter
    }

    input MembershipOrder {
      user: UserOrder
      organization: OrganizationOrder
      createdAt: OrderDirection
      isAdmin: OrderDirection
    }

    input MembershipUpdate {
      isAdmin: Boolean
    }
  `,
})
