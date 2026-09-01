import pino from 'pino'
import { env } from '../../config/env'

const pinoDevConfig = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'pid,hostname',
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'
  }
}

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.isDevEnv ? pinoDevConfig : undefined
})
