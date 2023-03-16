import Prisma from '@prisma/client'
import { emailSettingValueFor, updateEmailSettingValueFor } from '../helpers/email-setting'
import { prisma } from '../prisma'
import { builder } from './builder'

export const EmailSettings = builder.objectRef<Prisma.EmailSetting[]>('EmailSettings')

EmailSettings.implement({
  fields: (t) => ({
    receivePostFlagged: t.boolean({
      resolve: (settings) => {
        return emailSettingValueFor('receivePostFlagged', settings)
      },
    }),
  }),
})

builder.queryFields((t) => ({
  emailSettings: t.field({
    authScopes: {
      user: true,
    },
    type: EmailSettings,
    resolve: (obj, args, { user }) => {
      return prisma.emailSetting.findMany({
        where: { userId: user!.id },
      })
    },
  }),
}))

builder.mutationFields((t) => ({
  updateEmailSettings: t.fieldWithInput({
    authScopes: {
      user: true,
    },
    input: {
      receivePostFlagged: t.input.boolean({ required: false }),
    },
    type: 'Boolean',
    resolve: (obj, { input }, { user }) => {
      return prisma
        .$transaction(async (prisma) => {
          if (typeof input.receivePostFlagged === 'boolean') {
            await updateEmailSettingValueFor('receivePostFlagged', input.receivePostFlagged, user!.id, prisma)
          }
        })
        .then(() => true)
    },
  }),
}))
