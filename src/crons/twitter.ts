import { analyseTextFromPost } from '../libs/ai'
import { getSocialProvider } from '../libs/social'
import { storageSaveMedia, storageSavePost } from '../libs/storage'
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
      const posts = await getSocialProvider('twitter').fetchAndSavePosts(twitter.id)

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
