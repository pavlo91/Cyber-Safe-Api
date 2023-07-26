import { SmsClient } from '@azure/communication-sms'
import config from '../config'
import { demoPhoneMap } from '../utils/context'
import logger from './logger'

interface SMSer {
  send(to: string, message: string, info: { userId?: string }): Promise<void>
}

class AzureSMSer implements SMSer {
  private client

  constructor(connectionString: string, private from: string, private prefix: string) {
    this.client = new SmsClient(connectionString)
  }

  async send(to: string, message: string, info: { userId?: string }): Promise<void> {
    const phone = config.demo && info.userId ? demoPhoneMap[info.userId] || to : to

    await this.client
      .send({
        to: [phone],
        from: this.from,
        message: this.prefix + message,
      })
      .catch((error) => {
        logger.error('Error while sending SMS via Azure: %s', error)
      })
  }
}

class NoSMSer implements SMSer {
  constructor(private prefix: string) {
    logger.warn('No smser loaded')
  }

  async send(to: string, message: string, info: { userId?: string }): Promise<void> {
    const phone = config.demo && info.userId ? demoPhoneMap[info.userId] || to : to
    logger.debug('Sending SMS to %s: %s', phone, this.prefix + message)
  }
}

let smser: SMSer

const { connectionString, from } = config.azure.sms

const prefix = config.demo ? '[DEMO] ' : config.dev ? '[DEVELOP] ' : ''

if (!!connectionString && !!from) {
  smser = new AzureSMSer(connectionString, from, prefix)
} else {
  smser = new NoSMSer(prefix)
}

export default smser
