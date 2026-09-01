import { z } from 'zod'
import { JobStatus, TechnicianStatus, UserRole } from '../enums/index.js'

export const userRoleSchema = z.nativeEnum(UserRole)
export const technicianStatusSchema = z.nativeEnum(TechnicianStatus)
export const jobStatusSchema = z.nativeEnum(JobStatus)

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
})

export type Coordinates = z.infer<typeof coordinatesSchema>
