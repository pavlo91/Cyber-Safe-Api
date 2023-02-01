import { randAvatar } from '@ngneat/falso'
import { Address, Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Image } from '../../types/graphql'
import { TeamInclude } from './team.include'

export default createGraphQLModule({
  typeDefs: gql`
    type Address {
      street: String!
      city: String!
      state: String!
      zip: String!
      formatted: String!
    }

    type Team {
      id: ID!
      createdAt: DateTime!
      name: String!
      address: Address
      logo: Image
      memberCount: Int!
    }

    type PaginatedTeam {
      page: PageInfo!
      nodes: [Team!]!
    }

    input TeamOrder {
      createdAt: OrderDirection
      name: OrderDirection
      memberCount: OrderDirection
    }

    input TeamCreate {
      name: String!
    }

    input AddressUpdate {
      street: String!
      city: String!
      state: String!
      zip: String!
    }

    input TeamUpdate {
      name: String
      address: AddressUpdate
    }
  `,
  resolvers: {
    Address: {
      formatted({ street, city, state, zip }: Address) {
        return `${street}, ${city}, ${state} ${zip}`
      },
    },
    Team: {
      logo(obj: Prisma.TeamGetPayload<TeamInclude>): Image {
        if (obj.logo) {
          return obj.logo
        }

        return {
          url: randAvatar(),
        }
      },
      memberCount(obj: Prisma.TeamGetPayload<TeamInclude>) {
        return obj._count.roles
      },
    },
  },
})
