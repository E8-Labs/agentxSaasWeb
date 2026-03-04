'use client'

import React, { useRef } from 'react'
import { Plus, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const btnCircleClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition-colors'

/**
 * Chat input: Plus (attach files) left, input center, Send right. onFocus opens drawer when used on bar.
 */
const WebAgentChatInput = ({
  onFocus,
  onSubmit,
  onAttachFiles,
  accept,
  className,
  placeholder = 'Ask me anything',
  readOnly = false,
  value,
  onChange,
  inputRef: inputRefProp,
  disabled = false,
  ...rest
}) => {
  const inputRefLocal = useRef(null)
  const inputRef = inputRefProp ?? inputRefLocal
  const fileInputRef = useRef(null)

  const handleFocus = (e) => {
    if (onFocus) onFocus(e)
  }

  const handleClick = (e) => {
    if (onFocus) onFocus(e)
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (disabled) return
    if (onSubmit) onSubmit(e)
    else if (inputRef.current) inputRef.current.form?.requestSubmit?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handlePlusClick = () => {
    if (readOnly) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files?.length && onAttachFiles) {
      onAttachFiles(Array.from(files))
    }
    e.target.value = ''
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-1.5 rounded-full transition-all duration-200',
        'border-2 border-white bg-white/30',
        'focus-within:border-brand-primary focus-within:bg-white/40',
        'focus-within:shadow-brand-glow',
        'min-h-[48px] w-full max-w-full',
        'px-1.5 py-1',
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={handlePlusClick}
        className={cn(btnCircleClass, 'ml-0.5')}
        aria-label="Attach files"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
      </button>

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
        disabled={disabled}
        className={cn(
          'flex-1 min-w-0 rounded-xl bg-transparent px-2 py-2.5',
          'text-sm text-gray-900 placeholder:text-gray-500',
          'border-0 outline-none focus:outline-none focus:ring-0',
          'font-normal'
        )}
        style={{ fontSize: '14px' }}
        {...rest}
      />

      <button
        type="submit"
        disabled={disabled}
        className={cn(btnCircleClass, 'mr-0.5', disabled && 'opacity-50 cursor-not-allowed')}
        aria-label="Send message"
      >
        <ArrowUp className="h-5 w-5 stroke-[2.5]" />
      </button>
    </form>
  )
}

export default WebAgentChatInput
