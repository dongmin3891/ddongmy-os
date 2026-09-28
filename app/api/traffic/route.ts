import { getCloudflareTrafficStats } from '@/features/traffic/cloudflare-traffic.server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const trafficStats = await getCloudflareTrafficStats()

  return Response.json(trafficStats, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
