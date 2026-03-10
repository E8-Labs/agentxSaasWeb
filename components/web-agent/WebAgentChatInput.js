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

/** Speech recognition support (Chrome, Edge, Safari; requires HTTPS or localhost) */
function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

/** Silence duration (ms) after which dictation auto-stops */
const DICTATION_SILENCE_MS = 5000

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
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef(null)
  const appendTranscriptRef = useRef(null)
  const setInterimTranscriptRef = useRef(null)
  const silenceTimeoutRef = useRef(null)
  /** Coalesce focus + click so we only call onFocus once per user gesture (avoids drawer flicker) */
  const lastOpenCallRef = useRef(0)
  const OPEN_DEBOUNCE_MS = 150

  const handleFocus = (e) => {
    if (!onFocus) return
    const now = Date.now()
    if (now - lastOpenCallRef.current < OPEN_DEBOUNCE_MS) return
    lastOpenCallRef.current = now
    onFocus(e)
  }

  const handleClick = (e) => {
    if (!onFocus) return
    const now = Date.now()
    if (now - lastOpenCallRef.current < OPEN_DEBOUNCE_MS) return
    lastOpenCallRef.current = now
    onFocus(e)
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

  useEffect(() => {
    if (interimTranscript) requestAnimationFrame(resizeTextarea)
  }, [interimTranscript, resizeTextarea])

  const displayValue =
    (value ?? '') + (interimTranscript ? (value?.trim() ? ' ' : '') + interimTranscript : '')

  const handleChange = (e) => {
    setInterimTranscript('')
    onChange?.(e)
    requestAnimationFrame(resizeTextarea)
  }

  const appendTranscript = useCallback(
    (transcript) => {
      if (!transcript || typeof transcript !== 'string') return
      const trimmed = transcript.trim()
      if (!trimmed) return
      const current = (value ?? '').trim()
      const newValue = current ? `${current} ${trimmed}` : trimmed
      onChange?.({ target: { value: newValue } })
      requestAnimationFrame(resizeTextarea)
    },
    [value, onChange, resizeTextarea]
  )

  appendTranscriptRef.current = appendTranscript
  setInterimTranscriptRef.current = setInterimTranscript

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
  }, [])

  const scheduleSilenceStop = useCallback((recognition) => {
    clearSilenceTimeout()
    silenceTimeoutRef.current = setTimeout(() => {
      silenceTimeoutRef.current = null
      try {
        recognition?.stop()
      } catch (_) { }
    }, DICTATION_SILENCE_MS)
  }, [clearSilenceTimeout])

  const handleDictateClick = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition()
    if (!SpeechRecognitionClass) return

    let recognition = recognitionRef.current

    if (isListening && recognition) {
      clearSilenceTimeout()
      recognition.stop()
      setIsListening(false)
      setInterimTranscript('')
      return
    }

    if (!recognition) {
      recognition = new SpeechRecognitionClass()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        scheduleSilenceStop(recognitionRef.current)
      }

      recognition.onresult = (e) => {
        let finalTranscript = ''
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i += 1) {
          const result = e.results[i]
          const text = result[0]?.transcript ?? ''
          if (result.isFinal) {
            finalTranscript += text
          } else {
            interim += text
          }
        }
        if (finalTranscript && appendTranscriptRef.current) {
          appendTranscriptRef.current(finalTranscript)
          setInterimTranscriptRef.current?.('')
        }
        if (interim !== undefined && setInterimTranscriptRef.current) {
          setInterimTranscriptRef.current(interim)
        }
        scheduleSilenceStop(recognitionRef.current)
      }

      recognition.onend = () => {
        clearSilenceTimeout()
        setIsListening(false)
        setInterimTranscriptRef.current?.('')
      }

      recognition.onerror = (e) => {
        clearSilenceTimeout()
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          setIsListening(false)
          setInterimTranscriptRef.current?.('')
        }
      }

      recognitionRef.current = recognition
    }

    try {
      setInterimTranscript('')
      recognition.start()
      setIsListening(true)
    } catch (err) {
      setIsListening(false)
    }
  }, [isListening, clearSilenceTimeout, scheduleSilenceStop])

  useEffect(() => {
    return () => {
      clearSilenceTimeout()
      const recognition = recognitionRef.current
      if (recognition) {
        try {
          recognition.abort()
        } catch (_) { }
        recognitionRef.current = null
      }
      setIsListening(false)
    }
  }, [clearSilenceTimeout])

  const speechSupported = typeof window !== 'undefined' && !!getSpeechRecognition()

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
        onClick={() => {
          console.log("plus button clicked.kj", readOnly);
          if (readOnly) {
            handleFocus()
          } else {
            handlePlusClick()
          }
        }}
        className={cn(btnCircleClass, 'ml-0.5')}
        aria-label="Attach files"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
      </button>

      <textarea
        ref={inputRef}
        readOnly={readOnly}
        placeholder={placeholder}
        value={displayValue}
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
                onClick={() => {
                  console.log("plus button clicked.kj", readOnly);
                  if (readOnly) {
                    handleFocus()
                  } else {
                    handleDictateClick()
                  }
                }}
                disabled={!speechSupported}
                className={cn(
                  btnCircleClass,
                  isListening && 'bg-red-100 text-red-600 hover:bg-red-100 cursor-pointer'
                )}
                aria-label={isListening ? 'Stop dictation' : 'Dictate'}
                aria-pressed={isListening}
              >
                <Mic className="h-5 w-5 stroke-[2.5]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {!speechSupported
                ? 'Speech input not supported in this browser'
                : isListening
                  ? 'Listening… Click to stop'
                  : 'Dictate'}
            </TooltipContent>
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
                onClick={() => {
                  console.log("send button clicked.kj", readOnly);
                  if (readOnly) {
                    handleFocus()
                  }
                }}
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
