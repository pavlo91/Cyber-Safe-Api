import { z } from 'zod'
import { composeWebURL } from '../helpers/url'
import { prisma } from '../prisma'
import { fastify } from './fastify'

const schema = z.object({
  token: z.string(),
  response: z.enum(['accept', 'decline']),
})

fastify.get('/api/respond/:token/:response', async (req, reply) => {
  const params = schema.parse(req.params)

  const userRole = await prisma.userRole.findFirstOrThrow({
    where: {
      status: 'PENDING',
      statusToken: params.token,
    },
    include: {
      user: true,
      schoolRole: true,
    },
  })

  const isAccepted = params.response === 'accept'

  await prisma.userRole.update({
    where: { id: userRole.id },
    data: {
      statusToken: null,
      status: isAccepted ? 'ACCEPTED' : 'DECLINED',
    },
  })

  reply.redirect(composeWebURL('/auth/login', {}))

  return reply
})
