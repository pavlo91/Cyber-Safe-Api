import { ApolloServer } from '@apollo/server'
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify'
import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { glob } from 'glob'
import { ApolloContext } from '../types/apollo'
import { Resolvers } from '../types/graphql'
import { Logger } from '../utils/logger'

interface GraphQL {
  typeDefs?: string
  resolvers?: Resolvers
}

export function createGraphQLModule(module: GraphQL) {
  return module
}

export class GraphQLManager {
  private logger = Logger.label('graphql')
  private apollo: ApolloServer<ApolloContext>

  constructor(private fastify: FastifyInstance, private prisma: PrismaClient) {
    const paths = glob.sync('./**/*.{ts,js}', {
      cwd: __dirname,
      ignore: './index.{ts,js}',
    })

    const modules = paths.map((path) => {
      const module = require(path).default
      this.logger.info('Succesfully loaded GraphQL module at "%s"', path)
      return module
    })

    const typeDefs = modules.map((e) => e.typeDefs).filter((e) => !!e) as string[]
    const resolvers = modules.map((e) => e.resolvers).filter((e) => !!e) as Resolvers[]

    this.apollo = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [fastifyApolloDrainPlugin(this.fastify)],
      formatError: (formattedError) => {
        this.logger.error('Error while executing GraphQL: %o', formattedError)
        return formattedError
      },
    })
  }

  async registerServer() {
    const config = {
      path: '/graphql',
    }

    await this.apollo.start()
    await this.fastify.register(fastifyApollo(this.apollo), {
      ...config,
      context: async ({ raw: req }) => {
        return { req, prisma: this.prisma }
      },
    })

    return config
  }
}
