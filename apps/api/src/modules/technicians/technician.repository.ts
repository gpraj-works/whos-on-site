import dayjs from 'dayjs'
import { and, eq, sql } from 'drizzle-orm'
import { Coordinates, TechnicianStatus } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import { technicians } from '../../infrastructure/database/schema/index'
import {
  CreateTechnicianData,
  NearbyTechnicianQuery,
  TechnicianQueryResult
} from './technician.types'

export async function findCompanyTechnicians(
  companyId: string,
  client: DatabaseClient = db
): Promise<TechnicianQueryResult[]> {
  const rows = await client
    .select({
      id: technicians.id,
      companyId: technicians.companyId,
      userId: technicians.userId,
      name: technicians.name,
      phone: technicians.phone,
      status: technicians.status,
      location: technicians.currentLocation,
      lastLocationAt: technicians.lastLocationAt
    })
    .from(technicians)
    .where(eq(technicians.companyId, companyId))

  return rows.map((r) => ({
    ...r,
    status: r.status as TechnicianStatus,
    lastLocationAt: r.lastLocationAt ? dayjs(r.lastLocationAt).toISOString() : null
  }))
}

export async function findNearbyAvailableTechnicians(
  query: NearbyTechnicianQuery,
  client: DatabaseClient = db
): Promise<TechnicianQueryResult[]> {
  const radiusMeters = query.radiusMeters || 10000

  const pointSql = sql`ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)`

  const rows = await client
    .select({
      id: technicians.id,
      companyId: technicians.companyId,
      userId: technicians.userId,
      name: technicians.name,
      phone: technicians.phone,
      status: technicians.status,
      location: technicians.currentLocation,
      lastLocationAt: technicians.lastLocationAt,
      distanceMeters: sql<number>`ST_Distance(${technicians.currentLocation}, ${pointSql})`
    })
    .from(technicians)
    .where(
      and(
        eq(technicians.companyId, query.companyId),
        eq(technicians.status, 'available'),
        sql`ST_DWithin(${technicians.currentLocation}, ${pointSql}, ${radiusMeters})`
      )
    )
    .orderBy(sql`distance_meters ASC`)

  return rows.map((r) => ({
    ...r,
    status: r.status as TechnicianStatus,
    distanceMeters: Math.round(r.distanceMeters),
    lastLocationAt: r.lastLocationAt ? dayjs(r.lastLocationAt).toISOString() : null
  }))
}

export async function createTechnician(data: CreateTechnicianData, client: DatabaseClient = db) {
  const [row] = await client
    .insert(technicians)
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

export async function updateTechnicianLocation(
  id: string,
  companyId: string,
  coords: Coordinates,
  client: DatabaseClient = db
) {
  const pointSql = sql`ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)`

  const [updated] = await client
    .update(technicians)
    .set({
      currentLocation: pointSql,
      lastLocationAt: dayjs().toDate(),
      updatedAt: dayjs().toDate()
    })
    .where(and(eq(technicians.id, id), eq(technicians.companyId, companyId)))
    .returning()

  return updated || null
}

export async function findTechnicianById(
  id: string,
  companyId: string,
  client: DatabaseClient = db
) {
  const [row] = await client
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.companyId, companyId)))
  return row || null
}

export async function findTechnicianByUserId(
  userId: string,
  companyId: string,
  client: DatabaseClient = db
) {
  const [row] = await client
    .select()
    .from(technicians)
    .where(and(eq(technicians.userId, userId), eq(technicians.companyId, companyId)))
  return row || null
}

