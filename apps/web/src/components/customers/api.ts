import { CreateCustomerInput, CustomerDto } from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export async function listCustomers(search?: string): Promise<CustomerDto[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiClient<CustomerDto[]>(`/customers${query}`)
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerDto> {
  return apiClient<CustomerDto>('/customers', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}
