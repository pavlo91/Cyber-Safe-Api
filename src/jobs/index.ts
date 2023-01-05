import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'
import { Logger } from '../libs/logger'
import { FeedJob } from './feed'

export interface Job {
  name: string
  expression: string
  execute: () => MaybePromise<void>
}

export class JobManager {
  private jobs: Job[]
  private logger = Logger.label('job')

  constructor(prisma: PrismaClient) {
    this.jobs = [
      // Executes every 5 minutes a job to get the feed
      new FeedJob('FeedJob', '*/5 * * * *', prisma, this.logger),
    ]
  }

  private async handleJob(job: Job) {
    try {
      this.logger.info('Will execute job "%s"', job.name)
      await job.execute()
      this.logger.info('Did execute job "%s"', job.name)
    } catch (error) {
      this.logger.error('Error while executing job "%s": %s', job.name, error)
    }
  }

  registerJobs() {
    this.jobs.forEach((job) => {
      if (cron.validate(job.expression)) {
        cron.schedule(job.expression, () => this.handleJob(job), { name: job.name })
        this.logger.debug('Succesfully scheduled job "%s"', job.name)
      } else {
        this.logger.error('Error while validating job expression "%s"', job.name)
      }
    })
  }
}
