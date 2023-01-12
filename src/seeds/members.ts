import { randBoolean } from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export class MembersSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.membership.count()) === 0
  }

  async execute() {
    const users = await this.prisma.user.findMany({
      where: { isStaff: false },
    })
    const orgs = await this.prisma.organization.findMany()

    let group = Math.floor(users.length / orgs.length)
    let remaining = users.length % group

    await this.prisma.$transaction(async (prisma) => {
      for (let i = 0; i < orgs.length; i++) {
        let count = group

        if (i === orgs.length - 1) {
          count += remaining
        }

        for (let j = 0; j < count; j++) {
          const k = i * group + j

          const org = orgs[i]
          const user = users[k]

          await prisma.membership.create({
            data: {
              organizationId: org.id,
              userId: user.id,
              isAdmin: user.email.includes('admin') || randBoolean(),
            },
          })
        }
      }
    })
  }
}
