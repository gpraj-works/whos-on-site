import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { pinoHttp } from 'pino-http'
import { env } from './config/env'
import { logger } from './infrastructure/logging/logger'
import { queryClient } from './infrastructure/database/client'
import { redis } from './infrastructure/redis/client'
import { HealthResponse, ReadinessResponse } from '@whosonsite/shared'
import { apiRouter } from './routes/index'
import { errorHandler } from './middleware/error-handler'

const app = express()

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or Postman)
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        (env.isDevEnv && /^http:\/\/(localhost|127\.0\.0\.1):(3000|5173|4173)$/.test(origin))
      ) {
        return callback(null, true)
      }
      return callback(new Error(`CORS error: Origin ${origin} not allowed.`))
    },
    credentials: true
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(pinoHttp({ logger }))

// Mount Central API Router
app.use('/api', apiRouter)

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

// Register Global Error Handling Middleware
app.use(errorHandler)

export { app }
