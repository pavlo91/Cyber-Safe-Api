import path from 'path'
import pug from 'pug'

export function loadHtml(name: string, model?: Record<string, any>) {
  const pugPath = path.join(__dirname, '../../templates', name)
  return pug.renderFile(pugPath, { ...model, pretty: true })
}

export function loadHtmlTitle(html: string) {
  const titleRegex = new RegExp('<title>(.+)</title>')
  return titleRegex.exec(html)?.[1] ?? ''
}
