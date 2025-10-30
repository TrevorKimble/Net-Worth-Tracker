import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Force reload Prisma client in development if needed
if (process.env.NODE_ENV === 'development' && !globalForPrisma.prisma?.activityLog) {
  console.warn('Prisma client may be stale, try restarting the dev server')
}

