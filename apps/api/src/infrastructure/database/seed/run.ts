import { seedDatabase } from './index'

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Database seed failed:', err)
    process.exit(1)
  })
