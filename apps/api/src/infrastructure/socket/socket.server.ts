import { Server as HttpServer } from 'node:http'
import { Server as SocketIoServer } from 'socket.io'
import { env } from '../../config/env'
import { logger } from '../logging/logger'
import { socketAuthMiddleware, AuthenticatedSocketData } from './socket.auth'
import { joinCompanyRoom } from './socket.rooms'
import { updateAgentLocation, getAgentByUserId } from '../../modules/agents/agent.service'

let io: SocketIoServer | null = null

export function initSocketServer(httpServer: HttpServer): SocketIoServer {
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim())

  io = new SocketIoServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (
          allowedOrigins.includes(origin) ||
          (env.isDevEnv && /^http:\/\/(localhost|127\.0\.0\.1):(3000|517[3-9]|4173)$/.test(origin))
        ) {
          return callback(null, true)
        }
        return callback(new Error(`CORS error: Origin ${origin} not allowed.`))
      },
      credentials: true
    }
  })

  // Attach auth middleware
  io.use(socketAuthMiddleware)

  // Connection handler
  io.on('connection', (socket) => {
    const authData = socket.data.auth as AuthenticatedSocketData | undefined
    logger.info({ socketId: socket.id, userId: authData?.userId }, 'Socket client connected')

    // Automatically join verified company room
    joinCompanyRoom(socket)

    // Handle incoming client location:ping event
    socket.on('location:ping', async (data: { lat: number; lng: number; agentId?: string }) => {
      try {
        if (!authData) return

        let techId = data.agentId
        if (!techId) {
          const tech = await getAgentByUserId(authData.userId, authData.companyId)
          if (tech) {
            techId = tech.id
          }
        }

        if (techId && typeof data.lat === 'number' && typeof data.lng === 'number') {
          await updateAgentLocation(techId, authData.companyId, {
            lat: data.lat,
            lng: data.lng
          })
        }
      } catch (err) {
        logger.error({ err, socketId: socket.id }, 'Error processing location:ping socket event')
      }
    })

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Socket client disconnected')
    })
  })

  return io
}

export function getIo(): SocketIoServer | null {
  return io
}
