'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TypographyH3 } from '@/lib/typography'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

/**
 * Unified Call Transcript Modal Component
 * Uses shadcn Dialog and typography components for consistent styling
 *
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Callback when modal should close (receives boolean)
 * @param {string|number} callId - The call ID to display transcript for
 * @param {object} callData - Call data for the transcript
 * @param {boolean} elevatedZIndex - When true (e.g. opened from TeamMemberActivityDrawer), overlay and content use higher z-index so modal appears in front
 */
const CallTranscriptModal = ({ open, onClose, callId, callData, elevatedZIndex = false }) => {
  if (!callId || !callData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-2xl w-[90%] sm:w-[80%] lg:w-[50%] max-h-[90vh] p-0',
          elevatedZIndex && '!z-[5021]',
        )}
        overlayClassName={elevatedZIndex ? '!z-[5020]' : undefined}
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
          <TranscriptViewer callId={callId} callData={callData} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CallTranscriptModal
