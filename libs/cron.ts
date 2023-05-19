import nodeCron from 'node-cron'
import config from '../config'
import logger from './logger'

class Cron {
  constructor(private scheduled: boolean) {}

  schedule(name: string, expression: string, callback: () => void | Promise<void>) {
    logger.debug('Scheduled cron job %s', name)

    return nodeCron.schedule(
      expression,
      async () => {
        logger.info('Running cron job %s', name)
        try {
          await callback()
        } catch (error) {
          logger.info('Error while running cron job %s %s', name, error)
        } finally {
          logger.info('Finished running cron job %s', name)
        }
      },
      { name, scheduled: this.scheduled }
    )
  }

  getCrons() {
    return new Array(...nodeCron.getTasks()).map(([name, cron]) => ({ name, cron }))
  }
}

const cron = new Cron(config.enableCronJobs)

export default cron
