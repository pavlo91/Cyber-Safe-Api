import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Mutation {
      inviteStaff(email: String!): ID
      updateUser(id: ID!, input: UserUpdate!): ID
      updateProfile(input: ProfileUpdate!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteStaff: withAuth('staff', async (obj, { email }, { prisma }, info) => {
        await prisma.user.create({
          data: {
            email,
            name: '',
            isStaff: true,
          },
        })
      }),
      updateUser: withAuth('staff', async (obj, { id, input }, { prisma }, info) => {
        await prisma.user.update({
          where: { id },
          data: { ...input },
        })
      }),
      updateProfile: withAuth('any', async (obj, { input }, { prisma, user }, info) => {
        await prisma.user.update({
          where: { id: user.id },
          data: { ...input },
        })
      }),
    },
  },
})
