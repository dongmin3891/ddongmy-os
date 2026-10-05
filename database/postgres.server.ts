import 'server-only'
import { Pool } from 'pg'

const POSTGRES_POOL_MAX_CONNECTIONS = 5
const POSTGRES_CONNECTION_TIMEOUT_MS = 2_000
const POSTGRES_IDLE_TIMEOUT_MS = 30_000
const POSTGRES_STATEMENT_TIMEOUT_MS = 3_000

const globalForPostgres = globalThis as typeof globalThis & {
  __ddongmyPostgresPool?: Pool
}

let postgresPool = globalForPostgres.__ddongmyPostgresPool

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim()

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to connect to PostgreSQL')
  }

  return databaseUrl
}

function createPostgresPool() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    max: POSTGRES_POOL_MAX_CONNECTIONS,
    connectionTimeoutMillis: POSTGRES_CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: POSTGRES_IDLE_TIMEOUT_MS,
    statement_timeout: POSTGRES_STATEMENT_TIMEOUT_MS,
  })

  pool.on('error', (error) => {
    console.error('[postgres] Unexpected error on idle client', error)
  })

  return pool
}

export function getPostgresPool(): Pool {
  postgresPool ??= createPostgresPool()

  if (process.env.NODE_ENV !== 'production') {
    globalForPostgres.__ddongmyPostgresPool = postgresPool
  }

  return postgresPool
}

export async function closePostgresPool() {
  if (!postgresPool) return

  const pool = postgresPool
  postgresPool = undefined
  globalForPostgres.__ddongmyPostgresPool = undefined
  await pool.end()
}
