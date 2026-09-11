import type { ProjectStatus, ProjectSummary } from '../project'

const statusPresentation: Record<ProjectStatus, { label: string; className: string }> = {
  operational: { label: '운영 중', className: 'bg-green-500/20 text-green-300' },
  development: { label: '개발 중', className: 'bg-yellow-500/20 text-yellow-300' },
  experimental: { label: '실험', className: 'bg-purple-500/20 text-purple-300' },
}

type ProjectCardProps = {
  project: ProjectSummary
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const status = statusPresentation[project.status]

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-700 bg-slate-800 p-6 transition-colors hover:border-slate-600">
      <div className="mb-3 flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold text-white">{project.name}</h2>
        <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-300">{project.description}</p>
      <ul className="mb-5 flex flex-wrap gap-2" aria-label={`${project.name} 기술`}>
        {project.technologies.map((technology) => (
          <li key={technology} className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
            {technology}
          </li>
        ))}
      </ul>
      {(project.siteUrl || project.githubUrl) && (
        <div className="flex gap-4 text-sm font-medium">
          {project.siteUrl && (
            <a href={project.siteUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300">
              사이트 보기 →
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200">
              GitHub →
            </a>
          )}
        </div>
      )}
    </article>
  )
}
