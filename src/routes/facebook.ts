import { PrismaClient } from '@prisma/client'
import { HTTPMethods } from 'fastify'
import { Route } from './index'

export class FacebookRoute implements Route {
  constructor(public path: string, public method: HTTPMethods, private prisma: PrismaClient) {}

  handle() {
    return { success: true }
  }
}
