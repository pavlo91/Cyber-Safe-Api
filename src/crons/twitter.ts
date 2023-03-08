import { analysePostWithGoogleAI } from '../libs/google'
import { storageSaveMedia } from '../libs/storage'
import * as Twitter from '../libs/twitter'
import { prisma } from '../prisma'
import { cron } from './cron'

// Runs every day at 12AM
cron.schedule('0 0 0 * * *', async () => {
  const twitters = await prisma.twitter.findMany()

  for (const twitter of twitters) {
    try {
      const twitterPosts = await Twitter.getPostsFromTwitterUser(twitter)

      const posts = await prisma.$transaction(async (prisma) => {
        await prisma.twitter.update({
          where: { id: twitter.id },
          data: { indexedAt: new Date() },
        })

        return Promise.all(
          twitterPosts.map((post) =>
            prisma.post.upsert({
              where: { externalId: post.id },
              include: { media: true },
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
          )
        )
      })

      for (const post of posts) {
        const postMedia = post.media.filter((e) => !e.blobName)

        for (const media of postMedia) {
          await storageSaveMedia(media, post).catch((error) => {
            console.error(error)
          })
        }

        analysePostWithGoogleAI(post)
      }
    } catch (error) {
      console.error(error)
    }
  }
})
