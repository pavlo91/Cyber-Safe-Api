import { Prisma, PrismaClient } from '@prisma/client'
import { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import { z } from 'zod'
import { Config } from '../config'
import { randomToken } from '../utils/crypto'
import { Route } from './index'

const schema = z.object({
  token: z.string(),
})

export class ConfirmRoute implements Route {
  constructor(public path: string, public method: HTTPMethods, private prisma: PrismaClient) {}

  async handle(req: FastifyRequest, res: FastifyReply) {
    const params = schema.parse(req.params)

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { newEmailToken: params.token },
    })

    const data: Prisma.UserUpdateInput = {
      newEmailToken: null,
      emailConfirmed: true,
    }

    if (!user.password) {
      data.passwordToken = randomToken()
    }

    if (!!user.newEmail) {
      data.newEmail = null
      data.email = user.newEmail
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data,
    })

    let redirect: string

    if (!user.password) {
      redirect = Config.composeUrl('webUrl', '/auth/activate/:token', { token: data.passwordToken! })
    } else {
      redirect = Config.composeUrl('webUrl', '/auth/login')
    }

    res.redirect(redirect)
  }
}
