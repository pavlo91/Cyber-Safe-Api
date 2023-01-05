import { PrismaClient } from '@prisma/client'
import { Middleware } from '.'
import { Config } from '../config'
import { hashPassword } from '../libs/crypto'
import { Postmark } from '../libs/postmark'

export class UserMiddleware implements Middleware {
  constructor(private prisma: PrismaClient) {}

  private async handleConfirmationEmailsFor(emails: string[]) {
    if (emails.length === 0) return

    const users = await this.prisma.user.findMany({
      where: {
        email: { in: emails },
        isConfirmed: false,
      },
    })

    for (const user of users) {
      const url = Config.composeUrl('apiUrl', '/api/confirm/:uuid', { uuid: user.uuid })
      Postmark.shared.send(user.email, 'confirm', { url })
    }
  }

  applyMiddleware() {
    this.prisma.$use(async (params, next) => {
      let emails: string[] = []

      if (params.model === 'User') {
        switch (params.action) {
          case 'create':
            emails = [params.args.data.email]
            params.args.data.password = hashPassword(params.args.data.password)
            break
          case 'createMany':
            emails = params.args.data.map((e: any) => e.email)
            params.args.data.forEach((e: any) => {
              e.password = hashPassword(e.password)
            })
            break
          case 'update':
            if (params.args.data.email) {
              emails = [params.args.data.email]
            }
            if (params.args.data.password) {
              params.args.data.password = hashPassword(params.args.data.password)
            }
            break
          case 'updateMany':
            if (params.args.data.email) {
              emails = [params.args.data.email]
            }
            if (params.args.data.password) {
              params.args.data.password = hashPassword(params.args.data.password)
            }
            break
          case 'upsert':
            emails = [params.args.create.email]
            if (params.args.update.email) {
              emails.push(params.args.update.email)
            }
            params.args.create.password = hashPassword(params.args.create.password)
            if (params.args.update.password) {
              params.args.update.password = hashPassword(params.args.update.password)
            }
            break
          default:
            break
        }
      }

      const result = await next(params)

      this.handleConfirmationEmailsFor(emails)

      return result
    })
  }
}
