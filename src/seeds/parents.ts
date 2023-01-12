import { rand, randEmail, randFullName } from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export class ParentsSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.relationship.count()) === 0
  }

  async execute() {
    const users = await this.prisma.user.findMany({
      where: { memberships: { none: { isAdmin: true } } },
    })

    await this.prisma.$transaction(
      users.map((user) =>
        this.prisma.relationship.create({
          data: {
            parentUser: {
              create: {
                name: randFullName(),
                email: randEmail(),
                password: 'password',
                isConfirmed: true,
              },
            },
            childUser: {
              connect: {
                id: user.id,
              },
            },
            relation: rand(['Mom', 'Dad']),
          },
        })
      )
    )
  }
}
