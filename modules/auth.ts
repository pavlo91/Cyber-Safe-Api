import { User } from '@prisma/client'
import { z } from 'zod'
import fastify from '../libs/fastify'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { composeWebURL } from '../utils//url'
import { checkAuth, isUser } from '../utils/auth'
import { comparePassword, createJWT, randomToken } from '../utils/crypto'
import { sendEmailTemplate } from '../utils/email'
import { GQLUser } from './user'

fastify.get('/api/confirm/:token', async (req, reply) => {
  const schema = z.object({
    token: z.string(),
  })

  const params = schema.parse(req.params)

  const user = await prisma.user.findFirstOrThrow({
    where: {
      newEmailToken: params.token,
      newEmail: { not: null },
    },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: {
      newEmail: null,
      newEmailToken: null,
      email: user.newEmail!,
    },
  })

  const url = composeWebURL('/auth/login')
  reply.redirect(url)

  return reply
})

export const GQLUserWithToken = pothos.objectRef<User>('UserWithToken')

GQLUserWithToken.implement({
  fields: (t) => ({
    user: t.field({
      type: GQLUser,
      resolve: (user) => user,
    }),
    token: t.string({
      resolve: (user) => createJWT(user),
    }),
  }),
})

pothos.mutationFields((t) => ({
  loginWithEmail: t.fieldWithInput({
    type: GQLUserWithToken,
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
    type: GQLUserWithToken,
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
  forgotPassword: t.boolean({
    args: {
      email: t.arg.string(),
    },
    resolve: async (obj, { email }) => {
      const user = await prisma.user
        .update({
          where: { email },
          data: { passwordToken: randomToken() },
        })
        .catch(() => {
          throw new Error('E-mail does not exist')
        })

      sendEmailTemplate(email, 'reset-password', { token: user.passwordToken! })

      return true
    },
  }),
  resetPassword: t.fieldWithInput({
    type: GQLUserWithToken,
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
    type: 'Boolean',
    input: {
      oldPassword: t.input.string(),
      newPassword: t.input.string(),
    },
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(() => isUser(user))

      if (!user!.password || !comparePassword(input.oldPassword, user!.password)) {
        throw new Error("Password doesn't match")
      }

      await prisma.user.update({
        where: { id: user!.id },
        data: { password: input.newPassword },
      })

      return true
    },
  }),
}))
