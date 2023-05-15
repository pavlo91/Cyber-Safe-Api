import { composeWebURL } from '../../helpers/url'
import { getSocialProvider } from '../../libs/social'
import { fastify } from '../fastify'

fastify.get('/oauth2/twitter', async (req, reply) => {
  await getSocialProvider('twitter').finishAuthorization(req.query)

  const url = composeWebURL('/dashboard/profile', {})
  reply.redirect(url)
})
