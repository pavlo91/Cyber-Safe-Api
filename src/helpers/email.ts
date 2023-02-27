import { Prisma, User } from '@prisma/client'
import { sendEmail } from '../libs/postmark'
import { composeAPIURL } from './url'

export function sendUserConfirmationEmail(user: User) {
  if (user.newEmailToken) {
    const url = composeAPIURL('/api/confirm/:token', { token: user.newEmailToken! })
    sendEmail(user.newEmail ?? user.email, 'email/confirm.pug', { url })
  }
}

export function sendUserRoleConfirmationEmail(
  userRole: Prisma.UserRoleGetPayload<{
    include: {
      user: true
      schoolRole: { include: { school: true } }
      parentRole: { include: { childUser: true } }
    }
  }>
) {
  if (userRole.status === 'PENDING' && userRole.statusToken) {
    const acceptURL = composeAPIURL('/api/respond/:token/:response', {
      token: userRole.statusToken,
      response: 'accept',
    })
    const declineURL = composeAPIURL('/api/respond/:token/:response', {
      token: userRole.statusToken,
      response: 'decline',
    })

    switch (userRole.type) {
      case 'STAFF':
        sendEmail(userRole.user.email, 'email/invite-staff.pug', { acceptURL, declineURL })
        break

      case 'ADMIN':
      case 'COACH':
      case 'ATHLETE':
        sendEmail(userRole.user.email, 'email/invite-member.pug', {
          acceptURL,
          declineURL,
          schoolName: userRole.schoolRole?.school.name ?? '',
        })
        break

      case 'PARENT':
        sendEmail(userRole.user.email, 'email/invite-parent.pug', {
          acceptURL,
          declineURL,
          childName: userRole.parentRole?.childUser.name ?? '',
        })
        break

      default:
        break
    }
  }
}
