import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

type DevelopmentLogBodyProps = {
  markdown: string
}

export default function DevelopmentLogBody({ markdown }: DevelopmentLogBodyProps) {
  return (
    <div className="development-log-body">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {markdown}
      </Markdown>
    </div>
  )
}
