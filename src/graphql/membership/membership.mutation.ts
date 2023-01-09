import { createGraphQLModule } from '..'
import { withAuthMember } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Mutation {
      inviteMember(email: String!, isAdmin: Boolean): ID
      removeMember(id: ID!): ID
      updateMember(id: ID!, input: MembershipUpdate!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteMember: withAuthMember('admin', async (obj, { email, isAdmin }, { prisma, organization }, info) => {
        await prisma.user.create({
          data: {
            email,
            name: '',
            membership: {
              create: {
                isAdmin: isAdmin ?? false,
                organizationId: organization.id,
              },
            },
          },
        })
      }),
      removeMember: withAuthMember('admin', async (obj, { id }, { prisma, organization }, info) => {
        await prisma.membership.delete({
          where: {
            userId_organizationId: {
              userId: id,
              organizationId: organization.id,
            },
          },
        })
      }),
      updateMember: withAuthMember('admin', async (obj, { id, input }, { prisma }, info) => {
        await prisma.membership.update({
          where: { userId: id },
          data: { ...input },
        })
      }),
    },
  },
})
