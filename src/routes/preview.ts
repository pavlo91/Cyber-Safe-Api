import { FastifyRequest, HTTPMethods } from 'fastify'
import { z } from 'zod'
import { loadHtml } from '../helpers/pug'
import { Route } from './index'

const schema = z.object({
  file: z.string(),
})

export class PreviewRoute implements Route {
  constructor(public path: string, public method: HTTPMethods) {}

  handle(req: FastifyRequest) {
    const params = schema.parse(req.params)
    return loadHtml(('email/' + params.file + '.pug') as any, req.query)
  }
}
