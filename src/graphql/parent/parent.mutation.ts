import gql from 'graphql-tag'
import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteParent(email: String!, childId: ID!): ID
    }
  `,
  resolvers: {},
})
