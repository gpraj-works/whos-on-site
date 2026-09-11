import { io, Socket } from 'socket.io-client'
import { getAccessToken } from '../api/client'

let socket: Socket | null = null

/**
 * Initialize and connect the Socket.io client using the current in-memory access token.
 */
export function connectSocket(): Socket {
  const token = getAccessToken()

  if (socket) {
    if (!socket.connected) {
      if (token) {
        socket.auth = { token }
      }
      socket.connect()
    }
    return socket
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin

  socket = io(socketUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    auth: {
      token: token || ''
    }
  })

  socket.on('connect', () => {
    // Socket connected
  })

  socket.on('connect_error', (err) => {
    // Connection error handling
    console.warn('[Socket] Connection error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    // Socket disconnected
    if (reason === 'io server disconnect') {
      // Server disconnected socket, reconnect manually if needed
      socket?.connect()
    }
  })

  return socket
}

/**
 * Disconnect and clear the global Socket.io client instance.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Retrieve the current active Socket.io instance.
 */
export function getSocket(): Socket | null {
  return socket
}
