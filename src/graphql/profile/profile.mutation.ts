import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { updateImage } from '../../helpers/upload'
import { comparePassword } from '../../utils/crypto'

export default createGraphQLModule({
  typeDefs: gql`
    input UpdateProfileInput {
      newEmail: String
      name: String
      avatar: String
    }

    extend type Mutation {
      updateProfile(input: UpdateProfileInput!): ID
      updatePassword(oldPassword: String!, newPassword: String!): ID
    }
  `,
  resolvers: {
    Mutation: {
      updateProfile: withAuth('any', async (obj, { input }, { prisma, user }, info) => {
        const data: Prisma.UserUpdateInput = {
          newEmail: input.newEmail ?? undefined,
          name: input.name ?? undefined,
          avatar: await updateImage(input.avatar, prisma),
        }

        await prisma.user.update({
          where: { id: user.id },
          data,
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
