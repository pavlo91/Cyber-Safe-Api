import { EmailSetting, EmailSettingType, PrismaClient } from '@prisma/client'

const KEYS = {
  receivePostFlagged: 'RECEIVE_POST_FLAGGED',
}

const DEFAULTS = {
  receivePostFlagged: true,
}

export function emailSettingValueFor(key: keyof typeof KEYS, settings: EmailSetting[]) {
  const setting = settings.find((e) => e.id === KEYS[key])

  switch (setting?.type) {
    case 'BOOLEAN':
      return setting.boolean ?? DEFAULTS[key]

    default:
      return DEFAULTS[key]
  }
}

export async function updateEmailSettingValueFor(
  key: keyof typeof KEYS,
  value: any,
  userId: string,
  prisma: Omit<PrismaClient, `$${string}`>
) {
  let type: EmailSettingType

  switch (typeof value) {
    case 'boolean':
      type = 'BOOLEAN'
      break

    default:
      return
  }

  await prisma.emailSetting.upsert({
    where: { id_userId: { id: KEYS.receivePostFlagged, userId } },
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
