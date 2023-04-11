import { randEmail, randFullName } from '@ngneat/falso'
import { prisma } from '../prisma'

export async function seedParents() {
  const count = await prisma.parentRole.count()
  if (count > 1) return

  console.debug('Seeding student parents...')

  await prisma.$transaction(async (prisma) => {
    const students = await prisma.userRole.findMany({
      where: { type: 'STUDENT' },
    })

    for (const student of students) {
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
                  childUserId: student.userId,
                },
              },
            },
          },
        },
      })
    }
  })
}
