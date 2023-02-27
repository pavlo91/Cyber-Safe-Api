import { randEmail, randFullName } from '@ngneat/falso'
import { config } from '../config'
import { prisma } from '../prisma'

prisma.parentRole.count().then((count) => {
  if (count > 1 || !config.dev) return

  console.debug('Seeding athlete parents...')

  prisma.$transaction(async (prisma) => {
    const athletes = await prisma.userRole.findMany({
      where: { type: 'ATHLETE' },
    })

    for (const athlete of athletes) {
      await prisma.user.create({
        data: {
          email: randEmail(),
          emailConfirmed: true,
          password: 'password',
          name: randFullName(),
          roles: {
            create: {
              type: 'PARENT',
              status: 'ACCEPTED',
              parentRole: {
                create: {
                  childUserId: athlete.userId,
                },
              },
            },
          },
        },
      })
    }
  })
})
