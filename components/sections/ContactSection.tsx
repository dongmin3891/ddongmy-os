export default function ContactSection() {
  return (
    <section id="contact" className="space-y-6">
      <h2 className="text-3xl font-bold">Contact</h2>
      <p className="text-slate-300 leading-relaxed">
        협업이나 문의가 필요하시면 언제든지 연락주세요.
      </p>
      <div className="flex flex-wrap gap-6 pt-4">
        <a
          href="https://github.com/ddongmy"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
        >
          GitHub
        </a>
        <a
          href="mailto:contact@ddongmy.com"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
        >
          Email
        </a>
      </div>
    </section>
  )
}

