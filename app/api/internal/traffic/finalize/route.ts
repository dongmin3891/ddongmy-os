import { finalizeYesterdaySiteVisits } from '@/features/traffic/site-visit-finalization.server'
import {
  getSiteTrafficFinalizeSecret,
  hasValidTrafficFinalizeAuthorization,
} from '@/features/traffic/traffic-finalize-auth.server'

export const runtime = 'nodejs'

const responseHeaders = {
  'Cache-Control': 'no-store',
}

export async function POST(request: Request) {
  let expectedSecret: string

  try {
    expectedSecret = getSiteTrafficFinalizeSecret()
  } catch (error) {
    console.error('[traffic-finalize] Authentication configuration is unavailable', error)
    return Response.json({ status: 'unavailable' }, { status: 503, headers: responseHeaders })
  }

  if (
    !hasValidTrafficFinalizeAuthorization(
      request.headers.get('authorization'),
      expectedSecret,
    )
  ) {
    console.warn('[traffic-finalize] Rejected unauthorized request')
    return Response.json({ status: 'unauthorized' }, { status: 401, headers: responseHeaders })
  }

  try {
    const snapshot = await finalizeYesterdaySiteVisits()
    console.info('[traffic-finalize] Finalized daily site visits', {
      visitDate: snapshot.visitDate,
      visits: snapshot.visits,
    })

    return Response.json(
      {
        status: 'finalized',
        visitDate: snapshot.visitDate,
        visits: snapshot.visits,
      },
      { headers: responseHeaders },
    )
  } catch (error) {
    console.error('[traffic-finalize] Failed to finalize daily site visits', error)
    return Response.json({ status: 'unavailable' }, { status: 503, headers: responseHeaders })
  }
}
