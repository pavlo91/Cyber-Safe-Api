import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Organization {
      id: ID!
      createdAt: DateTime!
      name: String!
    }

    type PaginatedOrganization {
      page: PageInfo!
      nodes: [Organization!]!
    }

    input OrganizationFilter {
      name: StringFilter
      createdAt: DateTimeFilter
    }

    input OrganizationOrder {
      name: OrderDirection
      createdAt: OrderDirection
    }
  `,
})
