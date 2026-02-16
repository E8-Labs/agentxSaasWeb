'use client'

import { useState, useRef, useEffect } from 'react'
import { X, StickyNote } from 'lucide-react'
import { Button as ButtonBase } from '../ui/button'
import { toast } from '@/utils/toast'

// Type assertion for Button component
const Button = ButtonBase as any

interface CallNotesWindowProps {
  open: boolean
  onClose: () => void
  leadId?: number
  leadName?: string
}

export default function CallNotesWindow({
  open,
  onClose,
  leadId,
  leadName,
}: CallNotesWindowProps) {
  const [noteText, setNoteText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when window opens
  useEffect(() => {
    if (open && textareaRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Reset note text when window closes
  useEffect(() => {
    if (!open) {
      setNoteText('')
    }
  }, [open])

  if (!open) return null

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note')
      return
    }

    if (!leadId) {
      toast.error('Lead ID is required')
      return
    }

    try {
      setIsSaving(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/leads/add-note', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: noteText.trim(),
          leadId: leadId,
        }),
      })

      const data = await response.json()

      if (data?.status === true) {
        toast.success('Note saved successfully')
        setNoteText('')
        onClose()
      } else {
        toast.error(data?.message || 'Failed to save note')
      }
    } catch (error: any) {
      console.error('Error saving note:', error)
      toast.error('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed z-[1500] bg-white rounded-lg shadow-lg flex flex-col"
      style={{
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '500px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <StickyNote size={16} style={{ color: 'hsl(var(--brand-primary))' }} />
          <h3 className="text-sm font-semibold text-gray-900">Notes for
            {leadName && (
              <div className="flex items-center gap-2 mb-4 ps-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.1)' }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'hsl(var(--brand-primary))' }}
                  >
                    {leadName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{leadName}</span>
              </div>
            )}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          type="button"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Lead Name */}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Type here"
          className="flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none"
          style={{
            minHeight: '200px',
            pointerEvents: 'auto',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'hsl(var(--brand-primary))'
            e.target.style.boxShadow = '0 0 0 2px hsl(var(--brand-primary) / 0.2)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }}
          onKeyDown={(e) => {
            // Allow all key events to pass through
            e.stopPropagation()
          }}
          onClick={(e) => {
            // Allow click events to pass through
            e.stopPropagation()
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
        <Button
          onClick={handleSaveNote}
          disabled={isSaving || !noteText.trim()}
          className="rounded-lg"
          style={{
            backgroundColor: 'hsl(var(--brand-primary))',
            color: 'white',
            fontSize: '14px',
            padding: '8px 16px',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </div>
  )
}

