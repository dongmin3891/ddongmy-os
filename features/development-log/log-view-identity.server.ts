import 'server-only'
import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import { z } from 'zod'

const logViewIdentityEnvironmentSchema = z.object({
  LOG_VIEW_HASH_SECRET: z.string().min(32),
})

const MAX_USER_AGENT_LENGTH = 512

export class LogViewIdentityUnavailableError extends Error {}

function getLogViewHashSecret() {
  const result = logViewIdentityEnvironmentSchema.safeParse(process.env)
  if (!result.success) {
    throw new LogViewIdentityUnavailableError(
      'LOG_VIEW_HASH_SECRET must contain at least 32 characters',
    )
  }

  return result.data.LOG_VIEW_HASH_SECRET
}

function parseAddress(value: string | null) {
  const address = value?.trim()
  return address && isIP(address) ? address : undefined
}

export function getLogViewRequestAddress(headers: Headers) {
  const cloudflareAddress = parseAddress(headers.get('cf-connecting-ip'))
  if (cloudflareAddress) return cloudflareAddress

  const forwardedAddress = parseAddress(headers.get('x-forwarded-for')?.split(',')[0] ?? null)
  if (forwardedAddress) return forwardedAddress

  const realAddress = parseAddress(headers.get('x-real-ip'))
  if (realAddress) return realAddress

  throw new LogViewIdentityUnavailableError('A trusted requester address header is required')
}

function createIdentityHash(secret: string, context: string, value: string) {
  return createHmac('sha256', secret).update(context).update('\0').update(value).digest('hex')
}

export type LogViewRequestIdentity = {
  requesterHash: string
  visitorHash: string
}

export function createLogViewRequestIdentity(
  headers: Headers,
  secret = getLogViewHashSecret(),
): LogViewRequestIdentity {
  const address = getLogViewRequestAddress(headers)
  const userAgent = (headers.get('user-agent') ?? 'unknown').slice(0, MAX_USER_AGENT_LENGTH)

  return {
    requesterHash: createIdentityHash(secret, 'log-view-rate-limit', address),
    visitorHash: createIdentityHash(secret, 'log-view-deduplication', `${address}\0${userAgent}`),
  }
}
