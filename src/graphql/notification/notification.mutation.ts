import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      readAllNotifications: ID
    }
  `,
  resolvers: {
    Mutation: {
      readAllNotifications: withAuth('any', async (obj, args, { prisma, user }, info) => {
        await prisma.notification.updateMany({
          where: {
            unread: true,
            userId: user.id,
          },
          data: {
            unread: false,
          },
        })
      }),
    },
  },
})
