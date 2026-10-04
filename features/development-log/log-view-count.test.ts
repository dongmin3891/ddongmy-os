import assert from 'node:assert/strict'
import test from 'node:test'
import { POST } from '../../app/api/log-views/route'
import {
  LOG_VIEW_DEDUPLICATION_WINDOW_MS,
  parseIncrementDevelopmentLogViewResponse,
  wasDevelopmentLogRecentlyCounted,
} from './log-view-count'
import { incrementDevelopmentLogViewRequestSchema } from './log-view-request'
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
})
