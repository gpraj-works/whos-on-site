import { Job, Worker } from 'bullmq'
import { bullConnectionOptions } from '../../infrastructure/queue/bullmq'
import { db } from '../../infrastructure/database/client'
import { notifications } from '../../infrastructure/database/schema/notifications'
import { logger } from '../../infrastructure/logging/logger'
import { NOTIFICATION_QUEUE_NAME, NotificationJobPayload } from '../queues/notification.queue'

/** Process individual notification job by writing row to database */
async function processNotificationJob(job: Job<NotificationJobPayload>): Promise<void> {
  const { companyId, jobId, type, payload } = job.data

  logger.info({ jobId: job.id, type, companyId }, 'Processing notification job')

  await db.insert(notifications).values({
    companyId,
    jobId: jobId || null,
    type,
    payload: payload || {},
    sentAt: new Date()
  })

  logger.info({ jobId: job.id, type, companyId }, 'Notification recorded successfully')
}

export const notificationWorker = new Worker<NotificationJobPayload>(
  NOTIFICATION_QUEUE_NAME,
  processNotificationJob,
  {
    connection: bullConnectionOptions,
    concurrency: 5
  }
)

notificationWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, name: job.name }, 'Notification job completed')
})

notificationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, name: job?.name, err }, 'Notification job failed')
})

/** Gracefully close the worker connection */
export async function closeNotificationWorker(): Promise<void> {
  await notificationWorker.close()
}
