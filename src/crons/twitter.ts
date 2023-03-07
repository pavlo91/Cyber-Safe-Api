import * as Twitter from '../libs/twitter'
import { prisma } from '../prisma'
import { cron } from './cron'

// Runs every day at 12AM
cron.schedule('0 0 0 * * *', async () => {
  const twitters = await prisma.twitter.findMany()

  for (const twitter of twitters) {
    try {
      const posts = await Twitter.getPostsFromTwitterUser(twitter)

      await prisma.$transaction(async (prisma) => {
        await prisma.twitter.update({
          where: { id: twitter.id },
          data: { indexedAt: new Date() },
        })

        for (const post of posts) {
          await prisma.post.upsert({
            where: { externalId: post.id },
            update: {},
            create: {
              twitterId: twitter.id,
              externalId: post.id,
              text: post.text,
              media: {
                createMany: {
                  data: post.media.map((media) => ({
                    externalId: media.id,
                    type: media.type,
                    mime: media.mime,
                    url: media.url,
                    width: media.width,
                    height: media.height,
                    duration: media.duration,
                  })),
                },
              },
            },
          })
        }
      })
    } catch (error) {
      console.error(`Error while getting Twitter posts via cron job for ${twitter.id}`)
      console.error(error)
    }
  }
})
