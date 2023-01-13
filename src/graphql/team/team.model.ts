import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Team {
      id: ID!
      createdAt: DateTime!
      name: String!
    }
  `,
})
