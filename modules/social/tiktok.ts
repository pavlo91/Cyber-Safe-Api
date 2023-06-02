import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import logger from '../../libs/logger'
import prisma from '../../libs/prisma'
import { uploadAndAnalyzePost } from '../../utils/moderator'
import { getSocialProvider } from '../../utils/social'
import { createTikTokPost, finishTikTokAuthorization, refreshExpiringTikTokTokens } from '../../utils/tiktok'
import { composeWebURL } from '../../utils/url'

fastify.get(config.tiktok.callbackURL, async (req, reply) => {
  await finishTikTokAuthorization(req)

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

cron.schedule('cron.tiktok', '0 0 0 * * *', async () => {
  const tiktoks = await prisma.tikTok.findMany({
    include: { user: true },
    where: { user: { parentalApproval: true } },
  })

  for (const tiktok of tiktoks) {
    try {
      const tiktokUser = getSocialProvider('tiktok').getTikTokUser(tiktok)
      const tiktokPosts = await tiktokUser.fetchPosts(tiktok.indexedAt)

      const indexedAt = new Date()

      for (const tiktokPost of tiktokPosts) {
        await createTikTokPost(tiktok, tiktokPost)
          .then((post) => uploadAndAnalyzePost(post))
          .catch((error) => {
            logger.error('Error while saving TikTok post: %s', error)
          })
      }

      await prisma.tikTok.update({
        where: { id: tiktok.id },
        data: { indexedAt },
      })
    } catch (error) {
      logger.error('Error while getting TikTok posts: %s', error)
    }
  }
})

// It is done hourly because the access_token is valid 24h
// https://developers.tiktok.com/doc/oauth-user-access-token-management
cron.schedule('cron.tiktok-refresh-tokens', '0 0 * * * *', async () => {
  await refreshExpiringTikTokTokens()
})
