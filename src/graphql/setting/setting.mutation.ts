import { GlobalSetting, Prisma } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { Settings } from '../../seeds/settings'

async function updateSetting(key: string, value: any, prisma: Prisma.TransactionClient, settings: GlobalSetting[]) {
  const id = (Settings as Record<string, string>)[key]
  const setting = settings.find((e) => e.id == id)

  if (setting) {
    const data: Prisma.GlobalSettingUpdateInput = {}

    switch (setting.type) {
      case 'BOOLEAN':
        data.boolean = value
        break
      case 'INTEGER':
        data.integer = value
        break
      case 'STRING':
        data.string = value
        break
    }

    await prisma.globalSetting.update({ where: { id }, data })
  }
}

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      updateGlobalSettings(input: GlobalSettingsUpdate!): ID
    }
  `,
  resolvers: {
    Mutation: {
      updateGlobalSettings: withAuth('staff', async (obj, { input }, { prisma }, info) => {
        const settings = await prisma.globalSetting.findMany()

        await prisma.$transaction(async (prisma) => {
          for (const key in input) {
            await updateSetting(key, (input as Record<string, any>)[key], prisma, settings)
          }
        })
      }),
    },
  },
})
