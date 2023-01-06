import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export const AuthUsers = [
  {
    name: 'Staff',
    email: 'staff@wonderkiln.com',
    password: 'password',
    isStaff: true,
    isConfirmed: true,
  },
  {
    name: 'Admin',
    email: 'admin@wonderkiln.com',
    password: 'password',
    isConfirmed: true,
  },
]

export class AuthSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    const emails = AuthUsers.map((e) => e.email)
    const count = await this.prisma.user.count({
      where: { email: { in: emails } },
    })

    return emails.length !== count
  }

  async execute() {
    await this.prisma.$transaction(
      AuthUsers.map((user) =>
        this.prisma.user.upsert({
          where: { email: user.email },
          create: { ...user },
          update: { ...user },
        })
      )
    )
  }
}
