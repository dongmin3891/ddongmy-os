import 'server-only'
import r2ImageSource from '@/config/r2-image-source'
import {
  type DevelopmentLogCoverPage,
  getDevelopmentLogCoverPage,
  setDevelopmentLogExternalCover,
} from './notion-cover-api.server'
import {
  createOptimizedCover,
  downloadNotionCover,
  getNotionCoverSource,
} from './notion-cover-image.server'
import { uploadDevelopmentLogCover } from './r2-cover-storage.server'

export type DevelopmentLogCoverSyncResult =
  | { status: 'updated' }
  | { status: 'already-synced' }
  | { status: 'cover-changed' }
  | { status: 'ignored-not-development-log' }
  | { status: 'ignored-no-notion-cover' }
  | { status: 'ignored-untrusted-cover-source' }

function isR2Cover(value: string) {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    return false
  }

  return (
    url.protocol === `${r2ImageSource.protocol}:` &&
    url.hostname === r2ImageSource.hostname &&
    url.port === '' &&
    url.pathname.startsWith(r2ImageSource.pathnamePrefix)
  )
}

export function stillHasNotionCoverSource(
  page: DevelopmentLogCoverPage,
  sourceIdentity: string,
) {
  if (!page.isDevelopmentLog || page.cover.type !== 'notion-file') return false

  const source = getNotionCoverSource(page.cover.url)
  return source?.identity === sourceIdentity
}

export async function syncDevelopmentLogCover(
  pageId: string,
): Promise<DevelopmentLogCoverSyncResult> {
  const initialPage = await getDevelopmentLogCoverPage(pageId)
  if (!initialPage.isDevelopmentLog) return { status: 'ignored-not-development-log' }

  if (initialPage.cover.type === 'external' && isR2Cover(initialPage.cover.url)) {
    return { status: 'already-synced' }
  }
  if (initialPage.cover.type !== 'notion-file') {
    return { status: 'ignored-no-notion-cover' }
  }

  const source = getNotionCoverSource(initialPage.cover.url)
  if (!source) return { status: 'ignored-untrusted-cover-source' }

  const original = await downloadNotionCover(source)
  const optimized = await createOptimizedCover(original)
  const uploaded = await uploadDevelopmentLogCover({
    pageId: initialPage.id,
    contentSha256: optimized.contentSha256,
    webp: optimized.webp,
  })

  const latestPage = await getDevelopmentLogCoverPage(pageId)
  if (!stillHasNotionCoverSource(latestPage, source.identity)) {
    return { status: 'cover-changed' }
  }

  await setDevelopmentLogExternalCover(latestPage.id, uploaded.publicUrl)
  return { status: 'updated' }
}
