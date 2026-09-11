import type { Metadata } from 'next'
import PageIntro from '@/components/site/PageIntro'
import ProjectGrid from '@/features/projects/components/ProjectGrid'
import { projects } from '@/features/projects/projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: '문제, 역할, 해결 과정과 결과를 중심으로 정리한 프로젝트입니다.',
  alternates: { canonical: '/projects' },
}

export default function ProjectsPage() {
  return (
    <div className="space-y-12">
      <PageIntro
        eyebrow="Portfolio"
        title="Projects"
        description="사용자의 문제를 해결하고 직접 운영하며 개선한 프로젝트를 소개합니다."
      />
      <ProjectGrid projects={projects} />
    </div>
  )
}
