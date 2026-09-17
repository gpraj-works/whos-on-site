import { Queue } from 'bullmq'
import { bullConnectionOptions } from '../../infrastructure/queue/bullmq'
import { logger } from '../../infrastructure/logging/logger'

export const NOTIFICATION_QUEUE_NAME = 'notification-queue'

export interface NotificationJobPayload {
  companyId: string
  jobId?: string
  type: 'job_created' | 'job_delayed' | 'tech_assigned' | 'job_status_changed' | 'daily_summary'
  payload: Record<string, unknown>
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

notificationQueue.on('error', (err) => {
  logger.warn(
    { err: err.message },
    'Notification queue Redis connection warning (Redis is offline)'
  )
})

/** Enqueue a background notification job */
export async function enqueueNotificationJob(data: NotificationJobPayload): Promise<void> {
  try {
    await notificationQueue.add(data.type, data)
    logger.debug(
      { type: data.type, companyId: data.companyId, jobId: data.jobId },
      'Enqueued notification job'
    )
  } catch (err) {
    logger.warn(
      { err, type: data.type, companyId: data.companyId },
      'Failed to enqueue notification job'
    )
  }
}

/** Enqueue a delayed reminder job to re-check job progress after delay */
export async function enqueueDelayedReminderJob(
  companyId: string,
  jobId: string,
  delayMs = 15 * 60 * 1000
): Promise<void> {
  try {
    await notificationQueue.add(
      'job_delayed',
      {
        companyId,
        jobId,
        type: 'job_delayed',
        payload: { reminderDelayMs: delayMs }
      },
      {
        delay: delayMs,
        jobId: `reminder-${jobId}`
      }
    )
    logger.debug({ companyId, jobId, delayMs }, 'Enqueued delayed job reminder')
  } catch (err) {
    logger.warn({ err, companyId, jobId }, 'Failed to enqueue delayed job reminder')
  }
}

/** Register repeatable daily summary cron job */
export async function registerDailySummaryJob(): Promise<void> {
  try {
    await notificationQueue.upsertJobScheduler(
      'repeatable:daily_summary',
      { pattern: '0 8 * * *' },
      {
        name: 'daily_summary',
        data: {
          companyId: 'system',
          type: 'daily_summary',
          payload: {}
        }
      }
    )
    logger.info('Registered repeatable daily summary cron job')
  } catch (err) {
    logger.warn({ err }, 'Failed to register repeatable daily summary job')
  }
}
