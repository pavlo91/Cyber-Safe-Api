import { rand, randAmericanFootballTeam } from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export class AuthSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.user.count()) === 0
  }

  async execute() {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.user.upsert({
        where: { email: 'staff@wonderkiln.com' },
        create: {
          email: 'staff@wonderkiln.com',
          emailConfirmed: true,
          password: 'password',
          name: 'Staff User',
          roles: {
            create: {
              role: 'STAFF',
              status: 'ACCEPTED',
            },
          },
        },
        update: {},
      })

      const team = await prisma.team.create({
        data: {
          name: randAmericanFootballTeam(),
        },
      })

      await prisma.user.upsert({
        where: { email: 'coach@wonderkiln.com' },
        create: {
          email: 'coach@wonderkiln.com',
          emailConfirmed: true,
          password: 'password',
          name: 'Coach User',
          roles: {
            create: {
              role: 'COACH',
              status: 'ACCEPTED',
              teamRole: {
                create: {
                  teamId: team.id,
                },
              },
            },
          },
        },
        update: {},
      })

      const athlete = await prisma.user.upsert({
        where: { email: 'athlete@wonderkiln.com' },
        create: {
          email: 'athlete@wonderkiln.com',
          emailConfirmed: true,
          password: 'password',
          name: 'Athlete User',
          roles: {
            create: {
              role: 'ATHLETE',
              status: 'ACCEPTED',
              teamRole: {
                create: {
                  teamId: team.id,
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
          roles: {
            create: {
              role: 'PARENT',
              status: 'ACCEPTED',
              parentRole: {
                create: {
                  childUserId: athlete.id,
                  relation: rand(['Mom', 'Dad']),
                },
              },
            },
          },
        },
        update: {},
      })
    })
  }
}
