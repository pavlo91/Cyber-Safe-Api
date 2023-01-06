import { GraphQLScalarType, Kind } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { createGraphQLModule } from '.'
import { PageInfo } from '../types/graphql'

const NullResolver = new GraphQLScalarType({
  name: 'Null',
  parseLiteral(node) {
    if (node.kind === Kind.NULL) {
      return null
    }
  },
  parseValue(value) {
    if (value === null) {
      return null
    }
  },
})

export default createGraphQLModule({
  typeDefs: `#graphql
    scalar DateTime
    scalar Null

    input Page {
      index: Int
      size: Int
    }

    type PageInfo {
      index: Int!
      size: Int!
      count: Int!
      total: Int!
      hasPrev: Boolean!
      hasNext: Boolean!
    }

    enum StringFilterMode {
      INSENSITIVE
    }

    input StringFilter {
      equals: String
      contains: String
      mode: StringFilterMode
    }

    input NumberFilter {
      gte: Float
      lte: Float
    }

    input DateTimeFilter {
      gte: DateTime
      lte: DateTime
    }

    enum OrderDirection {
      ASC
      DESC
    }
  `,
  resolvers: {
    DateTime: DateTimeResolver,
    Null: NullResolver,
    PageInfo: {
      hasPrev({ index }: PageInfo) {
        return index > 0
      },
      hasNext({ index, count }: PageInfo) {
        return index < count - 1
      },
    },
    StringFilterMode: {
      INSENSITIVE: 'insensitive',
    },
    OrderDirection: {
      ASC: 'asc',
      DESC: 'desc',
    },
  },
})
