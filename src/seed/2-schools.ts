import {
  randAmericanFootballTeam,
  randAvatar,
  randCity,
  randEmail,
  randFullName,
  randPhoneNumber,
  randState,
  randStreetAddress,
  randZipCode,
} from '@ngneat/falso'
import { prisma } from '../prisma'

export async function seedSchools() {
  const count = await prisma.school.count()
  if (count > 1) return

  console.debug('Seeding schools and users...')

  await prisma.$transaction(async (prisma) => {
    for (let i = 0; i < 5; i++) {
      const school = await prisma.school.create({
        data: {
          name: randAmericanFootballTeam(),
          phone: randPhoneNumber(),
          logo: {
            create: {
              url: randAvatar(),
            },
          },
          cover: {
            create: {
              url: randAvatar(),
            },
          },
          address: {
            create: {
              street: randStreetAddress(),
              city: randCity(),
              state: randState(),
              zip: randZipCode(),
            },
          },
        },
      })

      for (let i = 0; i < 3; i++) {
        await prisma.user.create({
          data: {
            email: randEmail(),
            emailConfirmed: true,
            password: 'password',
            name: randFullName(),
            avatar: {
              create: {
                url: randAvatar(),
              },
            },
            roles: {
              create: {
                type: i === 0 ? 'ADMIN' : i === 1 ? 'COACH' : 'ATHLETE',
                status: 'ACCEPTED',
                schoolRole: {
                  create: {
                    schoolId: school.id,
                  },
                },
              },
            },
          },
        })
      }
    }
  })
}
