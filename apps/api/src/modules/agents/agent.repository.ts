import dayjs from 'dayjs'
import { and, eq, sql } from 'drizzle-orm'
import { Coordinates, AgentStatus } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import { agents } from '../../infrastructure/database/schema/index'
import {
  CreateAgentData,
  NearbyAgentQuery,
  AgentQueryResult
} from './agent.types'

export async function findCompanyAgents(
  companyId: string,
  client: DatabaseClient = db
): Promise<AgentQueryResult[]> {
  const rows = await client
    .select({
      id: agents.id,
      companyId: agents.companyId,
      userId: agents.userId,
      name: agents.name,
      phone: agents.phone,
      status: agents.status,
      location: agents.currentLocation,
      lastLocationAt: agents.lastLocationAt
    })
    .from(agents)
    .where(eq(agents.companyId, companyId))

  return rows.map((r) => ({
    ...r,
    status: r.status as AgentStatus,
    lastLocationAt: r.lastLocationAt ? dayjs(r.lastLocationAt).toISOString() : null
  }))
}

export async function findNearbyAvailableAgents(
  query: NearbyAgentQuery,
  client: DatabaseClient = db
): Promise<AgentQueryResult[]> {
  const radiusMeters = query.radiusMeters || 10000

  const pointSql = sql`ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)`

  const rows = await client
    .select({
      id: agents.id,
      companyId: agents.companyId,
      userId: agents.userId,
      name: agents.name,
      phone: agents.phone,
      status: agents.status,
      location: agents.currentLocation,
      lastLocationAt: agents.lastLocationAt,
      distanceMeters: sql<number>`ST_Distance(${agents.currentLocation}, ${pointSql})`
    })
    .from(agents)
    .where(
      and(
        eq(agents.companyId, query.companyId),
        eq(agents.status, 'available'),
        sql`ST_DWithin(${agents.currentLocation}, ${pointSql}, ${radiusMeters})`
      )
    )
    .orderBy(sql`ST_Distance(${agents.currentLocation}, ${pointSql}) ASC`)

  return rows.map((r) => ({
    ...r,
    status: r.status as AgentStatus,
    distanceMeters: Math.round(r.distanceMeters),
    lastLocationAt: r.lastLocationAt ? dayjs(r.lastLocationAt).toISOString() : null
  }))
}

export async function createAgent(data: CreateAgentData, client: DatabaseClient = db) {
  const [row] = await client
    .insert(agents)
    .values({
      companyId: data.companyId,
      userId: data.userId || null,
      name: data.name,
      phone: data.phone,
      status: data.status || 'offline',
      currentLocation: data.location || null,
      createdBy: data.createdBy || null
    })
    .returning()

  return row
}

export async function updateAgentLocation(
  id: string,
  companyId: string,
  coords: Coordinates,
  client: DatabaseClient = db
) {
  const pointSql = sql`ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)`

  const [updated] = await client
    .update(agents)
    .set({
      currentLocation: pointSql,
      lastLocationAt: dayjs().toDate(),
      updatedAt: dayjs().toDate()
    })
    .where(and(eq(agents.id, id), eq(agents.companyId, companyId)))
    .returning()

  return updated || null
}

export async function findAgentById(
  id: string,
  companyId: string,
  client: DatabaseClient = db
) {
  const [row] = await client
    .select()
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, companyId)))
  return row || null
}

export async function findAgentByUserId(
  userId: string,
  companyId: string,
  client: DatabaseClient = db
) {
  const [row] = await client
    .select()
    .from(agents)
    .where(and(eq(agents.userId, userId), eq(agents.companyId, companyId)))
  return row || null
}
