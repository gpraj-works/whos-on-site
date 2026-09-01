import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../../config/env'
import * as schema from './schema/index'

export const queryClient = postgres(env.DATABASE_URL, {
  max: env.isProdEnv ? 10 : 2,
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(queryClient, { schema })
