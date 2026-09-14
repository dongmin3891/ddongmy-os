import 'server-only'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

const NOTION_COVER_HOSTS = new Set(['prod-files-secure.s3.us-west-2.amazonaws.com'])
const MAX_COVER_BYTES = 10 * 1024 * 1024
const COVER_DOWNLOAD_TIMEOUT_MS = 15_000

export class CoverDownloadError extends Error {}
export class CoverTooLargeError extends CoverDownloadError {}

export type NotionCoverSource = {
  url: URL
  identity: string
}

export function getNotionCoverSource(value: string): NotionCoverSource | undefined {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    return undefined
  }

  if (url.protocol !== 'https:' || url.port || !NOTION_COVER_HOSTS.has(url.hostname)) {
    return undefined
  }

  return {
    url,
    identity: `${url.hostname}${url.pathname}`,
  }
}

export async function readCoverImageBytes(response: Response, maxBytes = MAX_COVER_BYTES) {
  if (!response.ok) {
    throw new CoverDownloadError(`Cover download failed with status ${response.status}`)
  }

  const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase()
  if (!contentType?.startsWith('image/')) {
    throw new CoverDownloadError('Cover response is not an image')
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > maxBytes) {
    throw new CoverTooLargeError('Cover exceeds the configured size limit')
  }

  if (!response.body) throw new CoverDownloadError('Cover response has no body')

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      throw new CoverTooLargeError('Cover exceeds the configured size limit')
    }
    chunks.push(value)
  }

  return Buffer.concat(chunks, totalBytes)
}

export async function downloadNotionCover(source: NotionCoverSource) {
  const response = await fetch(source.url, {
    headers: { Accept: 'image/*' },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(COVER_DOWNLOAD_TIMEOUT_MS),
  })

  return readCoverImageBytes(response)
}

export async function createOptimizedCover(original: Uint8Array) {
  const contentSha256 = createHash('sha256').update(original).digest('hex')
  const webp = await sharp(original)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 65 })
    .toBuffer()

  return { contentSha256, webp }
}
