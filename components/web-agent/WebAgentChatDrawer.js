'use client'

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Modal } from '@mui/material'
import { X, RotateCcw, Upload } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { agentImage } from '@/utilities/agentUtilities'
import AgentXOrb from '@/components/common/AgentXOrb'
import WebAgentChatInput from './WebAgentChatInput'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })
let thinkingAnimationData = null
try {
  thinkingAnimationData = require('../../public/assets/animation/subAccountLoader.json')
} catch {
  // fallback if path differs
}

const THINKING_MESSAGES = [
  'Sipping coffee...',
  'Typing...',
  'Creating...',
  'Still on it...',
  'Don\'t leave yet...',
]

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
const TITLE_MAX_LENGTH = 40

function truncateTitle(title) {
  if (!title || typeof title !== 'string') return title || ''
  const t = title.trim()
  if (t.length <= TITLE_MAX_LENGTH) return t
  return t.slice(0, TITLE_MAX_LENGTH).trim() + '…'
}

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
  leadId = null,
}) => {
  const headerAvatar = agentAvatar ?? (agent ? agentImage(agent) : null)
  const [inputValue, setInputValue] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [closing, setClosing] = useState(false)
  const modalInputRef = useRef(null)

  // Current conversation: new chat uses sessionId until first send, then threadId; history uses threadId only
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [currentThreadTitle, setCurrentThreadTitle] = useState(null)
  const [sessionError, setSessionError] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [thinkingIndex, setThinkingIndex] = useState(0)

  // History panel
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const historyPanelRef = useRef(null)
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleEditValue, setTitleEditValue] = useState('')
  const titleInputRef = useRef(null)

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

  // Lazy thread creation: we don't create a thread until the user sends the first message.
  // On drawer open we only set a sessionId so the first send can create the thread.
  // Load messages by threadId (used when we have a thread from first send or from history)
  const loadMessages = useCallback(
    async (threadId) => {
      if (!agentId || threadId == null) return
      setMessagesLoading(true)
      try {
        const params = { agentId: Number(agentId), threadId: Number(threadId) }
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
      setSessionError(null)
      const t = setTimeout(() => setExpanded(true), 50)
      return () => clearTimeout(t)
    } else {
      setExpanded(false)
      setCurrentThreadId(null)
      setCurrentSessionId(null)
      setCurrentThreadTitle(null)
      setSessionError(null)
      setMessages([])
      setHistoryOpen(false)
    }
  }, [open])

  // On open + expanded: for new chat just set a sessionId (thread is created on first send)
  useEffect(() => {
    if (!open || !expanded || !agentId) return
    if (currentThreadId == null && currentSessionId == null) {
      const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      setCurrentSessionId(sessionId)
    }
  }, [open, expanded, agentId])

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
      const params = { agentId: Number(agentId), visitorId }
      if (leadId != null) params.leadId = leadId
      const { data } = await axios.get('/api/public/web-chat/threads', {
        params,
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
  }, [agentId, leadId])

  const openHistory = () => {
    setHistoryOpen(true)
    fetchHistory()
  }

  const displayTitle = truncateTitle(currentThreadTitle || agentName || 'Agent')
  const displayTitleFull = currentThreadTitle || agentName || 'Agent'

  const startTitleEdit = () => {
    if (currentThreadId == null) return
    setTitleEditValue(currentThreadTitle || '')
    setTitleEditing(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const saveTitle = useCallback(async () => {
    if (currentThreadId == null || !agentId) return
    const trimmed = (titleEditValue || '').trim().slice(0, 120) || 'New chat'
    setTitleEditing(false)
    if (trimmed === (currentThreadTitle || '')) return
    try {
      await axios.patch(`/api/public/web-chat/thread/${currentThreadId}`, {
        agentId: Number(agentId),
        title: trimmed,
      })
      setCurrentThreadTitle(trimmed)
    } catch (err) {
      console.error('Failed to update chat title:', err?.message)
    }
  }, [currentThreadId, agentId, titleEditValue, currentThreadTitle])

  const selectHistoryThread = (thread) => {
    setCurrentThreadId(thread.id)
    setCurrentSessionId(null)
    setCurrentThreadTitle(thread.title || null)
    loadMessages(thread.id)
    setHistoryOpen(false)
  }

  // Ready when we have a thread (from first send or history) or a sessionId (new chat, thread created on first send)
  const sessionReady = !!(agentId && (currentThreadId != null || currentSessionId != null))

  useEffect(() => {
    if (!sendLoading) return
    const id = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [sendLoading])

  const handleSend = useCallback(async (e) => {
    e?.preventDefault?.()
    const text = inputValue.trim()
    if (!text || !agentId) return
    if (!sessionReady) return

    const optimisticId = `opt-${Date.now()}`
    const optimisticMessage = {
      id: optimisticId,
      threadId: currentThreadId,
      direction: 'inbound',
      content: text,
      status: 'sending',
      createdAt: new Date().toISOString(),
      messageType: 'web',
    }
    setMessages((prev) => [...prev, optimisticMessage])
    setInputValue('')
    setAttachedFiles([])
    setSendLoading(true)

    const visitorId = getVisitorId()
    const payload = {
      agentId: Number(agentId),
      content: text,
      visitorId: visitorId || undefined,
    }
    if (currentThreadId != null) {
      payload.threadId = currentThreadId
    } else {
      payload.sessionId = currentSessionId
      if (leadId != null) payload.leadId = leadId
    }

    try {
      const { data } = await axios.post('/api/public/web-chat/send', payload)
      if (data?.status && data?.data?.message) {
        if (data?.data?.threadId != null) {
          setCurrentThreadId(data.data.threadId)
          setCurrentSessionId(null)
          if (data?.data?.threadTitle) setCurrentThreadTitle(data.data.threadTitle)
        }
        setMessages((prev) => {
          const withoutOpt = prev.filter((m) => m.id !== optimisticId)
          const next = [...withoutOpt, data.data.message]
          if (data?.data?.assistantMessage) {
            next.push(data.data.assistantMessage)
          }
          return next
        })
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      }
    } catch (err) {
      console.error('Web chat send:', err?.message)
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
    } finally {
      setSendLoading(false)
    }
  }, [agentId, inputValue, currentThreadId, currentSessionId, sessionReady, leadId])

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
          {/* Header: X (close) top left with avatar + title (editable when thread exists); History + Upload top right */}
          <div className="flex flex-shrink-0 items-center justify-between gap-3 px-4 py-3 border-b border-white/50">
            <div className="flex items-center gap-3 min-w-0 flex-1">
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
              {titleEditing ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleEditValue}
                  onChange={(e) => setTitleEditValue(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle()
                    if (e.key === 'Escape') setTitleEditing(false)
                  }}
                  className="flex-1 min-w-0 font-semibold text-[15px] text-gray-900 border border-gray-200 rounded px-2 py-1"
                  placeholder="Chat title"
                />
              ) : (
                <button
                  type="button"
                  onClick={startTitleEdit}
                  className={cn(
                    'font-semibold text-[15px] text-gray-900 truncate text-left min-w-0 overflow-hidden',
                    currentThreadId != null && 'hover:bg-white/50 rounded px-1 -mx-1'
                  )}
                  title={currentThreadId != null ? (displayTitleFull !== displayTitle ? displayTitleFull : 'Click to edit title') : displayTitleFull}
                >
                  {displayTitle}
                </button>
              )}
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
                        onClick={() => selectHistoryThread(t)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 flex flex-col gap-0.5"
                      >
                        <span className="font-medium truncate overflow-hidden" title={t.title || 'New chat'}>{truncateTitle(t.title) || 'New chat'}</span>
                        <span className="text-xs text-gray-500">
                          {t.dateStr || (t.createdAt ? new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '')}
                          {t.timeStr ? `, ${t.timeStr}` : (t.lastMessageAt || t.createdAt ? `, ${new Date(t.lastMessageAt || t.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : '')}
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
                      'max-w-[85%] min-w-0 rounded-2xl px-3 py-2 text-sm overflow-hidden break-words',
                      m.direction === 'inbound'
                        ? 'self-end bg-brand-primary/15 text-gray-900'
                        : 'self-start bg-white/90 text-gray-900 border border-gray-100'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(m.createdAt).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              {sendLoading && (
                <div className="flex items-end gap-2 w-full justify-start mt-2">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden">
                    {thinkingAnimationData && Lottie ? (
                      <Lottie
                        animationData={thinkingAnimationData}
                        loop
                        style={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                    )}
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/90 border border-gray-100 min-w-[120px]">
                    <span className="text-sm text-gray-600">{THINKING_MESSAGES[thinkingIndex]}</span>
                  </div>
                </div>
              )}
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
            {sessionError && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                <span>{sessionError}</span>
                <button
                  type="button"
                  onClick={() => setSessionError(null)}
                  className="shrink-0 font-medium text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            {!sessionReady && !sessionError && open && expanded && (
              <p className="mb-2 text-xs text-gray-500">Starting chat...</p>
            )}
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
              placeholder={sessionReady ? 'Ask me anything' : 'Connecting...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onAttachFiles={(files) => setAttachedFiles((prev) => [...prev, ...files])}
              onSubmit={handleSend}
              disabled={!sessionReady || sendLoading}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WebAgentChatDrawer
