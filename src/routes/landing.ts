import { HTTPMethods } from 'fastify'
import { loadHtml } from '../helpers/pug'
import { Route } from './index'

export class LandingRoute implements Route {
  constructor(public path: string, public method: HTTPMethods) {}

  handle() {
    return loadHtml('/html/landing.pug')
  }
}
