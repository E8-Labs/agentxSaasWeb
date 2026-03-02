'use client'

import React, { useMemo, useState, useRef, useEffect } from 'react'
import { Modal } from '@mui/material'
import { X, RotateCcw, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agentImage } from '@/utilities/agentUtilities'
import AgentXOrb from '@/components/common/AgentXOrb'
import WebAgentChatInput from './WebAgentChatInput'

const EMPTY_STATE_MESSAGES = [
  "What's the agenda?",
  'What are we doing today?',
  'Where are we starting?',
  'How can I help?',
  "Let's cook!",
]

const EXPAND_DURATION_MS = 320

/**
 * Bottom-sheet chat UI. Expands from bottom (input-growing-into-modal). Auto-focuses input when open.
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
  const [inputValue, setInputValue] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [closing, setClosing] = useState(false)
  const modalInputRef = useRef(null)

  // Pick one generic message per drawer open (stable for this session)
  const emptyStateMessage = useMemo(
    () => EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)],
    [open]
  )

  useEffect(() => {
    if (open) {
      setClosing(false)
      const t = setTimeout(() => setExpanded(true), 50)
      return () => clearTimeout(t)
    } else {
      setExpanded(false)
    }
  }, [open])

  useEffect(() => {
    if (!expanded || !open) return
    const t = setTimeout(() => modalInputRef.current?.focus(), EXPAND_DURATION_MS + 50)
    return () => clearTimeout(t)
  }, [expanded, open])

  const handleCloseClick = () => {
    setClosing(true)
    setExpanded(false)
  }

  const handleTransitionEnd = (e) => {
    if (e.propertyName !== 'height') return
    if (closing) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={closing ? undefined : onClose}
      closeAfterTransition
      sx={{ zIndex: 1300 }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0,0,0,0.05)',
          backdropFilter: 'blur(4px)',
        },
        onClick: closing ? undefined : onClose,
      }}
    >
      <div className="absolute inset-0 flex justify-center items-end pointer-events-none pb-5">
        <div
          className={cn(
            'pointer-events-auto flex flex-col overflow-hidden',
            'rounded-t-3xl shadow-2xl w-full max-w-[630px]',
            'transition-[height] duration-300 ease-out'
          )}
          style={{
            height: expanded ? '75vh' : 0,
            minHeight: expanded ? 400 : 0,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={(e) => e.stopPropagation()}
          onTransitionEnd={handleTransitionEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Chat"
        >
          {/* Header: X (close) top left with agent; History + Upload top right */}
          <div className="flex flex-shrink-0 items-center justify-between gap-3 px-4 py-3 border-b border-white/50">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleCloseClick}
                className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 transition-colors shadow-sm"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
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
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {}}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 transition-colors shadow-sm"
                aria-label="History"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 transition-colors shadow-sm"
                aria-label="Upload"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body: empty state with generic message (no chat history) */}
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col items-center justify-center px-4 py-8">
            {/* AgentX orb with gradient shadow */}
            <div className="relative flex-shrink-0 mb-5">
              <div className="relative z-10 flex items-center justify-center">
                <AgentXOrb size={96} alt="Agent" />
              </div>
              {/* Gradient shadow underneath the orb */}
              <div
                className="absolute inset-0 rounded-full blur-2xl -z-0 pointer-events-none"
                style={{
                  width: '140%',
                  height: '140%',
                  left: '-20%',
                  top: '-10%',
                  background:
                    'radial-gradient(ellipse 60% 50% at 50% 85%, rgba(236,72,153,0.35) 0%, rgba(167,139,250,0.3) 35%, rgba(99,102,241,0.2) 60%, transparent 75%)',
                }}
              />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center max-w-sm">
              {emptyStateMessage}
            </p>
          </div>

          {/* Footer: attached files + input (Plus = attach, Send) */}
          <div className="flex-shrink-0 p-4 pt-2 border-t border-white/50">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {attachedFiles.map((file, i) => (
                  <span
                    key={`${file.name}-${i}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 text-gray-700 text-xs"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={() =>
                        setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <WebAgentChatInput
              inputRef={modalInputRef}
              placeholder="Ask me anything"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onAttachFiles={(files) => setAttachedFiles((prev) => [...prev, ...files])}
              onSubmit={() => {
                /* TODO: send message (include attachedFiles) */
                setInputValue('')
                setAttachedFiles([])
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WebAgentChatDrawer
