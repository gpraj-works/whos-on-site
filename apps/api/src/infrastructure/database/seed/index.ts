import argon2 from 'argon2'
import { sql } from 'drizzle-orm'
import { db } from '../client'
import { companies, customers, jobs, users, agents } from '../schema/index'
import { logger } from '../../logging/logger'
import { UserRole } from '@whosonsite/shared'

export async function seedDatabase() {
  logger.info('Starting multi-company database seed...')

  // Truncate existing data for clean re-seeding
  await db.execute(sql`TRUNCATE companies CASCADE`)

  const defaultPasswordHash = await argon2.hash('password123')

  // Company A — Acme HVAC Services (Atlanta, GA)
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

  await db
    .insert(users)
    .values({
      companyId: companyA.id,
      email: 'admin@acmehvac.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      createdBy: ownerA.id
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
      role: UserRole.AGENT,
      createdBy: dispatcherA.id
    })
    .returning()

  await db.insert(agents).values([
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

  const [customerA1] = await db
    .insert(customers)
    .values({
      companyId: companyA.id,
      name: 'Carlos Martinez',
      email: 'carlos.martinez@example.com',
      mobile: '404-555-0191',
      address: '245 Peachtree St NW, Atlanta, GA 30303',
      additionalInfo: { customerType: 'residential', priority: 'standard' },
      createdBy: dispatcherA.id
    })
    .returning()

  const [customerA2] = await db
    .insert(customers)
    .values({
      companyId: companyA.id,
      name: 'Riverbend Apartments',
      email: 'maintenance@riverbendapts.com',
      mobile: '404-555-0192',
      address: '880 Sidney Marcus Blvd NE, Atlanta, GA 30324',
      additionalInfo: { customerType: 'commercial', priority: 'high' },
      createdBy: dispatcherA.id
    })
    .returning()

  await db.insert(jobs).values([
    {
      companyId: companyA.id,
      customerId: customerA1.id,
      location: sql`ST_SetSRID(ST_MakePoint(-84.3879, 33.7574), 4326)`,
      status: 'unassigned',
      notes: 'AC unit not cooling on the second floor',
      createdBy: dispatcherA.id
    },
    {
      companyId: companyA.id,
      customerId: customerA2.id,
      location: sql`ST_SetSRID(ST_MakePoint(-84.3529, 33.8250), 4326)`,
      status: 'assigned',
      assignedAgentId: (
        await db
          .select({ id: agents.id })
          .from(agents)
          .where(sql`${agents.name} = 'John Atlanta Tech'`)
      )[0]?.id,
      notes: 'Routine HVAC filter replacement for common areas',
      createdBy: dispatcherA.id
    }
  ])

  // Company B — Apex Plumbing Co. (New York, NY)
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

  await db
    .insert(users)
    .values({
      companyId: companyB.id,
      email: 'admin@apexplumbing.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      createdBy: ownerB.id
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
      role: UserRole.AGENT,
      createdBy: dispatcherB.id
    })
    .returning()

  await db.insert(agents).values([
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

  const [customerB1] = await db
    .insert(customers)
    .values({
      companyId: companyB.id,
      name: 'Sofia Reyes',
      email: 'sofia.reyes@example.com',
      mobile: '212-555-0291',
      address: '310 Atlantic Ave, Brooklyn, NY 11201',
      additionalInfo: { customerType: 'residential', priority: 'high' },
      createdBy: dispatcherB.id
    })
    .returning()

  const [customerB2] = await db
    .insert(customers)
    .values({
      companyId: companyB.id,
      name: 'Green Grocers Market',
      email: 'ops@greengrocersnyc.com',
      mobile: '212-555-0292',
      address: '45-21 Queens Blvd, Queens, NY 11104',
      additionalInfo: { customerType: 'commercial', priority: 'standard' },
      createdBy: dispatcherB.id
    })
    .returning()

  await db.insert(jobs).values([
    {
      companyId: companyB.id,
      customerId: customerB1.id,
      location: sql`ST_SetSRID(ST_MakePoint(-73.9781, 40.6840), 4326)`,
      status: 'unassigned',
      notes: 'Kitchen sink leaking under the cabinet',
      createdBy: dispatcherB.id
    },
    {
      companyId: companyB.id,
      customerId: customerB2.id,
      location: sql`ST_SetSRID(ST_MakePoint(-73.9105, 40.7427), 4326)`,
      status: 'assigned',
      assignedAgentId: (
        await db
          .select({ id: agents.id })
          .from(agents)
          .where(sql`${agents.name} = 'Mike Brooklyn Tech'`)
      )[0]?.id,
      notes: 'Replace broken water heater in back stock room',
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
