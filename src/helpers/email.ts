import { Post, Prisma, User } from '@prisma/client'
import { sendEmail } from '../libs/postmark'
import { prisma } from '../prisma'
import { emailSettingValueFor } from './email-setting'
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

export async function sendPostFlaggedEmail(post: Post) {
  const schoolRoles = await prisma.schoolRole.findMany({
    where: {
      userRole: {
        status: 'ACCEPTED',
        userId: post.userId,
      },
    },
    include: {
      userRole: {
        include: {
          user: true,
        },
      },
    },
  })

  if (schoolRoles.length === 0) {
    return
  }

  let coachRoles = await prisma.schoolRole.findMany({
    where: {
      schoolId: { in: schoolRoles.map((e) => e.schoolId) },
      userRole: {
        type: 'COACH',
        status: 'ACCEPTED',
      },
    },
    include: {
      userRole: {
        include: {
          user: {
            include: {
              emailSettings: true,
            },
          },
        },
      },
    },
  })

  coachRoles = coachRoles.filter((coachRole) =>
    emailSettingValueFor('receivePostFlagged', coachRole.userRole.user.emailSettings)
  )

  if (coachRoles.length === 0) {
    return
  }

  sendEmail(
    coachRoles.map((e) => e.userRole.user.email),
    'post-flagged',
    schoolRoles[0].userRole.user.name || schoolRoles[0].userRole.user.email,
    post.id
  )
}
