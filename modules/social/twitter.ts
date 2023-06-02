import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import logger from '../../libs/logger'
import prisma from '../../libs/prisma'
import { uploadAndAnalyzePost } from '../../utils/moderator'
import { getSocialProvider } from '../../utils/social'
import { createTwitterPost, finishTwitterAuthorization, refreshExpiringTwitterTokens } from '../../utils/twitter'
import { composeWebURL } from '../../utils/url'

fastify.get(config.twitter.callbackURL, async (req, reply) => {
  await finishTwitterAuthorization(req)

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

cron.schedule('cron.twitter', '0 0 0 * * *', async () => {
  const twitters = await prisma.twitter.findMany({
    include: { user: true },
    where: { user: { parentalApproval: true } },
  })

  for (const twitter of twitters) {
    try {
      const twitterUser = getSocialProvider('twitter').getTwitterUser(twitter)
      const twitterPosts = await twitterUser.fetchPosts(twitter.indexedAt)

      const indexedAt = new Date()

      for (const twitterPost of twitterPosts) {
        await createTwitterPost(twitter, twitterPost)
          .then((post) => uploadAndAnalyzePost(post))
          .catch((error) => {
            logger.error('Error while saving Twitter post: %s', error)
          })
      }

      await prisma.twitter.update({
        where: { id: twitter.id },
        data: { indexedAt },
      })
    } catch (error) {
      logger.error('Error while getting Twitter posts: %s', error)
    }
  }
})

cron.schedule('cron.twitter-refresh-tokens', '0 0 0 * * *', async () => {
  await refreshExpiringTwitterTokens()
})
