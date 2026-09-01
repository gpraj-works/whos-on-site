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

export const createJobSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerPhone: z.string().min(7, 'Customer phone number is required'),
  address: z.string().min(5, 'Address is required'),
  location: coordinatesSchema.optional(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  notes: z.string().optional()
})

export type CreateJobInput = z.infer<typeof createJobSchema>

export const updateJobSchema = z.object({
  customerName: z.string().min(2).optional(),
  customerPhone: z.string().min(7).optional(),
  address: z.string().min(5).optional(),
  location: coordinatesSchema.optional(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()).nullable().optional(),
  notes: z.string().nullable().optional()
})

export type UpdateJobInput = z.infer<typeof updateJobSchema>

export const assignJobSchema = z.object({
  technicianId: z.string().uuid('Invalid technician ID')
})

export type AssignJobInput = z.infer<typeof assignJobSchema>

export const updateJobStatusSchema = z.object({
  status: jobStatusSchema,
  note: z.string().optional()
})

export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>

export const jobFilterQuerySchema = z.object({
  status: jobStatusSchema.optional(),
  assignedTechnicianId: z.string().uuid().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional()
})

export type JobFilterQuery = z.infer<typeof jobFilterQuerySchema>
