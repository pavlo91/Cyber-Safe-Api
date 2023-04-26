import path from 'path'
import pug from 'pug'
import { z } from 'zod'
import { config } from '../config'
import { fastify } from './fastify'

const schema = z.object({
  file: z.string(),
})

fastify.get('/api/preview/:file', async (req, reply) => {
  const params = schema.parse(req.params)

  const pugPath = path.join(__dirname, '../../templates', params.file + '.pug')
  const html = pug.renderFile(pugPath, { ...config.template, pretty: true })

  reply.type('text/html')
  reply.send(html)

  return reply
})
