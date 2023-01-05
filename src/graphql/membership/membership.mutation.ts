import { createGraphQLModule } from '..'
import { withAuthMember } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Mutation {
      inviteMember(email: String!, isAdmin: Boolean!): ID
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
                isAdmin,
                organizationId: organization.id,
              },
            },
          },
        })
      }),
    },
  },
})
