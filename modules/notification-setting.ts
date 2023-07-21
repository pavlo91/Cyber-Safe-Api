import { NotificationSetting } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, isUser } from '../utils/auth'
import { notificationSettingValueFor, updateNotificationSettingValueFor } from '../utils/notification-setting'

export const GQLNotificationSettings = pothos.objectRef<NotificationSetting[]>('NotificationSettings')

GQLNotificationSettings.implement({
  fields: (t) => ({
    receivePostNoneSeverityEmail: t.boolean({
      resolve: (settings) => {
        return notificationSettingValueFor('receivePostNoneSeverityEmail', settings)
      },
    }),
    receivePostLowSeverityEmail: t.boolean({
      resolve: (settings) => {
        return notificationSettingValueFor('receivePostLowSeverityEmail', settings)
      },
    }),
    receivePostHighSeverityEmail: t.boolean({
      resolve: (settings) => {
        return notificationSettingValueFor('receivePostHighSeverityEmail', settings)
      },
    }),
    receivePostNoneSeveritySMS: t.boolean({
      resolve: (settings) => {
        return notificationSettingValueFor('receivePostNoneSeveritySMS', settings)
      },
    }),
    receivePostLowSeveritySMS: t.boolean({
      resolve: (settings) => {
        return notificationSettingValueFor('receivePostLowSeveritySMS', settings)
      },
    }),
    receivePostHighSeveritySMS: t.boolean({
      resolve: (settings) => {
        return notificationSettingValueFor('receivePostHighSeveritySMS', settings)
      },
    }),
  }),
})

pothos.queryFields((t) => ({
  notificationSettings: t.field({
    type: GQLNotificationSettings,
    resolve: async (obj, args, { user }) => {
      await checkAuth(() => isUser(user))

      return await prisma.notificationSetting.findMany({
        where: { userId: user!.id },
      })
    },
  }),
}))

pothos.mutationFields((t) => ({
  updateEmailSettings: t.fieldWithInput({
    input: {
      receivePostNoneSeverityEmail: t.input.boolean({ required: false }),
      receivePostLowSeverityEmail: t.input.boolean({ required: false }),
      receivePostHighSeverityEmail: t.input.boolean({ required: false }),
      receivePostNoneSeveritySMS: t.input.boolean({ required: false }),
      receivePostLowSeveritySMS: t.input.boolean({ required: false }),
      receivePostHighSeveritySMS: t.input.boolean({ required: false }),
    },
    type: 'Boolean',
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(() => isUser(user))

      await prisma.$transaction(async (prisma) => {
        if (typeof input.receivePostNoneSeverityEmail === 'boolean') {
          await updateNotificationSettingValueFor(
            'receivePostNoneSeverityEmail',
            input.receivePostNoneSeverityEmail,
            user!.id,
            prisma
          )
        }
        if (typeof input.receivePostLowSeverityEmail === 'boolean') {
          await updateNotificationSettingValueFor(
            'receivePostLowSeverityEmail',
            input.receivePostLowSeverityEmail,
            user!.id,
            prisma
          )
        }
        if (typeof input.receivePostHighSeverityEmail === 'boolean') {
          await updateNotificationSettingValueFor(
            'receivePostHighSeverityEmail',
            input.receivePostHighSeverityEmail,
            user!.id,
            prisma
          )
        }
        if (typeof input.receivePostNoneSeveritySMS === 'boolean') {
          await updateNotificationSettingValueFor(
            'receivePostNoneSeveritySMS',
            input.receivePostNoneSeveritySMS,
            user!.id,
            prisma
          )
        }
        if (typeof input.receivePostLowSeveritySMS === 'boolean') {
          await updateNotificationSettingValueFor(
            'receivePostLowSeveritySMS',
            input.receivePostLowSeveritySMS,
            user!.id,
            prisma
          )
        }
        if (typeof input.receivePostHighSeveritySMS === 'boolean') {
          await updateNotificationSettingValueFor(
            'receivePostHighSeveritySMS',
            input.receivePostHighSeveritySMS,
            user!.id,
            prisma
          )
        }
      })

      return true
    },
  }),
}))
