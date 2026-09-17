import { dayjs } from '@whosonsite/shared'
import { Coordinates, AgentLocationUpdatedEvent } from '@whosonsite/shared'
import { emitToCompany } from '../../infrastructure/socket/socket.events'
import * as agentRepo from './agent.repository'
import { CreateAgentData, NearbyAgentQuery, AgentQueryResult } from './agent.types'

import * as jobRepo from '../jobs/job.repository'

export async function getCompanyAgents(companyId: string): Promise<AgentQueryResult[]> {
  return agentRepo.findCompanyAgents(companyId)
}

export async function getAgentByUserId(userId: string, companyId: string) {
  return agentRepo.findAgentByUserId(userId, companyId)
}

export async function getNearbyAgents(query: NearbyAgentQuery): Promise<AgentQueryResult[]> {
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

export async function updateAgent(id: string, companyId: string, data: Partial<CreateAgentData>) {
  const updated = await agentRepo.updateAgent(id, companyId, data)
  if (!updated) {
    throw new Error('Agent not found or does not belong to your company.')
  }
  return updated
}

export async function deleteAgent(id: string, companyId: string) {
  const existing = await agentRepo.findAgentById(id, companyId)
  if (!existing) {
    throw new Error('Agent not found or does not belong to your company.')
  }

  // Option A: Prevent deletion if there are associated jobs
  const agentJobs = await jobRepo.findJobs({ assignedAgentId: id, companyId, limit: 1 })
  if (agentJobs.length > 0) {
    throw new Error(
      'Agent cannot be deleted because they have associated jobs. Unassign the jobs first.'
    )
  }

  const deleted = await agentRepo.deleteAgent(id, companyId)
  if (!deleted) {
    throw new Error('Failed to delete agent.')
  }
}
