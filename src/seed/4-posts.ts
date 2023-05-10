import { randAvatar, randSentence, randUrl, randUuid } from '@ngneat/falso'
import { prisma } from '../prisma'

export async function seedPosts() {
  const count = await prisma.post.count()
  if (count > 1) return

  console.debug('Seeding posts...')

  await prisma.$transaction(async (prisma) => {
    const students = await prisma.userRole.findMany({
      where: { type: 'STUDENT' },
      include: { user: true },
    })

    for (const student of students) {
      let twitter = await prisma.twitter.findFirst({
        where: { user: { id: student.user.id } },
      })

      if (!twitter) {
        twitter = await prisma.twitter.create({
          data: {
            twitterToken: '',
            twitterTokenSecret: '',
            twitterId: randUuid(),
            twitterUsername: student.user.email,
            user: { connect: { id: student.user.id } },
          },
        })
      }

      for (let i = 0; i < 3; i++) {
        await prisma.post.create({
          data: {
            url: randUrl(),
            text: randSentence(),
            twitterId: twitter.id,
            externalId: randUuid(),
            userId: student.user.id,
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
