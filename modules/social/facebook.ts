import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import logger from '../../libs/logger'
import prisma from '../../libs/prisma'
import { createFacebookPost, finishFacebookAuthorization, refreshExpiringFacebookTokens } from '../../utils/facebook'
import { uploadAndAnalyzePost } from '../../utils/moderator'
import { getSocialProvider } from '../../utils/social'
import { composeWebURL } from '../../utils/url'

fastify.get(config.facebook.callbackURL, async (req, reply) => {
  await finishFacebookAuthorization(req)

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

cron.schedule('cron.facebook', '0 0 0 * * *', async () => {
  const facebooks = await prisma.facebook.findMany({
    include: { user: true },
    where: { user: { parentalApproval: true } },
  })

  for (const facebook of facebooks) {
    try {
      const facebookUser = getSocialProvider('facebook').getFacebookUser(facebook)
      const facebookPosts = await facebookUser.fetchPosts(facebook.indexedAt)

      const indexedAt = new Date()

      for (const facebookPost of facebookPosts) {
        await createFacebookPost(facebook, facebookPost)
          .then((post) => uploadAndAnalyzePost(post))
          .catch((error) => {
            logger.error('Error while saving Facebook post: %s', error)
          })
      }

      await prisma.facebook.update({
        where: { id: facebook.id },
        data: { indexedAt },
      })
    } catch (error) {
      logger.error('Error while getting Facebook posts: %s', error)
    }
  }
})

cron.schedule('cron.facebook-refresh-tokens', '0 0 0 * * *', async () => {
  await refreshExpiringFacebookTokens()
})
