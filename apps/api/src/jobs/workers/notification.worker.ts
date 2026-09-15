import { Job, Worker } from 'bullmq'
import { eq } from 'drizzle-orm'
import { bullConnectionOptions } from '../../infrastructure/queue/bullmq'
import { db } from '../../infrastructure/database/client'
import { companies, jobs, notifications } from '../../infrastructure/database/schema/index'
import { logger } from '../../infrastructure/logging/logger'
import { NOTIFICATION_QUEUE_NAME, NotificationJobPayload } from '../queues/notification.queue'

/** Process individual notification job by writing row to database */
export async function processNotificationJob(job: Job<NotificationJobPayload>): Promise<void> {
  const { companyId, jobId, type, payload } = job.data

  logger.info({ jobId: job.id, type, companyId }, 'Processing notification job')

  if (type === 'job_delayed' && jobId) {
    const [existingJob] = await db.select({ status: jobs.status }).from(jobs).where(eq(jobs.id, jobId))
    if (!existingJob || (existingJob.status !== 'unassigned' && existingJob.status !== 'assigned')) {
      logger.info(
        { jobId, status: existingJob?.status },
        'Job is no longer delayed or unstarted. Skipping job_delayed notification.'
      )
      return
    }
  }

  if (type === 'daily_summary') {
    const allCompanies = await db.select({ id: companies.id, name: companies.name }).from(companies)
    for (const company of allCompanies) {
      await db.insert(notifications).values({
        companyId: company.id,
        jobId: null,
        type: 'daily_summary',
        payload: {
          generatedAt: new Date().toISOString(),
          companyName: company.name
        },
        sentAt: new Date()
      })
    }
    logger.info({ companyCount: allCompanies.length }, 'Recorded daily summary notifications for all companies')
    return
  }

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
