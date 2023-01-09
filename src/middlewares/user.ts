import { Prisma, PrismaClient } from '@prisma/client'
import { Middleware } from '.'
import { Config } from '../config'
import { Postmark } from '../libs/postmark'
import { hashPassword } from '../utils/crypto'

function use<T>(data: T, callback: (data: T) => void) {
  callback(data)
}

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
      Postmark.shared.send(user.email, 'email/confirm.pug', { url })
    }
  }

  applyMiddleware() {
    this.prisma.$use(async (params, next) => {
      let emails: string[] | undefined

      if (params.model === 'User') {
        switch (params.action) {
          case 'create':
            use(params.args as Prisma.UserCreateArgs, ({ data }) => {
              emails = [data.email]
              data.password = hashPassword(data.password)
            })

            break

          case 'createMany':
            use(params.args as Prisma.UserCreateManyArgs, ({ data }) => {
              if (Array.isArray(data)) {
                emails = data.map((e) => e.email)
                data.forEach((e) => {
                  e.password = hashPassword(e.password)
                })
              } else {
                emails = [data.email]
                data.password = hashPassword(data.password)
              }
            })

            break

          case 'update':
            use(params.args as Prisma.UserUpdateArgs, ({ data }) => {
              if (typeof data.email === 'string') {
                emails = [data.email]
              }
              if (typeof data.password === 'string') {
                data.password = hashPassword(data.password)
              }
            })

            break

          case 'updateMany':
            use(params.args as Prisma.UserUpdateManyArgs, ({ data }) => {
              if (typeof data.email === 'string') {
                emails = [data.email]
              }
              if (typeof data.password === 'string') {
                data.password = hashPassword(data.password)
              }
            })

            break

          case 'upsert':
            use(params.args as Prisma.UserUpsertArgs, ({ create, update }) => {
              emails = [create.email]
              if (typeof update.email === 'string') {
                emails.push(update.email)
              }
              create.password = hashPassword(create.password)
              if (typeof update.password === 'string') {
                update.password = hashPassword(update.password)
              }
            })

            break

          default:
            break
        }
      }

      const result = await next(params)

      if (emails) {
        this.handleConfirmationEmailsFor(emails)
      }

      return result
    })
  }
}
