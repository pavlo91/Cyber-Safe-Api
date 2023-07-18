import { Prisma } from '@prisma/client'
import config from '../config'
import emailer from '../libs/emailer'
import template from '../libs/template'
import { Templates } from '../templates/types'
import { demoEmailMap } from './context'

export async function sendEmailTemplate<T extends keyof Templates>(
  to: string | string[] | Promise<string | string[]>,
  name: T,
  model?: Templates[T]
) {
  const awaitedTo = await to
  const awaitedToArray = Array.isArray(awaitedTo) ? awaitedTo : [awaitedTo]

  const html = template.getHTML(name, model)
  const subject = template.getTitle(html)

  await Promise.all(
    awaitedToArray.map((to) => {
      if (config.demo) {
        return emailer.send(demoEmailMap[to] || to, subject, html)
      }

      return emailer.send(to, subject, html)
    })
  )
}

export async function sendUserRoleConfirmationEmail(
  userRole: Prisma.UserRoleGetPayload<{
    include: {
      user: true
      schoolRole: { include: { school: true } }
      parentRole: { include: { childUser: true } }
    }
  }>
) {
  if (userRole.status === 'PENDING' && userRole.statusToken) {
    switch (userRole.type) {
      case 'STAFF':
        await sendEmailTemplate(userRole.user.email, 'invite-staff', {
          token: userRole.statusToken,
        })
        break

      case 'ADMIN':
      case 'COACH':
      case 'STUDENT':
        await sendEmailTemplate(userRole.user.email, 'invite-member', {
          token: userRole.statusToken,
          schoolName: userRole.schoolRole?.school.name ?? '',
        })
        break

      case 'PARENT':
        await sendEmailTemplate(userRole.user.email, 'invite-parent', {
          token: userRole.statusToken,
          childName: userRole.parentRole?.childUser.name ?? '',
        })
        break

      default:
        break
    }
  }
}
