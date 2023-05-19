import path from 'path'
import pug from 'pug'
import config from '../config'

class Template {
  constructor(private model: Record<string, any>, private prefix: string) {}

  getHTML(name: string, model?: Record<string, any>) {
    const filePath = path.join(__dirname, '../../templates', name + '.pug')
    return pug.renderFile(filePath, { ...this.model, ...model, pretty: true })
  }

  getTitle(html: string) {
    const regex = new RegExp('<title>(.+)</title>')
    const title = regex.exec(html)?.[1] ?? ''
    return this.prefix + title
  }
}

const template = new Template(config.template, config.dev ? '[DEVELOP] ' : '')

export default template
