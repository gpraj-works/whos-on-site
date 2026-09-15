import { Socket } from 'socket.io-client'
import {
  JobAssignedEvent,
  JobCreatedEvent,
  JobStatusChangedEvent,
  TeamMemberLocationUpdatedEvent,
  TeamMemberStatusChangedEvent
} from '@whosonsite/shared'

export interface SocketEventHandlers {
  onJobCreated?: (event: JobCreatedEvent) => void
  onJobAssigned?: (event: JobAssignedEvent) => void
  onJobStatusChanged?: (event: JobStatusChangedEvent) => void
  onTeamMemberLocationUpdated?: (event: TeamMemberLocationUpdatedEvent) => void
  onTeamMemberStatusChanged?: (event: TeamMemberStatusChangedEvent) => void
}

/**
 * Register typed socket event listeners on a Socket.io client instance.
 * Returns an unsubscribe cleanup function.
 */
export function registerSocketHandlers(
  socket: Socket,
  handlers: SocketEventHandlers
): () => void {
  const jobCreatedListener = (data: JobCreatedEvent) => {
    handlers.onJobCreated?.(data)
  }

  const jobAssignedListener = (data: JobAssignedEvent) => {
    handlers.onJobAssigned?.(data)
  }

  const jobStatusChangedListener = (data: JobStatusChangedEvent) => {
    handlers.onJobStatusChanged?.(data)
  }

  const techLocationListener = (data: TeamMemberLocationUpdatedEvent) => {
    handlers.onTeamMemberLocationUpdated?.(data)
  }

  const techStatusListener = (data: TeamMemberStatusChangedEvent) => {
    handlers.onTeamMemberStatusChanged?.(data)
  }

  socket.on('job:created', jobCreatedListener)
  socket.on('job:assigned', jobAssignedListener)
  socket.on('job:statusChanged', jobStatusChangedListener)
  socket.on('teamMember:locationUpdated', techLocationListener)
  socket.on('teamMember:statusChanged', techStatusListener)

  return () => {
    socket.off('job:created', jobCreatedListener)
    socket.off('job:assigned', jobAssignedListener)
    socket.off('job:statusChanged', jobStatusChangedListener)
    socket.off('teamMember:locationUpdated', techLocationListener)
    socket.off('teamMember:statusChanged', techStatusListener)
  }
}
