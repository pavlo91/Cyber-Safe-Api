import { GlobalSetting } from '@prisma/client'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Settings } from '../../seeds/settings'

function findSetting(id: keyof typeof Settings, settings: GlobalSetting[]) {
  const setting = settings.find((e) => e.id === Settings[id])

  if (setting) {
    switch (setting.type) {
      case 'BOOLEAN':
        return setting.boolean
      case 'INTEGER':
        return setting.integer
      case 'STRING':
        return setting.string
    }
  }
}

export default createGraphQLModule({
  typeDefs: gql`
    type GlobalSettings {
      enableSignUps: Boolean
    }

    input GlobalSettingsUpdate {
      enableSignUps: Boolean
    }
  `,
  resolvers: {
    GlobalSettings: {
      enableSignUps: (settings) => findSetting('enableSignUps', settings),
    },
  },
})
