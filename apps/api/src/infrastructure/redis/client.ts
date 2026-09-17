import { Redis } from 'ioredis'
import { env } from '../../config/env'
import { logger } from '../logging/logger'

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 5) return null
    const delay = Math.min(times * 100, 3000)
    return delay
  }
})

redis.on('error', (err) => {
  logger.warn(
    { err: err.message },
    'Redis connection warning (Redis server is offline or unreachable)'
  )
})

redis.on('connect', () => {
  logger.info('Connected to Redis server')
})
