export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  DISPATCHER = 'dispatcher',
  AGENT = 'agent'
}

export enum AgentStatus {
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

export enum ThemeColor {
  TEAL = 'teal',
  INDIGO = 'indigo',
  BLUE = 'blue',
  VIOLET = 'violet',
  ORANGE = 'orange',
  GREEN = 'green'
}

export const THEME_COLORS = ['teal', 'indigo', 'blue', 'violet', 'orange', 'green'] as const

