import { rand, randEmail, randFullName } from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export class ParentsSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.userRole.count({ where: { role: 'PARENT' } })) === 0
  }

  async execute() {
    const athletes = await this.prisma.userRole.findMany({
      where: {
        role: 'ATHLETE',
      },
    })

    await this.prisma.$transaction(async (prisma) => {
      for (const athlete of athletes) {
        await prisma.user.create({
          data: {
            email: randEmail(),
            emailConfirmed: true,
            password: 'password',
            name: randFullName(),
            roles: {
              create: {
                role: 'PARENT',
                parentRole: {
                  create: {
                    childUserId: athlete.userId,
                    relation: rand(['Mom', 'Dad']),
                  },
                },
              },
            },
          },
        })
      }
    })
  }
}
