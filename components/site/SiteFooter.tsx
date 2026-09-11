import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>This site is running on my home server.</p>
        <div className="flex gap-4">
          <Link href="/lab" className="hover:text-white">
            Home Lab
          </Link>
          <a href="https://github.com/dongmin3891" target="_blank" rel="noreferrer" className="hover:text-white">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
