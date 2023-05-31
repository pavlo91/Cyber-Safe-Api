import cors from '@fastify/cors'
import config from './config'
import fastify from './libs/fastify'
import logger from './libs/logger'
import './modules'
import { updateAllActionTypes } from './utils/actions'
import { updateAllActivityTypes } from './utils/activity'

if (config.dev) {
  import('./scripts/seed')
}

updateAllActionTypes()
updateAllActivityTypes()

async function main() {
  await fastify.register(cors)
  await fastify.listen({ host: '0.0.0.0', port: config.port })
  logger.info(`Server is ready at http://localhost:${config.port}/graphql`)
}

main()
