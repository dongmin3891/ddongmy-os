import { Skill } from '@/types'

const skills: Skill[] = [
  {
    category: '프론트엔드',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'React Query'],
  },
  {
    category: '인프라',
    items: ['Docker', 'Nginx', 'Linux', 'Netdata', 'CI/CD'],
  },
  {
    category: '기타',
    items: ['Git', 'VS Code', 'Figma', 'WebView'],
  },
]

export default function SkillsSection() {
  return (
    <section id="skills" className="space-y-6">
      <h2 className="text-3xl font-bold">Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <div
            key={skill.category}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700"
          >
            <h3 className="text-lg font-semibold mb-4 text-primary-400">
              {skill.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

