import { Prisma, PrismaClient } from '@prisma/client'
import { Middleware } from '.'
import { Config } from '../config'
import { use } from '../helpers/seed'
import { Postmark } from '../libs/postmark'
import { hashPassword, randomToken } from '../utils/crypto'

type EmailTokenData = {
  email: string
  token: string
}

export class UserMiddleware implements Middleware {
  private data: EmailTokenData[] = []

  constructor(private prisma: PrismaClient) {}

  beforeMiddleware(params: Prisma.MiddlewareParams) {
    if (params.model !== 'User') return

    this.data = []

    switch (params.action) {
      case 'create':
        use(params.args as Prisma.UserCreateArgs, ({ data }) => {
          if (!data.emailConfirmed) {
            data.newEmailToken = randomToken()

            this.data.push({
              email: data.email,
              token: data.newEmailToken!,
            })
          }

          data.password = hashPassword(data.password)
        })

        break

      case 'createMany':
        use(params.args as Prisma.UserCreateManyArgs, ({ data }) => {
          if (Array.isArray(data)) {
            data.forEach((data) => {
              if (!data.emailConfirmed) {
                data.newEmailToken = randomToken()

                this.data.push({
                  email: data.email,
                  token: data.newEmailToken!,
                })
              }

              data.password = hashPassword(data.password)
            })
          } else {
            if (!data.emailConfirmed) {
              data.newEmailToken = randomToken()

              this.data.push({
                email: data.email,
                token: data.newEmailToken!,
              })
            }

            data.password = hashPassword(data.password)
          }
        })

        break

      case 'update':
        use(params.args as Prisma.UserUpdateArgs, ({ data }) => {
          if (typeof data.newEmail === 'string') {
            data.newEmailToken = randomToken()

            this.data.push({
              email: data.newEmail,
              token: data.newEmailToken!,
            })
          } else if (typeof data.email === 'string' && !data.emailConfirmed) {
            data.newEmailToken = randomToken()

            this.data.push({
              email: data.email,
              token: data.newEmailToken!,
            })
          }

          if (typeof data.password === 'string') {
            data.password = hashPassword(data.password)
          }
        })

        break

      case 'updateMany':
        use(params.args as Prisma.UserUpdateManyArgs, ({ data }) => {
          if (typeof data.newEmail === 'string') {
            data.newEmailToken = randomToken()

            this.data.push({
              email: data.newEmail,
              token: data.newEmailToken!,
            })
          } else if (typeof data.email === 'string' && !data.emailConfirmed) {
            data.newEmailToken = randomToken()

            this.data.push({
              email: data.email,
              token: data.newEmailToken!,
            })
          }

          if (typeof data.password === 'string') {
            data.password = hashPassword(data.password)
          }
        })

        break

      // We can skip sending confirmation email when upserting users
      // because it's being used only internally.
      case 'upsert':
        use(params.args as Prisma.UserUpsertArgs, ({ create, update }) => {
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
    if (this.data.length === 0) return

    for (const data of this.data) {
      const url = Config.composeUrl('apiUrl', '/api/confirm/:token', { token: data.token })
      Postmark.shared.send(data.email, 'email/confirm.pug', { url })
    }

    this.data = []
  }
}
