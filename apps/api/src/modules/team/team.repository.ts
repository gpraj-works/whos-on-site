import dayjs from 'dayjs'
import { and, eq, sql } from 'drizzle-orm'
import { Coordinates, TeamMemberStatus } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import { teamMembers } from '../../infrastructure/database/schema/index'
import {
  CreateTeamMemberData,
  NearbyTeamMemberQuery,
  TeamMemberQueryResult
} from './team.types'

export async function findCompanyTeamMembers(
  companyId: string,
  client: DatabaseClient = db
): Promise<TeamMemberQueryResult[]> {
  const rows = await client
    .select({
      id: teamMembers.id,
      companyId: teamMembers.companyId,
      userId: teamMembers.userId,
      name: teamMembers.name,
      phone: teamMembers.phone,
      status: teamMembers.status,
      location: teamMembers.currentLocation,
      lastLocationAt: teamMembers.lastLocationAt
    })
    .from(teamMembers)
    .where(eq(teamMembers.companyId, companyId))

  return rows.map((r) => ({
    ...r,
    status: r.status as TeamMemberStatus,
    lastLocationAt: r.lastLocationAt ? dayjs(r.lastLocationAt).toISOString() : null
  }))
}

export async function findNearbyAvailableTeamMembers(
  query: NearbyTeamMemberQuery,
  client: DatabaseClient = db
): Promise<TeamMemberQueryResult[]> {
  const radiusMeters = query.radiusMeters || 10000

  const pointSql = sql`ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)`

  const rows = await client
    .select({
      id: teamMembers.id,
      companyId: teamMembers.companyId,
      userId: teamMembers.userId,
      name: teamMembers.name,
      phone: teamMembers.phone,
      status: teamMembers.status,
      location: teamMembers.currentLocation,
      lastLocationAt: teamMembers.lastLocationAt,
      distanceMeters: sql<number>`ST_Distance(${teamMembers.currentLocation}, ${pointSql})`
    })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.companyId, query.companyId),
        eq(teamMembers.status, 'available'),
        sql`ST_DWithin(${teamMembers.currentLocation}, ${pointSql}, ${radiusMeters})`
      )
    )
    .orderBy(sql`ST_Distance(${teamMembers.currentLocation}, ${pointSql}) ASC`)

  return rows.map((r) => ({
    ...r,
    status: r.status as TeamMemberStatus,
    distanceMeters: Math.round(r.distanceMeters),
    lastLocationAt: r.lastLocationAt ? dayjs(r.lastLocationAt).toISOString() : null
  }))
}

export async function createTeamMember(data: CreateTeamMemberData, client: DatabaseClient = db) {
  const [row] = await client
    .insert(teamMembers)
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

export async function updateTeamMemberLocation(
  id: string,
  companyId: string,
  coords: Coordinates,
  client: DatabaseClient = db
) {
  const pointSql = sql`ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)`

  const [updated] = await client
    .update(teamMembers)
    .set({
      currentLocation: pointSql,
      lastLocationAt: dayjs().toDate(),
      updatedAt: dayjs().toDate()
    })
    .where(and(eq(teamMembers.id, id), eq(teamMembers.companyId, companyId)))
    .returning()

  return updated || null
}

export async function findTeamMemberById(
  id: string,
  companyId: string,
  client: DatabaseClient = db
) {
  const [row] = await client
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.id, id), eq(teamMembers.companyId, companyId)))
  return row || null
}

export async function findTeamMemberByUserId(
  userId: string,
  companyId: string,
  client: DatabaseClient = db
) {
  const [row] = await client
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.companyId, companyId)))
  return row || null
}

