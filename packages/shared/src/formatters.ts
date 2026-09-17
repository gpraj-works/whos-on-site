import { JobStatus } from './enums'

/**
 * Maps raw system JobStatus enums to human-readable strings.
 */
export function formatJobStatus(status: JobStatus | string): string {
  switch (status) {
    case JobStatus.UNASSIGNED:
      return 'Unassigned'
    case JobStatus.ASSIGNED:
      return 'Assigned'
    case JobStatus.EN_ROUTE:
      return 'En Route'
    case JobStatus.ON_SITE:
      return 'On Site'
    case JobStatus.COMPLETE:
      return 'Completed' // The specific mapping requested by UI
    case JobStatus.CANCELLED:
      return 'Cancelled'
    default:
      // Fallback for unknown statuses: capitalize first letter and replace underscores
      if (!status) return 'Unknown'
      return status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
  }
}
