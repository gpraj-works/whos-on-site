export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
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

export const THEME_COLORS = ['teal', 'indigo', 'blue', 'violet', 'orange', 'green'] as const
