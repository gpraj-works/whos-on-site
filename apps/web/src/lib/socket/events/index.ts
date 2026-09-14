import { Socket } from 'socket.io-client'
import {
  JobAssignedEvent,
  JobCreatedEvent,
  JobStatusChangedEvent,
  TechnicianLocationUpdatedEvent,
  TechnicianStatusChangedEvent
} from '@whosonsite/shared'

export interface SocketEventHandlers {
  onJobCreated?: (event: JobCreatedEvent) => void
  onJobAssigned?: (event: JobAssignedEvent) => void
  onJobStatusChanged?: (event: JobStatusChangedEvent) => void
  onTechnicianLocationUpdated?: (event: TechnicianLocationUpdatedEvent) => void
  onTechnicianStatusChanged?: (event: TechnicianStatusChangedEvent) => void
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

  const techLocationListener = (data: TechnicianLocationUpdatedEvent) => {
    handlers.onTechnicianLocationUpdated?.(data)
  }

  const techStatusListener = (data: TechnicianStatusChangedEvent) => {
    handlers.onTechnicianStatusChanged?.(data)
  }

  socket.on('job:created', jobCreatedListener)
  socket.on('job:assigned', jobAssignedListener)
  socket.on('job:statusChanged', jobStatusChangedListener)
  socket.on('technician:locationUpdated', techLocationListener)
  socket.on('technician:statusChanged', techStatusListener)

  return () => {
    socket.off('job:created', jobCreatedListener)
    socket.off('job:assigned', jobAssignedListener)
    socket.off('job:statusChanged', jobStatusChangedListener)
    socket.off('technician:locationUpdated', techLocationListener)
    socket.off('technician:statusChanged', techStatusListener)
  }
}
