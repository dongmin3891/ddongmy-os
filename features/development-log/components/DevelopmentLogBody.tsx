import { isValidElement, type ReactNode } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
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

    if (
      isValidElement<MarkdownCodeProps>(children) &&
      children.props.className === 'language-mermaid'
    ) {
      return <MermaidDiagram chart={String(children.props.children).trim()} />
    }

    return <pre {...props}>{children}</pre>
  },
}

export default function DevelopmentLogBody({ markdown }: DevelopmentLogBodyProps) {
  return (
    <div className="development-log-body">
      <Markdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {normalizeNotionMarkdown(markdown)}
      </Markdown>
    </div>
  )
}
