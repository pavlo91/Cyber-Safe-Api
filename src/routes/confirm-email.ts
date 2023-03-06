import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { composeWebURL } from '../helpers/url'
import { prisma } from '../prisma'
import { randomToken } from '../utils/crypto'
import { fastify } from './fastify'

const schema = z.object({
  token: z.string(),
})

fastify.get('/api/confirm/:token', async (req, reply) => {
  const params = schema.parse(req.params)

  let user = await prisma.user.findUniqueOrThrow({
    where: { newEmailToken: params.token },
  })

  const data: Prisma.UserUpdateInput = {
    newEmailToken: null,
    emailConfirmed: true,
  }

  if (!user.password) {
    data.passwordToken = randomToken()
  }

  if (user.newEmail) {
    data.newEmail = null
    data.email = user.newEmail
  }

  user = await prisma.user.update({
    where: { id: user.id },
    data,
  })

  const url = !user.password
    ? composeWebURL('/auth/activate/:token', { token: user.passwordToken! })
    : composeWebURL('/auth/login', {})

  reply.redirect(url)

  return reply
})
