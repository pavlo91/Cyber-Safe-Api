import { randAmericanFootballTeam, randEmail, randFullName } from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export class TeamsSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.team.count()) === 0
  }

  async execute() {
    await this.prisma.$transaction(async (prisma) => {
      for (let i = 0; i < 10; i++) {
        const team = await prisma.team.create({
          data: {
            name: randAmericanFootballTeam(),
          },
        })

        for (let i = 0; i < 10; i++) {
          await prisma.userRole.create({
            data: {
              role: i === 0 ? 'COACH' : 'ATHLETE',
              user: {
                create: {
                  email: randEmail(),
                  emailConfirmed: true,
                  password: 'password',
                  name: randFullName(),
                },
              },
              teamRole: {
                create: {
                  teamId: team.id,
                },
              },
            },
          })
        }
      }
    })
  }
}
