import { createGraphQLModule } from '..'
import { select } from '../../helpers/graphql'
import { comparePassword, createJwt } from '../../libs/crypto'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Token {
      token: String
      user: User!
    }

    input RegisterInput {
      name: String!
      organizationName: String!
    }

    type Mutation {
      login(email: String!, password: String!): Token!
      register(email: String!, password: String!, input: RegisterInput!): ID
    }
  `,
  resolvers: {
    Mutation: {
      async login(obj, { email, password }, { prisma }, info) {
        const user = await prisma.user.findUniqueOrThrow({
          ...select(info, 'User', 'user'),
          where: { email },
        })

        if (!comparePassword(password, user.password)) {
          throw new Error("Passwords don't match")
        }

        const token = createJwt(user)

        return { token, user }
      },
      async register(obj, { email, password, input: { name, organizationName } }, { prisma }, info) {
        await prisma.user.create({
          data: {
            email,
            password,
            name,
            membership: {
              create: {
                isAdmin: true,
                organization: {
                  create: {
                    name: organizationName,
                  },
                },
              },
            },
          },
        })
      },
    },
  },
})
