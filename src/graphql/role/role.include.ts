import { Prisma } from '@prisma/client'
import { SchoolInclude } from '../school/school.include'

export const UserRoleInclude = {
  schoolRole: {
    include: {
      school: {
        include: SchoolInclude,
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
