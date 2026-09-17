import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateCustomerInput } from '@whosonsite/shared'

import { customerKeys } from '../../app/query/keys'
import { createCustomer, listCustomers, updateCustomer, deleteCustomer } from './api'

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: customerKeys.list(search ? { search } : undefined),
    queryFn: () => listCustomers(search)
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    }
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCustomerInput> }) =>
      updateCustomer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    }
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    }
  })
}
