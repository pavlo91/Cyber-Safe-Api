import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { comparePassword, createJwt } from '../../utils/crypto'
import { UserInclude } from '../user/user.include'

export default createGraphQLModule({
  typeDefs: gql`
    type JWT {
      token: String!
      user: User!
    }

    type Mutation {
      login(email: String!, password: String!): JWT!
      register(email: String!, password: String!, team: TeamCreate!): ID
      activate(email: String!, password: String!, passwordToken: String!): ID
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
