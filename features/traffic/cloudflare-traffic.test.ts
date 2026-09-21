import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getSeoulTrafficQueryWindow,
  parseCloudflareTrafficCounts,
} from './cloudflare-traffic'

test('한국 시간 오늘과 오늘을 포함한 최근 7일 조회 범위를 만든다', () => {
  assert.deepEqual(getSeoulTrafficQueryWindow(new Date('2026-09-21T03:30:00.000Z')), {
    todayStartsAt: '2026-09-20T15:00:00.000Z',
    lastSevenDaysStartAt: '2026-09-14T15:00:00.000Z',
    endsAt: '2026-09-21T03:30:00.000Z',
  })
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
