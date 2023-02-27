import { ServerClient } from 'postmark'
import { config } from '../config'
import { HTMLFileNames, HTMLModel, loadHTML, loadHTMLTitle } from './pug'

const client = config.postmark.token ? new ServerClient(config.postmark.token) : undefined

export async function sendEmail<K extends HTMLFileNames>(to: string | string[], fileName: K, model?: HTMLModel<K>) {
  if (!client || !config.postmark.from) {
    return
  }

  const emails = Array.isArray(to) ? to : [to]

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
