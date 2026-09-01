import { JobStatus } from '@routeboard/shared'

/** State Machine transition rules for RouteBoard job lifecycle */
const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.UNASSIGNED]: [JobStatus.ASSIGNED, JobStatus.CANCELLED],
  [JobStatus.ASSIGNED]: [JobStatus.EN_ROUTE, JobStatus.UNASSIGNED, JobStatus.CANCELLED],
  [JobStatus.EN_ROUTE]: [JobStatus.ON_SITE, JobStatus.CANCELLED],
  [JobStatus.ON_SITE]: [JobStatus.COMPLETE],
  [JobStatus.COMPLETE]: [],
  [JobStatus.CANCELLED]: []
}

/** Determines whether a status transition is permitted */
export function canTransition(fromStatus: JobStatus, toStatus: JobStatus): boolean {
  if (fromStatus === toStatus) {
    return true
  }
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || []
  return allowed.includes(toStatus)
}
