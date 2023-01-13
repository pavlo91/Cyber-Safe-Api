import { Prisma } from '@prisma/client'
import { UserRoleInclude } from '../role/role.include'

export const UserInclude = {
  roles: {
    include: UserRoleInclude,
  },
} satisfies Prisma.UserInclude

export type UserInclude = { include: typeof UserInclude }
