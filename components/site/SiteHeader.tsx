import Link from 'next/link'

const navigation = [
  { href: '/projects', label: 'Projects' },
  { href: '/log', label: 'Dev Log' },
  { href: '/lab', label: 'Home Lab' },
  { href: '/about', label: 'About' },
]

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link href="/" className="w-fit text-lg font-bold text-white hover:text-primary-400">
          ddongmy.com
        </Link>
        <nav aria-label="주요 탐색">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-300">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
