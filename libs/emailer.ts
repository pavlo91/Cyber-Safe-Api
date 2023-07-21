import { ServerClient } from 'postmark'
import config from '../config'
import logger from './logger'

interface Emailer {
  send(to: string, subject: string, html: string): Promise<void>
}

class PostmarkEmailer implements Emailer {
  private client: ServerClient

  constructor(token: string, private from: string, private prefix: string) {
    this.client = new ServerClient(token)
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    await this.client
      .sendEmail({
        To: to,
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

  async send(to: string, subject: string, html: string): Promise<void> {
    logger.debug('Sending email to %s: %s', to, this.prefix + subject)
  }
}

let emailer: Emailer

const { token, from } = config.postmark

if (!!token && !!from) {
  emailer = new PostmarkEmailer(token, from, config.dev ? '[DEVELOP] ' : '')
} else {
  emailer = new NoEmailer(config.dev ? '[DEVELOP] ' : '')
}

export default emailer
