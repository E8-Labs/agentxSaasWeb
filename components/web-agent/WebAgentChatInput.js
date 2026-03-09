'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import { Plus, ArrowUp, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const btnCircleClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition-colors'

/** Max height for textarea (~5 lines at 14px text + padding) */
const TEXTAREA_MAX_HEIGHT_PX = 120
/** Height above which we consider the input multi-line (align buttons bottom, reduce radius) */
const SINGLE_LINE_HEIGHT_PX = 48

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
  const [isMultiLine, setIsMultiLine] = useState(false)

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

  const resizeTextarea = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = '0'
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`
    setIsMultiLine(el.offsetHeight > SINGLE_LINE_HEIGHT_PX)
  }, [])

  useEffect(() => {
    resizeTextarea()
  }, [value, resizeTextarea])

  const handleChange = (e) => {
    onChange?.(e)
    requestAnimationFrame(resizeTextarea)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex gap-1.5 transition-all duration-200',
        'border-2 border-white bg-white/30',
        'focus-within:border-brand-primary focus-within:bg-white/40',
        'focus-within:shadow-brand-glow',
        'min-h-[48px] w-full max-w-full',
        'px-1.5 py-1',
        isMultiLine ? 'items-end rounded-[15px]' : 'items-center rounded-full',
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

      <textarea
        ref={inputRef}
        readOnly={readOnly}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onClick={handleClick}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 min-w-0 rounded-xl bg-transparent px-2 py-2.5 resize-none',
          'text-sm text-gray-900 placeholder:text-gray-500',
          'border-0 outline-none focus:outline-none focus:ring-0',
          'font-normal min-h-[40px] max-h-[120px] overflow-y-auto'
        )}
        style={{ fontSize: '14px' }}
        aria-label="Message input"
        {...rest}
      />

      <div className={cn('flex flex-row gap-1 mr-0.5 shrink-0', isMultiLine ? 'items-end' : 'items-center')}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(btnCircleClass)}
                aria-label="Dictate"
              >
                <Mic className="h-5 w-5 stroke-[2.5]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Dictate</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="submit"
                disabled={disabled}
                className={cn(btnCircleClass, '', disabled && 'opacity-50 cursor-not-allowed')}
                aria-label="Send message"
              >
                <ArrowUp className="h-5 w-5 stroke-[2.5]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Send</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </form>
  )
}

export default WebAgentChatInput
