export type DevelopmentLogStatus = 'draft' | 'published'

export type DevelopmentLogSummary = {
  slug: string
  title: string
  summary: string
  tags: readonly string[]
  status: DevelopmentLogStatus
  topics: readonly string[]
}
