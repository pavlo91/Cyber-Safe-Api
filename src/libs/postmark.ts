import PostmarkClient from 'postmark'
import { Config } from '../config'
import { loadHtml, loadHtmlTitle } from '../helpers/pug'
import { Logger } from './logger'

type Templates = {
  confirm: {
    url: string
  }
}

export class Postmark {
  static shared = new Postmark(Config.postmark.token, Config.postmark.from)

  private logger = Logger.label('postmark')
  private client: PostmarkClient.ServerClient | undefined

  constructor(token?: string, private from?: string) {
    if (token && from) {
      this.client = new PostmarkClient.ServerClient(token)
    }
  }

  async send<T extends keyof Templates>(email: string, template: T, model?: Templates[T]) {
    if (!this.client) {
      this.logger.debug('Sending email "%s" to "%s" with model %s', template, email, model)
      return
    }

    const html = loadHtml(`/email/${template}.pug`, model)
    const title = loadHtmlTitle(html)

    await this.client
      .sendEmail({
        From: this.from!,
        To: email,
        Subject: title,
        HtmlBody: html,
      })
      .catch((error) => {
        this.logger.error('Error while sending email via Postmark: %s', error)
      })
  }

  async sendMany<T extends keyof Templates>(emails: string[], template: T, models?: Templates[T][]) {
    if (models && emails.length !== models?.length) {
      throw new Error('The models count is not the same as the recepients count')
    }

    if (!this.client) {
      emails.forEach((email, index) => {
        this.logger.debug('Sending email "%s" to "%s" with model %s', template, email, models && models[index])
      })
      return
    }

    this.client
      .sendEmailBatch(
        emails.map((to, index) => {
          const html = loadHtml(`/email/${template}.pug`, models && models[index])
          const title = loadHtmlTitle(html)

          return {
            From: this.from!,
            To: to,
            Subject: title,
            HtmlBody: html,
          }
        })
      )
      .catch((error) => {
        this.logger.error('Error while sending many emails via Postmark: %s', error)
      })
  }
}
