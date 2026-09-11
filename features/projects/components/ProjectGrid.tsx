import type { ProjectSummary } from '../project'
import ProjectCard from './ProjectCard'

type ProjectGridProps = {
  projects: readonly ProjectSummary[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return <p className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-300">표시할 프로젝트가 없습니다.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
