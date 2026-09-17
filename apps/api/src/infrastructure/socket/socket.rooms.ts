import { Socket } from 'socket.io'
import { logger } from '../logging/logger'
import { AuthenticatedSocketData } from './socket.auth'

export function joinCompanyRoom(socket: Socket): void {
  const authData = socket.data.auth as AuthenticatedSocketData | undefined
  if (!authData || !authData.companyId) {
    logger.warn(
      { socketId: socket.id },
      'Attempted room join without verified companyId in socket data'
    )
    return
  }

  // Room name is strictly derived from verified JWT payload (never client-supplied string)
  const roomName = `company:${authData.companyId}`
  socket.join(roomName)
  logger.info(
    { socketId: socket.id, companyId: authData.companyId, roomName },
    'Socket client joined company room'
  )
}
