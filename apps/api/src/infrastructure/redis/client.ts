import { Redis } from 'ioredis'
import { env } from '../../config/env.js'
import { logger } from '../logging/logger.js'

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000)
    return delay
  }
})

redis.on('error', (err) => {
  logger.warn({ err: err.message }, 'Redis connection warning')
})

redis.on('connect', () => {
  logger.info('Connected to Redis server')
})
