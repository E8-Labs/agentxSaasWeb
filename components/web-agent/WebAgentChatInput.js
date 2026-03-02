'use client'

import React, { useRef } from 'react'
import { Plus, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Chat input for web-agent page. Matches design:
 * - Slightly transparent white bg, solid white border, fully rounded (pill).
 * - Placeholder "Ask me anything", body font 14px.
 * - Plus icon left, circular send button (white bg, up arrow) right.
 * Calls onFocus when user focuses or clicks (to open drawer).
 */
const WebAgentChatInput = ({
  onFocus,
  onSubmit,
  className,
  placeholder = 'Ask me anything',
  readOnly = false,
  value,
  onChange,
  ...rest
}) => {
  const inputRef = useRef(null)

  const handleFocus = (e) => {
    if (onFocus) onFocus(e)
  }

  const handleClick = (e) => {
    if (onFocus) onFocus(e)
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (onSubmit) onSubmit(e)
    else if (inputRef.current) inputRef.current.form?.requestSubmit?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-1 rounded-full transition-all duration-200',
        'border border-white bg-white/30',
        'focus-within:border-white focus-within:bg-white/40',
        'min-h-[48px] w-full max-w-full',
        className
      )}
    >
      {/* Left: plus icon */}
      <button
        type="button"
        tabIndex={-1}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-50 ml-1.5"
        aria-label="Add attachment"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
      </button>

      {/* Center: input */}
      <input
        ref={inputRef}
        type="text"
        readOnly={readOnly}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex-1 min-w-0 rounded-full bg-transparent px-2 py-2.5',
          'text-sm text-gray-900 placeholder:text-gray-500',
          'border-0 outline-none focus:outline-none focus:ring-0',
          'font-normal'
        )}
        style={{ fontSize: '14px' }}
        {...rest}
      />

      {/* Right: send button - full circle, white bg, up arrow */}
      <button
        type="submit"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-50 mr-1.5 transition-colors"
        aria-label="Send message"
      >
        <ArrowUp className="h-5 w-5 stroke-[2.5]" />
      </button>
    </form>
  )
}

export default WebAgentChatInput
