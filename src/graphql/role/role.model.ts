import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { UserRoleInclude } from './role.include'

export default createGraphQLModule({
  typeDefs: gql`
    enum Role {
      STAFF
      ADMIN
      COACH
      ATHLETE
      PARENT
    }

    enum RoleStatus {
      PENDING
      ACCEPTED
      DECLINED
    }

    interface UserRole {
      id: ID!
      role: Role!
      status: RoleStatus!
    }

    type AnyRole implements UserRole {
      id: ID!
      role: Role!
      status: RoleStatus!
    }

    type TeamRole implements UserRole {
      id: ID!
      role: Role!
      status: RoleStatus!
      team: Team!
    }

    type ParentRole implements UserRole {
      id: ID!
      role: Role!
      status: RoleStatus!
      childUser: User!
      relation: String
    }
  `,
  resolvers: {
    UserRole: {
      __resolveType(parent: any) {
        const obj = parent as Prisma.UserRoleGetPayload<UserRoleInclude>

        switch (obj.role) {
          case 'STAFF':
            return 'AnyRole'
          case 'ADMIN':
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
