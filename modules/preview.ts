import { z } from 'zod'
import config from '../config'
import fastify from '../libs/fastify'
import template from '../libs/template'

if (config.dev) {
  const schema = z.object({
    name: z.string(),
  })

  fastify.get('/api/preview/:name', (req, reply) => {
    const { name } = schema.parse(req.params)

    reply.type('text/html')
    reply.send(template.getHTML(name, req.query as any))

    return reply
  })
}
