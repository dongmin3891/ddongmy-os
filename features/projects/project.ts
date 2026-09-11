export type ProjectStatus = 'operational' | 'development' | 'experimental'

export type ProjectSummary = {
  id: string
  name: string
  description: string
  technologies: readonly string[]
  status: ProjectStatus
  isFeatured: boolean
  siteUrl?: string
  githubUrl?: string
}
