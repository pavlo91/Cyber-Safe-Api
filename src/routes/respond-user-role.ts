import { z } from 'zod'
import { composeWebURL } from '../helpers/url'
import { prisma } from '../prisma'
import { logActivity } from '../utils/activity'
import { getSchoolMemberIds, getStaffIds, sendNotification } from '../utils/notification'
import { fastify } from './fastify'

const schema = z.object({
  token: z.string(),
  response: z.enum(['accept', 'decline']),
})

fastify.get('/api/respond/:token/:response', async (req, reply) => {
  const params = schema.parse(req.params)

  let userRole = await prisma.userRole.findFirstOrThrow({
    where: {
      status: 'PENDING',
      statusToken: params.token,
    },
    include: {
      user: true,
      schoolRole: true,
    },
  })

  const isAccepted = params.response === 'accept'

  userRole = await prisma.userRole.update({
    where: { id: userRole.id },
    data: {
      statusToken: null,
      status: isAccepted ? 'ACCEPTED' : 'DECLINED',
    },
    include: {
      user: true,
      schoolRole: true,
    },
  })

  switch (userRole.type) {
    case 'STAFF':
      sendNotification(await getStaffIds(), 'userRespondedToStaffUserRole', userRole)
      break

    case 'ADMIN':
    case 'COACH':
    case 'ATHLETE':
      sendNotification(
        await getSchoolMemberIds('ADMIN', userRole.schoolRole!.schoolId),
        'userRespondedToMemberUserRole',
        userRole,
        'ADMIN'
      )
      sendNotification(
        await getSchoolMemberIds('COACH', userRole.schoolRole!.schoolId),
        'userRespondedToMemberUserRole',
        userRole,
        'COACH'
      )
      break

    default:
      break
  }

  logActivity('INVITE_USER_RESPONDED', userRole.userId)

  reply.redirect(composeWebURL('/auth/login', {}))

  return reply
})
