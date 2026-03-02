'use client'

import React, { useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Chat input for web-agent page. Shows neutral border by default;
 * on focus shows gradient border and shadow (brand colors).
 * Calls onFocus when user focuses or clicks (to open drawer).
 */
const WebAgentChatInput = ({
  onFocus,
  className,
  placeholder = 'Type your message…',
  readOnly = false,
  ...rest
}) => {
  const inputRef = useRef(null)

  const handleFocus = (e) => {
    if (onFocus) onFocus(e)
  }

  const handleClick = (e) => {
    if (onFocus) onFocus(e)
  }

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        'border border-gray-200 bg-white',
        'focus-within:border-0 focus-within:p-[2px] focus-within:bg-gradient-to-br focus-within:from-[hsl(var(--brand-primary))] focus-within:to-[hsl(var(--brand-secondary))]',
        'focus-within:shadow-[0_4px_14px_hsl(var(--brand-primary)/0.35)]',
        className
      )}
    >
      <input
        ref={inputRef}
        type="text"
        readOnly={readOnly}
        placeholder={placeholder}
        onFocus={handleFocus}
        onClick={handleClick}
        className={cn(
          'w-full rounded-[10px] bg-white px-4 py-3 text-[15px] font-medium',
          'placeholder:text-gray-500',
          'border-0 outline-none focus:outline-none focus:ring-0',
          'min-h-[44px] focus-within:min-h-[44px]'
        )}
        {...rest}
      />
    </div>
  )
}

export default WebAgentChatInput
