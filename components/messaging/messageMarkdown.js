'use client'

import React, { Children, isValidElement, createContext, useContext, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { simpleMarkdownToHtml } from '@/utilities/textUtils'

/** 'bullet' = native ul markers; 'ordered' = CSS counter + ::before (reliable vs list-outside + overflow/flex) */
const ListKindContext = createContext('bullet')

function filterListItemChildren(children) {
  return Children.toArray(children).filter((n) => {
    if (n == null || n === false || n === true) return false
    if (typeof n === 'string' && n.trim() === '') return false
    return true
  })
}

function DefaultMarkdownParagraph({ children }) {
  return <p className="mb-2 last:mb-0 leading-snug">{children}</p>
}

/**
 * LLMs often emit "4.\\n\\nText" which breaks list layout. Pull the next line up after "N."
 */
export function normalizeOrderedListBlankLines(text) {
  if (!text || typeof text !== 'string') return text
  return text.replace(/^(\s*\d+)\.\s*\n+(?=[^\n\r])/gm, '$1. ')
}

function MarkdownUl({ children }) {
  return (
    <ListKindContext.Provider value="bullet">
      <ul className="list-disc list-outside mb-2 space-y-0.5 my-[0.2em] pl-6 min-w-0">{children}</ul>
    </ListKindContext.Provider>
  )
}

function MarkdownOl({ children }) {
  return (
    <ListKindContext.Provider value="ordered">
      <ol className="mb-2 space-y-1 my-[0.2em] min-w-0 list-none pl-0 [counter-reset:chat-ol]">{children}</ol>
    </ListKindContext.Provider>
  )
}

/**
 * Build markdown renderers for chat bubbles. Pass a custom Paragraph for apps that need different `p` styles.
 */
export function buildMarkdownComponents(options = {}) {
  const ParagraphComponent = options.Paragraph ?? DefaultMarkdownParagraph
  const unwrappedSpanClass = options.unwrappedSpanClass ?? 'leading-snug'
  /** Same leading on the row + ::before + body so baselines match (absolute ::before was visually high) */
  const orderedLeading = options.orderedLeading ?? 'leading-snug'
  const orderedBodyClass = `min-w-0 ${orderedLeading}`

  function MarkdownListItem({ children }) {
    const kind = useContext(ListKindContext)
    const nodes = filterListItemChildren(children)
    const unwrap =
      nodes.length === 1 && isValidElement(nodes[0]) && nodes[0].type === ParagraphComponent

    const body = unwrap ? (
      <span className={unwrappedSpanClass}>{nodes[0].props.children}</span>
    ) : (
      children
    )

    if (kind === 'ordered') {
      return (
        <li
          className={
            `grid grid-cols-[2.5rem_1fr] gap-x-2 items-baseline list-none min-w-0 my-0.5 [counter-increment:chat-ol] ${orderedLeading} ` +
            'before:block before:w-full before:text-right before:pr-1.5 before:tabular-nums before:font-[inherit] before:text-[length:inherit] ' +
            "before:[content:counter(chat-ol)_'.']"
          }
        >
          <div className={`col-start-2 row-start-1 ${orderedBodyClass}`}>{body}</div>
        </li>
      )
    }

    return <li className="leading-relaxed my-[0.08em] pl-1 min-w-0">{body}</li>
  }

  return {
    p: ParagraphComponent,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    ul: MarkdownUl,
    ol: MarkdownOl,
    li: MarkdownListItem,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-brand-primary hover:opacity-80"
      >
        {children}
      </a>
    ),
    pre: ({ children }) => (
      <pre className="whitespace-pre-wrap break-words max-w-full my-2 p-2 rounded bg-muted text-sm">
        {children}
      </pre>
    ),
    code: ({ className, children }) => {
      const isBlock = className?.includes('language-')
      return isBlock ? (
        <code className={`${className || ''} whitespace-pre-wrap break-words`}>{children}</code>
      ) : (
        <code className="break-words rounded px-1 py-0.5 bg-muted">{children}</code>
      )
    },
  }
}

export const messageMarkdownComponents = buildMarkdownComponents()

/**
 * Renders message content as markdown using react-markdown + remark-gfm.
 * Use when content is plain text or markdown (no raw HTML).
 */
export function MessageMarkdown({ content, className = '' }) {
  const normalized = useMemo(
    () => (content && typeof content === 'string' ? normalizeOrderedListBlankLines(content) : content),
    [content]
  )
  if (!normalized || typeof normalized !== 'string') return null
  return (
    <span className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={messageMarkdownComponents}>
        {normalized}
      </ReactMarkdown>
    </span>
  )
}

/**
 * Convert markdown list lines (- item / * item) to <ul><li> so composer and bubbles show real bullets.
 * Runs before simpleMarkdownToHtml so list items can still contain **bold** and [links](url).
 */
function markdownListBlocksToHtml(text) {
  if (!text || typeof text !== 'string') return text
  const lines = text.split('\n')
  const out = []
  let listItems = []

  const flushList = () => {
    if (listItems.length === 0) return
    const ul = '<ul>' + listItems.map((item) => '<li>' + item + '</li>').join('') + '</ul>'
    out.push(ul)
    listItems = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const unorderedMatch = line.match(/^\s*[-*]\s+(.*)$/)
    if (unorderedMatch) {
      listItems.push(unorderedMatch[1])
      continue
    }
    flushList()
    out.push(line)
  }
  flushList()
  return out.join('\n')
}

/**
 * Convert markdown to HTML string for sending in emails / populating composer.
 * Matches MessageMarkdown display: **bold**, [text](url) links, lists (- / *), and newlines as <br>.
 * Use before appending body to send-email API or when setting draft content in composer.
 */
export function messageMarkdownToHtml(text) {
  if (!text || typeof text !== 'string') return text
  const withLists = markdownListBlocksToHtml(text)
  const withMarkdown = simpleMarkdownToHtml(withLists)
  return withMarkdown.replace(/\n/g, '<br>')
}
