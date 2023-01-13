import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Query {
      profile: User!
    }
  `,
  resolvers: {
    Query: {
      profile: withAuth('any', (obj, args, { user }, info) => {
        return user
      }),
    },
  },
})
