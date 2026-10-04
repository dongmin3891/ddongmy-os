import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getDevelopmentLogListHref,
  parseDevelopmentLogSort,
  sortDevelopmentLogListItems,
  type DevelopmentLogListItem,
} from './development-log-list'
import { parseDevelopmentLogViewStatsBatchRows } from './log-view-stats.server'

const listItems: readonly DevelopmentLogListItem[] = [
  {
    log: {
      slug: 'newest',
      title: 'Newest',
      summary: 'Newest post',
      category: 'improvement',
      tags: [],
      status: 'published',
    },
    viewStats: { todayViews: 2, totalViews: 10 },
  },
  {
    log: {
      slug: 'same-today',
      title: 'Same today',
      summary: 'Same today views',
      category: 'operations',
      tags: [],
      status: 'published',
    },
    viewStats: { todayViews: 2, totalViews: 20 },
  },
  {
    log: {
      slug: 'zero',
      title: 'Zero',
      summary: 'No views',
      category: 'retrospective',
      tags: [],
      status: 'published',
    },
    viewStats: { todayViews: 0, totalViews: 0 },
  },
]

test('조회수 정렬 입력은 세 가지 값만 허용하고 최신순을 기본값으로 사용한다', () => {
  assert.equal(parseDevelopmentLogSort(undefined), 'latest')
  assert.equal(parseDevelopmentLogSort('latest'), 'latest')
  assert.equal(parseDevelopmentLogSort('today'), 'today')
  assert.equal(parseDevelopmentLogSort('total'), 'total')
  assert.equal(parseDevelopmentLogSort('invalid'), 'latest')
  assert.equal(parseDevelopmentLogSort(['today', 'total']), 'latest')
})

test('오늘 조회수가 같으면 기존 최신순을 유지하고 조회수 0인 글도 포함한다', () => {
  const sortedItems = sortDevelopmentLogListItems(listItems, 'today')

  assert.deepEqual(
    sortedItems.map(({ log }) => log.slug),
    ['newest', 'same-today', 'zero'],
  )
})

test('누적 조회순은 통계가 없는 글을 0으로 취급한다', () => {
  const itemsWithUnavailableStats: readonly DevelopmentLogListItem[] = [
    ...listItems,
    {
      log: {
        slug: 'unavailable',
        title: 'Unavailable',
        summary: 'Database unavailable',
        category: 'improvement',
        tags: [],
        status: 'published',
      },
      viewStats: null,
    },
  ]

  assert.deepEqual(
    sortDevelopmentLogListItems(itemsWithUnavailableStats, 'total').map(({ log }) => log.slug),
    ['same-today', 'newest', 'zero', 'unavailable'],
  )
})

test('분류와 정렬 query를 함께 유지하고 기본 최신순은 URL에서 생략한다', () => {
  assert.equal(getDevelopmentLogListHref({}), '/log')
  assert.equal(
    getDevelopmentLogListHref({ category: 'operations', sort: 'latest' }),
    '/log?category=operations',
  )
  assert.equal(
    getDevelopmentLogListHref({ category: 'operations', sort: 'today' }),
    '/log?category=operations&sort=today',
  )
  assert.equal(getDevelopmentLogListHref({ sort: 'total' }), '/log?sort=total')
})

test('배치 조회 결과는 page ID별 오늘·누적 조회수로 변환한다', () => {
  const statsByPostId = parseDevelopmentLogViewStatsBatchRows([
    { post_id: 'page-a', today_views: '0', total_views: '0' },
    { post_id: 'page-b', today_views: '7', total_views: '42' },
  ])

  assert.deepEqual(statsByPostId.get('page-a'), { todayViews: 0, totalViews: 0 })
  assert.deepEqual(statsByPostId.get('page-b'), { todayViews: 7, totalViews: 42 })
})
