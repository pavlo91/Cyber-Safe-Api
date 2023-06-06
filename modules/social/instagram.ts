import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import logger from '../../libs/logger'
import prisma from '../../libs/prisma'
import {
  createInstagramPost,
  finishInstagramAuthorization,
  refreshExpiringInstagramTokens,
} from '../../utils/instagram'
import { uploadAndAnalyzePost } from '../../utils/moderator'
import { getSocialProvider } from '../../utils/social'
import { composeWebURL } from '../../utils/url'

fastify.get(config.instagram.callbackURL, async (req, reply) => {
  await finishInstagramAuthorization(req)

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

cron.schedule('cron.instagram', '0 0 0 * * *', async () => {
  const instagrams = await prisma.instagram.findMany({
    include: { user: true },
    where: { user: { parentalApproval: true } },
  })

  for (const instagram of instagrams) {
    try {
      const instagramUser = getSocialProvider('instagram').getInstagramUser(instagram)
      const instagramPosts = await instagramUser.fetchPosts(instagram.indexedAt)

      const indexedAt = new Date()

      for (const instagramPost of instagramPosts) {
        await createInstagramPost(instagram, instagramPost)
          .then((post) => uploadAndAnalyzePost(post))
          .catch((error) => {
            logger.error('Error while saving Instagram post: %s', error)
          })
      }

      await prisma.instagram.update({
        where: { id: instagram.id },
        data: { indexedAt },
      })
    } catch (error) {
      logger.error('Error while getting Instagram posts: %s', error)
    }
  }
})

cron.schedule('cron.instagram-refresh-tokens', '0 0 0 * * *', async () => {
  await refreshExpiringInstagramTokens()
})
