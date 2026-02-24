'use client'

import { useState, useEffect, useRef } from 'react'
import { Agentation } from 'agentation'

/**
 * Keep Agentation toolbar focusable when modals use aria-hidden (hideOthers).
 * Radix Dialog/Popover set aria-hidden on the rest of the page, which disables
 * the Agentation input. We remove aria-hidden from the Agentation container
 * so users can type annotation comments while a modal is open.
 */
function useKeepAgentationFocusable() {
  const observerRef = useRef(null)

  useEffect(() => {
    const checkAndFix = () => {
      const toolbarEl = document.querySelector('[data-feedback-toolbar]')
      if (!toolbarEl) return
      let el = toolbarEl.parentElement
      while (el && el !== document.body) {
        if (el.getAttribute?.('aria-hidden') === 'true') {
          el.removeAttribute('aria-hidden')
          break
        }
        el = el.parentElement
      }
    }

    observerRef.current = new MutationObserver(() => {
      checkAndFix()
    })

    observerRef.current.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden'],
      subtree: true,
    })

    checkAndFix()

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])
}

/**
 * Sync annotation to the local AGENTATION_NOTES.md file via API
 */
async function syncAnnotation(action, data) {
  try {
    const isDelete = action === 'delete' || action === 'clear'

    const response = await fetch('/api/agentation', {
      method: isDelete ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        isDelete ? { action, id: data?.id } : { action, annotation: data }
      ),
    })

    if (!response.ok) {
      console.error('[Agentation] Sync failed:', await response.text())
    }
  } catch (error) {
    console.error('[Agentation] Sync error:', error)
  }
}

export function AgentationProvider() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useKeepAgentationFocusable()

  if (!mounted || process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG !== 'true') {
    return null
  }

  return (
    <div className="relative z-[9999]" data-agentation="toolbar" aria-hidden="false">
      <Agentation
      onAnnotationAdd={(annotation) => {
        syncAnnotation('add', annotation)
      }}
      onAnnotationUpdate={(annotation) => {
        syncAnnotation('update', annotation)
      }}
      onAnnotationDelete={(annotation) => {
        syncAnnotation('delete', annotation)
      }}
      onAnnotationsClear={() => {
        syncAnnotation('clear', null)
      }}
    />
    </div>
  )
}
