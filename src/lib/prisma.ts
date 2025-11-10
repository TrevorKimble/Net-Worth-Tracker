import { PrismaClient, Prisma } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const base_prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

const mutation_actions = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'upsert'
])

let backup_created = false

const backup_extension = Prisma.defineExtension({
  name: 'sqlite-backup-middleware',
  query: {
    $allModels: {
      $allOperations: async (params: { operation: string; query: (args: unknown) => Promise<unknown>; args: unknown; model?: string }) => {
        const should_backup = mutation_actions.has(params.operation)

        if (should_backup && !backup_created) {
          try {
            await ensure_sqlite_backup()
            backup_created = true
          } catch (error) {
            console.error('Failed to create SQLite backup before mutation:', error)
          }
        }

        return params.query(params.args)
      }
    }
  }
})

export const prisma = base_prisma.$extends(backup_extension)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as unknown as PrismaClient
}

// Force reload Prisma client in development if needed
if (process.env.NODE_ENV === 'development' && !globalForPrisma.prisma?.activityLog) {
  console.warn('Prisma client may be stale, try restarting the dev server')
}

async function ensure_sqlite_backup() {
  const database_url = process.env.DATABASE_URL

  if (!database_url || !database_url.startsWith('file:')) {
    return
  }

  let sqlite_path: string | null = null

  try {
    const sqlite_url = new URL(database_url)
    sqlite_path = decodeURIComponent(sqlite_url.pathname)
  } catch {
    sqlite_path = database_url.replace(/^file:(\/\/)?/, '')
  }

  if (!sqlite_path) {
    return
  }

  try {
    await fs.stat(sqlite_path)
  } catch {
    console.warn(`SQLite database file not found at ${sqlite_path}. Skipping backup.`)
    return
  }

  const backup_dir = process.env.SQLITE_BACKUP_DIR
    ? path.resolve(process.env.SQLITE_BACKUP_DIR)
    : path.resolve(process.cwd(), 'backups', 'sqlite')

  await fs.mkdir(backup_dir, { recursive: true })

  const base_name = path.basename(sqlite_path)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backup_file_name = `${base_name}_${timestamp}.sqlite`
  const backup_path = path.join(backup_dir, backup_file_name)

  await fs.copyFile(sqlite_path, backup_path)
  console.info(`SQLite backup created: ${backup_path}`)
}

