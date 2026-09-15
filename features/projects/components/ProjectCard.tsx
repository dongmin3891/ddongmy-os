import Link from 'next/link'
import { getProjectCategoryLabel, type ProjectSummary } from '../project'
import ProjectStatusBadge from './ProjectStatusBadge'

type ProjectCardProps = {
  project: ProjectSummary
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative flex min-h-72 flex-col rounded-xl border border-slate-700 bg-slate-800/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary-400/60 hover:shadow-xl hover:shadow-slate-950/30 focus-within:ring-2 focus-within:ring-primary-400 motion-reduce:transform-none motion-reduce:transition-none">
      <div className="mb-3 flex items-start justify-between gap-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
          {getProjectCategoryLabel(project.category)}
        </span>
        <ProjectStatusBadge status={project.status} />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white transition-colors group-hover:text-primary-300">
        <Link
          href={`/projects/${project.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {project.name}
        </Link>
      </h2>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">{project.description}</p>
      <ul className="mb-5 flex flex-wrap gap-2" aria-label={`${project.name} 기술`}>
        {project.technologies.map((technology) => (
          <li key={technology} className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
            {technology}
          </li>
        ))}
      </ul>
      <span className="text-sm font-semibold text-primary-300" aria-hidden="true">
        Case study 보기 →
      </span>
    </article>
  )
}
