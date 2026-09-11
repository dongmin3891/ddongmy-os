'use client'

import { useEffect, useId, useState } from 'react'

type MermaidDiagramProps = {
  chart: string
}

let mermaidPromise: Promise<(typeof import('mermaid'))['default']> | undefined

function loadMermaid() {
  mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'dark',
      themeVariables: {
        background: '#020617',
        fontFamily: 'var(--font-pretendard)',
        lineColor: '#94a3b8',
        primaryBorderColor: '#60a5fa',
        primaryColor: '#1e293b',
        primaryTextColor: '#f1f5f9',
      },
    })

    return mermaid
  })

  return mermaidPromise
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const reactId = useId()
  const [svg, setSvg] = useState<string>()
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function renderDiagram() {
      try {
        const mermaid = await loadMermaid()
        const diagramId = `mermaid-${reactId.replaceAll(':', '')}`
        const result = await mermaid.render(diagramId, chart)

        if (isCurrent) {
          setSvg(result.svg)
        }
      } catch {
        if (isCurrent) {
          setHasError(true)
        }
      }
    }

    void renderDiagram()

    return () => {
      isCurrent = false
    }
  }, [chart, reactId])

  if (hasError) {
    return (
      <div className="mermaid-fallback">
        <p>다이어그램을 표시할 수 없어 원문을 보여드립니다.</p>
        <pre>
          <code className="language-mermaid">{chart}</code>
        </pre>
      </div>
    )
  }

  if (!svg) {
    return <div className="mermaid-loading" aria-label="다이어그램을 불러오는 중" />
  }

  return (
    <div
      className="mermaid-diagram"
      role="img"
      aria-label="본문 흐름도"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
