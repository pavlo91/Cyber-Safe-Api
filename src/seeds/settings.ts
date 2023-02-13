import { PrismaClient } from '@prisma/client'
import { Seed } from '.'

export const Settings = {
  enableSignUps: 'ENABLE_SIGN_UPS',
} as const

export class SettingsSeed implements Seed {
  constructor(public name: string, private prisma: PrismaClient) {}

  async execute() {
    await this.prisma.globalSetting.upsert({
      where: { id: Settings.enableSignUps },
      create: {
        boolean: true,
        type: 'BOOLEAN',
        id: Settings.enableSignUps,
        name: 'Enable Organzation Sign Ups',
      },
      update: {},
    })
  }
}
