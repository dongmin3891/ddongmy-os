import Link from 'next/link'
import ProjectGrid from '@/features/projects/components/ProjectGrid'
import { featuredProjects } from '@/features/projects/projects'

export default function ProjectsSection() {
  return (
    <section id="projects" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <p className="text-slate-300">직접 만들고 운영하며 문제를 해결한 프로젝트입니다.</p>
        </div>
        <Link href="/projects" className="font-medium text-primary-400 hover:text-primary-300">
          모든 프로젝트 보기 →
        </Link>
      </div>
      <ProjectGrid projects={featuredProjects} />
    </section>
  )
}
