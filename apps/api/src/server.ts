import { app } from './app'
import { env } from './config/env'
import { logger } from './infrastructure/logging/logger'

app.listen(env.PORT, () => {
  logger.info(`RouteBoard API server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
})
