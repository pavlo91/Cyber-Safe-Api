import { Notification } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { TeamInclude } from '../team/team.include'
import { UserInclude } from '../user/user.include'

export default createGraphQLModule({
  typeDefs: gql`
    enum NotificationObjectType {
      NONE
      USER
      TEAM
    }

    type Notification {
      id: ID!
      createdAt: DateTime!
      unread: Boolean!
      message: String!
      objectType: NotificationObjectType!
      object: NotificationObject
    }

    type PaginatedNotification {
      page: PageInfo!
      nodes: [Notification!]!
    }
  `,
  resolvers: {
    NotificationObject: {
      __resolveType({ __objectType }: any) {
        return __objectType
      },
    },
    Notification: {
      async object(obj: Notification, args, { prisma }, info) {
        switch (obj.objectType) {
          case 'USER':
            const user = await prisma.user.findUnique({
              include: UserInclude,
              where: { id: obj.objectId! },
            })

            if (user) {
              return { ...user, __objectType: 'User' }
            } else {
              return null
            }

          case 'TEAM':
            const team = await prisma.team.findUnique({
              include: TeamInclude,
              where: { id: obj.objectId! },
            })

            if (team) {
              return { ...team, __objectType: 'Team' }
            } else {
              return null
            }

          default:
            return null
        }
      },
    },
  },
})
