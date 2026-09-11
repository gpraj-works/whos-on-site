export interface CreateCustomerData {
  companyId: string
  name: string
  email?: string | null
  mobile: string
  address: string
  additionalInfo?: Record<string, unknown> | null
  createdBy?: string
}

export interface UpdateCustomerData {
  name?: string
  email?: string | null
  mobile?: string
  address?: string
  additionalInfo?: Record<string, unknown> | null
  updatedBy?: string
}

export interface CustomerFilterParams {
  companyId: string
  search?: string
  limit?: number
  offset?: number
}