import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Facebook {
      createdAt: DateTime!
      token: String!
    }
  `,
})
