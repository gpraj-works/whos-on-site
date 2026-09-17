import { dayjs } from '@whosonsite/shared'
import { Coordinates, AgentLocationUpdatedEvent } from '@whosonsite/shared'
import { emitToCompany } from '../../infrastructure/socket/socket.events'
import * as agentRepo from './agent.repository'
import {
  CreateAgentData,
  NearbyAgentQuery,
  AgentQueryResult
} from './agent.types'

export async function getCompanyAgents(companyId: string): Promise<AgentQueryResult[]> {
  return agentRepo.findCompanyAgents(companyId)
}

export async function getAgentByUserId(userId: string, companyId: string) {
  return agentRepo.findAgentByUserId(userId, companyId)
}

export async function getNearbyAgents(
  query: NearbyAgentQuery
): Promise<AgentQueryResult[]> {
  return agentRepo.findNearbyAvailableAgents(query)
}

export async function createAgent(data: CreateAgentData) {
  return agentRepo.createAgent(data)
}

export async function updateAgentLocation(id: string, companyId: string, coords: Coordinates) {
  const updated = await agentRepo.updateAgentLocation(id, companyId, coords)
  if (!updated) {
    throw new Error('Agent not found or does not belong to your company.')
  }

  // Emit agent:locationUpdated event after DB commit
  emitToCompany<AgentLocationUpdatedEvent>(companyId, 'agent:locationUpdated', {
    companyId,
    agentId: id,
    lat: coords.lat,
    lng: coords.lng,
    updatedAt: updated.lastLocationAt
      ? dayjs(updated.lastLocationAt).toISOString()
      : dayjs().toISOString()
  })

  return updated
}
