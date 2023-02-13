import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Config } from '../../config'
import { UserNotFoundError } from '../../helpers/errors'
import { Postmark } from '../../libs/postmark'
import { Settings } from '../../seeds/settings'
import { comparePassword, createJwt, randomToken } from '../../utils/crypto'
import { UserInclude } from '../user/user.include'

export default createGraphQLModule({
  typeDefs: gql`
    type JWT {
      token: String!
      user: User!
    }

    type Mutation {
      login(email: String!, password: String!): JWT!
      register(email: String!, password: String!, user: UserCreate!, school: SchoolCreate!): JWT!
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
      async register(obj, { email, password, user, school }, { prisma }, info) {
        const setting = await prisma.globalSetting.findUnique({
          where: { id: Settings.enableSignUps },
        })

        if (setting?.boolean !== true) {
          throw new Error('The organization sign ups are not enabled')
        }

        const createdUser = await prisma.user
          .create({
            include: UserInclude,
            data: {
              ...user,
              email,
              password,
              roles: {
                create: {
                  role: 'ADMIN',
                  status: 'ACCEPTED',
                  schoolRole: {
                    create: {
                      school: {
                        create: {
                          name: school.name,
                          phone: school.phone ?? undefined,
                          address: school.address ? { create: school.address } : undefined,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
          .catch((error) => {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              // P2022: Unique constraint failed
              // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
              if (error.code === 'P2002') {
                throw new Error('There is already an user with the same e-mail')
              }
            }

            throw error
          })

        const token = createJwt(createdUser)

        return { token, user: createdUser }
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
        const passwordToken = randomToken()

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
