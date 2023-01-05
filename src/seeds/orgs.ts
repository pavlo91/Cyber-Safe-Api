import { randCompanyName } from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'
import { mapCount } from '../helpers/rand'

export class OrgsSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.organization.count()) === 0
  }

  async execute() {
    await this.prisma.$transaction(
      mapCount(10, () =>
        this.prisma.organization.create({
          data: {
            name: randCompanyName(),
          },
        })
      )
    )
  }
}
