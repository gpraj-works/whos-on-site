import { getIo } from './socket.server'
import { logger } from '../logging/logger'

export function emitToCompany<T>(companyId: string, event: string, payload: T): void {
  const io = getIo()
  if (!io) {
    logger.warn({ event, companyId }, 'Socket.io server not initialized; event not emitted')
    return
  }

  const roomName = `company:${companyId}`
  io.to(roomName).emit(event, payload)
  logger.debug({ event, roomName }, 'Emitted socket event to company room')
}
