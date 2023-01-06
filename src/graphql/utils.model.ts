import { DateTimeResolver } from 'graphql-scalars'
import { createGraphQLModule } from '.'
import { PageInfo } from '../types/graphql'

export default createGraphQLModule({
  typeDefs: `#graphql
    scalar DateTime

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
      insensitive
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
      asc
      desc
    }
  `,
  resolvers: {
    DateTime: DateTimeResolver,
    PageInfo: {
      hasPrev({ index }: PageInfo) {
        return index > 0
      },
      hasNext({ index, count }: PageInfo) {
        return index < count - 1
      },
    },
  },
})
