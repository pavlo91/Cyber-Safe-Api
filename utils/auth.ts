import { Prisma, User } from '@prisma/client'
import { GraphQLError } from 'graphql'

export function isUser(user: User | null) {
  return !!user
}

export function isStaff(user: Prisma.UserGetPayload<{ include: { roles: true } }> | null) {
  return !!user?.roles.find((e) => e.type === 'STAFF')
}

export function isSameUser(id: string, user: User | null) {
  return user?.id === id
}

export function hasRoleInSchool(
  id: string,
  user: Prisma.UserGetPayload<{
    include: {
      roles: {
        include: {
          schoolRole: true
        }
      }
    }
  }> | null,
  role?: ('ADMIN' | 'COACH' | 'STUDENT')[]
) {
  if (user) {
    for (const userRole of user.roles) {
      if (userRole.schoolRole?.schoolId === id && (!role || (role as string[]).includes(userRole.type))) {
        return true
      }
    }
  }

  return false
}

export function hasRoleToUser(
  id: string,
  user: Prisma.UserGetPayload<{
    include: {
      roles: {
        include: {
          schoolRole: {
            include: {
              school: {
                include: {
                  roles: {
                    include: {
                      userRole: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }> | null,
  role?: ('ADMIN' | 'COACH' | 'STUDENT')[]
) {
  if (user) {
    for (const userRole of user.roles) {
      if (
        userRole.schoolRole?.school.roles.find((schoolRole) => schoolRole.userRole.userId === id) &&
        (!role || (role as string[]).includes(userRole.type))
      ) {
        return true
      }
    }
  }

  return false
}

export function isParentToUser(
  id: string,
  user: Prisma.UserGetPayload<{
    include: {
      roles: {
        include: {
          parentRole: true
        }
      }
    }
  }> | null
) {
  if (user) {
    for (const userRole of user.roles) {
      if (userRole.type === 'PARENT' && userRole.parentRole?.childUserId === id) {
        return true
      }
    }
  }

  return false
}

export async function checkAuth(...checks: (() => boolean | Promise<boolean>)[]) {
  for (const check of checks) {
    if (await check()) {
      return
    }
  }

  throw new GraphQLError('Not Authorized', {
    extensions: {
      code: 'NOT_AUTHORIZED',
    },
  })
}
