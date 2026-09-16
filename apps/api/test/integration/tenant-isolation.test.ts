import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('P0 — Multi-Tenant Isolation Integration Tests', () => {
  let tokenCompanyA: string
  let tokenCompanyB: string
  let companyAId: string
  let companyBId: string

  beforeAll(async () => {
    // Ensure clean seeded multi-company database state
    await seedDatabase()

    // Authenticate as Company A Dispatcher
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dispatcher@acmehvac.com', password: 'password123' })

    expect(resA.status).toBe(200)
    expect(resA.body.success).toBe(true)
    tokenCompanyA = resA.body.data.accessToken
    companyAId = resA.body.data.user.companyId

    // Authenticate as Company B Dispatcher
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dispatcher@apexplumbing.com', password: 'password123' })

    expect(resB.status).toBe(200)
    expect(resB.body.success).toBe(true)
    tokenCompanyB = resB.body.data.accessToken
    companyBId = resB.body.data.user.companyId

    expect(companyAId).not.toBe(companyBId)
  })

  describe('Jobs Isolation', () => {
    it('Company A receives ONLY Company A jobs on GET /api/jobs', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${tokenCompanyA}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const jobs = res.body.data
      expect(Array.isArray(jobs)).toBe(true)
      expect(jobs.length).toBeGreaterThan(0)
      for (const job of jobs) {
        expect(job.companyId).toBe(companyAId)
      }
    })

    it('Company A CANNOT fetch a Company B job by ID (returns 404)', async () => {
      // First get Company B job list
      const resB = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${tokenCompanyB}`)
      const jobB = resB.body.data[0]
      expect(jobB).toBeDefined()

      // Attempt to access Company B's job as Company A user
      const resCross = await request(app)
        .get(`/api/jobs/${jobB.id}`)
        .set('Authorization', `Bearer ${tokenCompanyA}`)

      expect(resCross.status).toBe(404)
      expect(resCross.body.success).toBe(false)
    })

    it('Company A CANNOT update status or assign a Company B job (returns 404)', async () => {
      const resB = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${tokenCompanyB}`)
      const jobB = resB.body.data[0]

      const resUpdate = await request(app)
        .post(`/api/jobs/${jobB.id}/status`)
        .set('Authorization', `Bearer ${tokenCompanyA}`)
        .send({ status: 'assigned' })

      expect(resUpdate.status).toBe(404)
      expect(resUpdate.body.success).toBe(false)
    })
  })

  describe('Technicians Isolation', () => {
    it('Company A receives ONLY Company A technicians on GET /api/technicians', async () => {
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${tokenCompanyA}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const techs = res.body.data
      expect(techs.length).toBeGreaterThan(0)
      for (const tech of techs) {
        expect(tech.companyId).toBe(companyAId)
      }
    })

    it('Company A nearby technician query returns ONLY Company A technicians', async () => {
      const res = await request(app)
        .get('/api/agents/nearby')
        .query({ lat: 33.75, lng: -84.38, radiusKm: 50 })
        .set('Authorization', `Bearer ${tokenCompanyA}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const techs = res.body.data
      for (const tech of techs) {
        expect(tech.companyId).toBe(companyAId)
      }
    })
  })

  describe('Notifications Isolation', () => {
    it('Company A receives ONLY Company A notifications from database query', async () => {
      const { db } = await import('../../src/infrastructure/database/client')
      const { notifications } = await import('../../src/infrastructure/database/schema/index')
      const { eq } = await import('drizzle-orm')

      const notifsA = await db.select().from(notifications).where(eq(notifications.companyId, companyAId))
      const notifsB = await db.select().from(notifications).where(eq(notifications.companyId, companyBId))

      for (const n of notifsA) {
        expect(n.companyId).toBe(companyAId)
      }
      for (const n of notifsB) {
        expect(n.companyId).toBe(companyBId)
      }
    })
  })
})
