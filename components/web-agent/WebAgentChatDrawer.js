'use client'

import React from 'react'
import { Modal, Slide } from '@mui/material'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agentImage } from '@/utilities/agentUtilities'
import WebAgentChatInput from './WebAgentChatInput'

/**
 * Bottom-sheet chat UI for web-agent page. Slides up from bottom (iPhone-style).
 * Header: agent avatar/name + close. Body: scrollable messages (empty state for now). Footer: chat input.
 */
const WebAgentChatDrawer = ({
  open,
  onClose,
  agentId,
  agentName,
  agencyBranding = null,
  agent = null,
  agentAvatar = null,
}) => {
  const headerAvatar = agentAvatar ?? (agent ? agentImage(agent) : null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{
        zIndex: 1300,
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
        },
        onClick: onClose,
      }}
    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <div
          className={cn(
            'absolute left-0 right-0 bottom-0 flex flex-col bg-white',
            'rounded-t-2xl shadow-2xl',
            'max-h-[80vh] w-full max-w-[420px] mx-auto',
            'md:max-h-[80vh] md:rounded-t-2xl',
            'max-md:h-[85svh] max-md:max-w-full max-md:rounded-t-2xl'
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Chat"
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {headerAvatar || (
                  <span className="text-lg font-semibold text-gray-500">
                    {agentName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <span className="font-semibold text-[15px] text-gray-900 truncate">
                {agentName || 'Agent'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: scrollable message list (empty state for now) */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-6">
            <div className="flex flex-col items-center justify-center text-center text-gray-500 text-sm py-8">
              <p className="font-medium">No messages yet</p>
              <p className="mt-1">Start the conversation below.</p>
            </div>
          </div>

          {/* Footer: chat input */}
          <div className="flex-shrink-0 p-4 pt-2 border-t border-gray-100">
            <WebAgentChatInput placeholder="Type your message…" readOnly />
          </div>
        </div>
      </Slide>
    </Modal>
  )
}

export default WebAgentChatDrawer
