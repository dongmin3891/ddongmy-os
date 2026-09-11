const calloutPattern = /<callout\b[^>]*>([\s\S]*?)<\/callout>/gi
const lineBreakPattern = /<br\s*\/?>/gi
const tableOfContentsPattern = /<table_of_contents\s*\/>/gi

function toBlockquote(content: string) {
  return content
    .replace(lineBreakPattern, '\n')
    .trim()
    .split('\n')
    .map((line) => `> ${line.trim()}`)
    .join('\n')
}

export function normalizeNotionMarkdown(markdown: string) {
  return markdown
    .replace(calloutPattern, (_, content: string) => `${toBlockquote(content)}\n`)
    .replace(tableOfContentsPattern, '')
    .replace(lineBreakPattern, '  \n')
}
