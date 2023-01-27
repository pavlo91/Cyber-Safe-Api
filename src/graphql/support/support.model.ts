import gql from 'graphql-tag'
import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: gql`
    input ContactInput {
      firstName: String!
      lastName: String!
      email: String!
      phone: String
      jobTitle: String
      schoolName: String!
      state: String!
      students: String!
      describe: String!
      comments: String
    }
  `,
})
