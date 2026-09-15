import { TechnicianDto } from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export async function listTechnicians(): Promise<TechnicianDto[]> {
  return apiClient<TechnicianDto[]>('/technicians')
}

export async function nearbyTechnicians(lat: number, lng: number): Promise<TechnicianDto[]> {
  return apiClient<TechnicianDto[]>(`/technicians/nearby?lat=${lat}&lng=${lng}`)
}

export async function updateTechnicianLocation(
  id: string,
  coords: { lat: number; lng: number }
): Promise<TechnicianDto> {
  return apiClient<TechnicianDto>(`/technicians/${id}/location`, {
    method: 'PATCH',
    body: JSON.stringify(coords)
  })
}

export async function createTechnician(data: {
  name: string
  phone: string
  status?: string
}): Promise<TechnicianDto> {
  return apiClient<TechnicianDto>('/technicians', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

