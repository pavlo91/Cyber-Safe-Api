import { Prisma } from '@prisma/client'

export const TeamInclude = {
  _count: {
    select: {
      roles: true,
    },
  },
} satisfies Prisma.TeamInclude

export type TeamInclude = { include: typeof TeamInclude }
