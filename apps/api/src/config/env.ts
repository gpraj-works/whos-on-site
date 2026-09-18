import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from workspace root if available
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })
dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('WhosOnSite <notifications@whosonsite.internal>').optional(),
  SMTP_SECURE: z.coerce.boolean().default(false).optional(),
  APP_URL: z.string().default('http://localhost:5173').optional()
})

const parsedEnv = envSchema.parse(process.env)

export const env = {
  ...parsedEnv,
  isDevEnv: parsedEnv.NODE_ENV === 'development',
  isProdEnv: parsedEnv.NODE_ENV === 'production'
}
