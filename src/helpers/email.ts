import { Prisma, User } from '@prisma/client'
import { sendEmail } from '../libs/postmark'
import { composeAPIURL } from './url'

export function sendUserConfirmationEmail(user: User) {
  if (user.newEmailToken) {
    const url = composeAPIURL('/api/confirm/:token', { token: user.newEmailToken! })
    sendEmail(user.newEmail ?? user.email, 'confirm', url)
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
    switch (userRole.type) {
      case 'STAFF':
        sendEmail(userRole.user.email, 'invite-staff', userRole.statusToken)
        break

      case 'ADMIN':
      case 'COACH':
      case 'ATHLETE':
        sendEmail(userRole.user.email, 'invite-member', userRole.statusToken, userRole.schoolRole?.school.name ?? '')
        break

      case 'PARENT':
        sendEmail(userRole.user.email, 'invite-parent', userRole.statusToken, userRole.parentRole?.childUser.name ?? '')
        break

      default:
        break
    }
  }
}
