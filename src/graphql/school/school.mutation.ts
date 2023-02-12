import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { updateAddress, updateImage } from '../../helpers/update'

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
        await prisma.school.update({
          where: { id: school.id },
          data: {
            name: input.name ?? undefined,
            address: updateAddress(input.address),
            logo: await updateImage(input.logo, { school: school.id }, prisma),
          },
        })
      }),
    },
  },
})
