import dayjs from 'dayjs'
import { Coordinates, TeamMemberLocationUpdatedEvent } from '@whosonsite/shared'
import { emitToCompany } from '../../infrastructure/socket/socket.events'
import * as teamMemberRepo from './team.repository'
import {
  CreateTeamMemberData,
  NearbyTeamMemberQuery,
  TeamMemberQueryResult
} from './team.types'

export async function getCompanyTeamMembers(companyId: string): Promise<TeamMemberQueryResult[]> {
  return teamMemberRepo.findCompanyTeamMembers(companyId)
}

export async function getTeamMemberByUserId(userId: string, companyId: string) {
  return teamMemberRepo.findTeamMemberByUserId(userId, companyId)
}

export async function getNearbyTeamMembers(
  query: NearbyTeamMemberQuery
): Promise<TeamMemberQueryResult[]> {
  return teamMemberRepo.findNearbyAvailableTeamMembers(query)
}

export async function createTeamMember(data: CreateTeamMemberData) {
  return teamMemberRepo.createTeamMember(data)
}

export async function updateTeamMemberLocation(id: string, companyId: string, coords: Coordinates) {
  const updated = await teamMemberRepo.updateTeamMemberLocation(id, companyId, coords)
  if (!updated) {
    throw new Error('TeamMember not found or does not belong to your company.')
  }

  // Emit teamMember:locationUpdated event after DB commit
  emitToCompany<TeamMemberLocationUpdatedEvent>(companyId, 'teamMember:locationUpdated', {
    companyId,
    teamMemberId: id,
    lat: coords.lat,
    lng: coords.lng,
    updatedAt: updated.lastLocationAt
      ? dayjs(updated.lastLocationAt).toISOString()
      : dayjs().toISOString()
  })

  return updated
}

