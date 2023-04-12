import { z } from 'zod'
import { composeWebURL } from '../helpers/url'
import { prisma } from '../prisma'
import { fastify } from './fastify'

const schema = z.object({
  token: z.string(),
})

fastify.get('/api/confirm/:token', async (req, reply) => {
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

  const url = composeWebURL('/auth/login', {})
  reply.redirect(url)

  return reply
})
