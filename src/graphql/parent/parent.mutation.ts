import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteParent(childId: ID!, email: String!, relation: String): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteParent: withAuth('coach', async (obj, { childId, email, relation }, { prisma }, info) => {
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
    },
  },
})
