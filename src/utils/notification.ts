import { PrismaClient } from '@prisma/client'
import { Config } from '../config'

export class NotificationManager {
  constructor(
    private userIds: string[] | Promise<string[]>,
    private teamId: string | undefined,
    private prisma: PrismaClient
  ) {}

  static toStaff(prisma: PrismaClient) {
    const userIds = prisma.user
      .findMany({
        where: {
          roles: {
            some: {
              role: 'STAFF',
              status: 'ACCEPTED',
            },
          },
        },
      })
      .then((users) => {
        return users.map((user) => user.id)
      })

    return new NotificationManager(userIds, undefined, prisma)
  }

  static toAdmin(teamId: string, prisma: PrismaClient) {
    const userIds = prisma.user
      .findMany({
        where: {
          roles: {
            some: {
              role: 'ADMIN',
              status: 'ACCEPTED',
              teamRole: {
                teamId,
              },
            },
          },
        },
      })
      .then((users) => {
        return users.map((user) => user.id)
      })

    return new NotificationManager(userIds, teamId, prisma)
  }

  static async notify<T>(template: NotificationTemplate<T>, args: T) {
    const { manager, message, url } = template(args)
    await manager.notify(message, url)
  }

  async notify(message: string, url: string | undefined) {
    const userIds = await this.userIds

    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({ url, message, userId, teamId: this.teamId })),
    })
  }
}

type NotificationTemplate<T> = (args: T) => {
  manager: NotificationManager
  message: string
  url?: string
}

export const Notification = {
  acceptedStaffRole: (args: { email: string; prisma: PrismaClient }) => {
    return {
      message: `The user with e-mail ${args.email} has accepted their role of staff`,
      url: Config.composeUrl('webUrl', '/dashboard/staff/users', { search: args.email }),
      manager: NotificationManager.toStaff(args.prisma),
    }
  },
  declinedStaffRole: (args: { email: string; prisma: PrismaClient }) => {
    return {
      message: `The user with e-mail ${args.email} has declined their role of staff`,
      url: Config.composeUrl('webUrl', '/dashboard/staff/users', { search: args.email }),
      manager: NotificationManager.toStaff(args.prisma),
    }
  },
  acceptedMemberRole: (args: { email: string; teamId: string; prisma: PrismaClient }) => {
    return {
      message: `The user with e-mail ${args.email} has accepted their member role`,
      url: Config.composeUrl('webUrl', '/dashboard/coach/members', { search: args.email }),
      manager: NotificationManager.toAdmin(args.teamId, args.prisma),
    }
  },
  declinedMemberRole: (args: { email: string; teamId: string; prisma: PrismaClient }) => {
    return {
      message: `The user with e-mail ${args.email} has declined their member role`,
      url: Config.composeUrl('webUrl', '/dashboard/coach/members', { search: args.email }),
      manager: NotificationManager.toAdmin(args.teamId, args.prisma),
    }
  },
} satisfies Record<string, NotificationTemplate<any>>
