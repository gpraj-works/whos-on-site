import { logger } from '../../logging/logger.js'

export async function seedDatabase() {
  logger.info('Starting database seed foundation...')
  // Seed logic for two-tenant data will be populated in Phase 2
  logger.info('Database seed foundation complete.')
}

if (process.argv[1]?.endsWith('seed/index.ts') || process.argv[1]?.endsWith('seed\\index.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error({ err }, 'Seed failed')
      process.exit(1)
    })
}
