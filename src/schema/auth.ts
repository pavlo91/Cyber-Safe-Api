import Prisma from '@prisma/client'
import { composeWebURL } from '../helpers/url'
import { sendEmail } from '../libs/postmark'
import { prisma } from '../prisma'
import { comparePassword, createJWT, randomToken } from '../utils/crypto'
import { builder } from './builder'
import { User } from './user'

export const UserWithToken = builder.objectRef<Prisma.User>('UserWithToken')

UserWithToken.implement({
  fields: (t) => ({
    user: t.field({
      type: User,
      resolve: (user) => user,
    }),
    token: t.string({
      resolve: (user) => createJWT(user),
    }),
  }),
})

builder.mutationFields((t) => ({
  loginWithEmail: t.fieldWithInput({
    type: UserWithToken,
    input: {
      email: t.input.string(),
      password: t.input.string(),
    },
    resolve: async (obj, { input: { email, password } }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email },
      })

      if (!user.password) {
        throw new Error('Account is not activated')
      } else if (!comparePassword(password, user.password)) {
        throw new Error("Password does't match")
      }

      return user
    },
  }),
  registerWithEmail: t.fieldWithInput({
    type: UserWithToken,
    input: {
      email: t.input.string(),
      password: t.input.string(),
      name: t.input.string(),
    },
    resolve: (obj, { input: { email, password, name } }) => {
      return prisma.user.create({
        data: {
          email,
          password,
          name,
        },
      })
    },
  }),
  finalizeAccount: t.fieldWithInput({
    type: UserWithToken,
    input: {
      token: t.input.string(),
      password: t.input.string(),
      name: t.input.string(),
    },
    resolve: (obj, { input: { token, password, name } }) => {
      return prisma.user.update({
        where: { passwordToken: token },
        data: {
          password,
          name,
        },
      })
    },
  }),
  forgotPassword: t.boolean({
    args: {
      email: t.arg.string(),
    },
    resolve: async (obj, { email }) => {
      const user = await prisma.user.update({
        where: { email },
        data: { passwordToken: randomToken() },
      })

      const url = composeWebURL('/auth/reset/:token', { token: user.passwordToken! })
      sendEmail(email, 'reset-password', url)

      return true
    },
  }),
  resetPassword: t.fieldWithInput({
    type: UserWithToken,
    input: {
      token: t.input.string(),
      password: t.input.string(),
    },
    resolve: (obj, { input: { token, password } }) => {
      return prisma.user.update({
        where: { passwordToken: token },
        data: {
          password,
          passwordToken: null,
        },
      })
    },
  }),
  updatePassword: t.fieldWithInput({
    authScopes: {
      user: true,
    },
    type: 'Boolean',
    input: {
      oldPassword: t.input.string(),
      newPassword: t.input.string(),
    },
    resolve: async (obj, { input }, { user }) => {
      if (!user!.password || !comparePassword(input.oldPassword, user!.password)) {
        throw new Error("Password doesn't match")
      }

      return await prisma.user
        .update({
          where: { id: user!.id },
          data: { password: input.newPassword },
        })
        .then(() => true)
    },
  }),
}))
