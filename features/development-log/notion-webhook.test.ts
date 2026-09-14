import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import {
  hasSameSecret,
  hasValidNotionWebhookSignature,
  parseNotionWebhookPayload,
  readWebhookBody,
  WebhookBodyTooLargeError,
} from './notion-webhook'
import { POST } from '../../app/api/notion/webhook/route'

test('verification payload를 별도 bootstrap 요청으로 구분한다', () => {
  assert.deepEqual(parseNotionWebhookPayload({ verification_token: 'secret_token' }), {
    type: 'verification',
    verificationToken: 'secret_token',
  })
})

test('처리할 page event에서 event와 page ID를 추출한다', () => {
  assert.deepEqual(
    parseNotionWebhookPayload({
      id: 'event-id',
      type: 'page.properties_updated',
      entity: { type: 'page', id: 'page-id' },
    }),
    {
      type: 'page-event',
      eventId: 'event-id',
      eventType: 'page.properties_updated',
      pageId: 'page-id',
    },
  )
})

test('구독 대상이 아닌 event는 성공적으로 무시한다', () => {
  assert.deepEqual(
    parseNotionWebhookPayload({
      id: 'event-id',
      type: 'page.content_updated',
      entity: { type: 'page', id: 'page-id' },
    }),
    { type: 'ignored-event' },
  )
})

test('raw body의 올바른 HMAC signature만 허용한다', () => {
  const rawBody = '{"id":"event-id"}'
  const verificationToken = 'secret_token'
  const signature = `sha256=${createHmac('sha256', verificationToken).update(rawBody).digest('hex')}`

  assert.equal(
    hasValidNotionWebhookSignature({ rawBody, signature, verificationToken }),
    true,
  )
  assert.equal(
    hasValidNotionWebhookSignature({
      rawBody: `${rawBody} `,
      signature,
      verificationToken,
    }),
    false,
  )
  assert.equal(
    hasValidNotionWebhookSignature({ rawBody, signature: 'sha256=bad', verificationToken }),
    false,
  )
})

test('secret 비교는 길이가 다른 값도 예외 없이 거절한다', () => {
  assert.equal(hasSameSecret('same', 'same'), true)
  assert.equal(hasSameSecret('short', 'a-much-longer-secret'), false)
})

test('webhook body는 실제로 읽은 byte 수로 제한한다', async () => {
  const request = new Request('https://ddongmy.com/api/notion/webhook', {
    method: 'POST',
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('1234'))
        controller.enqueue(new TextEncoder().encode('5678'))
        controller.close()
      },
    }),
    duplex: 'half',
  } as RequestInit)

  await assert.rejects(() => readWebhookBody(request, 7), WebhookBodyTooLargeError)
})

test('초기 verification 요청에 signature가 있어도 설정 전에는 token을 수신한다', async (t) => {
  const previousToken = process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN
  delete process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN
  t.mock.method(console, 'info', () => {})

  try {
    const response = await POST(
      new Request('https://ddongmy.com/api/notion/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Notion-Signature': `sha256=${'0'.repeat(64)}`,
        },
        body: JSON.stringify({ verification_token: 'secret_bootstrap' }),
      }),
    )

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { received: true, type: 'verification' })
  } finally {
    if (previousToken === undefined) {
      delete process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN
    } else {
      process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN = previousToken
    }
  }
})
