import dotenv from 'dotenv'
import path from 'path'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })
dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables.')
}

export default defineConfig({
  schema: './src/infrastructure/database/schema/index.ts',
  out: './src/infrastructure/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  verbose: true,
  strict: true
})
