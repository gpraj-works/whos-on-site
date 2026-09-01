import { SQL } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../../config/env'
import * as schema from './schema/index'

export const queryClient = postgres(env.DATABASE_URL, {
  max: env.isProdEnv ? 10 : 2,
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(queryClient, { schema })

export type DatabaseClient = PostgresJsDatabase<typeof schema> | Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * Execute callback within an atomic database transaction.
 */
export async function withTransaction<T>(
  fn: (tx: DatabaseClient) => Promise<T>
): Promise<T> {
  return db.transaction(fn)
}

/**
 * Execute parameter-safe native SQL queries directly using Drizzle's sql builder.
 */
export async function executeRaw<T = unknown>(
  query: SQL,
  client: DatabaseClient = db
): Promise<T[]> {
  const result = await client.execute(query)
  return result as unknown as T[]
}
