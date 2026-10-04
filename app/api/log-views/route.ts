import {
  createLogViewRequestIdentity,
  LogViewIdentityUnavailableError,
} from '@/features/development-log/log-view-identity.server'
import { consumeLogViewRateLimit } from '@/features/development-log/log-view-protection.server'
import {
  incrementDevelopmentLogViewRequestSchema,
  LogViewRequestBodyTooLargeError,
  readLogViewRequestBody,
} from '@/features/development-log/log-view-request'
import { incrementDevelopmentLogView } from '@/features/development-log/log-view-stats.server'
import { getDevelopmentLogSummary } from '@/features/development-log/notion-development-logs.server'

export const runtime = 'nodejs'

const noStoreHeaders = {
  'Cache-Control': 'no-store',
}

export async function POST(request: Request) {
  let rawBody: string

  try {
    rawBody = await readLogViewRequestBody(request)
  } catch (error) {
    if (error instanceof LogViewRequestBodyTooLargeError) {
      return Response.json({ status: 'request-too-large' }, { status: 413, headers: noStoreHeaders })
    }
    throw error
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return Response.json({ status: 'invalid-request' }, { status: 400, headers: noStoreHeaders })
  }

  const parsedRequest = incrementDevelopmentLogViewRequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return Response.json({ status: 'invalid-request' }, { status: 400, headers: noStoreHeaders })
  }

  try {
    const identity = createLogViewRequestIdentity(request.headers)
    const rateLimit = await consumeLogViewRateLimit(identity.requesterHash)
    if (rateLimit.status === 'limited') {
      return Response.json(
        { status: 'rate-limited' },
        {
          status: 429,
          headers: {
            ...noStoreHeaders,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      )
    }

    const log = await getDevelopmentLogSummary(parsedRequest.data.postSlug)
    if (
      !log ||
      log.status !== 'published' ||
      log.notionPageId !== parsedRequest.data.postId
    ) {
      return Response.json({ status: 'not-found' }, { status: 404, headers: noStoreHeaders })
    }

    const result = await incrementDevelopmentLogView({
      postId: log.notionPageId,
      postSlug: log.slug,
      visitorHash: identity.visitorHash,
    })

    return Response.json(result, { status: 200, headers: noStoreHeaders })
  } catch (error) {
    if (error instanceof LogViewIdentityUnavailableError) {
      console.error('[log-views] Request identity is unavailable', error)
      return Response.json({ status: 'unavailable' }, { status: 503, headers: noStoreHeaders })
    }

    console.error('[log-views] Failed to count development log view', error)
    return Response.json({ status: 'unavailable' }, { status: 503, headers: noStoreHeaders })
  }
}
