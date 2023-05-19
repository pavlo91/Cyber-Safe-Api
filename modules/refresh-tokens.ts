import { add } from 'date-fns'
import cron from '../libs/cron'
import prisma from '../libs/prisma'
import { getSocialProvider } from '../utils/social'

// This cron job runs every day at 12AM
// and refreshes access tokens if they are about to expire (< 3 days from now)
cron.schedule('cron.refresh-tokens', '0 0 0 * * *', async () => {
  const lt = add(new Date(), { days: 3 })

  const twitters = await prisma.twitter.findMany({
    where: { twitterTokenExpiresAt: { lt } },
  })

  for (const twitter of twitters) {
    const token = await getSocialProvider('twitter').getTwitterUser(twitter).refreshToken()

    await prisma.twitter.update({
      where: { id: twitter.id },
      data: {
        twitterAccessToken: token.accessToken,
        twitterRefreshToken: token.refreshToken,
        twitterTokenExpiresAt: token.tokenExpiresAt,
      },
    })
  }

  const facebooks = await prisma.facebook.findMany({
    where: { facebookTokenExpiresAt: { lt } },
  })

  for (const facebook of facebooks) {
    const token = await getSocialProvider('facebook').getFacebookUser(facebook).refreshToken()

    await prisma.facebook.update({
      where: { id: facebook.id },
      data: {
        facebookAccessToken: token.accessToken,
        facebookTokenExpiresAt: token.tokenExpiresAt,
      },
    })
  }
})
