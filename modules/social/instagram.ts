import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import { finishInstagramAuthorization, refreshExpiringInstagramTokens } from '../../utils/instagram'
import { composeWebURL } from '../../utils/url'

fastify.get(config.instagram.callbackURL, async (req, reply) => {
  await finishInstagramAuthorization(req)

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

cron.schedule('cron.instagram-refresh-tokens', '0 0 0 * * *', async () => {
  await refreshExpiringInstagramTokens()
})
