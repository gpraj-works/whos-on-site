import { describe, expect, it, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('Agents & Spatial Proximity Integration Tests', () => {
  let adminToken: string
  let techToken: string
  let techId: string

  beforeAll(async () => {
    await seedDatabase()

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@acmehvac.com', password: 'password123' })
    adminToken = adminRes.body.data.accessToken

    const techRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tech1@acmehvac.com', password: 'password123' })
    techToken = techRes.body.data.accessToken

    const techListRes = await request(app)
      .get('/api/agents')
      .set('Authorization', `Bearer ${adminToken}`)
    techId = techListRes.body.data[0].id
  })

  it('queries nearby available agents ordered by PostGIS distance', async () => {
    const res = await request(app)
      .get('/api/agents/nearby')
      .query({ lat: 33.75, lng: -84.38, radiusKm: 25 })
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    const techs = res.body.data
    expect(Array.isArray(techs)).toBe(true)
    expect(techs.length).toBeGreaterThan(0)
    expect(techs[0].distanceMeters).toBeDefined()

    // Assert ascending distance ordering
    for (let i = 1; i < techs.length; i++) {
      expect(techs[i].distanceMeters).toBeGreaterThanOrEqual(techs[i - 1].distanceMeters)
    }
  })

  it('updates agent location via location-ping endpoint', async () => {
    const pingRes = await request(app)
      .patch(`/api/agents/${techId}/location`)
      .set('Authorization', `Bearer ${techToken}`)
      .send({ lat: 33.76, lng: -84.39 })

    expect(pingRes.status).toBe(200)
    expect(pingRes.body.success).toBe(true)
    expect(pingRes.body.data.lastLocationAt).toBeDefined()
  })
})
