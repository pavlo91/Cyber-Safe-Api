import { PrismaClient } from '@prisma/client'
import { UserMiddleware } from './user'

export interface Middleware {
  applyMiddleware(): void
}

export class MiddlewareManager {
  private middlewares: Middleware[]

  constructor(prisma: PrismaClient) {
    this.middlewares = [new UserMiddleware(prisma)]
  }

  applyMiddlewares() {
    this.middlewares.forEach((middleware) => {
      middleware.applyMiddleware()
    })
  }
}
