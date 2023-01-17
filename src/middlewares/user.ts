import { Prisma, PrismaClient } from '@prisma/client'
import { Middleware } from '.'
import { Config } from '../config'
import { use } from '../helpers/seed'
import { Postmark } from '../libs/postmark'
import { hashPassword } from '../utils/crypto'

export class UserMiddleware implements Middleware {
  private emails: string[] = []

  constructor(private prisma: PrismaClient) {}

  beforeMiddleware(params: Prisma.MiddlewareParams) {
    if (params.model !== 'User') return

    this.emails = []

    switch (params.action) {
      case 'create':
        use(params.args as Prisma.UserCreateArgs, ({ data }) => {
          this.emails = [data.email]
          data.password = hashPassword(data.password)
        })

        break

      case 'createMany':
        use(params.args as Prisma.UserCreateManyArgs, ({ data }) => {
          if (Array.isArray(data)) {
            this.emails = data.map((e) => e.email)
            data.forEach((data) => {
              data.password = hashPassword(data.password)
            })
          } else {
            this.emails = [data.email]
            data.password = hashPassword(data.password)
          }
        })

        break

      case 'update':
        use(params.args as Prisma.UserUpdateArgs, ({ data }) => {
          if (typeof data.email === 'string') {
            this.emails = [data.email]
          }
          if (typeof data.password === 'string') {
            data.password = hashPassword(data.password)
          }
        })

        break

      case 'updateMany':
        use(params.args as Prisma.UserUpdateManyArgs, ({ data }) => {
          if (typeof data.email === 'string') {
            this.emails = [data.email]
          }
          if (typeof data.password === 'string') {
            data.password = hashPassword(data.password)
          }
        })

        break

      case 'upsert':
        use(params.args as Prisma.UserUpsertArgs, ({ create, update }) => {
          this.emails = [create.email]
          if (typeof update.email === 'string') {
            this.emails.push(update.email)
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

  async afterMiddleware(params: Prisma.MiddlewareParams) {
    if (params.model !== 'User') return
    if (this.emails.length === 0) return

    const users = await this.prisma.user.findMany({
      where: {
        emailConfirmed: false,
        email: { in: this.emails },
      },
    })

    for (const user of users) {
      const url = Config.composeUrl('apiUrl', '/api/confirm/:uuid', { uuid: user.uuid })
      Postmark.shared.send(user.email, 'email/confirm.pug', { url })
    }
  }
}
