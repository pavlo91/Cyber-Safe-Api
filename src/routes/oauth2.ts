import { PrismaClient } from '@prisma/client'
import { FastifyRequest, HTTPMethods } from 'fastify'
import { Route } from './index'

type Headers = {
  'x-token': string
}

type Body = {
  user: {
    id: string
  }
}

export class OAuth2Route implements Route {
  constructor(public path: string, public method: HTTPMethods, private prisma: PrismaClient) {}

  handle(req: FastifyRequest) {
    const headers = req.headers as Headers
    const body = req.body as Body

    return { success: true }
  }
}
