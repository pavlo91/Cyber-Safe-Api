import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { comparePassword } from '../../utils/crypto'

export default createGraphQLModule({
  typeDefs: gql`
    input UpdateProfileInput {
      name: String
    }

    extend type Mutation {
      updateProfile(input: UpdateProfileInput!): ID
      updatePassword(oldPassword: String!, newPassword: String!): ID
    }
  `,
  resolvers: {
    Mutation: {
      updateProfile: withAuth('any', async (obj, { input }, { prisma, user }, info) => {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: input.name ?? undefined,
          },
        })
      }),
      updatePassword: withAuth('any', async (obj, { oldPassword, newPassword }, { prisma, user }, info) => {
        if (!user.password || !comparePassword(oldPassword, user.password)) {
          throw new Error("Passwords don't match")
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { password: newPassword },
        })
      }),
    },
  },
})
