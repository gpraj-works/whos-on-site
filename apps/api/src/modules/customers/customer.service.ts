import { CustomerDto } from '@routeboard/shared'
import { ConflictError, NotFoundError } from '../../common/app-error'
import * as customerRepo from './customer.repository'
import {
  CreateCustomerData,
  CustomerFilterParams,
  UpdateCustomerData
} from './customer.types'

export async function getCompanyCustomers(
  params: CustomerFilterParams
): Promise<CustomerDto[]> {
  return customerRepo.findCompanyCustomers(params)
}

export async function getCustomerDetail(
  id: string,
  companyId: string
): Promise<CustomerDto> {
  const customer = await customerRepo.findCustomerById(id, companyId)
  if (!customer) {
    throw new NotFoundError('Customer not found')
  }
  return customer
}

export async function createCustomer(
  data: CreateCustomerData
): Promise<CustomerDto> {
  return customerRepo.createCustomer(data)
}

export async function updateCustomerDetails(
  id: string,
  companyId: string,
  data: UpdateCustomerData
): Promise<CustomerDto> {
  const existing = await customerRepo.findCustomerById(id, companyId)
  if (!existing) {
    throw new NotFoundError('Customer not found')
  }

  const updated = await customerRepo.updateCustomer(id, companyId, data)
  if (!updated) {
    throw new NotFoundError('Failed to update customer')
  }
  return updated
}

export async function deleteCustomer(
  id: string,
  companyId: string
): Promise<void> {
  const existing = await customerRepo.findCustomerById(id, companyId)
  if (!existing) {
    throw new NotFoundError('Customer not found')
  }

  try {
    const deleted = await customerRepo.deleteCustomer(id, companyId)
    if (!deleted) {
      throw new NotFoundError('Failed to delete customer')
    }
  } catch (err: unknown) {
    // Postgres FK violation (23503): customer still referenced by jobs
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === '23503'
    ) {
      throw new ConflictError(
        'Customer cannot be deleted because they have associated jobs. Reassign or remove the jobs first.'
      )
    }
    throw err
  }
}