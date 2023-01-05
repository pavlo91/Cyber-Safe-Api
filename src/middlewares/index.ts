import { PrismaClient } from '@prisma/client'
import { UserMiddleware } from './user'

export interface Middleware {
  applyMiddleware(): void
}

export class MiddlewareManager {
  private middlewares: Middleware[]

  constructor(prisma: PrismaClient) {
    this.middlewares = [
      // The user middleware for sending the confirmation email + hashing the password
      new UserMiddleware(prisma),
    ]
  }

  applyMiddlewares() {
    this.middlewares.forEach((middleware) => {
      middleware.applyMiddleware()
    })
  }
}
