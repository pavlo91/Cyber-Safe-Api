import config from '../../config'
import cron from '../../libs/cron'
import fastify from '../../libs/fastify'
import logger from '../../libs/logger'
import prisma from '../../libs/prisma'
import { uploadAndAnalyzePost } from '../../utils/moderator'
import { getSocialProvider } from '../../utils/social'
import { composeWebURL } from '../../utils/url'

fastify.get(config.twitter.callbackURL, async (req, reply) => {
  const twitterUser = await getSocialProvider('twitter').finishAuthorization(req.query)

  const twitter = await prisma.twitter.findFirst({
    where: { user: { id: twitterUser.state } },
  })

  if (twitter) {
    await prisma.twitter.update({
      where: { id: twitter.id },
      data: {
        twitterId: twitterUser.id,
        twitterUsername: twitterUser.username,
        twitterAccessToken: twitterUser.accessToken,
        twitterRefreshToken: twitterUser.refreshToken,
        twitterTokenExpiresAt: new Date(twitterUser.tokenExpiresAt),
      },
    })
  } else {
    await prisma.twitter.create({
      data: {
        twitterId: twitterUser.id,
        twitterUsername: twitterUser.username,
        twitterAccessToken: twitterUser.accessToken,
        twitterRefreshToken: twitterUser.refreshToken,
        twitterTokenExpiresAt: new Date(twitterUser.tokenExpiresAt),
        user: { connect: { id: twitterUser.state } },
      },
    })
  }

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
        const post = await prisma.post.upsert({
          where: { externalId: twitterPost.externalId },
          create: {
            ...twitterPost,
            twitterId: twitter.id,
            userId: twitter.user!.id,
            media: {
              createMany: {
                data: twitterPost.media,
              },
            },
          },
          update: {
            ...twitterPost,
            media: {
              deleteMany: {},
              createMany: {
                data: twitterPost.media,
              },
            },
          },
          include: {
            media: true,
          },
        })

        await uploadAndAnalyzePost(post)
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
