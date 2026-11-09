import { notFound } from 'next/navigation'
import LogViewCounterFixture from './LogViewCounterFixture'

export const dynamic = 'force-dynamic'

export default function LogViewCounterFixturePage() {
  if (process.env.PLAYWRIGHT_TEST !== '1') notFound()

  return <LogViewCounterFixture />
}
