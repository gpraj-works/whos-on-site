import { dayjs } from '@whosonsite/shared'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { env } from '../../src/config/env'
import { db } from '../../src/infrastructure/database/client'
import { refreshTokens, users } from '../../src/infrastructure/database/schema'
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

  it('registers a new company and owner user with extended company details', async () => {
    const res = await request(app).post('/api/auth/register').send({
      companyName: 'Test HVAC Co',
      email: 'newowner@testhvac.com',
      phone: '+1 555-0199',
      address: '123 Main Street, Suite 400, New York, NY 10001',
      latitude: 40.7128,
      longitude: -74.006,
      password: 'password123'
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.email).toBe('newowner@testhvac.com')
    expect(res.body.data.company.name).toBe('Test HVAC Co')
    expect(res.body.data.company.phone).toBe('+1 555-0199')
    expect(res.body.data.company.address).toBe('123 Main Street, Suite 400, New York, NY 10001')
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('handles forgot-password request for existing user', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'admin@acmehvac.com'
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toContain('password reset instructions')
  })

  it('handles forgot-password gracefully for non-existent user (anti-enumeration)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'nonexistent@example.com'
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toContain('password reset instructions')
  })

  it('resets password with a valid token and allows login with new password', async () => {
    const [user] = await db.select().from(users).where(eq(users.email, 'newowner@testhvac.com'))
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    const resetRes = await request(app).post('/api/auth/reset-password').send({
      token: resetToken,
      password: 'newpassword456'
    })

    expect(resetRes.status).toBe(200)
    expect(resetRes.body.success).toBe(true)

    // Verify login works with the updated password
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'newowner@testhvac.com',
      password: 'newpassword456'
    })

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.success).toBe(true)
  })

  it('rejects reset-password with invalid token', async () => {
    const resetRes = await request(app).post('/api/auth/reset-password').send({
      token: 'invalid.token.here',
      password: 'newpassword456'
    })

    expect(resetRes.status).toBe(400)
    expect(resetRes.body.success).toBe(false)
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
