import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400">404</p>
      <h1 className="mt-4 text-4xl font-bold text-white">페이지를 찾을 수 없습니다</h1>
      <p className="mt-4 text-slate-300">주소를 다시 확인하거나 홈에서 원하는 내용을 찾아보세요.</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-primary-500 px-5 py-3 font-medium text-white hover:bg-primary-600"
      >
        홈으로 이동
      </Link>
    </div>
  )
}
