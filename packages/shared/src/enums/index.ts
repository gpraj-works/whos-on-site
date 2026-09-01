export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  DISPATCHER = 'dispatcher',
  TECHNICIAN = 'technician'
}

export enum TechnicianStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export enum JobStatus {
  UNASSIGNED = 'unassigned',
  ASSIGNED = 'assigned',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled'
}

export enum NotificationType {
  JOB_DELAYED = 'job_delayed',
  TECH_ASSIGNED = 'tech_assigned',
  DAILY_SUMMARY = 'daily_summary'
}
