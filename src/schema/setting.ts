import Prisma from '@prisma/client'
import { prisma } from '../prisma'
import { builder } from './builder'

const KEYS = {
  enableSignUps: 'ENABLE_SIGN_UPS',
}

export const Settings = builder.objectRef<Prisma.Setting[]>('Settings')

Settings.implement({
  fields: (t) => ({
    enableSignUps: t.boolean({
      resolve: (settings) => {
        return settings.find((e) => e.id === KEYS.enableSignUps)?.boolean ?? false
      },
    }),
  }),
})

builder.queryFields((t) => ({
  settings: t.field({
    type: Settings,
    resolve: () => {
      return prisma.setting.findMany()
    },
  }),
}))

builder.mutationFields((t) => ({
  updateSettings: t.fieldWithInput({
    authScopes: {
      staff: true,
    },
    input: {
      enableSignUps: t.input.boolean({ required: false }),
    },
    type: 'Boolean',
    resolve: (obj, { input }) => {
      return prisma
        .$transaction(async (prisma) => {
          if (typeof input.enableSignUps === 'boolean') {
            await prisma.setting.upsert({
              where: { id: KEYS.enableSignUps },
              create: { id: KEYS.enableSignUps, type: 'BOOLEAN', boolean: input.enableSignUps },
              update: { boolean: input.enableSignUps },
            })
          }
        })
        .then(() => true)
    },
  }),
}))
