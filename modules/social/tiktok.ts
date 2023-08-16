import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import logger from '../../libs/logger'
import prisma from '../../libs/prisma'
import { uploadAndAnalyzePost } from '../../utils/moderator'
import { getSocialProvider } from '../../utils/social'
import { createTikTokPost, finishTikTokAuthorization } from '../../utils/tiktok'
import { composeWebURL } from '../../utils/url'

fastify.get(config.tiktok.callbackURL, async (req, reply) => {
  await finishTikTokAuthorization(req).catch((error) => {
    logger.error('Error while finishing TikTok authorization: %o', error)
  })

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

cron.schedule('cron.tiktok', '0 0 0 * * *', async () => {
  const tiktoks = await prisma.tikTok.findMany({
    include: { user: true },
    orderBy: { indexedAt: 'asc' },
    where: { user: { parentalApproval: true } },
  })

  for (const tiktok of tiktoks) {
    try {
      const tiktokUser = await getSocialProvider('tiktok').getTikTokUser(tiktok)
      const tiktokPosts = await tiktokUser.fetchPosts(tiktok.indexedAt)

      logger.info('Found %d TikTok posts of %s', tiktokPosts.length, tiktok.id)

      const indexedAt = new Date()

      for (const tiktokPost of tiktokPosts) {
        await createTikTokPost(tiktok, tiktokPost)
          .then((post) => uploadAndAnalyzePost(post))
          .catch((error) => {
            logger.error('Error while saving TikTok post of %s: %o', tiktok.id, error)
          })
      }

      await prisma.tikTok.update({
        where: { id: tiktok.id },
        data: { indexedAt },
      })
    } catch (error) {
      logger.error('Error while getting TikTok posts of %s: %o', tiktok.id, error)
    }
  }
})
