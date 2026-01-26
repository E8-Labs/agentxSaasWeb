'use client'

import { useState, useEffect } from 'react'
import { Agentation } from 'agentation'

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

  if (!mounted || process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG !== 'true') {
    return null
  }

  return (
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
  )
}
