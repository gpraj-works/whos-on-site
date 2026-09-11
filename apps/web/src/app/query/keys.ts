/** Centralized React Query Keys Factory */
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'me'] as const
}

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  history: (id: string) => [...jobKeys.detail(id), 'history'] as const
}

export const technicianKeys = {
  all: ['technicians'] as const,
  list: () => [...technicianKeys.all, 'list'] as const,
  nearby: (coords: { lat: number; lng: number; radiusMeters?: number }) =>
    [...technicianKeys.all, 'nearby', coords] as const
}

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const
}

