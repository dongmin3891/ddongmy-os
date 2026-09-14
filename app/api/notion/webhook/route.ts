import { z } from 'zod'
import {
  hasSameSecret,
  hasValidNotionWebhookSignature,
  parseNotionWebhookPayload,
  readWebhookBody,
  WebhookBodyTooLargeError,
} from '@/features/development-log/notion-webhook'
import { syncDevelopmentLogCover } from '@/features/development-log/sync-development-log-cover.server'

export const runtime = 'nodejs'

const MAX_WEBHOOK_BODY_BYTES = 64 * 1024

function getConfiguredVerificationToken() {
  const token = process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN?.trim()
  return token || undefined
}

export async function POST(request: Request) {
  let rawBody: string

  try {
    rawBody = await readWebhookBody(request, MAX_WEBHOOK_BODY_BYTES)
  } catch (error) {
    if (error instanceof WebhookBodyTooLargeError) {
      return Response.json({ received: false }, { status: 413 })
    }
    throw error
  }

  const verificationToken = getConfiguredVerificationToken()
  const signature = request.headers.get('x-notion-signature')

  if (signature) {
    if (!verificationToken) {
      return Response.json({ received: false }, { status: 503 })
    }

    if (!hasValidNotionWebhookSignature({ rawBody, signature, verificationToken })) {
      return Response.json({ received: false }, { status: 401 })
    }
  }

  let rawPayload: unknown

  try {
    rawPayload = JSON.parse(rawBody)
  } catch {
    return Response.json({ received: false }, { status: 400 })
  }

  let payload

  try {
    payload = parseNotionWebhookPayload(rawPayload)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ received: false }, { status: 400 })
    }
    throw error
  }

  if (payload.type === 'verification') {
    if (verificationToken && !hasSameSecret(payload.verificationToken, verificationToken)) {
      return Response.json({ received: false }, { status: 401 })
    }

    if (!verificationToken) {
      console.info(
        '[notion-webhook] Set NOTION_WEBHOOK_VERIFICATION_TOKEN to:',
        payload.verificationToken,
      )
    }

    return Response.json({ received: true, type: 'verification' })
  }

  if (!signature) {
    return Response.json({ received: false }, { status: 401 })
  }

  if (payload.type === 'ignored-event') {
    return Response.json({ received: true, type: 'ignored-event' })
  }

  try {
    const result = await syncDevelopmentLogCover(payload.pageId)
    console.info('[notion-webhook] cover sync', {
      eventId: payload.eventId,
      eventType: payload.eventType,
      pageId: payload.pageId,
      status: result.status,
    })
    return Response.json({ received: true, status: result.status })
  } catch (error) {
    console.error('[notion-webhook] cover sync failed', {
      eventId: payload.eventId,
      eventType: payload.eventType,
      pageId: payload.pageId,
      error,
    })
    return Response.json({ received: false }, { status: 500 })
  }
}
