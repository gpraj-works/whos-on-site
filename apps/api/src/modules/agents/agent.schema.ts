import { z } from 'zod'
import { coordinatesSchema, agentStatusSchema } from '@whosonsite/shared'

export const createAgentSchema = z.object({
  userId: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Invalid phone number'),
  status: agentStatusSchema.optional(),
  location: coordinatesSchema.optional()
})

export const updateLocationSchema = coordinatesSchema

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().positive().default(10000) // Default 10km
})
