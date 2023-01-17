import path from 'path'
import pug from 'pug'
import { Config } from '../config'

type HtmlFileName = {
  // Email
  'email/confirm.pug': {
    url: string
  }
  'email/invite-staff.pug': {
    acceptUrl: string
    declineUrl: string
  }
  'email/invite-coach.pug': {
    teamName: string
    acceptUrl: string
    declineUrl: string
  }
  'email/invite-athlete.pug': {
    teamName: string
    acceptUrl: string
    declineUrl: string
  }
  'email/invite-parent.pug': {
    childName: string
    acceptUrl: string
    declineUrl: string
  }
  // Html
  'html/landing.pug': {}
}

export type HtmlFileNames = keyof HtmlFileName
export type HtmlModel<K extends HtmlFileNames> = HtmlFileName[K]

export function loadHtml<K extends HtmlFileNames>(fileName: K, model?: HtmlModel<K>) {
  const pugPath = path.join(__dirname, '../../templates', fileName)
  return pug.renderFile(pugPath, { ...Config.template, ...model, pretty: true })
}

export function loadHtmlTitle(html: string) {
  const titleRegex = new RegExp('<title>(.+)</title>')
  return titleRegex.exec(html)?.[1] ?? ''
}
