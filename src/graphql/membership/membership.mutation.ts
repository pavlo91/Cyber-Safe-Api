import { createGraphQLModule } from '..'
import { withAuthMembership } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Mutation {
      inviteMember(email: String!, isAdmin: Boolean): ID
      removeMember(id: ID!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteMember: withAuthMembership('admin', async (obj, { email, isAdmin }, { prisma, organization }, info) => {
        await prisma.user.upsert({
          where: { email },
          update: {
            memberships: {
              create: {
                isAdmin: isAdmin ?? false,
                organizationId: organization.id,
              },
            },
          },
          create: {
            email,
            name: '',
            memberships: {
              create: {
                isAdmin: isAdmin ?? false,
                organizationId: organization.id,
              },
            },
          },
        })
      }),
      removeMember: withAuthMembership('admin', async (obj, { id }, { prisma, organization }, info) => {
        await prisma.membership.delete({
          where: {
            userId_organizationId: {
              userId: id,
              organizationId: organization.id,
            },
          },
        })
      }),
    },
  },
})
