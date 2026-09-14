import http from 'node:http'
import { app } from './app'
import { env } from './config/env'
import { logger } from './infrastructure/logging/logger'
import { initSocketServer } from './infrastructure/socket/socket.server'

const httpServer = http.createServer(app)
initSocketServer(httpServer)

httpServer.listen(env.PORT, () => {
  logger.info(`WhosOnSite API server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
})

