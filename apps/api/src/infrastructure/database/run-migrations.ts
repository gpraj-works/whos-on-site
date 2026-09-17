import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './client'
import { logger } from '../logging/logger'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.resolve(currentDir, '../../../src/infrastructure/database/migrations')

async function runMigrations() {
  logger.info('Applying database migrations...')
  await migrate(db, { migrationsFolder })
  logger.info('Database migrations applied successfully')
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, 'Database migration failed')
    process.exit(1)
  })