import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Address {
      id: ID!
      street: String!
      city: String!
      state: String!
      zip: String!
    }

    input AddressFilter {
      street: StringFilter
      city: StringFilter
      state: StringFilter
      zip: StringFilter
    }

    input AddressOrder {
      street: OrderDirection
      city: OrderDirection
      state: OrderDirection
      zip: OrderDirection
    }

    input AddressCreate {
      street: String!
      city: String!
      state: String!
      zip: String!
    }

    input AddressUpdate {
      street: String
      city: String
      state: String
      zip: String
    }
  `,
})
