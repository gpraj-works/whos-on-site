import { Socket } from 'socket.io-client'
import {
  JobAssignedEvent,
  JobCreatedEvent,
  JobStatusChangedEvent,
  AgentLocationUpdatedEvent,
  AgentStatusChangedEvent
} from '@whosonsite/shared'

export interface SocketEventHandlers {
  onJobCreated?: (event: JobCreatedEvent) => void
  onJobAssigned?: (event: JobAssignedEvent) => void
  onJobStatusChanged?: (event: JobStatusChangedEvent) => void
  onAgentLocationUpdated?: (event: AgentLocationUpdatedEvent) => void
  onAgentStatusChanged?: (event: AgentStatusChangedEvent) => void
}

/**
 * Register typed socket event listeners on a Socket.io client instance.
 * Returns an unsubscribe cleanup function.
 */
export function registerSocketHandlers(socket: Socket, handlers: SocketEventHandlers): () => void {
  const jobCreatedListener = (data: JobCreatedEvent) => {
    handlers.onJobCreated?.(data)
  }

  const jobAssignedListener = (data: JobAssignedEvent) => {
    handlers.onJobAssigned?.(data)
  }

  const jobStatusChangedListener = (data: JobStatusChangedEvent) => {
    handlers.onJobStatusChanged?.(data)
  }

  const techLocationListener = (data: AgentLocationUpdatedEvent) => {
    handlers.onAgentLocationUpdated?.(data)
  }

  const techStatusListener = (data: AgentStatusChangedEvent) => {
    handlers.onAgentStatusChanged?.(data)
  }

  socket.on('job:created', jobCreatedListener)
  socket.on('job:assigned', jobAssignedListener)
  socket.on('job:statusChanged', jobStatusChangedListener)
  socket.on('agent:locationUpdated', techLocationListener)
  socket.on('agent:statusChanged', techStatusListener)

  return () => {
    socket.off('job:created', jobCreatedListener)
    socket.off('job:assigned', jobAssignedListener)
    socket.off('job:statusChanged', jobStatusChangedListener)
    socket.off('agent:locationUpdated', techLocationListener)
    socket.off('agent:statusChanged', techStatusListener)
  }
}
