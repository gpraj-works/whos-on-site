import { and, eq } from 'drizzle-orm'
import { Job } from 'bullmq'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { db } from '../../src/infrastructure/database/client'
import {
  jobs,
  notificationTypeEnum,
  notifications
} from '../../src/infrastructure/database/schema'
import { seedDatabase } from '../../src/infrastructure/database/seed'
import { NotificationJobPayload } from '../../src/jobs/queues/notification.queue'
import {
  closeNotificationWorker,
  processNotificationJob
} from '../../src/jobs/workers/notification.worker'
import { createJob } from '../../src/modules/jobs/job.repository'

type NotificationType = (typeof notificationTypeEnum)['enumValues'][number]

const makeJob = (data: NotificationJobPayload): Job<NotificationJobPayload> =>
  ({ id: 'test-job', name: data.type, data }) as unknown as Job<NotificationJobPayload>

describe('Notification Worker Processor Integration Tests', () => {
  let dispatcherToken: string
  let companyId: string
  let customerId: string

  beforeAll(async () => {
    await seedDatabase()

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dispatcher@acmehvac.com', password: 'password123' })
    dispatcherToken = login.body.data.accessToken
    companyId = login.body.data.user.companyId

    const cust = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${dispatcherToken}`)
    customerId = cust.body.data[0].id
  })

  afterAll(async () => {
    await closeNotificationWorker()
  })

  const createTestJob = async () => {
    const job = await createJob({ companyId, customerId })
    return job
  }

  const countByJobAndType = async (jobId: string, type: NotificationType) => {
    const rows = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.jobId, jobId), eq(notifications.type, type)))
    return rows.length
  }

  it('job_created writes a notification row with a sent timestamp', async () => {
    const job = await createTestJob()

    await processNotificationJob(
      makeJob({ companyId, jobId: job.id, type: 'job_created', payload: {} })
    )

    const rows = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.jobId, job.id), eq(notifications.type, 'job_created')))
    expect(rows).toHaveLength(1)
    expect(rows[0].sentAt).toBeDefined()
  })

  it('job_delayed writes a reminder while the job is still unstarted', async () => {
    const job = await createTestJob()

    await processNotificationJob(
      makeJob({ companyId, jobId: job.id, type: 'job_delayed', payload: {} })
    )

    expect(await countByJobAndType(job.id, 'job_delayed')).toBe(1)
  })

  it('job_delayed skips the reminder once the job has progressed', async () => {
    const job = await createTestJob()
    await db.update(jobs).set({ status: 'en_route' }).where(eq(jobs.id, job.id))

    await processNotificationJob(
      makeJob({ companyId, jobId: job.id, type: 'job_delayed', payload: {} })
    )

    expect(await countByJobAndType(job.id, 'job_delayed')).toBe(0)
  })

  it('daily_summary fans out one notification row per company', async () => {
    await processNotificationJob(
      makeJob({ companyId: 'system', type: 'daily_summary', payload: {} })
    )

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.type, 'daily_summary'))

    expect(rows.length).toBeGreaterThanOrEqual(2)
    for (const row of rows) {
      expect(row.sentAt).toBeDefined()
    }
  })
})
