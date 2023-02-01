import { Prisma } from '@prisma/client'
import { TeamInclude } from '../team/team.include'

export const UserRoleInclude = {
  teamRole: {
    include: {
      team: {
        include: TeamInclude,
      },
    },
  },
  parentRole: {
    include: {
      childUser: true,
    },
  },
} satisfies Prisma.UserRoleInclude

export type UserRoleInclude = { include: typeof UserRoleInclude }
