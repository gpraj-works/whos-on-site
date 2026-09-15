import { JobStatus, TeamMemberStatus } from '@whosonsite/shared'

/** Mantine color name tokens for each JobStatus */
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  [JobStatus.UNASSIGNED]: 'orange',
  [JobStatus.ASSIGNED]: 'blue',
  [JobStatus.EN_ROUTE]: 'indigo',
  [JobStatus.ON_SITE]: 'cyan',
  [JobStatus.COMPLETE]: 'green',
  [JobStatus.CANCELLED]: 'gray'
}

/** Hex color values for Leaflet maps for each JobStatus */
export const JOB_STATUS_HEX_COLORS: Record<JobStatus, string> = {
  [JobStatus.UNASSIGNED]: '#fd7e14',
  [JobStatus.ASSIGNED]: '#228be6',
  [JobStatus.EN_ROUTE]: '#5c7cfa',
  [JobStatus.ON_SITE]: '#15aabf',
  [JobStatus.COMPLETE]: '#40c057',
  [JobStatus.CANCELLED]: '#868e96'
}

/** Mantine color name tokens for each TeamMemberStatus */
export const TECHNICIAN_STATUS_COLORS: Record<TeamMemberStatus, string> = {
  [TeamMemberStatus.AVAILABLE]: 'green',
  [TeamMemberStatus.BUSY]: 'orange',
  [TeamMemberStatus.OFFLINE]: 'gray'
}

/** Hex color values for Leaflet maps for each TeamMemberStatus */
export const TECHNICIAN_STATUS_HEX_COLORS: Record<TeamMemberStatus, string> = {
  [TeamMemberStatus.AVAILABLE]: '#40c057',
  [TeamMemberStatus.BUSY]: '#fd7e14',
  [TeamMemberStatus.OFFLINE]: '#868e96'
}

/** Helper to get Mantine status color with fallback */
export function getJobStatusColor(status: JobStatus | string): string {
  if (status in JOB_STATUS_COLORS) {
    return JOB_STATUS_COLORS[status as JobStatus]
  }
  return 'gray'
}

/** Helper to get TeamMember status color with fallback */
export function getTeamMemberStatusColor(status: TeamMemberStatus | string): string {
  if (status in TECHNICIAN_STATUS_COLORS) {
    return TECHNICIAN_STATUS_COLORS[status as TeamMemberStatus]
  }
  return 'gray'
}
