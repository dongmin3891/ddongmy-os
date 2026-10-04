import { incrementDevelopmentLogViewRequestSchema } from '@/features/development-log/log-view-request'
import { incrementDevelopmentLogView } from '@/features/development-log/log-view-stats.server'
import { getDevelopmentLogSummary } from '@/features/development-log/notion-development-logs.server'

export const runtime = 'nodejs'

const noStoreHeaders = {
  'Cache-Control': 'no-store',
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json({ status: 'invalid-request' }, { status: 400, headers: noStoreHeaders })
  }

  const parsedRequest = incrementDevelopmentLogViewRequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return Response.json({ status: 'invalid-request' }, { status: 400, headers: noStoreHeaders })
  }

  try {
    const log = await getDevelopmentLogSummary(parsedRequest.data.postSlug)
    if (
      !log ||
      log.status !== 'published' ||
      log.notionPageId !== parsedRequest.data.postId
    ) {
      return Response.json({ status: 'not-found' }, { status: 404, headers: noStoreHeaders })
    }

    const viewStats = await incrementDevelopmentLogView({
      postId: log.notionPageId,
      postSlug: log.slug,
    })

    return Response.json(
      { status: 'counted', viewStats },
      { status: 200, headers: noStoreHeaders },
    )
  } catch (error) {
    console.error('[log-views] Failed to count development log view', error)
    return Response.json({ status: 'unavailable' }, { status: 503, headers: noStoreHeaders })
  }
}
