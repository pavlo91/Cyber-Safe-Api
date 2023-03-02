import { FastifyReply, FastifyRequest } from 'fastify'
import { createYoga } from 'graphql-yoga'
import { getContextFromRequest } from '../helpers/context'
import { schema } from '../schema'
import { fastify } from './fastify'

type ServerContext = {
  req: FastifyRequest
  reply: FastifyReply
}

const yoga = createYoga<ServerContext>({
  schema,
  context: ({ req }) => getContextFromRequest(req),
  maskedErrors: {
    maskError: (error: any) => {
      console.error(error)
      return error
    },
  },
})

fastify.route({
  url: '/graphql',
  method: ['GET', 'POST', 'OPTIONS'],
  handler: async (req, reply) => {
    const response = await yoga.handleNodeRequest(req, { req, reply })

    response.headers.forEach((value, name) => {
      reply.header(name, value)
    })

    reply.status(response.status)
    reply.send(response.body)

    return reply
  },
})
