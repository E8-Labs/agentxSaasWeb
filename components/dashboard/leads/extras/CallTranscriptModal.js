'use client'

import React, { useEffect } from 'react'
import { flushSync } from 'react-dom'
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
  
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

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
    <Dialog open={open} onOpenChange={onClose} modal={!isPopoverOpen}>
      <DialogContent
        className="max-w-2xl w-[90%] sm:w-[80%] lg:w-[50%] max-h-[90vh] p-0"
        onInteractOutside={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CallTranscriptModal.js:52',message:'Dialog onInteractOutside',data:{target:e.target?.tagName,currentTarget:e.currentTarget?.tagName,relatedTarget:e.relatedTarget?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          // Don't prevent default if clicking on popover elements
          const target = e.target;
          const isPopoverElement = target?.closest?.('[data-popover-content]');
          if (isPopoverElement) {
            e.preventDefault();
            return;
          }
          e.preventDefault()
          onClose?.(false)
        }}
        onPointerDownOutside={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CallTranscriptModal.js:64',message:'Dialog onPointerDownOutside',data:{target:e.target?.tagName,isPopover:!!e.target?.closest?.('[data-popover-content]')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          // Allow pointer events on popover
          if (e.target?.closest?.('[data-popover-content]')) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CallTranscriptModal.js:72',message:'Dialog onFocusOutside',data:{target:e.target?.tagName,isPopover:!!e.target?.closest?.('[data-popover-content]')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          // Allow focus on popover elements - this is the key fix!
          if (e.target?.closest?.('[data-popover-content]')) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={() => onClose?.(false)}
        trapFocus={false}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle asChild>
            <TypographyH3>Call Transcript</TypographyH3>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <TranscriptViewer 
            callId={callId} 
            onPopoverStateChange={(isOpen) => {
              // Use flushSync to ensure state updates immediately
              flushSync(() => {
                setIsPopoverOpen(isOpen)
              })
            }} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CallTranscriptModal
