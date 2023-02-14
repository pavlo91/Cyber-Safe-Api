import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { paginated } from '../../helpers/parse'
import { mapCount } from '../../helpers/seed'

export default createGraphQLModule({
  typeDefs: gql`
    type Item {
      id: ID!
    }

    type PaginatedItem {
      page: PageInfo!
      nodes: [Item!]!
    }

    extend type Query {
      tempPaginatedItem(page: Page): PaginatedItem!
    }
  `,
  resolvers: {
    Query: {
      tempPaginatedItem: (obj, { page }, ctx, info) => {
        return paginated(page, async () => {
          return [mapCount(100, (id) => ({ id })), 100]
        })
      },
    },
  },
})
