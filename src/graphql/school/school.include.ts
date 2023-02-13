import { Prisma } from '@prisma/client'

export const SchoolInclude = {
  address: true,
  logo: true,
  cover: true,
  _count: {
    select: {
      roles: true,
    },
  },
} satisfies Prisma.SchoolInclude

export type SchoolInclude = { include: typeof SchoolInclude }
