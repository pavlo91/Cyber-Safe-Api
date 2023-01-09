import { createGraphQLModule } from '..'
import { withAuthMember } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Mutation {
      updateOrganization(input: OrganizationUpdate): ID
    }
  `,
  resolvers: {
    Mutation: {
      updateOrganization: withAuthMember('admin', async (obj, { input }, { prisma, organization }, info) => {
        await prisma.organization.update({
          where: { id: organization.id },
          data: { ...input },
        })
      }),
    },
  },
})
