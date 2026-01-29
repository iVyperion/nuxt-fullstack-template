import 'dotenv/config'
import { PrismaClient } from './generated'
import { PrismaPg } from '@prisma/adapter-pg'

const databaseUrl = process.env.NUXT_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL or NUXT_DATABASE_URL environment variable is not set')
}

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Example password hashes (replace with real bcrypt hashes in production)
  const adminPasswordHash = '$2b$10$adminadminadminadminadminadminadminadminadminadminadminad';
  const userPasswordHash = '$2b$10$useruseruseruseruseruseruseruseruseruseruseruseruserus';

  // Upsert admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })
  console.log('Seeded admin user')

  // Upsert regular user
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'user',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  })
  console.log('Seeded regular user')
}

main()
  .then(() => {
    console.log('Seed completed')
    prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
