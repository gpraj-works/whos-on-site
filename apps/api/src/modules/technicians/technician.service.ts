import { Coordinates } from '@whosonsite/shared'
import * as technicianRepo from './technician.repository'
import {
  CreateTechnicianData,
  NearbyTechnicianQuery,
  TechnicianQueryResult
} from './technician.types'

export async function getCompanyTechnicians(companyId: string): Promise<TechnicianQueryResult[]> {
  return technicianRepo.findCompanyTechnicians(companyId)
}

export async function getNearbyTechnicians(
  query: NearbyTechnicianQuery
): Promise<TechnicianQueryResult[]> {
  return technicianRepo.findNearbyAvailableTechnicians(query)
}

export async function createTechnician(data: CreateTechnicianData) {
  return technicianRepo.createTechnician(data)
}

export async function updateTechnicianLocation(id: string, companyId: string, coords: Coordinates) {
  const updated = await technicianRepo.updateTechnicianLocation(id, companyId, coords)
  if (!updated) {
    throw new Error('Technician not found or does not belong to your company.')
  }
  return updated
}
