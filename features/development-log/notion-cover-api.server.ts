import 'server-only'
import { z } from 'zod'

const NOTION_API_BASE_URL = 'https://api.notion.com/v1/'
const NOTION_API_VERSION = '2026-03-11'

const notionCoverEnvironmentSchema = z.object({
  NOTION_TOKEN: z.string().trim().min(1),
  NOTION_DATA_SOURCE_ID: z.string().trim().min(1),
})

const notionFileCoverSchema = z.object({
  type: z.literal('file'),
  file: z.object({ url: z.url() }),
})

const notionExternalCoverSchema = z.object({
  type: z.literal('external'),
  external: z.object({ url: z.url() }),
})

const notionPageSchema = z.object({
  object: z.literal('page'),
  id: z.string().min(1),
  parent: z
    .object({
      type: z.string().min(1),
      data_source_id: z.string().min(1).optional(),
    })
    .passthrough(),
  cover: z.unknown(),
})

type NotionCoverConfig = {
  token: string
  dataSourceId: string
}

export type DevelopmentLogPageCover =
  | { type: 'notion-file'; url: string }
  | { type: 'external'; url: string }
  | { type: 'none' }
  | { type: 'unsupported' }

export type DevelopmentLogCoverPage = {
  id: string
  isDevelopmentLog: boolean
  cover: DevelopmentLogPageCover
}

export class NotionCoverResponseError extends Error {
  constructor(readonly status: number) {
    super(`Notion cover request failed with status ${status}`)
  }
}

function getNotionCoverConfig(): NotionCoverConfig {
  const result = notionCoverEnvironmentSchema.safeParse(process.env)
  if (!result.success) {
    const invalidKeys = [...new Set(result.error.issues.map((issue) => issue.path[0]))]
    throw new Error(`Invalid Notion cover configuration: ${invalidKeys.join(', ')}`)
  }

  return {
    token: result.data.NOTION_TOKEN,
    dataSourceId: result.data.NOTION_DATA_SOURCE_ID,
  }
}

function createNotionHeaders(token: string, hasJsonBody = false) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
    'Notion-Version': NOTION_API_VERSION,
  }
}

async function readNotionResponse(response: Response) {
  let value: unknown

  try {
    value = await response.json()
  } catch (cause) {
    throw new Error('Notion returned an invalid JSON response', { cause })
  }

  if (!response.ok) throw new NotionCoverResponseError(response.status)
  return value
}

function normalizeNotionId(value: string) {
  return value.replaceAll('-', '').toLowerCase()
}

function parsePageCover(value: unknown): DevelopmentLogPageCover {
  if (value === null) return { type: 'none' }

  const fileCover = notionFileCoverSchema.safeParse(value)
  if (fileCover.success) return { type: 'notion-file', url: fileCover.data.file.url }

  const externalCover = notionExternalCoverSchema.safeParse(value)
  if (externalCover.success) return { type: 'external', url: externalCover.data.external.url }

  return { type: 'unsupported' }
}

export async function getDevelopmentLogCoverPage(pageId: string): Promise<DevelopmentLogCoverPage> {
  const config = getNotionCoverConfig()
  const url = new URL(`pages/${encodeURIComponent(pageId)}`, NOTION_API_BASE_URL)
  const response = await fetch(url, {
    headers: createNotionHeaders(config.token),
    cache: 'no-store',
  })
  const page = notionPageSchema.parse(await readNotionResponse(response))
  const parentDataSourceId =
    page.parent.type === 'data_source_id' ? page.parent.data_source_id : undefined

  return {
    id: page.id,
    isDevelopmentLog:
      parentDataSourceId !== undefined &&
      normalizeNotionId(parentDataSourceId) === normalizeNotionId(config.dataSourceId),
    cover: parsePageCover(page.cover),
  }
}

export async function setDevelopmentLogExternalCover(pageId: string, publicUrl: string) {
  const config = getNotionCoverConfig()
  const url = new URL(`pages/${encodeURIComponent(pageId)}`, NOTION_API_BASE_URL)
  const response = await fetch(url, {
    method: 'PATCH',
    headers: createNotionHeaders(config.token, true),
    body: JSON.stringify({
      cover: {
        type: 'external',
        external: { url: publicUrl },
      },
    }),
    cache: 'no-store',
  })

  notionPageSchema.parse(await readNotionResponse(response))
}
