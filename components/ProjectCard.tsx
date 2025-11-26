import { Project } from '@/types';

interface ProjectCardProps {
    project: Project;
    statusLabel: string;
    statusColor: string;
}

export default function ProjectCard({ project, statusLabel, statusColor }: ProjectCardProps) {
    return (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>{statusLabel}</span>
            </div>
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        {tech}
                    </span>
                ))}
            </div>
            <div className="flex gap-3">
                {project.link && (
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                        사이트 보기 →
                    </a>
                )}
                {project.github && (
                    <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                        GitHub →
                    </a>
                )}
            </div>
        </div>
    );
}
