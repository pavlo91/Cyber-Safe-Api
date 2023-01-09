import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { select } from '../../helpers/parse'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Query {
      me: User!
    }
  `,
  resolvers: {
    Query: {
      me: withAuth('any', (obj, args, { prisma, user }, info) => {
        return prisma.user.findUniqueOrThrow({
          ...select(info, 'User'),
          where: { id: user.id },
        })
      }),
    },
  },
})
