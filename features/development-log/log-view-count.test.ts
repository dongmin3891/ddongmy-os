import assert from 'node:assert/strict'
import test from 'node:test'
import { POST } from '../../app/api/log-views/route'
import {
  LOG_VIEW_DEDUPLICATION_WINDOW_MS,
  parseIncrementDevelopmentLogViewResponse,
  wasDevelopmentLogRecentlyCounted,
} from './log-view-count'
import {
  incrementDevelopmentLogViewRequestSchema,
  LogViewRequestBodyTooLargeError,
  readLogViewRequestBody,
} from './log-view-request'
import {
  createLogViewRequestIdentity,
  getLogViewRequestAddress,
  LogViewIdentityUnavailableError,
} from './log-view-identity.server'
import { parseLogViewRateLimitRow } from './log-view-protection.server'
import { parseDevelopmentLogViewStatsRow } from './log-view-stats.server'

test('조회수 증가 요청에서 Notion page ID와 공개 slug만 허용한다', () => {
  assert.deepEqual(
    incrementDevelopmentLogViewRequestSchema.parse({
      postId: 'notion-page-id',
      postSlug: 'kubernetes-oomkilled',
    }),
    {
      postId: 'notion-page-id',
      postSlug: 'kubernetes-oomkilled',
    },
  )

  assert.equal(
    incrementDevelopmentLogViewRequestSchema.safeParse({
      postId: 'notion-page-id',
      postSlug: '../private',
    }).success,
    false,
  )
  assert.equal(
    incrementDevelopmentLogViewRequestSchema.safeParse({
      postId: 'notion-page-id',
      postSlug: 'kubernetes-oomkilled',
      views: 100,
    }).success,
    false,
  )
})

test('조회수 응답은 안전한 정수로 구성된 counted 결과만 허용한다', () => {
  assert.deepEqual(
    parseIncrementDevelopmentLogViewResponse({
      status: 'counted',
      viewStats: { todayViews: 3, totalViews: 21 },
    }),
    {
      status: 'counted',
      viewStats: { todayViews: 3, totalViews: 21 },
    },
  )

  assert.equal(
    parseIncrementDevelopmentLogViewResponse({
      status: 'counted',
      viewStats: { todayViews: -1, totalViews: 21 },
    }),
    undefined,
  )
  assert.equal(
    parseIncrementDevelopmentLogViewResponse({ status: 'unavailable' }),
    undefined,
  )

  assert.deepEqual(
    parseIncrementDevelopmentLogViewResponse({
      status: 'duplicate',
      viewStats: { todayViews: 3, totalViews: 21 },
    }),
    {
      status: 'duplicate',
      viewStats: { todayViews: 3, totalViews: 21 },
    },
  )
})

test('Cloudflare 주소를 우선하고 유효한 proxy 주소만 요청 identity로 사용한다', () => {
  assert.equal(
    getLogViewRequestAddress(
      new Headers({
        'cf-connecting-ip': '203.0.113.10',
        'x-forwarded-for': '198.51.100.20, 10.0.0.1',
      }),
    ),
    '203.0.113.10',
  )
  assert.equal(
    getLogViewRequestAddress(
      new Headers({ 'x-forwarded-for': '198.51.100.20, 10.0.0.1' }),
    ),
    '198.51.100.20',
  )
  assert.throws(
    () => getLogViewRequestAddress(new Headers({ 'x-forwarded-for': 'not-an-ip' })),
    LogViewIdentityUnavailableError,
  )
})

test('요청 identity는 원본 주소를 저장하지 않고 rate limit과 방문자 hash를 분리한다', () => {
  const secret = 'a-secure-log-view-hash-secret-with-32-characters'
  const chromeIdentity = createLogViewRequestIdentity(
    new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'user-agent': 'Chrome',
    }),
    secret,
  )
  const safariIdentity = createLogViewRequestIdentity(
    new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'user-agent': 'Safari',
    }),
    secret,
  )

  assert.equal(chromeIdentity.requesterHash.length, 64)
  assert.equal(chromeIdentity.visitorHash.length, 64)
  assert.equal(chromeIdentity.requesterHash.includes('203.0.113.10'), false)
  assert.equal(chromeIdentity.requesterHash, safariIdentity.requesterHash)
  assert.notEqual(chromeIdentity.visitorHash, safariIdentity.visitorHash)
})

test('rate limit DB 결과를 허용과 제한 상태로 구분한다', () => {
  assert.deepEqual(
    parseLogViewRateLimitRow({ allowed: true, retry_after_seconds: 600 }),
    { status: 'allowed' },
  )
  assert.deepEqual(
    parseLogViewRateLimitRow({ allowed: false, retry_after_seconds: 431 }),
    { status: 'limited', retryAfterSeconds: 431 },
  )
})

test('조회수 요청 body는 선언된 크기와 실제로 읽은 byte 수를 모두 제한한다', async () => {
  await assert.rejects(
    () =>
      readLogViewRequestBody(
        new Request('https://ddongmy.com/api/log-views', {
          method: 'POST',
          headers: { 'Content-Length': '10' },
          body: '1234567890',
        }),
        9,
      ),
    LogViewRequestBodyTooLargeError,
  )

  const streamedRequest = new Request('https://ddongmy.com/api/log-views', {
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

  await assert.rejects(
    () => readLogViewRequestBody(streamedRequest, 7),
    LogViewRequestBodyTooLargeError,
  )
})

test('같은 게시글은 저장된 시각부터 30분 동안 다시 집계하지 않는다', () => {
  const countedAt = Date.parse('2026-10-05T00:00:00.000Z')

  assert.equal(wasDevelopmentLogRecentlyCounted(String(countedAt), countedAt), true)
  assert.equal(
    wasDevelopmentLogRecentlyCounted(
      String(countedAt),
      countedAt + LOG_VIEW_DEDUPLICATION_WINDOW_MS - 1,
    ),
    true,
  )
  assert.equal(
    wasDevelopmentLogRecentlyCounted(
      String(countedAt),
      countedAt + LOG_VIEW_DEDUPLICATION_WINDOW_MS,
    ),
    false,
  )
  assert.equal(wasDevelopmentLogRecentlyCounted('invalid', countedAt), false)
  assert.equal(wasDevelopmentLogRecentlyCounted(null, countedAt), false)
})

test('PostgreSQL bigint 문자열을 공개 조회수로 변환한다', () => {
  assert.deepEqual(
    parseDevelopmentLogViewStatsRow({ today_views: '7', total_views: '42' }),
    { todayViews: 7, totalViews: 42 },
  )

  assert.throws(
    () =>
      parseDevelopmentLogViewStatsRow({
        today_views: '1',
        total_views: String(BigInt(Number.MAX_SAFE_INTEGER) + 1n),
      }),
    /safe integer range/,
  )
})

test('조회수 API는 읽을 수 없거나 계약에 맞지 않는 JSON을 거절한다', async () => {
  const invalidJsonResponse = await POST(
    new Request('https://ddongmy.com/api/log-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    }),
  )
  assert.equal(invalidJsonResponse.status, 400)
  assert.deepEqual(await invalidJsonResponse.json(), { status: 'invalid-request' })

  const invalidRequestResponse = await POST(
    new Request('https://ddongmy.com/api/log-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: '', postSlug: 'INVALID SLUG' }),
    }),
  )
  assert.equal(invalidRequestResponse.status, 400)
  assert.deepEqual(await invalidRequestResponse.json(), { status: 'invalid-request' })

  const oversizedResponse = await POST(
    new Request('https://ddongmy.com/api/log-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '5000',
      },
      body: JSON.stringify({ postId: 'post-id', postSlug: 'published-post' }),
    }),
  )
  assert.equal(oversizedResponse.status, 413)
  assert.deepEqual(await oversizedResponse.json(), { status: 'request-too-large' })
})
