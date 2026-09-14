import { ConnectionOptions } from 'bullmq'
import { env } from '../../config/env'

/** Shared connection options for BullMQ queues and workers */
export const bullConnectionOptions: ConnectionOptions = (() => {
  try {
    const url = new URL(env.REDIS_URL)
    return {
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port, 10) : 6379,
      username: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    }
  } catch {
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    }
  }
})()
