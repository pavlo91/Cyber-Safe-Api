import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Config } from '../../config'
import { withAuth } from '../../helpers/auth'
import { Postmark } from '../../libs/postmark'
import { randomToken } from '../../utils/crypto'

export default createGraphQLModule({
  typeDefs: gql`
    enum InviteMemberRole {
      ADMIN
      COACH
      ATHLETE
    }

    extend type Mutation {
      inviteMember(email: String!, role: InviteMemberRole!): ID
      removeMember(id: ID!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteMember: withAuth('admin', async (obj, { email, role }, { prisma, team }, info) => {
        let user = await prisma.user.findUnique({
          where: { email },
          include: {
            roles: {
              include: {
                teamRole: true,
              },
            },
          },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: '',
            },
            include: {
              roles: {
                include: {
                  teamRole: true,
                },
              },
            },
          })
        }

        const statusToken = randomToken()
        const teamRole = user.roles.find((e) => e.role === role && e.teamRole && e.teamRole.teamId === team.id)

        if (!teamRole) {
          await prisma.userRole.create({
            data: {
              role,
              statusToken,
              userId: user.id,
              teamRole: {
                create: {
                  teamId: team.id,
                },
              },
            },
          })
        } else {
          await prisma.userRole.update({
            data: { statusToken },
            where: { id: teamRole.id },
          })
        }

        const acceptUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/accept', { statusToken })
        const declineUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/decline', { statusToken })
        Postmark.shared.send(email, 'email/invite-member.pug', { teamName: team.name, acceptUrl, declineUrl })
      }),
      removeMember: withAuth('admin', async (obj, { id }, { prisma, team }, info) => {
        await prisma.userRole.deleteMany({
          where: {
            userId: id,
            teamRole: {
              teamId: team.id,
            },
          },
        })
      }),
    },
  },
})
