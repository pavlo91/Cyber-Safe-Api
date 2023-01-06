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
  const { paths: routePaths } = route.registerRoutes()

  const graphQL = new GraphQLManager(fastify, prisma)
  graphQL.registerModules()
  const { path: graphQLPath } = await graphQL.registerServer()

  await fastify.listen({ port: Config.port })

  Logger.global.info('GraphQL server is ready at http://localhost:%d%s', Config.port, graphQLPath)

  routePaths.forEach(({ path, method }) => {
    Logger.global.info('REST route is ready at [%s] http://localhost:%d%s', method, Config.port, path)
  })

  const seed = new SeedManager(prisma)
  seed.executeSeed()
}

main()
