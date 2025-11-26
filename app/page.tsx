import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ContactSection from '@/components/sections/ContactSection';
import ServerMonitorWidget from '@/components/widgets/ServerMonitorWidget';

export default function Home() {
    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 메인 콘텐츠 영역 */}
                    <div className="lg:col-span-8 space-y-24">
                        <HeroSection />
                        <AboutSection />
                        <ProjectsSection />
                        <SkillsSection />
                        <ContactSection />
                    </div>

                    {/* 사이드바 - 데스크톱에서만 표시 */}
                    <aside className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-8 space-y-6">
                            <ServerMonitorWidget />
                        </div>
                    </aside>
                </div>

                {/* 모바일용 서버 모니터 - 하단에 표시 */}
                <div className="lg:hidden mt-24">
                    <ServerMonitorWidget />
                </div>
            </div>
        </main>
    );
}
