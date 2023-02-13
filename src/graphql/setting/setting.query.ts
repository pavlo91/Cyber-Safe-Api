import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { Settings } from '../../seeds/settings'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Query {
      globalSettings: GlobalSettings!
      globalSettingsCanSignUp: Boolean!
    }
  `,
  resolvers: {
    Query: {
      globalSettings: withAuth('staff', (obj, args, { prisma }, info) => {
        return prisma.globalSetting.findMany()
      }),
      globalSettingsCanSignUp: async (obj, args, { prisma }, info) => {
        const setting = await prisma.globalSetting.findUnique({
          where: { id: Settings.enableSignUps },
        })

        return setting?.boolean === true
      },
    },
  },
})
