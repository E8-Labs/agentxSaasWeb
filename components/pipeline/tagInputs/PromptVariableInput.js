import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const normalizeVariableLabel = (value) =>
  String(value || '')
    .trim()
    .replace(/^\{+/, '')
    .replace(/\}+$/, '')
    .trim()

const dedupeNormalizedVariables = (list) => {
  const result = []
  const seen = new Set()

  for (const item of list || []) {
    const label = normalizeVariableLabel(item)
    if (!label) continue
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(label)
  }

  return result
}

export const PromptVariableInput = ({
  promptTag,
  kycsList,
  tagValue,
  uniqueColumns,
  limit,
  placeholder = 'Type here...',
  fillHeight = false,
  showSaveChangesBtn = false,
  isSubject = false,
}) => {
  const [text, setText] = useState(promptTag || '')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [isVariableMenuOpen, setIsVariableMenuOpen] = useState(false)
  const textareaRef = useRef(null)
  const selectionRef = useRef({ start: 0, end: 0 })
  const scrollRef = useRef({ top: 0, left: 0 })

  useEffect(() => {
    setText(promptTag || '')
  }, [promptTag])

  const variableOptions = useMemo(() => {
    const defaultColumns = ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Kyc']
    const kycQuestions = Array.isArray(kycsList)
      ? kycsList.map((item) => item?.question).filter(Boolean)
      : []

    return dedupeNormalizedVariables([
      ...defaultColumns,
      ...(Array.isArray(uniqueColumns) ? uniqueColumns : []),
      ...kycQuestions,
    ])
  }, [kycsList, uniqueColumns])

  const storeSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    selectionRef.current = {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0,
    }
    scrollRef.current = {
      top: textarea.scrollTop ?? 0,
      left: textarea.scrollLeft ?? 0,
    }
  }

  const restoreSelection = (start, end = start) => {
    const textarea = textareaRef.current
    if (!textarea) return
    try {
      textarea.focus({ preventScroll: true })
    } catch {
      textarea.focus()
    }
    textarea.setSelectionRange(start, end)
    textarea.scrollTop = scrollRef.current.top ?? 0
    textarea.scrollLeft = scrollRef.current.left ?? 0
    selectionRef.current = { start, end }
  }

  const insertVariable = (value) => {
    const label = normalizeVariableLabel(value)
    if (!label) return

    const safeText = text || ''
    const start = Math.max(0, Math.min(selectionRef.current.start ?? 0, safeText.length))
    const end = Math.max(0, Math.min(selectionRef.current.end ?? start, safeText.length))
    const before = safeText.slice(0, start)
    const after = safeText.slice(end)
    const token = `{${label}}`
    const updated = `${before}${token}${after}`
    const nextCaret = before.length + token.length
    const textarea = textareaRef.current
    const prevScrollTop = textarea?.scrollTop ?? 0
    const prevScrollLeft = textarea?.scrollLeft ?? 0

    setText(updated)
    tagValue(updated)
    scrollRef.current = {
      top: prevScrollTop,
      left: prevScrollLeft,
    }

    requestAnimationFrame(() => {
      restoreSelection(nextCaret)
    })
  }

  const textareaHeight = fillHeight
    ? { minHeight: 120, flex: 1 }
    : {
        height: isSubject
          ? 'calc(7vh - 30px)'
          : showSaveChangesBtn
            ? (typeof window !== 'undefined' && window.innerHeight <= 900)
              ? 'calc(100vh - 670px)'
              : 'calc(100vh - 770px)'
            : 'calc(100vh - 650px)',
      }

  return (
    <div className={fillHeight ? 'h-full min-h-0 flex flex-col' : 'w-full'}>
      <div className="flex justify-end mb-2">
        <Select
          open={isVariableMenuOpen}
          onOpenChange={(open) => {
            if (!open) {
              requestAnimationFrame(() => {
                restoreSelection(selectionRef.current.start ?? 0, selectionRef.current.end ?? 0)
              })
            }
            setIsVariableMenuOpen(open)
          }}
          value={selectedVariable}
          onValueChange={(value) => {
            setSelectedVariable('')
            if (value) insertVariable(value)
            setIsVariableMenuOpen(false)
          }}
        >
          <SelectTrigger
            className="h-8 w-[120px] text-xs bg-white"
            onMouseDownCapture={storeSelection}
            onKeyDownCapture={storeSelection}
          >
            <SelectValue placeholder="Variables" />
          </SelectTrigger>
          <SelectContent
            className="z-[25000]"
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              restoreSelection(selectionRef.current.start ?? 0, selectionRef.current.end ?? 0)
            }}
          >
            {variableOptions.map((variable) => (
              <SelectItem key={variable} value={variable}>
                {variable}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <textarea
        ref={textareaRef}
        className={`w-full rounded-xl border border-[#e5e7eb] px-3 pt-2.5 pb-4 text-sm font-medium leading-6 text-black/80 outline-none transition-colors hover:border-gray-300 hover:bg-gray-50/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none overflow-y-auto ${fillHeight ? 'flex-1 min-h-[120px]' : 'min-h-[50px]'}`}
        value={text}
        maxLength={limit}
        onChange={(e) => {
          const value = e.target.value
          setText(value)
          tagValue(value)
        }}
        onClick={storeSelection}
        onKeyUp={storeSelection}
        onSelect={storeSelection}
        onBlur={storeSelection}
        placeholder={placeholder}
        style={textareaHeight}
      />
    </div>
  )
}
