export type ProjectStatus = 'operational' | 'development' | 'experimental'
export type ProjectCategory = 'product' | 'platform'

export type ProjectLink = {
  label: string
  href: string
  isExternal?: boolean
}

export type ProjectSummary = {
  slug: string
  name: string
  description: string
  technologies: readonly string[]
  status: ProjectStatus
  category: ProjectCategory
}

export type ProjectDecision = {
  title: string
  description: string
}

export type ProjectCaseStudy = ProjectSummary & {
  featuredOrder?: number
  challenge: string
  approach: string
  scope: readonly string[]
  decisions: readonly ProjectDecision[]
  links: readonly ProjectLink[]
}

export function getProjectCategoryLabel(category: ProjectCategory) {
  switch (category) {
    case 'product':
      return 'Product'
    case 'platform':
      return 'Platform'
  }
}
