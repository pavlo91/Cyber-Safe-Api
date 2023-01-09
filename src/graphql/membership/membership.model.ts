import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Membership {
      createdAt: DateTime!
      organization: Organization!
      isAdmin: Boolean!
    }

    input MembershipFilter {
      createdAt: DateTimeFilter
      organization: OrganizationFilter
      isAdmin: BooleanFilter
    }

    input MembershipOrder {
      createdAt: OrderDirection
      organization: OrganizationOrder
      isAdmin: OrderDirection
    }

    input MembershipUpdate {
      isAdmin: Boolean
    }
  `,
})
