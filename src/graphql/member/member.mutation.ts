import gql from 'graphql-tag'
import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteCoach(email: String!): ID
      inviteAthlete(email: String!): ID
    }
  `,
  resolvers: {},
})
