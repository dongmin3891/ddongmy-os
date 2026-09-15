import Link from 'next/link'
import type { ProjectLink } from '../project'

type ProjectLinksProps = {
  links: readonly ProjectLink[]
  className?: string
}

export default function ProjectLinks({ links, className = '' }: ProjectLinksProps) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold ${className}`}>
      {links.map((link, index) => {
        const linkClassName =
          index === 0
            ? 'text-primary-300 hover:text-primary-200'
            : 'text-slate-400 hover:text-white'

        if (link.isExternal) {
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              {link.label} →
            </a>
          )
        }

        return (
          <Link key={link.href} href={link.href} className={linkClassName}>
            {link.label} →
          </Link>
        )
      })}
    </div>
  )
}
