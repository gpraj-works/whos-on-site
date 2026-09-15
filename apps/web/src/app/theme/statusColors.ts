import { JobStatus, TechnicianStatus } from '@whosonsite/shared'

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

/** Mantine color name tokens for each TechnicianStatus */
export const TECHNICIAN_STATUS_COLORS: Record<TechnicianStatus, string> = {
  [TechnicianStatus.AVAILABLE]: 'green',
  [TechnicianStatus.BUSY]: 'orange',
  [TechnicianStatus.OFFLINE]: 'gray'
}

/** Hex color values for Leaflet maps for each TechnicianStatus */
export const TECHNICIAN_STATUS_HEX_COLORS: Record<TechnicianStatus, string> = {
  [TechnicianStatus.AVAILABLE]: '#40c057',
  [TechnicianStatus.BUSY]: '#fd7e14',
  [TechnicianStatus.OFFLINE]: '#868e96'
}

/** Helper to get Mantine status color with fallback */
export function getJobStatusColor(status: JobStatus | string): string {
  if (status in JOB_STATUS_COLORS) {
    return JOB_STATUS_COLORS[status as JobStatus]
  }
  return 'gray'
}

/** Helper to get Technician status color with fallback */
export function getTechnicianStatusColor(status: TechnicianStatus | string): string {
  if (status in TECHNICIAN_STATUS_COLORS) {
    return TECHNICIAN_STATUS_COLORS[status as TechnicianStatus]
  }
  return 'gray'
}
