import { z } from 'zod'
import { AgentStatus, JobStatus } from '../enums/index'

export const agentStatusSchema = z.nativeEnum(AgentStatus)
export const jobStatusSchema = z.nativeEnum(JobStatus)

export const themeColorSchema = z.enum(['teal', 'indigo', 'blue', 'violet', 'orange', 'green'])
export type ThemeColorType = z.infer<typeof themeColorSchema>

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

export const createJobSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  location: coordinatesSchema.optional(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  notes: z.string().optional()
})

export type CreateJobInput = z.infer<typeof createJobSchema>

export const updateJobSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  location: coordinatesSchema.optional(),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().datetime())
    .nullable()
    .optional(),
  notes: z.string().nullable().optional()
})

export type UpdateJobInput = z.infer<typeof updateJobSchema>

export const assignJobSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID')
})

export const updateJobStatusSchema = z.object({
  status: jobStatusSchema,
  note: z.string().optional()
})

export const jobFilterQuerySchema = z.object({
  status: jobStatusSchema.optional(),
  assignedAgentId: z.string().uuid().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional()
})

export type JobFilterQuery = z.infer<typeof jobFilterQuerySchema>

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
  mobile: z.string().min(7, 'Customer phone number is required'),
  address: z.string().min(5, 'Address is required'),
  additionalInfo: z.record(z.string(), z.unknown()).optional()
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>

export const updateCustomerSchema = createCustomerSchema.partial()

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>

export const customerFilterQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional()
})

export const createAgentSchema = z.object({
  name: z.string().min(2, 'Agent name must be at least 2 characters'),
  phone: z.string().min(7, 'Valid phone number is required (at least 7 digits)'),
  status: agentStatusSchema.optional()
})
