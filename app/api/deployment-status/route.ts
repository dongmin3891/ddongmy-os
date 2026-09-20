import { z } from 'zod'
import { getDeploymentRuntimeStatus } from '@/features/homelab/status-exporter-deployment-timeline.server'

export const dynamic = 'force-dynamic'

const commitShaSchema = z.string().regex(/^[a-f0-9]{40}$/)

export async function GET(request: Request) {
  const values = new URL(request.url).searchParams.getAll('commitSha')
  const result = commitShaSchema.safeParse(values.length === 1 ? values[0] : undefined)
  if (!result.success) {
    return Response.json({ error: 'invalid_commit_sha' }, { status: 400 })
  }

  const runtime = await getDeploymentRuntimeStatus()
  if (runtime.status === 'unavailable') {
    return Response.json(runtime, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  if (runtime.commitSha !== result.data) {
    return Response.json(
      { status: 'waiting_for_release', checkedAt: runtime.checkedAt },
      { status: 409, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return Response.json(runtime, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
