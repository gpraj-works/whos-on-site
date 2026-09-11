import { app } from './app'
import { env } from './config/env'
import { logger } from './infrastructure/logging/logger'

app.listen(env.PORT, () => {
  logger.info(`WhosOnSite API server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
})
