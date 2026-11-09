import { expect, test } from '@playwright/test'
import {
  E2E_LOG_POST_ID,
  E2E_LOG_POST_SLUG,
} from '../app/e2e-fixtures/log-view-counter/LogViewCounterFixture'

const fixturePath = '/e2e-fixtures/log-view-counter'
const logViewApiPattern = '**/api/log-views'

test('개발 로그 방문 시 집계된 조회수를 표시한다', async ({ page }) => {
  let requestCount = 0

  await page.route(logViewApiPattern, async (route) => {
    requestCount += 1
    expect(route.request().method()).toBe('POST')
    expect(route.request().postDataJSON()).toEqual({
      postId: E2E_LOG_POST_ID,
      postSlug: E2E_LOG_POST_SLUG,
    })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'counted',
        viewStats: { todayViews: 7, totalViews: 42 },
      }),
    })
  })

  await page.goto(fixturePath)

  const metadata = page.getByLabel('게시글 정보')
  await expect(metadata).toContainText('오늘 7')
  await expect(metadata).toContainText('누적 42')
  expect(requestCount).toBe(1)
})

test('집계 실패 후 새로고침하면 다시 시도한다', async ({ page }) => {
  let requestCount = 0

  await page.route(logViewApiPattern, async (route) => {
    requestCount += 1

    if (requestCount === 1) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'unavailable' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'counted',
        viewStats: { todayViews: 8, totalViews: 43 },
      }),
    })
  })

  await page.goto(fixturePath)
  await expect.poll(() => requestCount).toBe(1)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.reload()

  await expect(page.getByLabel('게시글 정보')).toContainText('누적 43')
  expect(requestCount).toBe(2)
})

test('집계 성공 후 새로고침해도 중복 요청하지 않는다', async ({ page }) => {
  let requestCount = 0

  await page.route(logViewApiPattern, async (route) => {
    requestCount += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'counted',
        viewStats: { todayViews: 7, totalViews: 42 },
      }),
    })
  })

  await page.goto(fixturePath)
  await expect(page.getByLabel('게시글 정보')).toContainText('누적 42')
  expect(requestCount).toBe(1)

  await page.reload()
  await expect(page.getByLabel('브라우저 준비 상태')).toHaveText('준비됨')

  expect(requestCount).toBe(1)
})
