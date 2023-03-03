import path from 'path'
import pug from 'pug'
import { config } from '../config'
import { composeAPIURL } from '../helpers/url'

const HTMLFileMap = {
  confirm: (url: string) => {
    return { url }
  },
  'invite-staff': (token: string) => {
    const acceptURL = composeAPIURL('/api/respond/:token/:response', { token, response: 'accept' })
    const declineURL = composeAPIURL('/api/respond/:token/:response', { token, response: 'decline' })
    return { acceptURL, declineURL }
  },
  'invite-member': (token: string, schoolName: string) => {
    const acceptURL = composeAPIURL('/api/respond/:token/:response', { token, response: 'accept' })
    const declineURL = composeAPIURL('/api/respond/:token/:response', { token, response: 'decline' })
    return { acceptURL, declineURL, schoolName }
  },
  'invite-parent': (token: string, childName: string) => {
    const acceptURL = composeAPIURL('/api/respond/:token/:response', { token, response: 'accept' })
    const declineURL = composeAPIURL('/api/respond/:token/:response', { token, response: 'decline' })
    return { acceptURL, declineURL, childName }
  },
  'reset-password': (url: string) => {
    return { url }
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
  return titleRegex.exec(html)?.[1] ?? ''
}
