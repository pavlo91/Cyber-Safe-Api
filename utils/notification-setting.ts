import { NotificationSetting, NotificationSettingType, PrismaClient } from '@prisma/client'

const KEYS = {
  receivePostNoneSeverityEmail: 'RECEIVE_POST_NONE_SEVERITY_EMAIL',
  receivePostLowSeverityEmail: 'RECEIVE_POST_LOW_SEVERITY_EMAIL',
  receivePostHighSeverityEmail: 'RECEIVE_POST_HIGH_SEVERITY_EMAIL',
  receivePostNoneSeveritySMS: 'RECEIVE_POST_NONE_SEVERITY_SMS',
  receivePostLowSeveritySMS: 'RECEIVE_POST_LOW_SEVERITY_SMS',
  receivePostHighSeveritySMS: 'RECEIVE_POST_HIGH_SEVERITY_SMS',
}

export type NotificationSettingKey = keyof typeof KEYS

const DEFAULTS = {
  receivePostNoneSeverityEmail: true,
  receivePostLowSeverityEmail: true,
  receivePostHighSeverityEmail: true,
  receivePostNoneSeveritySMS: false,
  receivePostLowSeveritySMS: false,
  receivePostHighSeveritySMS: false,
}

export function notificationSettingValueFor(key: NotificationSettingKey, settings: NotificationSetting[]) {
  const setting = settings.find((e) => e.id === KEYS[key])

  switch (setting?.type) {
    case 'BOOLEAN':
      return setting.boolean ?? DEFAULTS[key]

    default:
      return DEFAULTS[key]
  }
}

export async function updateNotificationSettingValueFor(
  key: NotificationSettingKey,
  value: any,
  userId: string,
  prisma: Omit<PrismaClient, `$${string}`>
) {
  let type: NotificationSettingType

  switch (typeof value) {
    case 'boolean':
      type = 'BOOLEAN'
      break

    default:
      return
  }

  await prisma.notificationSetting.upsert({
    where: { id_userId: { id: KEYS[key], userId } },
    update: {
      boolean: type === 'BOOLEAN' ? value : undefined,
    },
    create: {
      type,
      userId,
      id: KEYS[key],
      boolean: type === 'BOOLEAN' ? value : undefined,
    },
  })
}
