import { Prisma } from '@prisma/client'

export const TeamInclude = {
  address: true,
  logo: true,
  _count: {
    select: {
      roles: true,
    },
  },
} satisfies Prisma.TeamInclude

export type TeamInclude = { include: typeof TeamInclude }
