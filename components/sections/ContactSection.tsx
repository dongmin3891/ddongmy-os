export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-10"
      aria-labelledby="contact-title"
    >
      <div
        className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-primary-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">
            Contact
          </p>
          <h2 id="contact-title" className="mt-3 text-3xl font-bold text-white">
            같이 이야기해 볼까요?
          </h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            제품 개발, 프론트엔드와 직접 운영하는 서비스에 관한 이야기를 환영합니다.
          </p>
          <a
            href="mailto:rlaehdals753@naver.com"
            className="mt-3 inline-block text-sm text-slate-400 hover:text-white"
          >
            rlaehdals753@naver.com
          </a>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:rlaehdals753@naver.com"
            className="rounded-lg bg-primary-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
          >
            이메일 보내기
          </a>
          <a
            href="https://github.com/dongmin3891"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-600 bg-slate-800 px-5 py-3 font-semibold text-white transition-colors hover:border-slate-500 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
          >
            GitHub 보기
          </a>
        </div>
      </div>
    </section>
  )
}
