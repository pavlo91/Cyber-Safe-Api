import { SmsClient } from '@azure/communication-sms'
import config from '../config'
import logger from './logger'

interface SMSer {
  send(to: string, message: string): Promise<void>
}

class AzureSMSer implements SMSer {
  private client

  constructor(connectionString: string, private from: string, private prefix: string) {
    this.client = new SmsClient(connectionString)
  }

  async send(to: string, message: string): Promise<void> {
    await this.client
      .send({
        message,
        to: [to],
        from: this.from,
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

  async send(to: string, message: string): Promise<void> {
    logger.debug('Sending SMS to %s: %s', to, this.prefix + message)
  }
}

let smser: SMSer

const { connectionString, from } = config.azure.sms

if (!!connectionString && !!from) {
  smser = new AzureSMSer(connectionString, from, config.dev ? '[DEVELOP] ' : '')
} else {
  smser = new NoSMSer(config.dev ? '[DEVELOP] ' : '')
}

export default smser
