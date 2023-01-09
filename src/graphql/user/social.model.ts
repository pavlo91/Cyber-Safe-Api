import { createGraphQLModule } from '..'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Facebook {
      createdAt: DateTime!
    }

    input FacebookFilter {
      is: NullObject
      isNot: NullObject
    }
  `,
})
