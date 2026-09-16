import { logger } from './infrastructure/logging/logger'
import { registerDailySummaryJob } from './jobs/queues/notification.queue'
import { closeNotificationWorker } from './jobs/workers/notification.worker'

logger.info('WhosOnSite Worker process started. Listening for background jobs...')

registerDailySummaryJob().catch((err) => {
  logger.warn({ err }, 'Failed to initialize daily summary cron schedule')
})

async function shutdown(signal: string) {
  logger.info({ signal }, 'Worker process shut down signal received. Closing workers...')
  try {
    await closeNotificationWorker()
    logger.info('Notification worker closed cleanly.')
    process.exit(0)
  } catch (err) {
    logger.error({ err }, 'Error during worker shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
