import fs from 'fs'
import path from 'path'
import { ServerClient } from 'postmark'
import { config } from '../config'
import { HTMLFileMap, loadHTML, loadHTMLTitle } from './pug'

const client = config.postmark.token ? new ServerClient(config.postmark.token) : undefined

export async function sendEmail<K extends keyof HTMLFileMap>(
  to: string | string[],
  fileName: K,
  ...args: Parameters<HTMLFileMap[K]>
) {
  const emails = Array.isArray(to) ? to : [to]
  const html = loadHTML(fileName, ...args)
  const title = loadHTMLTitle(html)

  if (!client || !config.postmark.from) {
    let filePath = path.join(__dirname, '../../.temp')
    fs.mkdirSync(filePath, { recursive: true })

    const fileName = 'email-' + Date.now() + '.html'
    filePath = path.join(filePath, fileName)

    fs.writeFileSync(filePath, html)
    console.log(`Saved e-mail locally to ${filePath}`)

    return
  }

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
      console.error(error)
    })
}
