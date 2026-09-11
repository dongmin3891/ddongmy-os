import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { getDevelopmentLogSummaries } from '@/features/development-log/notion-development-logs.server'

export const dynamic = 'force-dynamic'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteConfig.url, changeFrequency: 'monthly' },
  { url: `${siteConfig.url}/projects`, changeFrequency: 'monthly' },
  { url: `${siteConfig.url}/log`, changeFrequency: 'weekly' },
  { url: `${siteConfig.url}/lab`, changeFrequency: 'monthly' },
  { url: `${siteConfig.url}/about`, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const logs = await getDevelopmentLogSummaries()
  const publishedLogs: MetadataRoute.Sitemap = logs
    .filter((log) => log.status === 'published')
    .map((log) => ({
      url: `${siteConfig.url}/log/${log.slug}`,
      lastModified: log.updatedAt ?? log.publishedAt,
      changeFrequency: 'monthly',
    }))

  return [...staticRoutes, ...publishedLogs]
}
