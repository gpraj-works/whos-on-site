import { TeamMemberDto } from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export async function listTeamMembers(): Promise<TeamMemberDto[]> {
  return apiClient<TeamMemberDto[]>('/team')
}

export async function nearbyTeamMembers(lat: number, lng: number): Promise<TeamMemberDto[]> {
  return apiClient<TeamMemberDto[]>(`/team/nearby?lat=${lat}&lng=${lng}`)
}

export async function updateTeamMemberLocation(
  id: string,
  coords: { lat: number; lng: number }
): Promise<TeamMemberDto> {
  return apiClient<TeamMemberDto>(`/team/${id}/location`, {
    method: 'PATCH',
    body: JSON.stringify(coords)
  })
}

export async function createTeamMember(data: {
  name: string
  phone: string
  status?: string
}): Promise<TeamMemberDto> {
  return apiClient<TeamMemberDto>('/team', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

