import { EmailSetting } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { emailSettingValueFor, updateEmailSettingValueFor } from '../utils//email-setting'
import { checkAuth, isUser } from '../utils/auth'

export const GQLEmailSettings = pothos.objectRef<EmailSetting[]>('EmailSettings')

GQLEmailSettings.implement({
  fields: (t) => ({
    receivePostFlagged: t.boolean({
      resolve: (settings) => {
        return emailSettingValueFor('receivePostFlagged', settings)
      },
    }),
  }),
})

pothos.queryFields((t) => ({
  emailSettings: t.field({
    type: GQLEmailSettings,
    resolve: async (obj, args, { user }) => {
      await checkAuth(() => isUser(user))

      return await prisma.emailSetting.findMany({
        where: { userId: user!.id },
      })
    },
  }),
}))

pothos.mutationFields((t) => ({
  updateEmailSettings: t.fieldWithInput({
    input: {
      receivePostFlagged: t.input.boolean({ required: false }),
    },
    type: 'Boolean',
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(() => isUser(user))

      await prisma.$transaction(async (prisma) => {
        if (typeof input.receivePostFlagged === 'boolean') {
          await updateEmailSettingValueFor('receivePostFlagged', input.receivePostFlagged, user!.id, prisma)
        }
      })

      return true
    },
  }),
}))
