import { ServerClient } from 'postmark'
import config from '../config'
import logger from './logger'

interface Emailer {
  send(to: string, subject: string, html: string): Promise<void>
}

class PostmarkEmailer implements Emailer {
  private client: ServerClient

  constructor(token: string, private from: string) {
    this.client = new ServerClient(token)
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    await this.client
      .sendEmail({
        To: to,
        HtmlBody: html,
        From: this.from,
        Subject: subject,
      })
      .catch((error) => {
        logger.error('Error while sending email via Postmark: %s', error)
      })
  }
}

class NoEmailer implements Emailer {
  constructor() {
    logger.warn('No emailer loaded')
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    logger.debug('Sending email to %s', to)
  }
}

let emailer: Emailer

const { token, from } = config.postmark

if (!!token && !!from) {
  emailer = new PostmarkEmailer(token, from)
} else {
  emailer = new NoEmailer()
}

export default emailer
