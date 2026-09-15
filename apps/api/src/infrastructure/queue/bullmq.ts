import { ConnectionOptions } from 'bullmq'
import { env } from '../../config/env'

/** Shared connection options for BullMQ queues and workers */
export const bullConnectionOptions: ConnectionOptions = (() => {
  try {
    const url = new URL(env.REDIS_URL)
    const rawHost = url.hostname || '127.0.0.1'
    const host = rawHost === 'localhost' ? '127.0.0.1' : rawHost
    return {
      host,
      port: url.port ? parseInt(url.port, 10) : 6379,
      username: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    }
  } catch {
    return {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    }
  }
})()
