import { randEmail, randFullName } from '@ngneat/falso'
import { prisma } from '../prisma'

export async function seedParents() {
  const count = await prisma.parentRole.count()
  if (count > 1) return

  console.debug('Seeding athlete parents...')

  await prisma.$transaction(async (prisma) => {
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
}
