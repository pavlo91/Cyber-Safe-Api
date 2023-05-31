import {
  randAmericanFootballTeam,
  randAvatar,
  randCity,
  randEmail,
  randFullName,
  randPhoneNumber,
  randSentence,
  randState,
  randStreetAddress,
  randUrl,
  randUuid,
  randZipCode,
} from '@ngneat/falso'
import { add } from 'date-fns'
import logger from '../libs/logger'
import prisma from '../libs/prisma'

async function seedAuth() {
  const count = await prisma.user.count()

  if (count > 0) {
    logger.warn('Skipping seeding auth users...')
    return
  }

  logger.debug('Seeding auth users...')

  await prisma.$transaction(async (prisma) => {
    await prisma.user.upsert({
      where: { email: 'staff@wonderkiln.com' },
      create: {
        email: 'staff@wonderkiln.com',
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
        password: 'password',
        name: 'Student User',
        parentalApproval: true,
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

async function seedSchools() {
  const count = await prisma.school.count()

  if (count > 1) {
    logger.warn('Skipping seeding schools and users...')
    return
  }

  logger.debug('Seeding schools and users...')

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
            password: 'password',
            name: randFullName(),
            avatar: {
              create: {
                url: randAvatar(),
              },
            },
            roles: {
              create: {
                type: i === 0 ? 'ADMIN' : i === 1 ? 'COACH' : 'STUDENT',
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

async function seedParents() {
  const count = await prisma.parentRole.count()

  if (count > 1) {
    logger.warn('Skipping seeding student parents...')
    return
  }

  logger.debug('Seeding student parents...')

  await prisma.$transaction(async (prisma) => {
    const students = await prisma.userRole.findMany({
      where: { type: 'STUDENT' },
    })

    for (const student of students) {
      await prisma.user.create({
        data: {
          email: randEmail(),
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

async function seedPosts() {
  const count = await prisma.post.count()

  if (count > 1) {
    logger.warn('Skipping seeding posts...')
    return
  }

  logger.debug('Seeding posts...')

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
            twitterAccessToken: '',
            twitterRefreshToken: '',
            twitterTokenExpiresAt: add(new Date(), { years: 1 }),
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

async function main() {
  await seedAuth()
  await seedSchools()
  await seedParents()
  await seedPosts()
}

main()
