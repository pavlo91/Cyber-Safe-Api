import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

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
        await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: '',
            roles: {
              create: {
                role: 'PARENT',
                parentRole: {
                  create: {
                    childUserId: childId,
                    relation,
                  },
                },
              },
            },
          },
          update: {
            roles: {
              create: {
                role: 'PARENT',
                parentRole: {
                  create: {
                    childUserId: childId,
                    relation,
                  },
                },
              },
            },
          },
        })
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
