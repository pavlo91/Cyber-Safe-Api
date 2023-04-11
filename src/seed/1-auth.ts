import {
  randAmericanFootballTeam,
  randAvatar,
  randCity,
  randPhoneNumber,
  randState,
  randStreetAddress,
  randZipCode,
} from '@ngneat/falso'
import { prisma } from '../prisma'

export async function seedAuth() {
  const count = await prisma.user.count()
  if (count > 0) return

  console.debug('Seeding auth users...')

  await prisma.$transaction(async (prisma) => {
    await prisma.user.upsert({
      where: { email: 'staff@wonderkiln.com' },
      create: {
        email: 'staff@wonderkiln.com',
        emailConfirmed: true,
        password: 'password',
        name: 'Staff User',
        avatar: {
          create: {
            url: randAvatar(),
          },
        },
        roles: {
          create: {
            type: 'STAFF',
            status: 'ACCEPTED',
          },
        },
      },
      update: {},
    })

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

    await prisma.user.upsert({
      where: { email: 'admin@wonderkiln.com' },
      create: {
        email: 'admin@wonderkiln.com',
        emailConfirmed: true,
        password: 'password',
        name: 'Admin User',
        avatar: {
          create: {
            url: randAvatar(),
          },
        },
        roles: {
          create: {
            type: 'ADMIN',
            status: 'ACCEPTED',
            schoolRole: {
              create: {
                schoolId: school.id,
              },
            },
          },
        },
      },
      update: {},
    })

    await prisma.user.upsert({
      where: { email: 'coach@wonderkiln.com' },
      create: {
        email: 'coach@wonderkiln.com',
        emailConfirmed: true,
        password: 'password',
        name: 'Coach User',
        avatar: {
          create: {
            url: randAvatar(),
          },
        },
        roles: {
          create: {
            type: 'COACH',
            status: 'ACCEPTED',
            schoolRole: {
              create: {
                schoolId: school.id,
              },
            },
          },
        },
      },
      update: {},
    })

    const student = await prisma.user.upsert({
      where: { email: 'student@wonderkiln.com' },
      create: {
        email: 'student@wonderkiln.com',
        emailConfirmed: true,
        password: 'password',
        name: 'Student User',
        avatar: {
          create: {
            url: randAvatar(),
          },
        },
        roles: {
          create: {
            type: 'STUDENT',
            status: 'ACCEPTED',
            schoolRole: {
              create: {
                schoolId: school.id,
              },
            },
          },
        },
      },
      update: {},
    })

    await prisma.user.upsert({
      where: { email: 'parent@wonderkiln.com' },
      create: {
        email: 'parent@wonderkiln.com',
        emailConfirmed: true,
        password: 'password',
        name: 'Parent User',
        avatar: {
          create: {
            url: randAvatar(),
          },
        },
        roles: {
          create: {
            type: 'PARENT',
            status: 'ACCEPTED',
            parentRole: {
              create: {
                childUserId: student.id,
              },
            },
          },
        },
      },
      update: {},
    })
  })
}
