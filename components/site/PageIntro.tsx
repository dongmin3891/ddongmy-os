type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

export default function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <header className="max-w-3xl space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">{eyebrow}</p>
      <h1 className="text-balance text-4xl font-bold text-white sm:text-5xl">{title}</h1>
      <p className="text-lg leading-relaxed text-slate-300">{description}</p>
    </header>
  )
}
