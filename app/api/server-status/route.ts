import { getHomelabStatus } from '@/features/homelab/kubernetes-homelab-status.server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const homelabStatus = await getHomelabStatus()

  return Response.json(homelabStatus, {
    headers: {
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=45',
    },
  })
}
