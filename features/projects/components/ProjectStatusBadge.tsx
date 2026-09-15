import type { ProjectStatus } from '../project'

const statusPresentation: Record<ProjectStatus, { label: string; className: string }> = {
  operational: { label: '운영 중', className: 'bg-emerald-500/15 text-emerald-300' },
  development: { label: '개발 중', className: 'bg-amber-500/15 text-amber-300' },
  experimental: { label: '실험', className: 'bg-violet-500/15 text-violet-300' },
}

type ProjectStatusBadgeProps = {
  status: ProjectStatus
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const presentation = statusPresentation[status]

  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${presentation.className}`}>
      {presentation.label}
    </span>
  )
}
