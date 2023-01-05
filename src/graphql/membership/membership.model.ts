import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Membership {
      organization: Organization!
      isAdmin: Boolean!
    }

    input MembershipFilter {
      organization: OrganizationFilter
      isAdmin: Boolean
    }

    input MembershipOrder {
      organization: OrganizationOrder
      isAdmin: OrderDirection
    }
  `,
})
