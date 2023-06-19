import { FastifyReply, FastifyRequest } from 'fastify'
import { createYoga } from 'graphql-yoga'
import fastify from '../libs/fastify'
import pothos from '../libs/pothos'
import { getContextFromRequest } from '../utils/context'
import './address'
import './auth'
import './contact'
import './email-setting'
import './image'
import './import'
import './moderator'
import './notification'
import './post'
import './preview'
import './school'
import './setting'
import './social'
import './stats'
import './upload'
import './user'
import './user-role'

type ServerContext = {
  req: FastifyRequest
  reply: FastifyReply
}

const yoga = createYoga<ServerContext>({
  schema: pothos.toSchema(),
  context: ({ req }) => getContextFromRequest(req),
  maskedErrors: {
    maskError: (error) => {
      return error as Error
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
