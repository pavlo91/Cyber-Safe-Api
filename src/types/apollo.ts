import { PrismaClient } from '@prisma/client'
import { IncomingMessage } from 'http'

export type ApolloContext = {
  req: IncomingMessage
  prisma: PrismaClient
}
