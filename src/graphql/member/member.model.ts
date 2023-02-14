import gql from 'graphql-tag'
import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: gql`
    enum MemberRole {
      ADMIN
      COACH
      ATHLETE
    }

    input MemberFilter {
      role: MemberRole
    }
  `,
})
