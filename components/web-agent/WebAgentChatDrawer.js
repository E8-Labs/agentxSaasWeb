'use client'

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, RotateCcw, Upload, ChevronDown } from 'lucide-react'
import { OpenAiLogoIcon } from '@phosphor-icons/react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { agentImage } from '@/utilities/agentUtilities'
import AgentXOrb from '@/components/common/AgentXOrb'
import WebAgentChatInput from './WebAgentChatInput'
import Apis from '@/components/apis/Apis'

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
const TITLE_MAX_LENGTH = 28

function truncateTitle(title) {
  if (!title || typeof title !== 'string') return title || ''
  const t = title.trim()
  if (t.length <= TITLE_MAX_LENGTH) return t
  return t.slice(0, TITLE_MAX_LENGTH).trim() + '…'
}

/**
 * Bottom-sheet chat UI. New chat per open; history panel to continue previous web chats.
 */
const LLM_PROVIDERS = [
  { id: 'openai', label: 'GPT', icon: 'openai' },
  { id: 'anthropic', label: 'Claude AI', icon: 'anthropic' },
  { id: 'google', label: 'Gemini', icon: 'google' },
]

const noop = () => {}

/** Icon button with 10% larger size, hover scale 1.05, and subtle magnetic cursor-follow */
function MagneticIconButton({ onClick, 'aria-label': ariaLabel, children, className, ...props }) {
  const ref = useRef(null)
  const [magnetic, setMagnetic] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height
    const strength = 3
    setMagnetic({ x: dx * strength, y: dy * strength })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMagnetic({ x: 0, y: 0 })
    setHovered(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
  }, [])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-[9999px]',
        'bg-[rgba(255,255,255,0.39)] border border-white text-gray-600',
        'shadow-[0_23px_30.7px_0_rgba(0,0,0,0.05)]',
        'hover:bg-white/50 active:scale-[0.98]',
        'transition-all duration-200 ease-in-out',
        className
      )}
      style={{
        transform: `translate(${magnetic.x}px, ${magnetic.y}px) scale(${hovered ? 1.05 : 1})`,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

/** True if target is inside Agentation toolbar, popup, or marker (keep dropdowns/popovers open when annotating) */
function isAgentationTarget(target) {
  return (
    target?.closest?.('[data-feedback-toolbar]') != null ||
    target?.closest?.('[data-annotation-popup]') != null ||
    target?.closest?.('[data-annotation-marker]') != null ||
    target?.closest?.('[data-agentation="toolbar"]') != null
  )
}

const WebAgentChatDrawer = ({
  open,
  onClose = noop,
  agentId,
  agentName,
  agencyBranding = null,
  agent = null,
  agentAvatar = null,
  leadId = null,
  canChangeLlmProvider = false,
}) => {
  const headerAvatar = agentAvatar ?? (agent ? agentImage(agent) : null)
  const [inputValue, setInputValue] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [closing, setClosing] = useState(false)
  const modalInputRef = useRef(null)

  // LLM provider dropdown (agent owner only)
  const [llmIntegrations, setLlmIntegrations] = useState([])
  const [llmDefaultIntegrationId, setLlmDefaultIntegrationId] = useState(null)
  const [llmProviderOpen, setLlmProviderOpen] = useState(false)
  const [llmLoading, setLlmLoading] = useState(false)
  const [addKeyModalProvider, setAddKeyModalProvider] = useState(null)
  const [addKeyValue, setAddKeyValue] = useState('')
  const [addKeyLoading, setAddKeyLoading] = useState(false)
  const [addKeyError, setAddKeyError] = useState('')
  const llmProviderRef = useRef(null)

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
      if (isAgentationTarget(e.target)) return
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
      // Always start a new chat when opening (ChatGPT-style: old thread only when selected from History)
      setCurrentThreadId(null)
      setCurrentSessionId(null)
      setCurrentThreadTitle(null)
      setMessages([])
      setHistoryOpen(false)
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

  const handleCloseAnimationComplete = useCallback(() => {
    if (closing) {
      onClose()
      setClosing(false)
    }
  }, [closing])

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

  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('User')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.token ?? null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!open || !canChangeLlmProvider) return
    const token = getAuthToken()
    if (!token) return
    let cancelled = false
    setLlmLoading(true)
    const baseUrl = Apis.BasePath ?? ''
    Promise.all([
      axios.get(`${baseUrl}api/mail/ai-integrations`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }),
      axios.get(Apis.getMessageSettings, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }),
    ])
      .then(([intRes, settingsRes]) => {
        if (cancelled) return
        if (intRes.data?.status && Array.isArray(intRes.data?.data)) {
          setLlmIntegrations(intRes.data.data)
        }
        if (settingsRes.data?.status && settingsRes.data?.data?.aiIntegrationId != null) {
          setLlmDefaultIntegrationId(settingsRes.data.data.aiIntegrationId)
        } else {
          setLlmDefaultIntegrationId(intRes.data?.data?.[0]?.id ?? null)
        }
      })
      .catch((err) => {
        if (!cancelled) console.warn('Web chat: failed to load LLM settings', err?.message)
      })
      .finally(() => {
        if (!cancelled) setLlmLoading(false)
      })
    return () => { cancelled = true }
  }, [open, canChangeLlmProvider, getAuthToken])

  const currentLlmIntegration = useMemo(() => {
    if (!llmDefaultIntegrationId || !llmIntegrations.length) return null
    return llmIntegrations.find((i) => i.id === llmDefaultIntegrationId) ?? llmIntegrations[0]
  }, [llmDefaultIntegrationId, llmIntegrations])

  const integrationForProvider = useCallback(
    (providerId) => llmIntegrations.find((i) => (i.provider === 'google' ? 'google' : i.provider === 'anthropic' ? 'anthropic' : 'openai') === providerId),
    [llmIntegrations]
  )

  const handleLlmProviderSelect = useCallback(
    async (providerId) => {
      setLlmProviderOpen(false)
      const token = getAuthToken()
      if (!token) return
      const int = integrationForProvider(providerId)
      if (int) {
        try {
          await axios.put(Apis.updateMessageSettings, { aiIntegrationId: int.id }, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          })
          setLlmDefaultIntegrationId(int.id)
        } catch (err) {
          console.warn('Failed to set default LLM', err?.message)
        }
        return
      }
      setAddKeyModalProvider(providerId)
      setAddKeyValue('')
      setAddKeyError('')
    },
    [getAuthToken, integrationForProvider]
  )

  const handleAddKeySubmit = useCallback(async () => {
    const key = addKeyValue.trim()
    if (!key || !addKeyModalProvider) return
    const token = getAuthToken()
    if (!token) return
    setAddKeyLoading(true)
    setAddKeyError('')
    try {
      const baseUrl = Apis.BasePath ?? ''
      const createRes = await axios.post(
        `${baseUrl}api/mail/ai-integrations`,
        { provider: addKeyModalProvider, apiKey: key },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
      if (createRes.data?.status && createRes.data?.data?.id) {
        const newId = createRes.data.data.id
        await axios.put(Apis.updateMessageSettings, { aiIntegrationId: newId }, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        setLlmDefaultIntegrationId(newId)
        const intRes = await axios.get(`${Apis.BasePath ?? ''}api/mail/ai-integrations`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        if (intRes.data?.status && Array.isArray(intRes.data?.data)) {
          setLlmIntegrations(intRes.data.data)
        }
        setAddKeyModalProvider(null)
        setAddKeyValue('')
      } else {
        setAddKeyError(createRes.data?.message || 'Failed to add API key')
      }
    } catch (err) {
      setAddKeyError(err.response?.data?.message || err.message || 'Failed to add API key')
    } finally {
      setAddKeyLoading(false)
    }
  }, [addKeyValue, addKeyModalProvider, getAuthToken])

  useEffect(() => {
    if (!llmProviderOpen) return
    const onMouseDown = (e) => {
      if (isAgentationTarget(e.target)) return
      if (llmProviderRef.current && !llmProviderRef.current.contains(e.target)) {
        setLlmProviderOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [llmProviderOpen])

  // Ready when we have a thread (from first send or history) or a sessionId (new chat, thread created on first send)
  const sessionReady = !!(agentId && (currentThreadId != null || currentSessionId != null))

  useEffect(() => {
    if (!sendLoading) return
    const id = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [sendLoading])

  const readImageAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleSend = useCallback(async (e) => {
    e?.preventDefault?.()
    const text = (inputValue || '').trim()
    const hasAttachments = attachedFiles && attachedFiles.length > 0
    if ((!text && !hasAttachments) || !agentId) return
    if (!sessionReady) return

    const imageFiles = (attachedFiles || []).filter((f) => f.type?.startsWith('image/'))
    const attachmentDataUrls = []
    for (const file of imageFiles) {
      try {
        const dataUrl = await readImageAsDataUrl(file)
        if (dataUrl) attachmentDataUrls.push({ type: 'image', dataUrl })
      } catch (err) {
        console.warn('Failed to read image:', file.name, err)
      }
    }
    const optimisticAttachments = attachmentDataUrls.length
      ? attachmentDataUrls.map((a) => ({ type: 'image', dataUrl: a.dataUrl }))
      : []

    const optimisticId = `opt-${Date.now()}`
    const optimisticMessage = {
      id: optimisticId,
      threadId: currentThreadId,
      direction: 'inbound',
      content: text || (hasAttachments ? '[Image]' : ''),
      status: 'sending',
      createdAt: new Date().toISOString(),
      messageType: 'web',
      metadata: optimisticAttachments.length ? { attachments: optimisticAttachments } : undefined,
    }
    setMessages((prev) => [...prev, optimisticMessage])
    setInputValue('')
    setAttachedFiles([])
    setSendLoading(true)

    const visitorId = getVisitorId()
    const payload = {
      agentId: Number(agentId),
      content: text || (hasAttachments ? '[Image]' : ''),
      visitorId: visitorId || undefined,
    }
    if (currentThreadId != null) {
      payload.threadId = currentThreadId
    } else {
      payload.sessionId = currentSessionId
      if (leadId != null) payload.leadId = leadId
    }
    if (optimisticAttachments.length > 0) {
      payload.attachments = optimisticAttachments
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
  }, [agentId, inputValue, currentThreadId, currentSessionId, sessionReady, leadId, attachedFiles])

  const handleModalClose = closing ? noop : onClose
  const showOverlay = open || closing
  if (!showOverlay) return null

  const liquidSpring = { type: 'spring', stiffness: 360, damping: 26 }
  const liquidSpringExit = { type: 'spring', stiffness: 400, damping: 32 }

  const modalContent = (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          key="drawer-overlay"
          className="fixed inset-0"
          style={{ zIndex: 1300, fontFamily: "'Inter', sans-serif" }}
          role="dialog"
          aria-modal="true"
          aria-label="Chat"
          initial={false}
        >
          <motion.div
            className="absolute inset-0 bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={liquidSpring}
            onClick={(e) => {
              if (isAgentationTarget(e.target)) return
              handleModalClose()
            }}
            onKeyDown={(e) => e.key === 'Escape' && handleModalClose()}
          />
          <div className="absolute inset-0 flex justify-center items-end pointer-events-none pb-5">
            <motion.div
              className={cn(
                'pointer-events-auto flex flex-col overflow-hidden',
                'rounded-[32px] w-full max-w-[756px]',
                'border border-white'
              )}
              style={{
                height: '852px',
                minHeight: 480,
                maxHeight: '90vh',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(44px)',
                WebkitBackdropFilter: 'blur(44px)',
                boxShadow: '0 -10px 45.9px 0 rgba(185,185,185,0.05), 0 -25px 38.9px 0 rgba(255,255,255,0.04)',
                transformOrigin: 'bottom center',
                pointerEvents: expanded ? 'auto' : 'none',
              }}
              initial={false}
              animate={{
                scale: expanded ? 1 : 0.92,
                opacity: expanded ? 1 : 0,
                y: expanded ? 0 : 32,
              }}
              transition={expanded ? liquidSpring : liquidSpringExit}
              onAnimationComplete={handleCloseAnimationComplete}
              onClick={(e) => e.stopPropagation()}
            >
          {/* Header: close (left), model selector (center), history + upload (right) — Figma assignx */}
          <div className="flex flex-shrink-0 items-center justify-between gap-3 px-4 py-3 min-w-0 relative z-10 border-b border-white">
            <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
              <MagneticIconButton onClick={handleCloseClick} aria-label="Close chat" className="flex-shrink-0">
                <X className="w-[18px] h-[18px]" />
              </MagneticIconButton>
              {/* <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {headerAvatar || (
                  <span className="text-lg font-semibold text-gray-500">
                    {agentName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div> */}
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
                  className="flex-1 min-w-0 font-semibold text-[15px] text-gray-900 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  placeholder="Chat title"
                />
              ) : (
                <button
                  type="button"
                  onClick={startTitleEdit}
                  className={cn(
                    'flex-1 min-w-[80px] font-medium text-[18px] text-gray-900 truncate text-left overflow-hidden block',
                    currentThreadId != null && 'hover:bg-white/50 rounded px-1 -mx-1'
                  )}
                  title={currentThreadId != null ? (displayTitleFull !== displayTitle ? displayTitleFull : 'Click to edit title') : displayTitleFull}
                >
                  {displayTitle}
                </button>
              )}
            </div>
            <div ref={historyPanelRef} className="flex items-center gap-3 shrink-0 relative">
              <MagneticIconButton onClick={openHistory} aria-label="History">
                <RotateCcw className="w-[18px] h-[18px]" />
              </MagneticIconButton>
              <MagneticIconButton onClick={() => {}} aria-label="Upload">
                <Upload className="w-[18px] h-[18px]" />
              </MagneticIconButton>
              {/* History dropdown: compact floating panel (like second screenshot) */}
              <AnimatePresence>
                {historyOpen && (
                  <motion.div
                    key="history-dropdown"
                    className="absolute top-full right-0 mt-2 w-72 max-h-80 rounded-2xl overflow-hidden z-50 flex flex-col bg-[rgba(255,255,255,0.85)] backdrop-blur-xl border border-white shadow-[0_23px_30.7px_0_rgba(0,0,0,0.05)] origin-top"
                    role="dialog"
                    aria-label="Chat history"
                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  >
                  <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-white/50 bg-white/30">
                    <span className="text-sm font-medium text-gray-700">History</span>
                    <button
                      type="button"
                      onClick={() => setHistoryOpen(false)}
                      className="p-1 rounded-full hover:bg-white/50 text-gray-500 hover:text-gray-700 active:scale-[0.98] transition-all duration-200 ease-in-out"
                      aria-label="Close history"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 py-1">
                    {historyLoading ? (
                      <p className="px-3 py-3 text-sm text-gray-500">Loading...</p>
                    ) : historyList.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-gray-500">No previous chats</p>
                    ) : (
                      historyList.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => selectHistoryThread(t)}
                          className="w-full min-w-0 text-left px-3 py-2.5 text-sm text-gray-800 hover:bg-white/50 active:scale-[0.98] transition-all duration-200 ease-in-out flex flex-col gap-0.5 overflow-hidden"
                        >
                          <span className="font-medium truncate block min-w-0 overflow-hidden" title={t.title || 'New chat'}>{truncateTitle(t.title) || 'New chat'}</span>
                          <span className="text-xs text-gray-500">
                            {t.dateStr || (t.createdAt ? new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '')}
                            {t.timeStr ? `, ${t.timeStr}` : (t.lastMessageAt || t.createdAt ? `, ${new Date(t.lastMessageAt || t.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : '')}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Body: messages or empty state */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col px-4 py-4 relative z-0">
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="flex flex-col gap-2 px-2 py-2">
                {messages.map((m) => {
                  const attachments = m.metadata?.attachments || []
                  const imageAttachments = attachments.filter((a) => a.type === 'image' && a.dataUrl)
                  const isInbound = m.direction === 'inbound'
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex flex-col min-w-0 max-w-[85%]',
                        isInbound ? 'items-end self-end' : 'items-start self-start'
                      )}
                    >
                      {isInbound ? (
                        /* Sent: white bubble, tail at top-right (no rounded-tr) — Figma Message Item outbound */
                        <div className="bg-white rounded-tl-[12px] rounded-bl-[12px] rounded-br-[12px] px-3 py-2 w-full min-w-0">
                          {imageAttachments.length > 0 && (
                            <div className="flex flex-col gap-1.5 mb-2">
                              {imageAttachments.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.dataUrl}
                                  alt=""
                                  className="rounded-lg max-h-48 w-auto object-contain"
                                />
                              ))}
                            </div>
                          )}
                          {m.content && (m.content !== '[Image]' || imageAttachments.length === 0) ? (
                            <p className="text-[14px] font-normal leading-normal text-black/80 text-right whitespace-pre-wrap break-words">{m.content}</p>
                          ) : null}
                          <p className="text-[11px] text-black/50 text-right mt-1">
                            {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        /* Received: avatar + bubble with tail (no top-left radius), bg rgba(246,247,249,0.28) — Figma Message Item inbound */
                        <div className="flex gap-2 items-start w-full min-w-0">
                          <div className="flex-shrink-0 pt-1">
                            <AgentXOrb size={24} alt="" />
                          </div>
                          <div className="flex-1 min-w-0 rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] rounded-tl-[0] px-4 py-2 bg-[rgba(246,247,249,0.28)]">
                            {imageAttachments.length > 0 && (
                              <div className="flex flex-col gap-1.5 mb-2">
                                {imageAttachments.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img.dataUrl}
                                    alt=""
                                    className="rounded-lg max-h-48 w-auto object-contain"
                                  />
                                ))}
                              </div>
                            )}
                            {m.content && (m.content !== '[Image]' || imageAttachments.length === 0) ? (
                              <p className="text-[14px] font-normal leading-normal text-black/80 whitespace-pre-wrap break-words">{m.content}</p>
                            ) : null}
                            <p className="text-[11px] text-[#0e0e0e]/50 mt-1">
                              {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              {sendLoading && (
                <div className="flex items-start gap-2 w-full min-w-0 mt-2">
                  <div className="flex-shrink-0 pt-1">
                    <AgentXOrb size={24} alt="" />
                  </div>
                  <div className="flex-1 min-w-0 rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] rounded-tl-[0] px-4 py-3 bg-[rgba(246,247,249,0.28)] min-w-[120px]">
                    <span className="text-[14px] text-[#0e0e0e]">{THINKING_MESSAGES[thinkingIndex]}</span>
                  </div>
                </div>
              )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                <div className="relative flex-shrink-0">
                  <div className="relative z-10 flex items-center justify-center scale-[1.3]">
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
                <p className="text-[22px] font-semibold leading-[30px] tracking-[-0.77px] text-[#0e0e0e] text-center max-w-sm">
                  Where should we begin?
                </p>
              </div>
            )}
          </div>

          {/* Footer: attached files + input (Plus = attach, Send) — Figma pill container */}
          <div className="flex-shrink-0 pb-4 pl-4 pr-4 pt-2">
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
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 backdrop-blur-sm border border-white/50 text-gray-700 text-xs"
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
            <div className="relative group w-full">
              <div className="chat-input-glow-layer-1" aria-hidden />
              <div className="chat-input-glow-layer-2" aria-hidden />
              <div className="chat-input-glow-layer-3" aria-hidden />
              <div className="chat-input-glow-layer-4" aria-hidden />
              <div className="chat-input-glow-layer-5" aria-hidden />
              <div className="chat-input-glow-layer-6" aria-hidden />

              <div className="relative z-10">
                <WebAgentChatInput
                  inputRef={modalInputRef}
                placeholder={sessionReady ? 'Ask me anything' : 'Connecting...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onAttachFiles={(files) => setAttachedFiles((prev) => [...prev, ...files])}
                onSubmit={handleSend}
                disabled={!sessionReady || sendLoading}
                className="gap-3"
                rightSlot={
                  canChangeLlmProvider ? (
                    <div ref={llmProviderRef} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setLlmProviderOpen((o) => !o)}
                        disabled={llmLoading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-[9999px] bg-[rgba(255,255,255,0.39)] border border-white text-gray-900 font-medium min-w-0 shadow-[0_23px_30.7px_0_rgba(0,0,0,0.05)] hover:bg-white/50 active:scale-[0.98] transition-all duration-200 ease-in-out"
                        aria-label="LLM Provider"
                      >
                        {llmLoading ? (
                          <span className="text-sm">...</span>
                        ) : currentLlmIntegration ? (
                          <>
                            <span className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden',
                              currentLlmIntegration.provider === 'anthropic' && 'bg-[#E0775B]',
                              currentLlmIntegration.provider === 'openai' && 'bg-[#10a37f]',
                              currentLlmIntegration.provider === 'google' && 'bg-[#4285f4]'
                            )}>
                              {currentLlmIntegration.provider === 'anthropic' && (
                                <Image src="/Claude.jpeg" alt="" width={12} height={12} className="object-contain" />
                              )}
                              {currentLlmIntegration.provider === 'openai' && (
                                <OpenAiLogoIcon size={12} className="text-white" />
                              )}
                              {currentLlmIntegration.provider === 'google' && (
                                <Image src="/gemini.png" alt="" width={12} height={12} className="object-contain" />
                              )}
                            </span>
                            <span className="truncate max-w-[80px] text-xs">
                              {currentLlmIntegration.provider === 'anthropic' ? 'Claude AI' : currentLlmIntegration.provider === 'google' ? 'Gemini' : 'GPT'}
                            </span>
                            <ChevronDown className="w-3 h-3 shrink-0 text-black" />
                          </>
                        ) : (
                          <>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200">
                              <span className="text-[9px] font-medium text-gray-500">LLM</span>
                            </span>
                            <span className="truncate max-w-[80px] text-xs">LLM</span>
                            <ChevronDown className="w-3 h-3 shrink-0 text-black" />
                          </>
                        )}
                      </button>
                      <AnimatePresence>
                        {llmProviderOpen && (
                          <motion.div
                            key="llm-provider-dropdown"
                            className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl overflow-hidden z-50 py-1 bg-[rgba(255,255,255,0.85)] backdrop-blur-xl border border-white shadow-[0_23px_30.7px_0_rgba(0,0,0,0.05)] origin-bottom"
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          >
                            {LLM_PROVIDERS.map((p) => {
                            const hasKey = !!integrationForProvider(p.id)
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleLlmProviderSelect(p.id)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-white/60 active:scale-[0.98] transition-all duration-200 ease-in-out"
                              >
                                {p.icon === 'anthropic' && <Image src="/Claude.jpeg" alt="" width={20} height={20} className="rounded object-contain" />}
                                {p.icon === 'openai' && <OpenAiLogoIcon size={20} className="text-[#10a37f]" />}
                                {p.icon === 'google' && <Image src="/gemini.png" alt="" width={20} height={20} className="rounded object-contain" />}
                                <span>{p.label}</span>
                                {!hasKey && <span className="text-xs text-amber-600 ml-auto">Add key</span>}
                              </button>
                            )
                          })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : null
                }
              />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {addKeyModalProvider && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/15 backdrop-blur-md rounded-3xl">
          <div className="rounded-2xl p-4 w-full max-w-sm mx-4 bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.12)]">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Add {addKeyModalProvider === 'anthropic' ? 'Claude' : addKeyModalProvider === 'google' ? 'Gemini' : 'OpenAI'} API key
            </h3>
            <input
              type="password"
              placeholder="Paste your API key"
              value={addKeyValue}
              onChange={(e) => { setAddKeyValue(e.target.value); setAddKeyError('') }}
              className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 transition-all duration-200"
            />
            {addKeyError && <p className="text-xs text-red-600 mt-1">{addKeyError}</p>}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => { setAddKeyModalProvider(null); setAddKeyValue(''); setAddKeyError('') }}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl hover:bg-white/70 active:scale-[0.98] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddKeySubmit}
                disabled={!addKeyValue.trim() || addKeyLoading}
                className="flex-1 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-xl active:scale-[0.98] disabled:opacity-50 transition-transform duration-150"
              >
                {addKeyLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
    )}
  </AnimatePresence>
  )
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default WebAgentChatDrawer
