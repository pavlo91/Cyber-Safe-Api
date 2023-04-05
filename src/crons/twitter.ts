import { analyseTextFromPost } from '../libs/ai'
import { storageSaveMedia, storageSavePost } from '../libs/storage'
import * as Twitter from '../libs/twitter'
import { prisma } from '../prisma'
import { cron } from './cron'

// Runs every day at 12AM
cron.schedule('0 0 0 * * *', async () => {
  const twitters = await prisma.twitter.findMany({
    include: { user: true },
    where: { user: { parentalApproval: true } },
  })

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
                url: post.url,
                text: post.text,
                externalId: post.id,
                twitterId: twitter.id,
                userId: twitter.user!.id,
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
        await storageSavePost(post)

        await Promise.all(post.media.filter((e) => !e.blobName).map((media) => storageSaveMedia(media, post)))

        analyseTextFromPost(post.id)
      }
    } catch (error) {
      console.error(error)
    }
  }
})
