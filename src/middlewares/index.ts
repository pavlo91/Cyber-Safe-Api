import { Prisma, PrismaClient } from '@prisma/client'
import { UserMiddleware } from './user'

export interface Middleware {
  beforeMiddleware?(params: Prisma.MiddlewareParams): MaybePromise<void>
  afterMiddleware?(params: Prisma.MiddlewareParams, result: any): MaybePromise<void>
}

export class MiddlewareManager {
  private middlewares: Middleware[]

  constructor(private prisma: PrismaClient) {
    this.middlewares = [new UserMiddleware(prisma)]
  }

  applyMiddlewares() {
    this.prisma.$use(async (params, next) => {
      for (const middleware of this.middlewares) {
        if (middleware.beforeMiddleware) {
          await middleware.beforeMiddleware(params)
        }
      }

      const result = await next(params)

      for (const middleware of this.middlewares) {
        if (middleware.afterMiddleware) {
          await middleware.afterMiddleware(params, result)
        }
      }

      return result
    })
  }
}
