import { z } from 'zod'
import { composeWebURL } from '../helpers/url'
import * as Twitter from '../libs/twitter'
import { fastify } from './fastify'

const schema = z.object({
  code: z.string(),
  state: z.string(),
})

fastify.get('/oauth2/twitter', async (req, reply) => {
  const query = schema.parse(req.query)

  await Twitter.getUserFromCallback(query.code, query.state)

  const url = composeWebURL('/dashboard/profile', {})
  reply.redirect(url)

  return reply
})
