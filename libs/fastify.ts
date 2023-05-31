import Fastify from 'fastify'
import logger from './logger'

const fastify = Fastify()

fastify.addHook('onRoute', (route) => {
  const method = Array.isArray(route.method) ? route.method.join(', ') : route.method
  logger.debug('Registered route %s %s', method, route.path)
})

export default fastify
