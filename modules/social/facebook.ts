import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import { finishFacebookAuthorization, refreshExpiringFacebookTokens } from '../../utils/facebook'
import { composeWebURL } from '../../utils/url'

fastify.get(config.facebook.callbackURL, async (req, reply) => {
  await finishFacebookAuthorization(req)

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

cron.schedule('cron.facebook-refresh-tokens', '0 0 0 * * *', async () => {
  await refreshExpiringFacebookTokens()
})
