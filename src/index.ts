import { PrismaClient } from '@prisma/client'
import Fastify from 'fastify'
import { Config } from './config'
import { GraphQLManager } from './graphql'
import { JobManager } from './jobs'
import { Logger } from './libs/logger'
import { MiddlewareManager } from './middlewares'
import { RouteManager } from './routes'
import { SeedManager } from './seeds'

async function main() {
  const prisma = new PrismaClient()

  const middleware = new MiddlewareManager(prisma)
  middleware.applyMiddlewares()

  const job = new JobManager(prisma)
  job.registerJobs()

  const fastify = Fastify()

  const route = new RouteManager(fastify, prisma)
  route.registerRoutes()

  const graphQL = new GraphQLManager(fastify, prisma)
  graphQL.registerModules()
  await graphQL.registerServer()

  await fastify.listen({ port: Config.port })

  Logger.global.info('Fastify server is ready at http://localhost:%d', Config.port)
  Logger.global.info('GraphQL server is ready at http://localhost:%d/graphql', Config.port)

  const seed = new SeedManager(prisma)
  seed.executeSeed()
}

main()
