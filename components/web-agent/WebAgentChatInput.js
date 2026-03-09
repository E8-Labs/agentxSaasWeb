'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { Plus, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconBtnClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[9999px] bg-[rgba(255,255,255,0.39)] border border-white text-gray-600 shadow-[0_23px_30.7px_0_rgba(0,0,0,0.05)] hover:bg-white/50 active:scale-[0.98] transition-all duration-200 ease-in-out'

const MIN_ROWS = 1
const MAX_HEIGHT_PX = 200

/**
 * Chat input: Plus (attach files) left, multi-line textarea center, Send right.
 * ChatGPT-style: Enter sends, Shift+Enter adds new line. Auto-grows up to max height.
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
  rightSlot,
  ...rest
}) => {
  const inputRefLocal = useRef(null)
  const inputRef = inputRefProp ?? inputRefLocal
  const fileInputRef = useRef(null)

  const adjustHeight = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, MAX_HEIGHT_PX)
    el.style.height = `${Math.max(newHeight, 24)}px`
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? 'auto' : 'hidden'
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleFocus = (e) => {
    if (onFocus) onFocus(e)
  }

  const handleClick = (e) => {
    if (onFocus) onFocus(e)
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    const hasValue = (value?.trim() ?? '').length > 0
    if (disabled || !hasValue) return
    if (onSubmit) onSubmit(e)
    else if (inputRef.current) inputRef.current.form?.requestSubmit?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleChange = (e) => {
    onChange?.(e)
    adjustHeight()
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

  const hasValue = (value?.trim() ?? '').length > 0
  const isSendDisabled = disabled || !hasValue

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col rounded-[24px] transition-all duration-200 ease-out',
        'border border-white bg-white/[0.98] backdrop-blur-[34px]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
        'focus-within:border-white focus-within:bg-white/[0.98] focus-within:shadow-[0_16px_28px_rgba(0,0,0,0.1)]',
        'min-h-[48px] w-full max-w-full',
        'p-1.5',
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

      {/* Full-width textarea: grows with content */}
      <textarea
        ref={inputRef}
        rows={MIN_ROWS}
        readOnly={readOnly}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'w-full min-w-0 rounded-[24px] bg-transparent px-2 py-2.5 resize-none',
          'text-sm text-gray-900 placeholder:text-gray-500',
          'border-0 outline-none focus:outline-none focus:ring-0',
          'font-normal leading-normal'
        )}
        style={{
          fontSize: '14px',
          minHeight: '24px',
          maxHeight: `${MAX_HEIGHT_PX}px`,
          overflowY: 'hidden',
        }}
        {...rest}
      />

      {/* ChatGPT-style: Plus left, Model + Send right */}
      <div className="flex flex-row items-center justify-between mt-1 min-h-[40px] gap-1.5">
        <button
          type="button"
          tabIndex={-1}
          onClick={handlePlusClick}
          className={cn(iconBtnClass, 'shrink-0')}
          aria-label="Attach files"
        >
          <Plus className="w-[18px] h-[18px] stroke-[2.5]" />
        </button>
        <div className="flex flex-row items-center gap-1.5 shrink-0">
          {rightSlot}
          <button
            type="submit"
            disabled={isSendDisabled}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-[9999px] border shadow-[0_23px_30.7px_0_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all duration-200 ease-in-out',
              isSendDisabled
                ? 'bg-[rgba(255,255,255,0.39)] border-white cursor-not-allowed'
                : 'bg-brand-primary border-brand-primary hover:bg-brand-primary/90 cursor-pointer'
            )}
            aria-label="Send message"
          >
            <ArrowUp
              className={cn(
                'w-[18px] h-[18px] stroke-[2.5]',
                isSendDisabled ? 'text-gray-400' : 'text-white'
              )}
            />
          </button>
        </div>
      </div>
    </form>
  )
}

export default WebAgentChatInput
