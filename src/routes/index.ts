import { PrismaClient } from '@prisma/client'
import { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import { Config } from '../config'
import { Logger } from '../utils/logger'
import { ConfirmRoute } from './confirm'
import { LandingRoute } from './landing'
import { PreviewRoute } from './preview'
import { RespondRoute } from './respond'

export interface Route {
  path: string
  method: HTTPMethods
  handle(req: FastifyRequest, res: FastifyReply): MaybePromise<any>
}

export class RouteManager {
  private routes: Route[]
  private logger = Logger.label('route')

  constructor(private fastify: FastifyInstance, prisma: PrismaClient) {
    this.routes = [
      new LandingRoute('/', 'GET'),
      new ConfirmRoute('/api/confirm/:uuid', 'GET', prisma),
      new RespondRoute('/api/respond/:token/:response', 'GET', prisma),
    ]

    if (Config.dev) {
      this.routes.push(new PreviewRoute('/dev/preview/:file', 'GET'))
    }
  }

  private async handleRoute(route: Route, req: FastifyRequest, res: FastifyReply) {
    try {
      this.logger.info('Will handle route at "%s"', route.path)
      const result = await route.handle(req, res)
      this.logger.info('Did handle route at "%s"', route.path)

      if (typeof result === 'string') {
        res.type('text/html')
      }

      return result
    } catch (error) {
      this.logger.error('Error while handling route at "%s": %s', route.path, error)
      throw error
    }
  }

  registerRoutes() {
    this.routes.forEach((route) => {
      this.fastify.route({
        url: route.path,
        method: route.method,
        handler: (req, res) => this.handleRoute(route, req, res),
      })

      this.logger.info('Succesfully registered route at [%s] "%s"', route.method, route.path)
    })
  }
}
