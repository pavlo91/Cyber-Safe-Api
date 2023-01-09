import { PrismaClient } from '@prisma/client'
import { Config } from '../config'
import { Logger } from '../utils/logger'
import { AuthSeed } from './auth'
import { MembersSeed } from './members'
import { OrgsSeed } from './orgs'
import { UsersSeed } from './users'

export interface Seed {
  name: string
  canExecute?(): MaybePromise<boolean>
  execute(): MaybePromise<void>
}

export class SeedManager {
  private seeds: Seed[] = []
  private logger = Logger.label('seed')

  constructor(prisma: PrismaClient) {
    if (Config.dev) {
      this.seeds.push(
        new AuthSeed('AuthSeed', prisma),
        new UsersSeed('UsersSeed', prisma),
        new OrgsSeed('OrgsSeed', prisma),
        new MembersSeed('MembersSeed', prisma)
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
