import { Prisma, User } from '@prisma/client'

export function isSameUserId(id: string, user: User | null) {
  return user?.id === id
}

export function hasRoleInSchoolId(
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
  role?: ('ADMIN' | 'COACH' | 'ATHLETE')[]
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

export function hasRoleToUserId(
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
  role?: ('ADMIN' | 'COACH' | 'ATHLETE')[]
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

export function isParentToUserId(
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
