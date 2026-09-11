import { useEffect, useRef } from 'react'
import { updateTechnicianLocation } from '../../components/technicians/api'
import { getSocket } from '../socket/client'

const MIN_PING_INTERVAL_MS = 10000 // 10 seconds minimum throttle

export function useLocationTracking(technicianId: string | null, enabled: boolean): void {
  const lastPingTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || !technicianId || !('geolocation' in navigator)) {
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const now = Date.now()
      if (now - lastPingTimeRef.current < MIN_PING_INTERVAL_MS) {
        return
      }

      const { latitude: lat, longitude: lng } = position.coords
      lastPingTimeRef.current = now

      // 1. Send socket location ping for real-time dispatcher map updates
      const socket = getSocket()
      if (socket?.connected) {
        socket.emit('location:ping', { lat, lng })
      }

      // 2. Persist location to backend REST endpoint
      updateTechnicianLocation(technicianId, { lat, lng }).catch((err) => {
        console.warn('[LocationTracking] Failed to update location via REST:', err)
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      console.warn('[LocationTracking] Geolocation error:', error.message)
    }

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [technicianId, enabled])
}
