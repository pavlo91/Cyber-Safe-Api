import { add } from 'date-fns'
import { getSocialProvider } from '../libs/social'
import { prisma } from '../prisma'
import { cron } from './cron'

// This cron job runs every day at 12AM
// and refreshes access tokens if they are about to expire (< 3 days from now)
cron.schedule('0 0 0 * * *', async () => {
  const lt = add(new Date(), { days: 3 })

  const facebook = await prisma.facebook.findMany({
    where: { facebookTokenExpiration: { lt } },
  })

  for (const social of facebook) {
    await getSocialProvider('facebook').refreshToken(social.id)
  }
})
