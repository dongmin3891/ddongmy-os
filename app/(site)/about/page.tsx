import type { Metadata } from 'next'
import AboutSection from '@/components/sections/AboutSection'
import ContactSection from '@/components/sections/ContactSection'
import SkillsSection from '@/components/sections/SkillsSection'
import PageIntro from '@/components/site/PageIntro'

export const metadata: Metadata = {
  title: 'About',
  description: '프론트엔드 개발자 천재동민의 경험, 기술과 연락처입니다.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="space-y-16">
      <PageIntro
        eyebrow="About"
        title="제품을 만들고 운영하는 프론트엔드 개발자"
        description="사용자 경험을 구현하는 일부터 배포 이후 서비스를 관찰하고 개선하는 과정까지 관심을 가집니다."
      />
      <AboutSection />
      <SkillsSection />
      <ContactSection />
    </div>
  )
}
