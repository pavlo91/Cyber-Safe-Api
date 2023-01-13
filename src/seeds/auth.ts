import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export class AuthSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.user.count()) === 0
  }

  async execute() {
    await this.prisma.$transaction([
      this.prisma.user.upsert({
        where: { email: 'staff@wonderkiln.com' },
        create: {
          email: 'staff@wonderkiln.com',
          emailConfirmed: true,
          password: 'password',
          name: 'Staff User',
          roles: {
            create: {
              role: 'STAFF',
            },
          },
        },
        update: {},
      }),
    ])
  }
}
