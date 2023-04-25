import path from 'path'
import pug from 'pug'
import { config } from '../config'
import { composeWebURL } from '../helpers/url'

const HTMLFileMap = {
  confirm: (url: string) => {
    return { url }
  },
  'reset-password': (url: string) => {
    return { url }
  },
  'invite-staff': (token: string) => {
    const url = composeWebURL('/invite/:token', { token })
    return { url }
  },
  'invite-member': (token: string, schoolName: string) => {
    const url = composeWebURL('/invite/:token', { token })
    return { schoolName, url }
  },
  'invite-parent': (token: string, childName: string) => {
    const url = composeWebURL('/invite/:token', { token })
    return { childName, url }
  },
  notification: (body: string, url?: string) => {
    return { body, url }
  },
  contact: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string | undefined | null,
    jobTitle: string | undefined | null,
    schoolName: string,
    state: string,
    students: string,
    describe: string,
    comments: string | undefined | null
  ) => {
    return { firstName, lastName, email, phone, jobTitle, schoolName, state, students, describe, comments }
  },
  'post-flagged': (name: string, postId: string) => {
    const url = composeWebURL('/dashboard/coach/posts/:postId', { postId })
    return { name, url }
  },
}

export type HTMLFileMap = typeof HTMLFileMap

export function loadHTML<K extends keyof HTMLFileMap>(fileName: K, ...args: Parameters<HTMLFileMap[K]>) {
  const pugPath = path.join(__dirname, '../../templates', fileName + '.pug')
  // @ts-ignore
  const model = HTMLFileMap[fileName](...args)
  return pug.renderFile(pugPath, { ...config.template, ...model, pretty: true })
}

export function loadHTMLTitle(html: string) {
  const titleRegex = new RegExp('<title>(.+)</title>')
  const title = titleRegex.exec(html)?.[1] ?? ''

  if (config.dev) {
    return '[DEVELOP] ' + title
  }

  return title
}
