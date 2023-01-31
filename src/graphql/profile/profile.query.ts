import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { UserInclude } from '../user/user.include'

export default createGraphQLModule({
  typeDefs: gql`
    type Query {
      profile: User!
    }
  `,
  resolvers: {
    Query: {
      profile: withAuth('any', (obj, args, { prisma, user }, info) => {
        return prisma.user.findUniqueOrThrow({
          include: UserInclude,
          where: { id: user.id },
        })
      }),
    },
  },
})
