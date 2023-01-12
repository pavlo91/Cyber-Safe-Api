import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'
import { Config } from '../config'
import { Logger } from '../utils/logger'

export interface Job {
  name: string
  expression: string
  execute: () => MaybePromise<void>
}

function expression(expression: string) {
  if (Config.dev && Config.jobExpression) {
    return Config.jobExpression
  }
  return expression
}

export class JobManager {
  private jobs: Job[]
  private logger = Logger.label('job')

  constructor(prisma: PrismaClient) {
    this.jobs = []
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
        this.logger.info('Succesfully scheduled job (%s) "%s"', job.expression, job.name)
      } else {
        this.logger.error('Error while validating job expression "%s"', job.name)
      }
    })
  }
}
