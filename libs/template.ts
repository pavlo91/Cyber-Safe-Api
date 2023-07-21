import path from 'path'
import pug from 'pug'
import config from '../config'

class Template {
  constructor(private model: Record<string, any>) {}

  getHTML(name: string, model?: Record<string, any>) {
    const filePath = path.join(__dirname, '../templates', name + '.pug')
    return pug.renderFile(filePath, { ...this.model, ...model, pretty: true })
  }

  getTitle(html: string) {
    const regex = new RegExp('<title>(.+)</title>')
    return regex.exec(html)?.[1] ?? ''
  }
}

const template = new Template(config.template)

export default template
