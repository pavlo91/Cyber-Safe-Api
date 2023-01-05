import { PrismaClient } from '@prisma/client'
import { FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import { Config } from '../config'
import { loadHtml } from '../helpers/pug'
import { Route } from './index'

type Params = {
  uuid: string
}

type Query = {
  redirect?: string
}

export class ConfirmRoute implements Route {
  constructor(public path: string, public method: HTTPMethods, private prisma: PrismaClient) {}

  async handle(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as Params
    const query = req.query as Query

    await this.prisma.user.update({
      where: { uuid: params.uuid },
      data: { isConfirmed: true },
    })

    if (query.redirect) {
      res.redirect(query.redirect)
    }

    return loadHtml('/html/confirm.pug', { url: Config.webUrl })
  }
}
