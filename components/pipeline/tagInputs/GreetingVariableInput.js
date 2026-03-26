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

export const GreetingVariableInput = ({
  greetTag,
  kycsList,
  tagValue,
  uniqueColumns,
  placeholder,
}) => {
  const [text, setText] = useState(greetTag || '')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [isVariableMenuOpen, setIsVariableMenuOpen] = useState(false)
  const inputRef = useRef(null)
  const selectionRef = useRef({ start: 0, end: 0 })
  const scrollRef = useRef({ left: 0 })

  useEffect(() => {
    setText(greetTag || '')
  }, [greetTag])

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

  const storeSelection = (force = false) => {
    const input = inputRef.current
    if (!input) return
    if (!force && typeof document !== 'undefined' && document.activeElement !== input) return
    selectionRef.current = {
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0,
    }
    scrollRef.current = {
      left: input.scrollLeft ?? 0,
    }
  }

  const restoreSelection = (start, end = start) => {
    const input = inputRef.current
    if (!input) return
    try {
      input.focus({ preventScroll: true })
    } catch {
      input.focus()
    }
    input.setSelectionRange(start, end)
    input.scrollLeft = scrollRef.current.left ?? 0
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
    const input = inputRef.current
    const prevScrollLeft = input?.scrollLeft ?? 0
    setText(updated)
    tagValue(updated)
    scrollRef.current = { left: prevScrollLeft }

    const nextCaret = before.length + token.length
    requestAnimationFrame(() => {
      restoreSelection(nextCaret)
    })
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-end">
        <Select
          open={isVariableMenuOpen}
          onOpenChange={(open) => {
            if (open) {
              requestAnimationFrame(() => {
                const input = inputRef.current
                if (!input) return
                input.scrollLeft = scrollRef.current.left ?? 0
              })
            }
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
            if (value) {
              insertVariable(value)
            }
            setIsVariableMenuOpen(false)
          }}
        >
          <SelectTrigger
            className="h-8 w-[120px] text-xs bg-white"
            onMouseDownCapture={() => storeSelection(true)}
            onKeyDownCapture={storeSelection}
            onMouseDown={(event) => {
              // Keep caret/scroll stable in the greeting input while opening dropdown.
              event.preventDefault()
            }}
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

      <input
        ref={inputRef}
        className="h-[40px] w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm font-medium text-black/80 outline-none transition-colors hover:border-gray-300 hover:bg-gray-50/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        value={text}
        onChange={(e) => {
          const value = e.target.value
          setText(value)
          tagValue(value)
        }}
        onClick={storeSelection}
        onKeyUp={storeSelection}
        onSelect={storeSelection}
        placeholder={placeholder || 'Type here...'}
      />
    </div>
  )
}
