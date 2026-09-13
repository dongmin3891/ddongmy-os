import { isValidElement, type ReactNode } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { normalizeNotionMarkdown } from '../notion-markdown'
import MermaidDiagram from './MermaidDiagram'

type DevelopmentLogBodyProps = {
  markdown: string
}

type MarkdownCodeProps = {
  children?: ReactNode
  className?: string
}

const markdownComponents: Components = {
  pre({ children, node, ...props }) {
    void node

    if (!isValidElement<MarkdownCodeProps>(children)) {
      return <pre {...props}>{children}</pre>
    }

    const language = children.props.className?.match(/language-([\w-]+)/)?.[1]

    if (language === 'mermaid') {
      return <MermaidDiagram chart={String(children.props.children).trim()} />
    }

    return (
      <div className="code-block">
        {language && <div className="code-block-language">{language}</div>}
        <pre {...props}>{children}</pre>
      </div>
    )
  },
}

export default function DevelopmentLogBody({ markdown }: DevelopmentLogBodyProps) {
  return (
    <div className="development-log-body">
      <Markdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      >
        {normalizeNotionMarkdown(markdown)}
      </Markdown>
    </div>
  )
}
