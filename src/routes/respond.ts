import { PrismaClient } from '@prisma/client'
import { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import { z } from 'zod'
import { Config } from '../config'
import { Notification, NotificationManager } from '../utils/notification'
import { Route } from './index'

const schema = z.object({
  token: z.string(),
  response: z.enum(['accept', 'decline']),
})

export class RespondRoute implements Route {
  constructor(public path: string, public method: HTTPMethods, private prisma: PrismaClient) {}

  async handle(req: FastifyRequest, res: FastifyReply) {
    const params = schema.parse(req.params)

    const role = await this.prisma.userRole.findFirstOrThrow({
      where: {
        status: 'PENDING',
        statusToken: params.token,
      },
      include: {
        user: true,
        schoolRole: true,
      },
    })

    const hasAccepted = params.response === 'accept'

    await this.prisma.userRole.update({
      where: { id: role.id },
      data: {
        statusToken: null,
        status: hasAccepted ? 'ACCEPTED' : 'DECLINED',
      },
    })

    switch (role.role) {
      case 'STAFF':
        NotificationManager.notify(hasAccepted ? Notification.acceptedStaffRole : Notification.declinedStaffRole, {
          prisma: this.prisma,
          email: role.user.email,
        })

        break

      case 'ADMIN':
      case 'COACH':
      case 'ATHLETE':
        NotificationManager.notify(hasAccepted ? Notification.acceptedMemberRole : Notification.declinedMemberRole, {
          prisma: this.prisma,
          email: role.user.email,
          schoolId: role.schoolRole!.schoolId,
        })

        break

      default:
        break
    }

    res.redirect(Config.composeUrl('webUrl', '/auth/login'))
  }
}
