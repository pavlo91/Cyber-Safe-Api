import { ServerClient } from 'postmark'
import config from '../config'
import { demoEmailMap } from '../utils/context'
import logger from './logger'

interface Emailer {
  send(to: string, subject: string, html: string, info: { userId?: string }): Promise<void>
}

class PostmarkEmailer implements Emailer {
  private client: ServerClient

  constructor(token: string, private from: string, private prefix: string) {
    this.client = new ServerClient(token)
  }

  async send(to: string, subject: string, html: string, info: { userId?: string }): Promise<void> {
    const email = config.demo && info.userId ? demoEmailMap[info.userId] || to : to

    await this.client
      .sendEmail({
        To: email,
        HtmlBody: html,
        From: this.from,
        Subject: this.prefix + subject,
      })
      .catch((error) => {
        logger.error('Error while sending email via Postmark: %s', error)
      })
  }
}

class NoEmailer implements Emailer {
  constructor(private prefix: string) {
    logger.warn('No emailer loaded')
  }

  async send(to: string, subject: string, html: string, info: { userId?: string }): Promise<void> {
    const email = config.demo && info.userId ? demoEmailMap[info.userId] || to : to
    logger.debug('Sending email to %s: %s', email, this.prefix + subject)
  }
}

let emailer: Emailer

const { token, from } = config.postmark

const prefix = config.demo ? '[DEMO] ' : config.dev ? '[DEVELOP] ' : ''

if (!!token && !!from) {
  emailer = new PostmarkEmailer(token, from, prefix)
} else {
  emailer = new NoEmailer(prefix)
}

export default emailer
