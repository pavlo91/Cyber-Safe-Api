import { PrismaClient } from '@prisma/client'
import { Job } from '.'
import { Logger } from '../libs/logger'

export class FeedJob implements Job {
  private logger: Logger

  constructor(public name: string, public expression: string, private prisma: PrismaClient, logger: Logger) {
    this.logger = logger.task(name)
  }

  async execute() {
    this.logger.debug('This is a test')
  }
}
