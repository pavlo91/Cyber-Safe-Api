import { ServerClient } from 'postmark'
import { config } from '../config'
import { HTMLFileNames, HTMLModel, loadHTML, loadHTMLTitle } from './pug'

const client = config.postmark.token ? new ServerClient(config.postmark.token) : undefined

export async function sendEmail<K extends HTMLFileNames>(to: string | string[], fileName: K, model?: HTMLModel<K>) {
  const emails = Array.isArray(to) ? to : [to]

  if (!client || !config.postmark.from) {
    console.log(
      `Sending e-mail to ${emails.join(', ')} with template "${fileName}" and model ${JSON.stringify(model ?? {})}`
    )
    return
  }

  const html = loadHTML(fileName, model)
  const title = loadHTMLTitle(html)

  await client
    .sendEmailBatch(
      emails.map((email) => ({
        To: email,
        Subject: title,
        HTMLBody: html,
        From: config.postmark.from!,
      }))
    )
    .catch((error) => {
      console.error(`Error while sending email: ${error}`)
    })
}
