const LOG_PREFIX = '[TeamFlow]'

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
} as const

type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel]

interface LoggerOptions {
  minLevel: LogLevelType
  enableInProduction: boolean
}

const options: LoggerOptions = {
  minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
  enableInProduction: false
}

function shouldLog(level: LogLevelType): boolean {
  if (!import.meta.env.DEV && !options.enableInProduction) {
    return level >= LogLevel.ERROR
  }
  return level >= options.minLevel
}

function debug(...args: unknown[]): void {
  if (shouldLog(LogLevel.DEBUG)) {
    console.debug(`${LOG_PREFIX} [DEBUG]`, ...args)
  }
}

function info(...args: unknown[]): void {
  if (shouldLog(LogLevel.INFO)) {
    console.info(`${LOG_PREFIX} [INFO]`, ...args)
  }
}

function warn(...args: unknown[]): void {
  if (shouldLog(LogLevel.WARN)) {
    console.warn(`${LOG_PREFIX} [WARN]`, ...args)
  }
}

function error(...args: unknown[]): void {
  if (shouldLog(LogLevel.ERROR)) {
    console.error(`${LOG_PREFIX} [ERROR]`, ...args)
  }
}

export const logger = {
  debug,
  info,
  warn,
  error
}
