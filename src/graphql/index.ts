import { ApolloServer } from '@apollo/server'
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify'
import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { glob } from 'glob'
import { Logger } from '../libs/logger'
import { ApolloContext } from '../types/apollo'
import { Resolvers } from '../types/graphql'

interface GraphQL {
  typeDefs?: string
  resolvers?: Resolvers
}

export function createGraphQLModule(module: GraphQL) {
  return module
}

export class GraphQLManager {
  private modules: GraphQL[]
  private logger = Logger.label('graphql')
  private apollo: ApolloServer<ApolloContext> | undefined

  constructor(private fastify: FastifyInstance, private prisma: PrismaClient) {
    const paths = glob.sync('./**/*.{ts,js}', {
      cwd: __dirname,
      ignore: './index.{ts,js}',
    })

    this.modules = paths.map((path) => {
      this.logger.debug('Succesfully loaded GraphQL module at "%s"', path)
      return require(path).default
    })
  }

  registerModules() {
    const typeDefs = this.modules.map((e) => e.typeDefs).filter((e) => !!e) as string[]
    const resolvers = this.modules.map((e) => e.resolvers).filter((e) => !!e) as Resolvers[]

    this.apollo = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [fastifyApolloDrainPlugin(this.fastify)],
    })
  }

  async registerServer() {
    if (!this.apollo) {
      throw new Error('Apollo is not initialized')
    }

    await this.apollo.start()
    await this.fastify.register(fastifyApollo(this.apollo), {
      path: '/graphql',
      context: async ({ raw: req }) => {
        return { req, prisma: this.prisma }
      },
    })
  }
}
