import { Queue } from 'bullmq'
import { bullConnectionOptions } from '../../infrastructure/queue/bullmq'
import { logger } from '../../infrastructure/logging/logger'

export const NOTIFICATION_QUEUE_NAME = 'notification-queue'

export interface NotificationJobPayload {
  companyId: string
  jobId?: string
  type: 'job_created' | 'job_delayed' | 'tech_assigned' | 'job_status_changed' | 'daily_summary'
  payload: Record<string, any>
}

export const notificationQueue = new Queue<NotificationJobPayload>(NOTIFICATION_QUEUE_NAME, {
  connection: bullConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 }
  }
})

/** Enqueue a background notification job */
export async function enqueueNotificationJob(data: NotificationJobPayload): Promise<void> {
  try {
    await notificationQueue.add(data.type, data)
    logger.debug({ type: data.type, companyId: data.companyId, jobId: data.jobId }, 'Enqueued notification job')
  } catch (err) {
    logger.warn({ err, type: data.type, companyId: data.companyId }, 'Failed to enqueue notification job')
  }
}
