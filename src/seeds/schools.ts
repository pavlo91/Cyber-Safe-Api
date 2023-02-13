import {
  randAmericanFootballTeam,
  randCity,
  randEmail,
  randFullName,
  randPhoneNumber,
  randState,
  randStreetAddress,
  randZipCode,
} from '@ngneat/falso'
import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export class SchoolsSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async canExecute() {
    return (await this.prisma.school.count()) <= 1
  }

  async execute() {
    await this.prisma.$transaction(async (prisma) => {
      for (let i = 0; i < 5; i++) {
        const school = await prisma.school.create({
          data: {
            name: randAmericanFootballTeam(),
            phone: randPhoneNumber(),
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
              emailConfirmed: true,
              password: 'password',
              name: randFullName(),
              roles: {
                create: {
                  role: i === 0 ? 'ADMIN' : i === 1 ? 'COACH' : 'ATHLETE',
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
}
