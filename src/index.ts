import cors from '@fastify/cors'
import fs from 'fs'
import path from 'path'
import { config } from './config'
import './middleware'
import './routes'
import { fastify } from './routes/fastify'

if (config.dev) {
  import('./seed')

  // Cleanup .temp folder
  fs.rmSync(path.join(__dirname, '../.temp'), { recursive: true, force: true })
}
if (config.enableCronJobs) {
  import('./crons')
}

fastify
  .register(cors)
  .listen({ host: '0.0.0.0', port: config.port })
  .then(() => console.info(`Server is ready at http://localhost:${config.port}/graphql`))
