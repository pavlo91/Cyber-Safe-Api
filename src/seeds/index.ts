import { PrismaClient } from '@prisma/client'
import { Config } from '../config'
import { Logger } from '../utils/logger'
import { AuthSeed } from './auth'
import { ParentsSeed } from './parents'
import { SchoolsSeed } from './schools'
import { SettingsSeed } from './settings'

export interface Seed {
  name: string
  canExecute?(): MaybePromise<boolean>
  execute(): MaybePromise<void>
}

export class SeedManager {
  private seeds: Seed[]
  private logger = Logger.label('seed')

  constructor(prisma: PrismaClient) {
    this.seeds = [new SettingsSeed('SettingsSeed', prisma)]

    if (Config.dev) {
      this.seeds.push(
        new AuthSeed('AuthSeed', prisma),
        new SchoolsSeed('SchoolsSeed', prisma),
        new ParentsSeed('ParentsSeed', prisma)
      )
    }
  }

  async executeSeed() {
    for (const seed of this.seeds) {
      try {
        if (!seed.canExecute || (await seed.canExecute())) {
          this.logger.info('Will execute seed "%s"', seed.name)
          await seed.execute()
          this.logger.info('Did execute seed "%s"', seed.name)
        }
      } catch (error) {
        this.logger.error('Error while executing seed "%s": %s', seed.name, error)
      }
    }
  }
}
