'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { simpleMarkdownToHtml } from '@/utilities/textUtils'

/**
 * Shared markdown components for message bubbles (EmailBubble, MessageBubble).
 * Renders **bold**, [text](url) links, lists, etc. Links open in new tab with brand styling.
 */
export const messageMarkdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-snug">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5 my-[0.2em] pl-[1.15em]">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5 my-[0.2em] pl-[1.15em]">{children}</ol>,
  li: ({ children }) => (
    <li className="leading-relaxed my-[0.08em] [&>p]:inline [&>p]:m-0 [&>p:not(:last-child)]:mr-1">
      {children}
    </li>
  ),
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

/**
 * Renders message content as markdown using react-markdown + remark-gfm.
 * Use when content is plain text or markdown (no raw HTML).
 */
export function MessageMarkdown({ content, className = '' }) {
  if (!content || typeof content !== 'string') return null
  return (
    <span className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={messageMarkdownComponents}>
        {content}
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
