import { describe, expect, it, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('Jobs CRUD & RBAC Integration Tests', () => {
  let dispatcherToken: string
  let techToken: string
  let createdJobId: string
  let customerId: string
  let techId: string

  beforeAll(async () => {
    await seedDatabase()

    // Login as Dispatcher
    const dispRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dispatcher@acmehvac.com', password: 'password123' })
    dispatcherToken = dispRes.body.data.accessToken

    // Login as Technician
    const techRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tech1@acmehvac.com', password: 'password123' })
    techToken = techRes.body.data.accessToken

    // Fetch customer list to obtain valid customerId for job creation
    const custRes = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${dispatcherToken}`)
    customerId = custRes.body.data[0].id

    // Fetch technicians list to find technician linked to tech1@acmehvac.com
    const techListRes = await request(app)
      .get('/api/technicians')
      .set('Authorization', `Bearer ${dispatcherToken}`)
    techId = techListRes.body.data[0].id
  })

  it('creates a new job as dispatcher', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        customerId,
        location: { lat: 33.755, lng: -84.388 },
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        notes: 'Test emergency AC repair'
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('unassigned')
    createdJobId = res.body.data.id
  })

  it('creates a job without coordinates, saving a null location', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({ customerId, notes: 'No geocodable address available' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('unassigned')
    expect(res.body.data.location).toBeNull()
  })

  it('retrieves job details and status history trail', async () => {
    const res = await request(app)
      .get(`/api/jobs/${createdJobId}`)
      .set('Authorization', `Bearer ${dispatcherToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(createdJobId)

    const historyRes = await request(app)
      .get(`/api/jobs/${createdJobId}/status-history`)
      .set('Authorization', `Bearer ${dispatcherToken}`)

    expect(historyRes.status).toBe(200)
    expect(historyRes.body.success).toBe(true)
    expect(historyRes.body.data.length).toBeGreaterThan(0)
  })

  it('assigns job to technician', async () => {
    const assignRes = await request(app)
      .post(`/api/jobs/${createdJobId}/assign`)
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({ technicianId: techId })

    expect(assignRes.status).toBe(200)
    expect(assignRes.body.success).toBe(true)
    expect(assignRes.body.data.status).toBe('assigned')
    expect(assignRes.body.data.assignedTechnicianId).toBe(techId)
  })

  it('rejects illegal status transition e.g. ASSIGNED -> COMPLETE directly (returns 400)', async () => {
    const illegalRes = await request(app)
      .post(`/api/jobs/${createdJobId}/status`)
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({ status: 'complete' })

    expect(illegalRes.status).toBe(400)
    expect(illegalRes.body.success).toBe(false)
  })

  it('enforces RBAC: technician can update status for assigned job', async () => {
    // First update to EN_ROUTE as technician
    const resEnRoute = await request(app)
      .post(`/api/jobs/${createdJobId}/status`)
      .set('Authorization', `Bearer ${techToken}`)
      .send({ status: 'en_route' })

    expect(resEnRoute.status).toBe(200)
    expect(resEnRoute.body.data.status).toBe('en_route')

    // Next update to ON_SITE as technician
    const resOnSite = await request(app)
      .post(`/api/jobs/${createdJobId}/status`)
      .set('Authorization', `Bearer ${techToken}`)
      .send({ status: 'on_site' })

    expect(resOnSite.status).toBe(200)
    expect(resOnSite.body.data.status).toBe('on_site')
  })
})
