import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Membership {
      organization: Organization!
      isAdmin: Boolean!
    }

    input MembershipFilter {
      organization: OrganizationFilter
      user: UserFilter
      isAdmin: Boolean
    }

    input MembershipOrder {
      organization: OrganizationOrder
      user: UserOrder
      isAdmin: OrderDirection
    }
  `,
})
