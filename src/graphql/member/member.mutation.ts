import { randAlphaNumeric } from '@ngneat/falso'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Config } from '../../config'
import { withAuth } from '../../helpers/auth'
import { Postmark } from '../../libs/postmark'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteCoach(email: String!): ID
      inviteAthlete(email: String!): ID
      removeMember(id: ID!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteCoach: withAuth('coach', async (obj, { email }, { prisma, team }, info) => {
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
                teamRole: true,
              },
            },
          },
        })

        const statusToken = randAlphaNumeric({ length: 16 }).join('')
        const coachRole = user.roles.find((e) => e.role === 'COACH' && e.teamRole && e.teamRole.teamId === team.id)

        if (!coachRole) {
          await prisma.userRole.create({
            data: {
              statusToken,
              role: 'COACH',
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
            where: { id: coachRole.id },
          })
        }

        const acceptUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/accept', { statusToken })
        const declineUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/decline', { statusToken })
        Postmark.shared.send(email, 'email/invite-coach.pug', { teamName: team.name, acceptUrl, declineUrl })
      }),
      inviteAthlete: withAuth('coach', async (obj, { email }, { prisma, team }, info) => {
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
                teamRole: true,
              },
            },
          },
        })

        const statusToken = randAlphaNumeric({ length: 16 }).join('')
        const coachRole = user.roles.find((e) => e.role === 'ATHLETE' && e.teamRole && e.teamRole.teamId === team.id)

        if (!coachRole) {
          await prisma.userRole.create({
            data: {
              statusToken,
              role: 'ATHLETE',
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
            where: { id: coachRole.id },
            data: {
              statusToken,
              status: 'PENDING',
            },
          })
        }

        const acceptUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/accept', { statusToken })
        const declineUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/decline', { statusToken })
        Postmark.shared.send(email, 'email/invite-athlete.pug', { teamName: team.name, acceptUrl, declineUrl })
      }),
      removeMember: withAuth('coach', async (obj, { id }, { prisma, team }, info) => {
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
