import path from 'path'
import pug from 'pug'
import { Config } from '../config'

type HtmlFileName = {
  // Email
  'email/confirm.pug': {
    url: string
    appName: string
  }
  // Html
  'html/landing.pug': {
    appName: string
  }
}

export type HtmlFileNames = keyof HtmlFileName
export type HtmlModel<K extends HtmlFileNames> = Omit<HtmlFileName[K], keyof typeof Config.template> &
  Partial<typeof Config.template>

export function loadHtml<K extends HtmlFileNames>(fileName: K, model?: HtmlModel<K>) {
  const pugPath = path.join(__dirname, '../../templates', fileName)
  return pug.renderFile(pugPath, { ...Config.template, ...model, pretty: true })
}

export function loadHtmlTitle(html: string) {
  const titleRegex = new RegExp('<title>(.+)</title>')
  return titleRegex.exec(html)?.[1] ?? ''
}
