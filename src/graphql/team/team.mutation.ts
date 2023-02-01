import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      createTeam(input: TeamCreate!): ID
      updateTeam(input: TeamUpdate!): ID
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
      updateTeam: withAuth('coach', async (obj, { input }, { prisma, team }, info) => {
        let address: Prisma.AddressUpdateOneWithoutTeamNestedInput | undefined

        if (input.address === null) {
          address = { delete: true }
        } else if (input.address) {
          address = {
            upsert: {
              create: input.address,
              update: input.address,
            },
          }
        }

        await prisma.team.update({
          where: { id: team.id },
          data: {
            name: input.name ?? undefined,
            address,
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
