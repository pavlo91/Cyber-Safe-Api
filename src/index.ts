import cors from '@fastify/cors'
import { config } from './config'
import './middleware'
import './routes'
import { fastify } from './routes/fastify'

if (config.dev) {
  import('./seed')
} else {
  import('./crons')
}

fastify
  .register(cors)
  .listen({ host: '0.0.0.0', port: config.port })
  .then(() => console.info(`Server is ready at http://localhost:${config.port}/graphql`))
