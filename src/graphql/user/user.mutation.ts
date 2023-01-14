import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteStaff(email: String!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteStaff: withAuth('staff', async (obj, { email }, { prisma }, info) => {
        await prisma.user.create({
          data: {
            email,
            name: '',
            roles: {
              create: {
                role: 'STAFF',
              },
            },
          },
        })
      }),
    },
  },
})
