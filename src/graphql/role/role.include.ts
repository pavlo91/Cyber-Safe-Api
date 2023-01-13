import { Prisma } from '@prisma/client'

export const UserRoleInclude = {
  teamRole: {
    include: {
      team: true,
    },
  },
  parentRole: {
    include: {
      childUser: true,
    },
  },
} satisfies Prisma.UserRoleInclude

export type UserRoleInclude = { include: typeof UserRoleInclude }
