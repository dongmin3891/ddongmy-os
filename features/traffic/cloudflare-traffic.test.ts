import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getSeoulCompletedDayTrafficQueryWindows,
  getSeoulVisitDate,
  getSeoulTrafficQueryWindow,
  getSeoulYesterdayTrafficQueryWindow,
  parseCloudflareTrafficCounts,
  parseCloudflareTrafficRetentionSeconds,
  parseCloudflareYesterdayVisits,
} from './cloudflare-traffic'
import {
  CloudflareTrafficBackfillDateError,
  collectCloudflareTrafficBackfillSnapshots,
} from './cloudflare-traffic.server'
import { finalizeYesterdaySiteVisits } from './site-visit-finalization.server'
import { backfillSiteTraffic } from './site-traffic-backfill.server'
import { parseSiteVisitTotalRow } from './site-visit-stats.server'
import { hasValidTrafficFinalizeAuthorization } from './traffic-finalize-auth.server'
import { publicTrafficStatsSchema } from './traffic-stats'
import { POST as finalizeTraffic } from '../../app/api/internal/traffic/finalize/route'

test('조회 시각을 한국 날짜 snapshot key로 변환한다', () => {
  assert.equal(getSeoulVisitDate(new Date('2026-10-05T14:59:59.999Z')), '2026-10-05')
  assert.equal(getSeoulVisitDate(new Date('2026-10-05T15:00:00.000Z')), '2026-10-06')
})

test('한국 시간 오늘과 오늘을 포함한 최근 7일 조회 범위를 만든다', () => {
  assert.deepEqual(getSeoulTrafficQueryWindow(new Date('2026-09-21T03:30:00.000Z')), {
    todayStartsAt: '2026-09-20T15:00:00.000Z',
    lastSevenDaysStartAt: '2026-09-14T15:00:00.000Z',
    endsAt: '2026-09-21T03:30:00.000Z',
  })
})

test('한국 시간 어제 하루의 닫힌 시작과 열린 종료 범위를 만든다', () => {
  assert.deepEqual(
    getSeoulYesterdayTrafficQueryWindow(new Date('2026-10-05T15:40:00.000Z')),
    {
      visitDate: '2026-10-05',
      startsAt: '2026-10-04T15:00:00.000Z',
      endsAt: '2026-10-05T15:00:00.000Z',
    },
  )
})

test('Backfill은 오늘을 제외한 최근 30개 KST 완료 날짜를 만든다', () => {
  const windows = getSeoulCompletedDayTrafficQueryWindows({
    now: new Date('2026-10-05T12:00:00.000Z'),
    requestedDays: 30,
    notOlderThanSeconds: 31 * 24 * 60 * 60,
  })

  assert.equal(windows.length, 30)
  assert.deepEqual(windows[0], {
    visitDate: '2026-09-05',
    startsAt: '2026-09-04T15:00:00.000Z',
    endsAt: '2026-09-05T15:00:00.000Z',
  })
  assert.deepEqual(windows.at(-1), {
    visitDate: '2026-10-04',
    startsAt: '2026-10-03T15:00:00.000Z',
    endsAt: '2026-10-04T15:00:00.000Z',
  })
})

test('Backfill 범위는 Cloudflare의 실제 보존 기간으로 줄인다', () => {
  const windows = getSeoulCompletedDayTrafficQueryWindows({
    now: new Date('2026-10-05T12:00:00.000Z'),
    requestedDays: 30,
    notOlderThanSeconds: 2 * 24 * 60 * 60,
  })

  assert.deepEqual(windows.map((window) => window.visitDate), ['2026-10-04'])
})

test('Cloudflare의 오늘과 최근 7일 visits를 공개 값으로 합산한다', () => {
  assert.deepEqual(
    parseCloudflareTrafficCounts({
      data: {
        viewer: {
          zones: [
            {
              today: [{ sum: { visits: 3 } }, { sum: { visits: 2 } }],
              lastSevenDays: [{ sum: { visits: 21 } }],
            },
          ],
        },
      },
      errors: null,
    }),
    {
      todayVisits: 5,
      lastSevenDaysVisits: 21,
    },
  )
})

test('Cloudflare GraphQL 오류가 있으면 방문 통계를 거부한다', () => {
  assert.throws(
    () =>
      parseCloudflareTrafficCounts({
        data: {
          viewer: {
            zones: [
              {
                today: [],
                lastSevenDays: [],
              },
            ],
          },
        },
        errors: [{ message: 'not authorized' }],
      }),
    /GraphQL errors/,
  )
})

test('Cloudflare 어제 방문수를 그룹 합계로 변환한다', () => {
  assert.equal(
    parseCloudflareYesterdayVisits({
      data: {
        viewer: {
          zones: [
            {
              yesterday: [{ sum: { visits: 40 } }, { sum: { visits: 2 } }],
            },
          ],
        },
      },
    }),
    42,
  )
})

test('Cloudflare settings에서 zone의 실제 보존 기간을 읽는다', () => {
  assert.equal(
    parseCloudflareTrafficRetentionSeconds({
      data: {
        viewer: {
          zones: [
            {
              settings: {
                httpRequestsAdaptiveGroups: {
                  enabled: true,
                  notOlderThan: 2_678_400,
                },
              },
            },
          ],
        },
      },
      errors: null,
    }),
    2_678_400,
  )
})

test('일별 Cloudflare Backfill 실패는 해당 KST 날짜와 함께 거부한다', async () => {
  const observedAt = new Date('2026-10-05T12:00:00.000Z')
  const queryWindows = getSeoulCompletedDayTrafficQueryWindows({
    now: observedAt,
    requestedDays: 2,
    notOlderThanSeconds: 3 * 24 * 60 * 60,
  })

  await assert.rejects(
    () =>
      collectCloudflareTrafficBackfillSnapshots({
        queryWindows,
        observedAt,
        getVisits: async (window) => {
          if (window.visitDate === '2026-10-04') throw new Error('request failed')
          return 10
        },
      }),
    (error: unknown) =>
      error instanceof CloudflareTrafficBackfillDateError &&
      error.visitDate === '2026-10-04',
  )
})

test('방문 통계 응답은 누적값과 DB unavailable 상태를 구분한다', () => {
  const checkedAt = '2026-10-05T12:00:00.000Z'

  assert.deepEqual(
    publicTrafficStatsSchema.parse({
      status: 'available',
      todayVisits: 12,
      lastSevenDaysVisits: 84,
      totalVisits: 1350,
      checkedAt,
    }),
    {
      status: 'available',
      todayVisits: 12,
      lastSevenDaysVisits: 84,
      totalVisits: 1350,
      checkedAt,
    },
  )

  const statsWithoutTotal = publicTrafficStatsSchema.parse({
    status: 'available',
    todayVisits: 12,
    lastSevenDaysVisits: 84,
    totalVisits: null,
    checkedAt,
  })
  assert.equal(statsWithoutTotal.status, 'available')
  if (statsWithoutTotal.status === 'available') {
    assert.equal(statsWithoutTotal.totalVisits, null)
  }
})

test('PostgreSQL bigint 누적 방문수를 안전한 정수로 변환한다', () => {
  assert.equal(parseSiteVisitTotalRow({ total_visits: '1350' }), 1350)
  assert.throws(
    () =>
      parseSiteVisitTotalRow({
        total_visits: String(BigInt(Number.MAX_SAFE_INTEGER) + 1n),
      }),
    /safe integer range/,
  )
})

test('Cloudflare 조회가 실패하면 확정 DB 저장을 호출하지 않는다', async () => {
  let saveCallCount = 0

  await assert.rejects(
    () =>
      finalizeYesterdaySiteVisits(new Date('2026-10-05T15:40:00.000Z'), {
        getYesterdaySnapshot: async () => {
          throw new Error('Cloudflare unavailable')
        },
        saveFinalizedSnapshot: async () => {
          saveCallCount += 1
        },
      }),
    /Cloudflare unavailable/,
  )
  assert.equal(saveCallCount, 0)
})

test('Backfill 조회가 실패하면 DB 저장을 호출하지 않는다', async () => {
  let saveCallCount = 0

  await assert.rejects(
    () =>
      backfillSiteTraffic(new Date('2026-10-05T12:00:00.000Z'), {
        getSnapshots: async () => {
          throw new Error('daily query failed')
        },
        saveSnapshots: async () => {
          saveCallCount += 1
          return { queriedDays: 0, upsertedDays: 0, totalVisits: 0 }
        },
      }),
    /daily query failed/,
  )
  assert.equal(saveCallCount, 0)
})

test('Backfill 결과는 처리 범위와 복원된 누적 방문수를 보고한다', async () => {
  const observedAt = new Date('2026-10-05T12:00:00.000Z')

  const result = await backfillSiteTraffic(observedAt, {
    getSnapshots: async () => [
      { visitDate: '2026-10-03', visits: 8, observedAt },
      { visitDate: '2026-10-04', visits: 13, observedAt },
    ],
    saveSnapshots: async () => ({
      queriedDays: 2,
      upsertedDays: 2,
      totalVisits: 101,
    }),
  })

  assert.deepEqual(result, {
    queriedDays: 2,
    upsertedDays: 2,
    totalVisits: 101,
    startsOn: '2026-10-03',
    endsOn: '2026-10-04',
    observedAt: observedAt.toISOString(),
  })
})

test('어제 절대 방문 snapshot을 그대로 확정 저장한다', async () => {
  const observedAt = new Date('2026-10-05T15:40:00.000Z')
  const savedSnapshots: Array<{
    visitDate: string
    visits: number
    observedAt: Date
  }> = []

  const snapshot = await finalizeYesterdaySiteVisits(observedAt, {
    getYesterdaySnapshot: async (requestedAt) => ({
      visitDate: '2026-10-05',
      visits: 107,
      observedAt: requestedAt,
    }),
    saveFinalizedSnapshot: async (value) => {
      savedSnapshots.push(value)
    },
  })

  assert.deepEqual(snapshot, {
    visitDate: '2026-10-05',
    visits: 107,
    observedAt,
  })
  assert.deepEqual(savedSnapshots, [snapshot])
})

test('finalize Bearer secret은 상수 시간 비교로 일치하는 값만 허용한다', () => {
  const secret = 'a'.repeat(32)

  assert.equal(hasValidTrafficFinalizeAuthorization(`Bearer ${secret}`, secret), true)
  assert.equal(hasValidTrafficFinalizeAuthorization(`Bearer ${'b'.repeat(32)}`, secret), false)
  assert.equal(hasValidTrafficFinalizeAuthorization('Bearer short', secret), false)
  assert.equal(hasValidTrafficFinalizeAuthorization(null, secret), false)
})

test('finalize endpoint는 올바른 Bearer secret이 없는 요청을 거절한다', async (t) => {
  const previousSecret = process.env.SITE_TRAFFIC_FINALIZE_SECRET
  process.env.SITE_TRAFFIC_FINALIZE_SECRET = 'a'.repeat(32)
  t.mock.method(console, 'warn', () => {})

  try {
    const response = await finalizeTraffic(
      new Request('https://ddongmy.com/api/internal/traffic/finalize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${'b'.repeat(32)}` },
      }),
    )

    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { status: 'unauthorized' })
  } finally {
    if (previousSecret === undefined) {
      delete process.env.SITE_TRAFFIC_FINALIZE_SECRET
    } else {
      process.env.SITE_TRAFFIC_FINALIZE_SECRET = previousSecret
    }
  }
})
