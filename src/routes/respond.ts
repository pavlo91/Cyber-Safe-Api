import { PrismaClient } from '@prisma/client'
import { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import { z } from 'zod'
import { Config } from '../config'
import { Route } from './index'

const schema = z.object({
  token: z.string(),
  response: z.enum(['accept', 'decline']),
})

export class RespondRoute implements Route {
  constructor(public path: string, public method: HTTPMethods, private prisma: PrismaClient) {}

  async handle(req: FastifyRequest, res: FastifyReply) {
    const params = schema.parse(req.params)

    const role = await this.prisma.userRole.findFirstOrThrow({
      where: {
        status: 'PENDING',
        statusToken: params.token,
      },
    })

    await this.prisma.userRole.update({
      where: { id: role.id },
      data: {
        statusToken: null,
        status: params.response === 'accept' ? 'ACCEPTED' : 'DECLINED',
      },
    })

    res.redirect(Config.composeUrl('webUrl', '/auth/login'))
  }
}
