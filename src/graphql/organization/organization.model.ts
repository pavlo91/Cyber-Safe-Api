import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Organization {
      id: ID!
      createdAt: DateTime!
      name: String!
      address: Address!
    }

    type PaginatedOrganization {
      page: PageInfo!
      nodes: [Organization!]!
    }

    input OrganizationFilter {
      createdAt: DateTimeFilter
      name: StringFilter
      address: AddressFilter
    }

    input OrganizationOrder {
      createdAt: OrderDirection
      name: OrderDirection
      address: AddressOrder
    }
    
    input OrganizationCreate {
      name: String!
      address: AddressCreate!
    }

    input OrganizationUpdate {
      name: String
      address: AddressUpdate
    }
  `,
})
