import { ServerClient } from 'postmark'
import { Config } from '../config'
import { HtmlFileNames, HtmlModel, loadHtml, loadHtmlTitle } from '../helpers/pug'
import { Logger } from '../utils/logger'

export class Postmark {
  static shared = new Postmark(Config.postmark.token, Config.postmark.from)

  private logger = Logger.label('postmark')
  private client: ServerClient | undefined

  constructor(token?: string, private from?: string) {
    if (token && from) {
      this.client = new ServerClient(token)
    }
  }

  async send<K extends HtmlFileNames>(to: string, fileName: K, model?: HtmlModel<K>) {
    if (!this.client) {
      this.logger.debug('Sending email "%s" to "%s" with model %o', fileName, to, model)
      return
    }

    const html = loadHtml(fileName, model)
    const title = loadHtmlTitle(html)

    await this.client
      .sendEmail({
        To: to,
        Subject: title,
        HtmlBody: html,
        From: this.from!,
      })
      .catch((error) => {
        this.logger.error('Error while sending email via Postmark: %s', error)
      })
  }
}
