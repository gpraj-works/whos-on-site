import argon2 from 'argon2'
import { sql } from 'drizzle-orm'
import { db } from '../client'
import { companies, users, technicians } from '../schema/index'
import { logger } from '../../logging/logger'
import { UserRole } from '@routeboard/shared'

export async function seedDatabase() {
  logger.info('Starting multi-company database seed...')

  const defaultPasswordHash = await argon2.hash('Password123!')

  // 1. Company A — Acme HVAC Services (Atlanta, GA)
  const [companyA] = await db.insert(companies).values({ name: 'Acme HVAC Services' }).returning()

  const [ownerA] = await db
    .insert(users)
    .values({
      companyId: companyA.id,
      email: 'owner@acmehvac.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER
    })
    .returning()

  const [dispatcherA] = await db
    .insert(users)
    .values({
      companyId: companyA.id,
      email: 'dispatcher@acmehvac.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DISPATCHER,
      createdBy: ownerA.id
    })
    .returning()

  const [techUserA1] = await db
    .insert(users)
    .values({
      companyId: companyA.id,
      email: 'tech1@acmehvac.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.TECHNICIAN,
      createdBy: dispatcherA.id
    })
    .returning()

  await db.insert(technicians).values([
    {
      companyId: companyA.id,
      userId: techUserA1.id,
      name: 'John Atlanta Tech',
      phone: '404-555-0101',
      status: 'available',
      currentLocation: sql`ST_SetSRID(ST_MakePoint(-84.3850, 33.7500), 4326)`,
      lastLocationAt: new Date(),
      createdBy: dispatcherA.id
    },
    {
      companyId: companyA.id,
      name: 'Sarah Decatur Tech',
      phone: '404-555-0102',
      status: 'available',
      currentLocation: sql`ST_SetSRID(ST_MakePoint(-84.2970, 33.7710), 4326)`,
      lastLocationAt: new Date(),
      createdBy: dispatcherA.id
    }
  ])

  // 2. Company B — Apex Plumbing Co. (New York, NY)
  const [companyB] = await db.insert(companies).values({ name: 'Apex Plumbing Co.' }).returning()

  const [ownerB] = await db
    .insert(users)
    .values({
      companyId: companyB.id,
      email: 'owner@apexplumbing.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER
    })
    .returning()

  const [dispatcherB] = await db
    .insert(users)
    .values({
      companyId: companyB.id,
      email: 'dispatcher@apexplumbing.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DISPATCHER,
      createdBy: ownerB.id
    })
    .returning()

  const [techUserB1] = await db
    .insert(users)
    .values({
      companyId: companyB.id,
      email: 'tech1@apexplumbing.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.TECHNICIAN,
      createdBy: dispatcherB.id
    })
    .returning()

  await db.insert(technicians).values([
    {
      companyId: companyB.id,
      userId: techUserB1.id,
      name: 'Mike Brooklyn Tech',
      phone: '212-555-0201',
      status: 'available',
      currentLocation: sql`ST_SetSRID(ST_MakePoint(-73.9442, 40.6782), 4326)`,
      lastLocationAt: new Date(),
      createdBy: dispatcherB.id
    },
    {
      companyId: companyB.id,
      name: 'David Queens Tech',
      phone: '212-555-0202',
      status: 'available',
      currentLocation: sql`ST_SetSRID(ST_MakePoint(-73.7949, 40.7282), 4326)`,
      lastLocationAt: new Date(),
      createdBy: dispatcherB.id
    }
  ])

  logger.info(
    'Database seed complete: Company A (Atlanta) & Company B (New York) successfully created.'
  )
}

if (process.argv[1]?.endsWith('seed/index.ts') || process.argv[1]?.endsWith('seed\\index.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error({ err }, 'Seed execution failed')
      process.exit(1)
    })
}
