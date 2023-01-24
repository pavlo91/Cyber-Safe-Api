import { randAlphaNumeric } from '@ngneat/falso'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Config } from '../../config'
import { UserNotFoundError } from '../../helpers/errors'
import { Postmark } from '../../libs/postmark'
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
      requestResetPassword(email: String!): ID
      resetPassword(password: String!, passwordToken: String!): ID
    }
  `,
  resolvers: {
    Mutation: {
      async login(obj, { email, password }, { prisma }, info) {
        const user = await prisma.user
          .findUniqueOrThrow({
            where: { email },
            include: UserInclude,
          })
          .catch(() => {
            throw UserNotFoundError
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
      async requestResetPassword(obj, { email }, { prisma }, info) {
        const passwordToken = randAlphaNumeric({ length: 16 }).join('')

        await prisma.user.update({
          where: { email },
          data: { passwordToken },
        })

        const url = Config.composeUrl('webUrl', '/auth/reset/:token', { token: passwordToken })
        Postmark.shared.send(email, 'email/reset-password.pug', { url })
      },
      async resetPassword(obj, { password, passwordToken }, { prisma }, info) {
        const user = await prisma.user.findUniqueOrThrow({
          where: { passwordToken },
        })

        await prisma.user.update({
          where: { id: user.id },
          data: {
            password,
            passwordToken: null,
          },
        })
      },
    },
  },
})
