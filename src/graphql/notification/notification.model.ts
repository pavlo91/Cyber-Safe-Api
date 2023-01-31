import gql from 'graphql-tag'
import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: gql`
    type Notification {
      id: ID!
      createdAt: DateTime!
      message: String!
      url: String
    }

    type PaginatedNotification {
      page: PageInfo!
      nodes: [Notification!]!
    }
  `,
})
