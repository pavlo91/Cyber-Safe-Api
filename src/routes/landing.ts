import { loadHTML } from '../libs/pug'
import { fastify } from './fastify'

fastify.get('/', (req, reply) => {
  reply.type('text/html')
  reply.send(loadHTML('html/landing.pug'))

  return reply
})
