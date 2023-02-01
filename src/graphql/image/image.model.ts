import gql from 'graphql-tag'
import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: gql`
    type Image {
      url: String!
    }
  `,
})
