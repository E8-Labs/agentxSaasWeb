'use client'

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { Modal } from '@mui/material'
import { X, RotateCcw, Upload } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { agentImage } from '@/utilities/agentUtilities'
import AgentXOrb from '@/components/common/AgentXOrb'
import WebAgentChatInput from './WebAgentChatInput'

const WEB_CHAT_VISITOR_ID_KEY = 'webChatVisitorId'

function getVisitorId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem(WEB_CHAT_VISITOR_ID_KEY)
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    localStorage.setItem(WEB_CHAT_VISITOR_ID_KEY, id)
  }
  return id
}

const EMPTY_STATE_MESSAGES = [
  "What's the agenda?",
  'What are we doing today?',
  'Where are we starting?',
  'How can I help?',
  "Let's cook!",
]

const EXPAND_DURATION_MS = 320

/**
 * Bottom-sheet chat UI. New chat per open; history panel to continue previous web chats.
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

  // Current conversation: either new session (sessionId + threadId) or from history (threadId only)
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)

  // History panel
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const historyPanelRef = useRef(null)

  useEffect(() => {
    if (!historyOpen) return
    const onMouseDown = (e) => {
      if (historyPanelRef.current && !historyPanelRef.current.contains(e.target)) {
        setHistoryOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [historyOpen])

  const emptyStateMessage = useMemo(
    () => EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)],
    [open]
  )

  const createNewSession = useCallback(async () => {
    if (!agentId) return
    const visitorId = getVisitorId()
    const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    try {
      const { data } = await axios.post('/api/public/web-chat/thread', {
        agentId: Number(agentId),
        sessionId,
        visitorId,
      })
      if (data?.status && data?.data) {
        setCurrentThreadId(data.data.threadId)
        setCurrentSessionId(sessionId)
        setMessages([])
        return { threadId: data.data.threadId, sessionId }
      }
    } catch (err) {
      console.error('Web chat create thread:', err?.message)
    }
    return null
  }, [agentId])

  const loadMessages = useCallback(
    async (threadIdOrSession) => {
      if (!agentId) return
      setMessagesLoading(true)
      try {
        const params = { agentId }
        if (typeof threadIdOrSession === 'number') {
          params.threadId = threadIdOrSession
        } else {
          params.sessionId = threadIdOrSession
        }
        const { data } = await axios.get('/api/public/web-chat/messages', { params })
        if (data?.status && data?.data?.messages) {
          setMessages(data.data.messages)
        } else {
          setMessages([])
        }
      } catch (err) {
        console.error('Web chat load messages:', err?.message)
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }
    },
    [agentId]
  )

  useEffect(() => {
    if (open) {
      setClosing(false)
      const t = setTimeout(() => setExpanded(true), 50)
      return () => clearTimeout(t)
    } else {
      setExpanded(false)
      setCurrentThreadId(null)
      setCurrentSessionId(null)
      setMessages([])
      setHistoryOpen(false)
    }
  }, [open])

  // On open + expanded: start new chat (new thread), load messages (empty for new)
  useEffect(() => {
    if (!open || !expanded || !agentId) return
    let cancelled = false
    createNewSession().then((result) => {
      if (!cancelled && result) loadMessages(result.sessionId)
    })
    return () => {
      cancelled = true
    }
  }, [open, expanded, agentId, createNewSession, loadMessages])

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

  const fetchHistory = useCallback(async () => {
    if (!agentId) return
    const visitorId = getVisitorId()
    setHistoryLoading(true)
    try {
      const { data } = await axios.get('/api/public/web-chat/threads', {
        params: { agentId: Number(agentId), visitorId },
      })
      if (data?.status && data?.data) {
        setHistoryList(data.data)
      } else {
        setHistoryList([])
      }
    } catch (err) {
      console.error('Web chat history:', err?.message)
      setHistoryList([])
    } finally {
      setHistoryLoading(false)
    }
  }, [agentId])

  const openHistory = () => {
    setHistoryOpen(true)
    fetchHistory()
  }

  const selectHistoryThread = (threadId) => {
    setCurrentThreadId(threadId)
    setCurrentSessionId(null)
    loadMessages(Number(threadId))
    setHistoryOpen(false)
  }

  const handleSend = useCallback(async () => {
    const text = inputValue.trim()
    if (!text || !agentId) return
    setSendLoading(true)
    try {
      const payload = {
        agentId: Number(agentId),
        content: text,
      }
      if (currentThreadId && !currentSessionId) {
        payload.threadId = currentThreadId
      } else if (currentSessionId) {
        payload.sessionId = currentSessionId
      } else {
        setSendLoading(false)
        return
      }
      const { data } = await axios.post('/api/public/web-chat/send', payload)
      if (data?.status && data?.data?.message) {
        setMessages((prev) => [...prev, data.data.message])
        setInputValue('')
        setAttachedFiles([])
      }
    } catch (err) {
      console.error('Web chat send:', err?.message)
    } finally {
      setSendLoading(false)
    }
  }, [agentId, inputValue, currentThreadId, currentSessionId])

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
            'rounded-3xl shadow-2xl w-full max-w-[630px]',
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
            <div ref={historyPanelRef} className="flex items-center gap-1 shrink-0 relative">
              <button
                type="button"
                onClick={openHistory}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 transition-colors shadow-sm"
                aria-label="History"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              {historyOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl bg-white shadow-lg border border-gray-100 py-2 z-50"
                  role="listbox"
                >
                  {historyLoading ? (
                    <p className="px-3 py-2 text-sm text-gray-500">Loading...</p>
                  ) : historyList.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">No previous chats</p>
                  ) : (
                    historyList.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => selectHistoryThread(t.id)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 flex flex-col"
                      >
                        <span className="text-xs text-gray-500">
                          {t.lastMessageAt
                            ? new Date(t.lastMessageAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
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

          {/* Body: messages or empty state */}
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col px-4 py-4">
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="flex flex-col gap-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                      m.direction === 'inbound'
                        ? 'self-start bg-white/90 text-gray-900 border border-gray-100'
                        : 'self-end bg-brand-primary/15 text-gray-900'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(m.createdAt).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="relative flex-shrink-0 mb-5">
                  <div className="relative z-10 flex items-center justify-center">
                    <AgentXOrb size={96} alt="Agent" />
                  </div>
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
            )}
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
              onSubmit={handleSend}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WebAgentChatDrawer
