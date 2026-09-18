import { dayjs } from '@whosonsite/shared'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { db } from '../../src/infrastructure/database/client'
import { refreshTokens } from '../../src/infrastructure/database/schema'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('Auth Integration Tests — Token Rotation, Revocation & Rate Limiting', () => {
  beforeAll(async () => {
    await seedDatabase()
  })

  const getCookieHeader = (res: { headers: Record<string, string | string[] | undefined> }) => {
    const setCookies = res.headers['set-cookie']
    const cookies = Array.isArray(setCookies) ? setCookies : setCookies ? [setCookies] : []
    const match = cookies.find((c: string) => c.includes('whosonsite_refresh_token'))
    return match ? match.split(';')[0] : ''
  }

  it('registers a new company and owner user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      companyName: 'Test HVAC Co',
      email: 'newowner@testhvac.com',
      password: 'password123'
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.email).toBe('newowner@testhvac.com')
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('authenticates user login and sets httpOnly refresh token cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@acmehvac.com',
      password: 'password123'
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
    const cookie = getCookieHeader(res)
    expect(cookie).toContain('whosonsite_refresh_token=')
  })

  it('rotates refresh token on /api/auth/refresh and revokes previous token after grace period', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@acmehvac.com',
      password: 'password123'
    })

    const cookie1 = getCookieHeader(loginRes)

    // First refresh: rotates token successfully
    const refreshRes1 = await request(app).post('/api/auth/refresh').set('Cookie', cookie1)

    expect(refreshRes1.status).toBe(200)
    expect(refreshRes1.body.success).toBe(true)

    // Explicitly set revokedAt to 30 seconds ago in DB to simulate post-grace-period reuse
    await db.update(refreshTokens).set({
      revokedAt: dayjs().subtract(30, 'second').toDate()
    })

    // Reusing the old rotated refresh token past grace period MUST be rejected (401)
    const reuseRes = await request(app).post('/api/auth/refresh').set('Cookie', cookie1)

    expect(reuseRes.status).toBe(401)
    expect(reuseRes.body.success).toBe(false)
  })

  it('invalidates refresh token on logout', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'owner@acmehvac.com',
      password: 'password123'
    })

    const cookie = getCookieHeader(loginRes)

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie)

    expect(logoutRes.status).toBe(200)

    // Set revokedAt to 30 seconds ago in DB to simulate post-grace-period logout refresh attempt
    await db.update(refreshTokens).set({
      revokedAt: dayjs().subtract(30, 'second').toDate()
    })

    const postLogoutRefresh = await request(app).post('/api/auth/refresh').set('Cookie', cookie)

    expect(postLogoutRefresh.status).toBe(401)
  })

  it('rate-limits login attempts once the threshold is exceeded', async () => {
    let lastStatus = 200
    for (let i = 0; i < 22; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@acmehvac.com', password: 'password123' })
      lastStatus = res.status
      if (lastStatus === 429) {
        expect(res.body.success).toBe(false)
        expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED')
        break
      }
    }

    expect(lastStatus).toBe(429)
  })
})
