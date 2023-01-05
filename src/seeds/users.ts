import { randEmail, randFullName } from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'
import { mapCount } from '../helpers/rand'
import { AuthUsers } from './auth'

export class UsersSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.user.count()) <= AuthUsers.length
  }

  async execute() {
    await this.prisma.$transaction(
      mapCount(50, () =>
        this.prisma.user.create({
          data: {
            name: randFullName(),
            email: randEmail(),
            password: 'password',
            isConfirmed: true,
          },
        })
      )
    )
  }
}
