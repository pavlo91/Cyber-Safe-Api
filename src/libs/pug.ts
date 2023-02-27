import path from 'path'
import pug from 'pug'
import { config } from '../config'

type HTMLFileName = {
  // Email
  'email/confirm.pug': {
    url: string
  }
  'email/invite-staff.pug': {
    acceptURL: string
    declineURL: string
  }
  'email/invite-member.pug': {
    schoolName: string
    acceptURL: string
    declineURL: string
  }
  'email/invite-parent.pug': {
    childName: string
    acceptURL: string
    declineURL: string
  }
  'email/reset-password.pug': {
    url: string
  }
  'email/contact.pug': {
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    jobTitle?: string | null
    schoolName: string
    state: string
    students: string
    describe: string
    comments?: string | null
  }
  // HTML
  'html/landing.pug': {}
}

export type HTMLFileNames = keyof HTMLFileName
export type HTMLModel<K extends HTMLFileNames> = HTMLFileName[K]

export function loadHTML<K extends HTMLFileNames>(fileName: K, model?: HTMLModel<K>) {
  const pugPath = path.join(__dirname, '../../templates', fileName)
  return pug.renderFile(pugPath, { ...config.template, ...model, pretty: true })
}

export function loadHTMLTitle(html: string) {
  const titleRegex = new RegExp('<title>(.+)</title>')
  return titleRegex.exec(html)?.[1] ?? ''
}
