import type { Metadata } from 'next'
import AboutSection from '@/components/sections/AboutSection'
import ContactSection from '@/components/sections/ContactSection'
import SkillsSection from '@/components/sections/SkillsSection'
import PageIntro from '@/components/site/PageIntro'

export const metadata: Metadata = {
  title: 'About',
  description: '제품을 만들고 직접 운영하며 개선하는 프론트엔드 개발자 천재동민입니다.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <PageIntro
        eyebrow="About"
        title="화면에서 시작해, 운영까지 이해합니다"
        description="사용자 경험을 구현하는 프론트엔드에서 출발해 API, 배포와 운영 환경까지 직접 다루며 제품을 개선합니다."
      />
      <AboutSection />
      <SkillsSection />
      <ContactSection />
    </div>
  )
}
