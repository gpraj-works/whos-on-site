import { z } from 'zod'
import { JobStatus, TechnicianStatus, UserRole } from '../enums/index'

export const userRoleSchema = z.nativeEnum(UserRole)
export const technicianStatusSchema = z.nativeEnum(TechnicianStatus)
export const jobStatusSchema = z.nativeEnum(JobStatus)

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
})

export type Coordinates = z.infer<typeof coordinatesSchema>

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})
