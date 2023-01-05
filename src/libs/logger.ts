import { Config } from '../config'

const LoggerLevel = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const

type LoggerLevel = keyof typeof LoggerLevel

const LoggerFn = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
} as const

type LoggerProps = {
  level: LoggerLevel
  label?: string
  task?: string
}

export class Logger {
  static global = new Logger({ level: Config.dev ? 'debug' : 'info' })

  static label(label: string) {
    return new Logger({ level: Config.dev ? 'debug' : 'info', label })
  }

  constructor(private props: LoggerProps) {}

  task(task: string) {
    return new Logger({ ...this.props, task })
  }

  private log(level: LoggerLevel, message: string, ...args: any[]) {
    if (LoggerLevel[level] < LoggerLevel[this.props.level]) return

    const { label, task } = this.props

    const _time = new Date().toTimeString().substring(0, 8)
    const _level = `[${level.toUpperCase()}]`
    const _label = label && `(${label.toUpperCase()})`
    const _task = task && `${task}:`

    const _components = [_time, _level, _label, _task, message]
    const _message = _components.filter((e) => !!e).join(' ')

    LoggerFn[level](_message, ...args)
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args)
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args)
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args)
  }
}
