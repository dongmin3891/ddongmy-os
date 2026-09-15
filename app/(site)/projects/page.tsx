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
        eyebrow="Projects"
        title="문제를 제품으로 풀어낸 기록"
        description="사용자의 문제, 직접 다룬 범위와 기술적 선택을 프로젝트별 Case Study로 정리했습니다."
      />
      <ProjectGrid projects={projects} />
    </div>
  )
}
