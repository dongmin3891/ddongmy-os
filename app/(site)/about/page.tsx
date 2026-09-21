import type { Metadata } from 'next'
import AboutSection from '@/components/sections/AboutSection'
import ContactSection from '@/components/sections/ContactSection'
import ExperienceSection from '@/components/sections/ExperienceSection'
import SkillsSection from '@/components/sections/SkillsSection'
import PageIntro from '@/components/site/PageIntro'

export const metadata: Metadata = {
  title: 'About',
  description:
    '약 5년간 React와 Next.js 기반 상용 웹·WebView 서비스를 개발하고 운영한 프론트엔드 개발자 천재동민입니다.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <PageIntro
        eyebrow="About"
        title="화면에서 시작해, 운영까지 이해합니다"
        description="약 5년간 React·Next.js 기반 상용 웹과 WebView 서비스를 개발하며 성능, 데이터 흐름과 운영 장애까지 함께 해결해 왔습니다."
      />
      <ExperienceSection />
      <AboutSection />
      <SkillsSection />
      <ContactSection />
    </div>
  )
}
