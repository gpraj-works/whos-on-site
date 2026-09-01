import express, { Request, Response } from 'express'
import cors from 'cors'
import { pinoHttp } from 'pino-http'
import { logger } from './infrastructure/logging/logger.js'
import { queryClient } from './infrastructure/database/client.js'
import { redis } from './infrastructure/redis/client.js'
import { HealthResponse, ReadinessResponse } from '@routeboard/shared'

const app: express.Express = express()

app.use(cors())
app.use(express.json())
app.use(pinoHttp({ logger }))

// Liveness check: process is alive
app.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Readiness check: verifies DB and Redis connections
app.get('/ready', async (_req: Request, res: Response<ReadinessResponse>) => {
  let postgresConnected = false
  let redisConnected = false

  try {
    await queryClient`SELECT 1`
    postgresConnected = true
  } catch (err) {
    logger.warn({ err }, 'Readiness check: Postgres unavailable')
  }

  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.ping()
      redisConnected = true
    } else {
      await redis.connect()
      await redis.ping()
      redisConnected = true
    }
  } catch (err) {
    logger.warn({ err }, 'Readiness check: Redis unavailable')
  }

  const isReady = postgresConnected && redisConnected

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    services: {
      postgres: postgresConnected,
      redis: redisConnected
    },
    timestamp: new Date().toISOString()
  })
})

export { app }
