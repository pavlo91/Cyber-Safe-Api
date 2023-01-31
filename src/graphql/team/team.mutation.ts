import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    input UpdateTeamInput {
      name: String
    }

    extend type Mutation {
      createTeam(input: TeamCreate!): ID
      updateTeam(input: UpdateTeamInput!): ID
      leaveTeam: ID
    }
  `,
  resolvers: {
    Mutation: {
      createTeam: withAuth('staff', async (obj, { input }, { prisma }, info) => {
        await prisma.team.create({
          data: { ...input },
        })
      }),
      updateTeam: withAuth('admin', async (obj, { input }, { prisma, team }, info) => {
        await prisma.team.update({
          where: { id: team.id },
          data: {
            name: input.name ?? undefined,
          },
        })
      }),
      leaveTeam: withAuth('member', async (obj, args, { prisma, user, team }, info) => {
        await prisma.userRole.deleteMany({
          where: {
            userId: user.id,
            teamRole: { teamId: team.id },
          },
        })
      }),
    },
  },
})
