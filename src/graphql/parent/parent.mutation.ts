import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Config } from '../../config'
import { withAuth } from '../../helpers/auth'
import { Postmark } from '../../libs/postmark'
import { randomToken } from '../../utils/crypto'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteParent(email: String!, childId: ID!, relation: String): ID
      removeParent(id: ID!, childId: ID!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteParent: withAuth('coach', async (obj, { email, childId, relation }, { prisma }, info) => {
        const child = await prisma.user.findUniqueOrThrow({
          where: { id: childId },
        })

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: '',
          },
          include: {
            roles: {
              include: {
                parentRole: true,
              },
            },
          },
        })

        const statusToken = randomToken()
        const parentRole = user.roles.find(
          (e) => e.role === 'PARENT' && e.parentRole && e.parentRole.childUserId === childId
        )

        if (!parentRole) {
          await prisma.userRole.create({
            data: {
              statusToken,
              role: 'PARENT',
              userId: user.id,
              parentRole: {
                create: {
                  childUserId: childId,
                  relation,
                },
              },
            },
          })
        } else {
          await prisma.userRole.update({
            where: { id: parentRole.id },
            data: {
              statusToken,
              status: 'PENDING',
              parentRole: {
                update: {
                  relation,
                },
              },
            },
          })
        }

        const acceptUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/accept', { statusToken })
        const declineUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/decline', { statusToken })
        Postmark.shared.send(email, 'email/invite-parent.pug', { childName: child.name, acceptUrl, declineUrl })
      }),
      removeParent: withAuth('coach', async (obj, { id, childId }, { prisma, team }, info) => {
        await prisma.userRole.deleteMany({
          where: {
            userId: id,
            parentRole: {
              childUser: {
                id: childId,
                roles: {
                  some: {
                    teamRole: {
                      teamId: team.id,
                    },
                  },
                },
              },
            },
          },
        })
      }),
    },
  },
})
