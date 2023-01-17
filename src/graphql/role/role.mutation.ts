import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      removeRole(id: ID!): ID
    }
  `,
  resolvers: {
    Mutation: {
      removeRole: withAuth('staff', async (obj, { id }, { prisma }, info) => {
        await prisma.userRole.delete({
          where: { id },
        })
      }),
    },
  },
})
