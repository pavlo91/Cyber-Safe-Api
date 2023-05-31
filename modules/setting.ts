import { Setting } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, isUser } from '../utils/auth'

const KEYS = {
  enableSignUps: 'ENABLE_SIGN_UPS',
}

export const GQLSettings = pothos.objectRef<Setting[]>('Settings')

GQLSettings.implement({
  fields: (t) => ({
    enableSignUps: t.boolean({
      resolve: (settings) => {
        return settings.find((e) => e.id === KEYS.enableSignUps)?.boolean ?? false
      },
    }),
  }),
})

pothos.queryFields((t) => ({
  settings: t.field({
    type: GQLSettings,
    resolve: () => {
      return prisma.setting.findMany()
    },
  }),
}))

pothos.mutationFields((t) => ({
  updateSettings: t.fieldWithInput({
    input: {
      enableSignUps: t.input.boolean({ required: false }),
    },
    type: 'Boolean',
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(() => isUser(user))

      await prisma.$transaction(async (prisma) => {
        if (typeof input.enableSignUps === 'boolean') {
          await prisma.setting.upsert({
            where: { id: KEYS.enableSignUps },
            create: { id: KEYS.enableSignUps, type: 'BOOLEAN', boolean: input.enableSignUps },
            update: { boolean: input.enableSignUps },
          })
        }
      })

      return true
    },
  }),
}))
