import { Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      createSchool(input: SchoolCreate!): ID
      updateSchool(input: SchoolUpdate!): ID
    }
  `,
  resolvers: {
    Mutation: {
      createSchool: withAuth('staff', async (obj, { input }, { prisma }, info) => {
        await prisma.school.create({
          data: { ...input },
        })
      }),
      updateSchool: withAuth('coach', async (obj, { input }, { prisma, school }, info) => {
        let address: Prisma.AddressUpdateOneWithoutSchoolNestedInput | undefined

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

        await prisma.school.update({
          where: { id: school.id },
          data: {
            name: input.name ?? undefined,
            address,
          },
        })
      }),
    },
  },
})
