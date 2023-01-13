import { createGraphQLModule } from '..'
import { comparePassword, createJwt } from '../../utils/crypto'
import { UserInclude } from '../user/user.include'

export default createGraphQLModule({
  typeDefs: `#graphql
    type JWT {
      token: String!
      user: User!
    }

    type Mutation {
      login(email: String!, password: String!): JWT!
    }
  `,
  resolvers: {
    Mutation: {
      async login(obj, { email, password }, { prisma }, info) {
        const user = await prisma.user.findUniqueOrThrow({
          where: { email },
          include: UserInclude,
        })

        if (!user.password || !comparePassword(password, user.password)) {
          throw new Error("Passwords don't match")
        }

        const token = createJwt(user)

        return { token, user }
      },
    },
  },
})
