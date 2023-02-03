import { Address, Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { SchoolInclude } from './school.include'

export default createGraphQLModule({
  typeDefs: gql`
    type Address {
      street: String!
      city: String!
      state: String!
      zip: String!
      formatted: String!
    }

    type School {
      id: ID!
      createdAt: DateTime!
      name: String!
      address: Address
      logo: Image
      memberCount: Int!
    }

    type PaginatedSchool {
      page: PageInfo!
      nodes: [School!]!
    }

    input SchoolOrder {
      createdAt: OrderDirection
      name: OrderDirection
      memberCount: OrderDirection
    }

    input SchoolCreate {
      name: String!
    }

    input AddressUpdate {
      street: String!
      city: String!
      state: String!
      zip: String!
    }

    input SchoolUpdate {
      name: String
      address: AddressUpdate
      logo: String
    }
  `,
  resolvers: {
    Address: {
      formatted({ street, city, state, zip }: Address) {
        return `${street}, ${city}, ${state} ${zip}`
      },
    },
    School: {
      memberCount(obj: Prisma.SchoolGetPayload<SchoolInclude>) {
        return obj._count.roles
      },
    },
  },
})
