import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { UserRoleInclude } from './role.include'

export default createGraphQLModule({
  typeDefs: gql`
    enum Role {
      STAFF
      COACH
      ATHLETE
      PARENT
    }

    interface UserRole {
      role: Role!
    }

    type AnyUserRole implements UserRole {
      role: Role!
    }

    type TeamRole implements UserRole {
      role: Role!
      team: Team!
    }

    type ParentRole implements UserRole {
      role: Role!
      childUser: User!
      relation: String
    }
  `,
  resolvers: {
    UserRole: {
      __resolveType(parent) {
        const obj = parent as Prisma.UserRoleGetPayload<UserRoleInclude>

        switch (obj.role) {
          case 'STAFF':
            return 'AnyUserRole'
          case 'COACH':
          case 'ATHLETE':
            return 'TeamRole'
          case 'PARENT':
            return 'ParentRole'
        }
      },
    },
    TeamRole: {
      team(obj: Prisma.UserRoleGetPayload<UserRoleInclude>) {
        return obj.teamRole!.team
      },
    },
    ParentRole: {
      childUser(obj: Prisma.UserRoleGetPayload<UserRoleInclude>) {
        return obj.parentRole!.childUser
      },
      relation(obj: Prisma.UserRoleGetPayload<UserRoleInclude>) {
        return obj.parentRole!.relation
      },
    },
  },
})
