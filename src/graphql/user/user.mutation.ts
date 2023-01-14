import gql from 'graphql-tag'
import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteStaff(email: String!): ID
    }
  `,
  resolvers: {},
})
