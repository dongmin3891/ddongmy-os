import Link from 'next/link'
import ProjectLinks from '@/features/projects/components/ProjectLinks'
import { getProjectCategoryLabel, type ProjectCaseStudy } from '@/features/projects/project'
import { featuredProjects } from '@/features/projects/projects'

export default function ProjectsSection() {
  return (
    <section id="selected-work" className="space-y-6 scroll-mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Selected work
          </p>
          <h2 className="text-3xl font-bold text-white">제품과 운영, 두 가지 관점</h2>
        </div>
        <Link href="/projects" className="font-medium text-primary-400 hover:text-primary-300">
          모든 프로젝트 보기 →
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {featuredProjects.map((project, index) => (
          <FeaturedProjectCard key={project.slug} project={project} index={index + 1} />
        ))}
      </div>
    </section>
  )
}

type FeaturedProjectCardProps = {
  project: ProjectCaseStudy
  index: number
}

function FeaturedProjectCard({ project, index }: FeaturedProjectCardProps) {
  return (
    <article className="group flex min-h-80 flex-col rounded-xl border border-slate-700 bg-slate-800/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary-400/60 hover:shadow-xl hover:shadow-slate-950/30 motion-reduce:transform-none motion-reduce:transition-none sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <span className="font-mono text-sm text-primary-300">0{index}</span>
        <span className="rounded-full border border-slate-600 px-3 py-1 text-xs font-medium text-slate-300">
          {getProjectCategoryLabel(project.category)}
        </span>
      </div>
      <div className="mt-10 flex-1">
        <h3 className="text-3xl font-bold text-white transition-colors group-hover:text-primary-300">
          {project.name}
        </h3>
        <p className="mt-4 max-w-xl leading-relaxed text-slate-300">{project.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.name} 기술`}>
          {project.technologies.map((technology) => (
            <li key={technology} className="rounded bg-slate-700 px-2.5 py-1 text-xs text-slate-300">
              {technology}
            </li>
          ))}
        </ul>
      </div>
      {project.links && (
        <ProjectLinks
          links={project.links}
          className="mt-8 border-t border-slate-700 pt-5"
        />
      )}
    </article>
  )
}
