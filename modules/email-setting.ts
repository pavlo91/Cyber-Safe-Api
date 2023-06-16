import { EmailSetting } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, isUser } from '../utils/auth'
import { emailSettingValueFor, updateEmailSettingValueFor } from '../utils/email-setting'

export const GQLEmailSettings = pothos.objectRef<EmailSetting[]>('EmailSettings')

GQLEmailSettings.implement({
  fields: (t) => ({
    receivePostNoneSeverity: t.boolean({
      resolve: (settings) => {
        return emailSettingValueFor('receivePostNoneSeverity', settings)
      },
    }),
    receivePostLowSeverity: t.boolean({
      resolve: (settings) => {
        return emailSettingValueFor('receivePostLowSeverity', settings)
      },
    }),
    receivePostHighSeverity: t.boolean({
      resolve: (settings) => {
        return emailSettingValueFor('receivePostHighSeverity', settings)
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
      receivePostNoneSeverity: t.input.boolean({ required: false }),
      receivePostLowSeverity: t.input.boolean({ required: false }),
      receivePostHighSeverity: t.input.boolean({ required: false }),
    },
    type: 'Boolean',
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(() => isUser(user))

      await prisma.$transaction(async (prisma) => {
        if (typeof input.receivePostNoneSeverity === 'boolean') {
          await updateEmailSettingValueFor('receivePostNoneSeverity', input.receivePostNoneSeverity, user!.id, prisma)
        }
        if (typeof input.receivePostLowSeverity === 'boolean') {
          await updateEmailSettingValueFor('receivePostLowSeverity', input.receivePostLowSeverity, user!.id, prisma)
        }
        if (typeof input.receivePostHighSeverity === 'boolean') {
          await updateEmailSettingValueFor('receivePostHighSeverity', input.receivePostHighSeverity, user!.id, prisma)
        }
      })

      return true
    },
  }),
}))
