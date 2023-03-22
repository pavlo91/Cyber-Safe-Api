import { randAvatar, randSentence, randUrl, randUuid } from '@ngneat/falso'
import { prisma } from '../prisma'

export async function seedPosts() {
  const count = await prisma.post.count()
  if (count > 1) return

  console.debug('Seeding posts...')

  await prisma.$transaction(async (prisma) => {
    const athletes = await prisma.userRole.findMany({
      where: { type: 'ATHLETE' },
      include: { user: true },
    })

    for (const athlete of athletes) {
      const twitter = await prisma.twitter.upsert({
        update: {},
        where: { userId: athlete.user.id },
        create: {
          token: '',
          refreshToken: '',
          expiresAt: new Date(),
          twitterId: randUuid(),
          userId: athlete.user.id,
          twitterUsername: athlete.user.email,
        },
      })

      for (let i = 0; i < 3; i++) {
        await prisma.post.create({
          data: {
            url: randUrl(),
            text: randSentence(),
            twitterId: twitter.id,
            externalId: randUuid(),
            userId: athlete.user.id,
            media: {
              create: {
                width: 0,
                height: 0,
                duration: 0,
                type: 'IMAGE',
                url: randAvatar(),
                mime: 'image/jpeg',
                externalId: randUuid(),
              },
            },
          },
        })
      }
    }
  })
}
