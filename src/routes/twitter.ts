import { z } from 'zod'
import { composeWebURL } from '../helpers/url'
import * as Twitter from '../libs/twitter'
import { prisma } from '../prisma'
import { fastify } from './fastify'

const schema = z.object({
  code: z.string(),
  state: z.string(),
})

fastify.get('/oauth2/twitter', async (req, reply) => {
  const query = schema.parse(req.query)

  const user = await Twitter.getUserFromCallback(query.code, query.state)

  await prisma.twitter.create({
    data: {
      twitterId: user.id,
      userId: query.state,
      twitterUsername: user.username,
    },
  })

  const url = composeWebURL('/dashboard/profile', {})
  reply.redirect(url)

  return reply
})
