import { GraphQLScalarType, Kind } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { createGraphQLModule } from '.'
import { PageInfo } from '../types/graphql'

const NullObjectResolver = new GraphQLScalarType({
  name: 'NullObject',
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
    scalar NullObject

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
      DEFAULT
      INSENSITIVE
    }

    input StringFilter {
      not: String
      equals: String
      contains: String
      mode: StringFilterMode = INSENSITIVE
    }

    input IntFilter {
      not: Int
      equals: Int
      gte: Int
      lte: Int
    }

    input FloatFilter {
      not: Float
      equals: Float
      gte: Float
      lte: Float
    }

    input BooleanFilter {
      not: Boolean
      equals: Boolean
    }

    input DateTimeFilter {
      not: DateTime
      equals: DateTime
      gte: DateTime
      lte: DateTime
    }

    enum OrderDirection {
      ASC
      DESC
    }

    input ArrayOrder {
      _count: OrderDirection
    }
  `,
  resolvers: {
    DateTime: DateTimeResolver,
    NullObject: NullObjectResolver,
    PageInfo: {
      hasPrev({ index }: PageInfo) {
        return index > 0
      },
      hasNext({ index, count }: PageInfo) {
        return index < count - 1
      },
    },
    StringFilterMode: {
      DEFAULT: 'default',
      INSENSITIVE: 'insensitive',
    },
    OrderDirection: {
      ASC: 'asc',
      DESC: 'desc',
    },
  },
})
