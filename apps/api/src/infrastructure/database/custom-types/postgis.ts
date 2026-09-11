import { customType } from 'drizzle-orm/pg-core'
import { Coordinates } from '@whosonsite/shared'

export const postgisGeometry = customType<{
  data: Coordinates
  driverData: string
}>({
  dataType() {
    return 'geography'
  },
  toDriver(value: Coordinates): string {
    return `ST_SetSRID(ST_MakePoint(${value.lng}, ${value.lat}), 4326)`
  },
  fromDriver(value: string): Coordinates {
    // If raw string representation or GeoJSON parse is needed
    if (typeof value === 'string' && value.includes('POINT')) {
      const match = value.match(/POINT\(([^ ]+) ([^ ]+)\)/)
      if (match) {
        return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) }
      }
    }
    return { lat: 0, lng: 0 }
  }
})
