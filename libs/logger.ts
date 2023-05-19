import colors from 'colors'
import { format } from 'date-fns'
import util from 'util'
import config from '../config'

interface Logger {
  debug(message: string, ...args: any[]): void
  log(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
}

class ConsoleLogger implements Logger {
  private levels: Record<keyof Logger, number> = {
    debug: -1,
    log: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  private minLevel: number
  private padLevel: number

  constructor(minLevel: keyof Logger) {
    this.minLevel = this.levels[minLevel]
    this.padLevel = Math.max(...Object.keys(this.levels).map((e) => e.length))
    colors.enable()
  }

  private formatMessage(level: keyof Logger, message: string, ...args: any[]) {
    const lvl = '(' + level.toUpperCase() + ')'
    const padLvl = lvl.padEnd(this.padLevel + 2, ' ')
    const time = format(new Date(), "'['HH:mm:ss']'")
    const msg = util.format(message, ...args)

    return msg
      .split('\n')
      .map((msg) => `${time} ${padLvl} ${msg}`)
      .join('\n')
  }

  debug(message: string, ...args: any[]): void {
    if (this.minLevel > this.levels.debug) return
    console.debug(this.formatMessage('debug', message, ...args).gray.italic)
  }

  log(message: string, ...args: any[]): void {
    if (this.minLevel > this.levels.log) return
    console.log(this.formatMessage('log', message, ...args).green)
  }

  info(message: string, ...args: any[]): void {
    if (this.minLevel > this.levels.info) return
    console.info(this.formatMessage('info', message, ...args).blue)
  }

  warn(message: string, ...args: any[]): void {
    if (this.minLevel > this.levels.warn) return
    console.warn(this.formatMessage('warn', message, ...args).yellow.bold)
  }

  error(message: string, ...args: any[]): void {
    if (this.minLevel > this.levels.error) return
    console.error(this.formatMessage('error', message, ...args).red.bold)
  }
}

const logger: Logger = new ConsoleLogger(config.dev ? 'debug' : 'log')

export default logger
