import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import { finishTikTokAuthorization, refreshExpiringTikTokTokens } from '../../utils/tiktok'
import { composeWebURL } from '../../utils/url'

fastify.get(config.tiktok.callbackURL, async (req, reply) => {
  await finishTikTokAuthorization(req)

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

// It is done hourly because the access_token is valid 24h
// https://developers.tiktok.com/doc/oauth-user-access-token-management
cron.schedule('cron.tiktok-refresh-tokens', '0 0 * * * *', async () => {
  await refreshExpiringTikTokTokens()
})
