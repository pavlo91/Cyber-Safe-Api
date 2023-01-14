import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteCoach(email: String!): ID
      inviteAthlete(email: String!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteCoach: withAuth('coach', async (obj, { email }, { prisma, team }, info) => {
        await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: '',
            roles: {
              create: {
                role: 'COACH',
                teamRole: {
                  create: {
                    teamId: team.id,
                  },
                },
              },
            },
          },
          update: {
            roles: {
              create: {
                role: 'COACH',
                teamRole: {
                  create: {
                    teamId: team.id,
                  },
                },
              },
            },
          },
        })
      }),
      inviteAthlete: withAuth('coach', async (obj, { email }, { prisma, team }, info) => {
        await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: '',
            roles: {
              create: {
                role: 'ATHLETE',
                teamRole: {
                  create: {
                    teamId: team.id,
                  },
                },
              },
            },
          },
          update: {
            roles: {
              create: {
                role: 'ATHLETE',
                teamRole: {
                  create: {
                    teamId: team.id,
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
