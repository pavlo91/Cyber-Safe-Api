import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import logger from '../../libs/logger'
import prisma from '../../libs/prisma'
import { uploadAndAnalyzePost } from '../../utils/moderator'
import { getSocialProvider } from '../../utils/social'
import { createTwitterPost, finishTwitterAuthorization } from '../../utils/twitter'
import { composeWebURL } from '../../utils/url'

fastify.get(config.twitter.callbackURL, async (req, reply) => {
  await finishTwitterAuthorization(req).catch((error) => {
    logger.error('Error while finishing Twitter authorization: %o', error)
  })

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})

// Twitter cron job will get posts every minute
cron.schedule('cron.twitter', '0 * * * * *', async () => {
  const twitters = await prisma.twitter.findMany({
    include: { user: true },
    orderBy: { indexedAt: 'asc' },
    where: { user: { parentalApproval: true } },
  })

  for (const twitter of twitters) {
    try {
      const twitterUser = await getSocialProvider('twitter').getTwitterUser(twitter)
      const twitterPosts = await twitterUser.fetchPosts(twitter.indexedAt)

      logger.info('Found %d Twitter posts of %s', twitterPosts.length, twitter.id)

      const indexedAt = new Date()

      for (const twitterPost of twitterPosts) {
        await createTwitterPost(twitter, twitterPost)
          .then((post) => uploadAndAnalyzePost(post))
          .catch((error) => {
            logger.error('Error while saving Twitter post of %s: %o', twitter.id, error)
          })
      }

      await prisma.twitter.update({
        where: { id: twitter.id },
        data: { indexedAt },
      })
    } catch (error) {
      logger.error('Error while getting Twitter posts of %s: %o', twitter.id, error)
    }
  }
})
