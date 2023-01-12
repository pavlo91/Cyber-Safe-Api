import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { withAuthMembership } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    extend type Mutation {
      updateOrganization(input: OrganizationUpdate!): ID
    }
  `,
  resolvers: {
    Mutation: {
      updateOrganization: withAuthMembership('admin', async (obj, { input }, { prisma, organization }, info) => {
        const { address, ...values } = input

        const data: Prisma.OrganizationUpdateInput = { ...values }
        if (address) data.address = { update: { ...address } }

        await prisma.organization.update({
          where: { id: organization.id },
          data,
        })
      }),
    },
  },
})
