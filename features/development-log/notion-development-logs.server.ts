import 'server-only'
import type { z } from 'zod'
import type { DevelopmentLogDraft, DevelopmentLogSummary } from './development-log'
import { developmentLogs, findDevelopmentLog } from './development-logs'
import {
  notionDevelopmentLogQuerySchema,
  notionPageMarkdownSchema,
  toPublishedDevelopmentLog,
  type PublishedDevelopmentLog,
} from './notion-development-log'

const NOTION_API_BASE_URL = 'https://api.notion.com/v1/'
const NOTION_API_VERSION = '2026-03-11'

type NotionConfig = {
  token: string
  dataSourceId: string
}

export type PublishedDevelopmentLogEntry = PublishedDevelopmentLog & {
  markdown: string
}

export type DevelopmentLogEntry = DevelopmentLogDraft | PublishedDevelopmentLogEntry

export class NotionResponseError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
  ) {
    super(`Notion request failed with status ${status}`)
  }
}

function getNotionConfig(): NotionConfig | undefined {
  const token = process.env.NOTION_TOKEN
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID

  if (!token && !dataSourceId) return undefined
  if (!token || !dataSourceId) {
    throw new Error('NOTION_TOKEN and NOTION_DATA_SOURCE_ID must be configured together')
  }

  return { token, dataSourceId }
}

async function readNotionJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch (cause) {
    throw new Error('Notion returned an invalid JSON response', { cause })
  }
}

type QueryPublishedLogsOptions = {
  slug?: string
  startCursor?: string
}

async function queryPublishedPage(
  config: NotionConfig,
  { slug, startCursor }: QueryPublishedLogsOptions = {},
): Promise<z.infer<typeof notionDevelopmentLogQuerySchema>> {
  const url = new URL(`data_sources/${config.dataSourceId}/query`, NOTION_API_BASE_URL)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_API_VERSION,
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Published', checkbox: { equals: true } },
          ...(slug ? [{ property: 'Slug', rich_text: { equals: slug } }] : []),
        ],
      },
      sorts: [
        { property: 'PublishedAt', direction: 'descending' },
        { property: 'Order', direction: 'ascending' },
      ],
      page_size: 100,
      start_cursor: startCursor,
      result_type: 'page',
    }),
    next: { revalidate: 300, tags: ['development-logs'] },
  })
  const body = await readNotionJson(response)

  if (!response.ok) {
    const error = body as { code?: unknown }
    throw new NotionResponseError(
      response.status,
      typeof error.code === 'string' ? error.code : undefined,
    )
  }

  return notionDevelopmentLogQuerySchema.parse(body)
}

async function getPublishedDevelopmentLogs(config: NotionConfig) {
  const logs: PublishedDevelopmentLog[] = []
  let cursor: string | undefined

  do {
    const page = await queryPublishedPage(config, { startCursor: cursor })
    logs.push(...page.results.map(toPublishedDevelopmentLog))
    cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined
  } while (cursor)

  return logs
}

async function getPublishedDevelopmentLog(config: NotionConfig, slug: string) {
  const page = await queryPublishedPage(config, { slug })

  if (page.results.length === 0) return undefined
  if (page.results.length > 1) {
    throw new Error(`Published Notion slug must be unique: ${slug}`)
  }

  return toPublishedDevelopmentLog(page.results[0])
}

async function getNotionPageMarkdown(config: NotionConfig, pageId: string) {
  const url = new URL(`pages/${pageId}/markdown`, NOTION_API_BASE_URL)
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.token}`,
      'Notion-Version': NOTION_API_VERSION,
    },
    next: { revalidate: 300, tags: [`development-log:${pageId}`] },
  })
  const body = await readNotionJson(response)

  if (!response.ok) {
    const error = body as { code?: unknown }
    throw new NotionResponseError(
      response.status,
      typeof error.code === 'string' ? error.code : undefined,
    )
  }

  const page = notionPageMarkdownSchema.parse(body)
  if (page.truncated || page.unknown_block_ids.length > 0) {
    throw new Error(`Notion page ${pageId} could not be read completely`)
  }

  return page.markdown
}

export async function getDevelopmentLogSummaries(): Promise<readonly DevelopmentLogSummary[]> {
  const config = getNotionConfig()
  if (!config) return developmentLogs

  return getPublishedDevelopmentLogs(config)
}

export async function getDevelopmentLog(slug: string): Promise<DevelopmentLogEntry | undefined> {
  const config = getNotionConfig()
  if (!config) return findDevelopmentLog(slug)

  const log = await getPublishedDevelopmentLog(config, slug)
  if (!log) return undefined

  return {
    ...log,
    markdown: await getNotionPageMarkdown(config, log.notionPageId),
  }
}
