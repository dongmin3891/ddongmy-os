import Link from 'next/link'
import { getProjectCategoryLabel, type ProjectCaseStudy as ProjectCaseStudyModel } from '../project'
import ProjectLinks from './ProjectLinks'
import ProjectStatusBadge from './ProjectStatusBadge'

type ProjectCaseStudyProps = {
  project: ProjectCaseStudyModel
}

export default function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  return (
    <article className="space-y-10">
      <header className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-10">
        <div
          className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary-500/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <Link
            href="/projects"
            className="text-sm font-semibold text-slate-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
          >
            ← Projects
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              {getProjectCategoryLabel(project.category)} case study
            </span>
            <ProjectStatusBadge status={project.status} />
          </div>
          <h1 className="mt-4 text-balance text-4xl font-bold text-white sm:text-6xl">
            {project.name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
            {project.description}
          </p>
          <ProjectLinks links={project.links} className="mt-8" />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <section
          className="rounded-xl border border-slate-700 bg-slate-800/70 p-6 sm:p-8 lg:col-span-7"
          aria-labelledby="project-challenge-title"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Challenge
          </p>
          <h2 id="project-challenge-title" className="mt-3 text-2xl font-bold text-white">
            해결하려던 문제
          </h2>
          <p className="mt-5 leading-8 text-slate-300">{project.challenge}</p>
          <p className="mt-5 leading-8 text-slate-300">{project.approach}</p>
        </section>

        <section
          className="rounded-xl border border-slate-700 bg-slate-900 p-6 sm:p-8 lg:col-span-5"
          aria-labelledby="project-scope-title"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Scope
          </p>
          <h2 id="project-scope-title" className="mt-3 text-2xl font-bold text-white">
            직접 다룬 영역
          </h2>
          <ul className="mt-6 divide-y divide-slate-700">
            {project.scope.map((item, index) => (
              <li key={item} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <span className="font-mono text-xs font-semibold text-primary-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-relaxed text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-6" aria-labelledby="project-decisions-title">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Decisions
          </p>
          <h2 id="project-decisions-title" className="text-3xl font-bold text-white">
            주요 기술적 선택
          </h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {project.decisions.map((decision, index) => (
            <li
              key={decision.title}
              className="rounded-xl border border-slate-700 bg-slate-800/70 p-6"
            >
              <span className="font-mono text-xs font-semibold text-primary-300">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 text-lg font-bold text-white">{decision.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {decision.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="flex flex-col gap-6 rounded-xl border border-slate-700 bg-slate-900 p-6 sm:p-8 md:flex-row md:items-end md:justify-between"
        aria-labelledby="project-stack-title"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Technology
          </p>
          <h2 id="project-stack-title" className="mt-3 text-2xl font-bold text-white">
            사용 기술
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.name} 사용 기술`}>
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-300"
              >
                {technology}
              </li>
            ))}
          </ul>
        </div>
        <ProjectLinks links={project.links} className="shrink-0" />
      </section>
    </article>
  )
}
