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
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
})

const parsedEnv = envSchema.parse(process.env)

export const env = {
  ...parsedEnv,
  isDevEnv: parsedEnv.NODE_ENV === 'development',
  isTestEnv: parsedEnv.NODE_ENV === 'test',
  isProdEnv: parsedEnv.NODE_ENV === 'production'
}
