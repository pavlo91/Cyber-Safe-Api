import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      createTeam(input: TeamCreate!): ID
    }
  `,
  resolvers: {
    Mutation: {
      createTeam: withAuth('staff', async (obj, { input }, { prisma }, info) => {
        await prisma.team.create({
          data: { ...input },
        })
      }),
    },
  },
})
