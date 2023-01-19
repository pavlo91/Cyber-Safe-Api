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
      register(email: String!, password: String!, user: UserCreate!, team: TeamCreate!): ID
      activate(password: String!, passwordToken: String!, user: UserCreate!): ID
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
      async register(obj, { email, password, user, team }, { prisma }, info) {
        await prisma.user.create({
          data: {
            ...user,
            email,
            password,
            roles: {
              create: {
                role: 'COACH',
                teamRole: {
                  create: {
                    team: {
                      create: {
                        ...team,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      },
      async activate(obj, { password, passwordToken, user }, { prisma }, info) {
        const foundUser = await prisma.user.findUniqueOrThrow({
          where: { passwordToken },
        })

        await prisma.user.update({
          where: { id: foundUser.id },
          data: {
            ...user,
            password,
            passwordToken: null,
          },
        })
      },
    },
  },
})
