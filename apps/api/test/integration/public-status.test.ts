import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { db } from '../../src/infrastructure/database/client'
import { jobs } from '../../src/infrastructure/database/schema'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('Public Job Status & Share-Link Expiry Integration Tests', () => {
  let dispatcherToken: string
  let customerId: string
  let activeJobShareToken: string
  let completedJobShareToken: string

  beforeAll(async () => {
    await seedDatabase()

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dispatcher@acmehvac.com', password: 'password123' })
    expect(login.status).toBe(200)
    dispatcherToken = login.body.data.accessToken

    const cust = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${dispatcherToken}`)
    customerId = cust.body.data[0].id

    const active = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({ customerId, scheduledAt: new Date(Date.now() + 86400000).toISOString() })
    expect(active.status).toBe(201)
    activeJobShareToken = active.body.data.shareToken

    const completed = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({ customerId })
    completedJobShareToken = completed.body.data.shareToken

    await db
      .update(jobs)
      .set({ status: 'complete', updatedAt: dayjs().subtract(2, 'hour').toDate() })
      .where(eq(jobs.shareToken, completedJobShareToken))
  })

  describe('Active (non-terminal) jobs', () => {
    it('returns live status for a valid share token', async () => {
      const res = await request(app).get(`/api/public/jobs/${activeJobShareToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.jobId).toBeDefined()
      expect(res.body.data.status).toBe('unassigned')
      expect(res.body.data.companyName).toBe('Acme HVAC Services')
      expect(res.body.data.history.length).toBeGreaterThan(0)
    })

    it('keeps serving an active job regardless of how old it is', async () => {
      await db
        .update(jobs)
        .set({ updatedAt: dayjs().subtract(5, 'day').toDate() })
        .where(eq(jobs.shareToken, activeJobShareToken))

      const res = await request(app).get(`/api/public/jobs/${activeJobShareToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('unassigned')
    })
  })

  describe('Terminal jobs and 48-hour expiry', () => {
    it('serves a recently completed job within the 48-hour window', async () => {
      const res = await request(app).get(`/api/public/jobs/${completedJobShareToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('complete')
    })

    it('returns 404 once a terminal job is older than 48 hours', async () => {
      await db
        .update(jobs)
        .set({ updatedAt: dayjs().subtract(49, 'hour').toDate() })
        .where(eq(jobs.shareToken, completedJobShareToken))

      const res = await request(app).get(`/api/public/jobs/${completedJobShareToken}`)

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Invalid tokens', () => {
    it('returns 404 for an unknown share token', async () => {
      const res = await request(app).get('/api/public/jobs/00000000-0000-4000-8000-000000000000')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })
})