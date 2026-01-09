'use client'

import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TypographyH3 } from '@/lib/typography'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Unified Call Transcript Modal Component
 * Uses shadcn Dialog and typography components for consistent styling
 * 
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Callback when modal should close (receives boolean)
 * @param {string|number} callId - The call ID to display transcript for
 */
const CallTranscriptModal = ({ open, onClose, callId }) => {
  if (!callId) return null

  // Override z-index for overlay and content to appear above LeadDetails Drawer
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      // Use a small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]')
        const contents = document.querySelectorAll('[data-radix-dialog-content]')
        
        // Set z-index on the last overlay/content (most recent modal)
        if (overlays.length > 0) {
          const lastOverlay = overlays[overlays.length - 1]
          lastOverlay.style.zIndex = '15000'
        }
        if (contents.length > 0) {
          const lastContent = contents[contents.length - 1]
          lastContent.style.zIndex = '15001'
        }
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl w-[90%] sm:w-[80%] lg:w-[50%] max-h-[90vh] p-0"
        onInteractOutside={(e) => {
          e.preventDefault()
          onClose?.(false)
        }}
        onEscapeKeyDown={() => onClose?.(false)}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle asChild>
            <TypographyH3>Call Transcript</TypographyH3>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <TranscriptViewer callId={callId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CallTranscriptModal
