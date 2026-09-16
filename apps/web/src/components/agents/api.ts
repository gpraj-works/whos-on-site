import { AgentDto } from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export async function listAgents(): Promise<AgentDto[]> {
  return apiClient<AgentDto[]>('/agents')
}

export async function updateAgentLocation(
  id: string,
  coords: { lat: number; lng: number }
): Promise<AgentDto> {
  return apiClient<AgentDto>(`/agents/${id}/location`, {
    method: 'PATCH',
    body: JSON.stringify(coords)
  })
}

export async function createAgent(data: {
  name: string
  phone: string
  status?: string
}): Promise<AgentDto> {
  return apiClient<AgentDto>('/agents', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
