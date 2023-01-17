import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import Fastify from 'fastify'
import { Config } from './config'
import { GraphQLManager } from './graphql'
import { JobManager } from './jobs'
import { MiddlewareManager } from './middlewares'
import { RouteManager } from './routes'
import { SeedManager } from './seeds'
import { Logger } from './utils/logger'

async function main() {
  const prisma = new PrismaClient()

  const middleware = new MiddlewareManager(prisma)
  middleware.applyMiddlewares()

  const job = new JobManager(prisma)
  job.registerJobs()

  const fastify = Fastify()
  await fastify.register(cors)

  const route = new RouteManager(fastify, prisma)
  route.registerRoutes()

  const graphQL = new GraphQLManager(fastify, prisma)
  const { path: graphQLPath } = await graphQL.registerServer()

  await fastify.listen({ port: Config.port })

  Logger.global.info('GraphQL server is ready at http://localhost:%d%s', Config.port, graphQLPath)

  const seed = new SeedManager(prisma)
  seed.executeSeed()
}

main()
