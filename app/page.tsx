import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ContactSection from '@/components/sections/ContactSection';

export default function Home() {
    console.log('오신것을 횐영합니다. (배포테스트)2');
    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="space-y-24">
                    <HeroSection />
                    <AboutSection />
                    <ProjectsSection />
                    <SkillsSection />
                    <ContactSection />
                </div>
            </div>
        </main>
    );
}
