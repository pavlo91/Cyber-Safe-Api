import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Organization {
      id: ID!
      name: String!
    }

    input OrganizationFilter {
      name: StringFilter
    }

    input OrganizationOrder {
      name: OrderDirection
    }
  `,
})
