import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const notionWebhookVerificationSchema = z
  .object({
    verification_token: z.string().min(1).max(512),
  })
  .strict()

const notionWebhookEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  entity: z.object({
    type: z.string().min(1),
    id: z.string().min(1),
  }),
})

const handledPageEventTypes = new Set(['page.created', 'page.properties_updated'])

export type NotionWebhookPayload =
  | { type: 'verification'; verificationToken: string }
  | { type: 'page-event'; eventId: string; eventType: string; pageId: string }
  | { type: 'ignored-event' }

export class WebhookBodyTooLargeError extends Error {}

export function parseNotionWebhookPayload(value: unknown): NotionWebhookPayload {
  const verification = notionWebhookVerificationSchema.safeParse(value)
  if (verification.success) {
    return {
      type: 'verification',
      verificationToken: verification.data.verification_token,
    }
  }

  const event = notionWebhookEventSchema.parse(value)
  if (!handledPageEventTypes.has(event.type) || event.entity.type !== 'page') {
    return { type: 'ignored-event' }
  }

  return {
    type: 'page-event',
    eventId: event.id,
    eventType: event.type,
    pageId: event.entity.id,
  }
}

export function hasValidNotionWebhookSignature({
  rawBody,
  signature,
  verificationToken,
}: {
  rawBody: string
  signature: string | null
  verificationToken: string
}) {
  if (!signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false

  const expected = `sha256=${createHmac('sha256', verificationToken).update(rawBody).digest('hex')}`
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

export function hasSameSecret(first: string, second: string) {
  const firstBuffer = Buffer.from(first)
  const secondBuffer = Buffer.from(second)

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer)
}

export async function readWebhookBody(request: Request, maxBytes: number) {
  const contentLength = request.headers.get('content-length')
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > maxBytes) {
    throw new WebhookBodyTooLargeError('Webhook body exceeds the configured limit')
  }

  if (!request.body) return ''

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      throw new WebhookBodyTooLargeError('Webhook body exceeds the configured limit')
    }
    chunks.push(value)
  }

  return Buffer.concat(chunks, totalBytes).toString('utf8')
}
