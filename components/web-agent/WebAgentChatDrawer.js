'use client'

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from '@mui/material'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { X, RotateCcw, Upload, ChevronDown, Sparkles } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { agentImage } from '@/utilities/agentUtilities'
import AgentXOrb from '@/components/common/AgentXOrb'
import WebAgentChatInput from './WebAgentChatInput'
import Apis from '@/components/apis/Apis'
import { MessageMarkdown } from '@/components/messaging/messageMarkdown'

/**
 * Normalize message content so **bold** renders correctly.
 * - Unwrap backticks around **bold** (LLMs often wrap bold in inline code).
 * - Unescape \*\* so markdown can parse.
 * - Decode &#42; so escaped asterisks become real **.
 */
function normalizeMarkdownForDisplay(content) {
  if (!content || typeof content !== 'string') return content
  return content
    .replace(/`(\*\*[^`]+\*\*)`/g, '$1')
    .replace(/\\\*\*/g, '**')
    .replace(/&#42;/g, '*')
}

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

import { getVisitorId } from './visitorId'
import { OpenAiLogoIcon } from '@phosphor-icons/react'

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
  { id: 'openai', label: 'OpenAI | 4o-mini', icon: 'openai' },
  { id: 'anthropic', label: 'Claude | Haiku-4-5', icon: 'anthropic' },
  { id: 'google', label: 'Gemini | 2.5-pro', icon: 'google' },
]

const noop = () => { }

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
  agentVapiId,
  agentName,
  agencyBranding = null,
  agent = null,
  agentAvatar = null,
  leadId = null,
  initialThreadId = null,
  canChangeLlmProvider = false,
  formData = null
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
  const [historyClosing, setHistoryClosing] = useState(false)
  const [llmProviderClosing, setLlmProviderClosing] = useState(false)
  const POPOVER_EXIT_MS = 200
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
  const [shareLinkLoading, setShareLinkLoading] = useState(false)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)
  const [shareLinkUrl, setShareLinkUrl] = useState(null)

  const closeHistory = useCallback(() => {
    setHistoryClosing(true)
    const t = setTimeout(() => {
      setHistoryOpen(false)
      setHistoryClosing(false)
    }, POPOVER_EXIT_MS)
    return () => clearTimeout(t)
  }, [])

  const closeLlmProvider = useCallback(() => {
    setLlmProviderClosing(true)
    const t = setTimeout(() => {
      setLlmProviderOpen(false)
      setLlmProviderClosing(false)
    }, POPOVER_EXIT_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!historyOpen) return
    const onMouseDown = (e) => {
      if (isAgentationTarget(e.target)) return
      if (historyPanelRef.current && !historyPanelRef.current.contains(e.target)) {
        closeHistory()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [historyOpen, closeHistory])

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
      const threadId = initialThreadId != null ? Number(initialThreadId) : null
      if (threadId != null && !Number.isNaN(threadId)) {
        setCurrentThreadId(threadId)
        setCurrentSessionId(null)
        loadMessages(threadId)
      } else {
        setCurrentThreadId(null)
        setCurrentSessionId(null)
        setMessages([])
      }
      setCurrentThreadTitle(null)
      setMessages([])
      setHistoryOpen(false); setHistoryClosing(false)
      // One frame delay so Modal is in DOM before we expand; avoids flicker of 0-height panel
      const id = requestAnimationFrame(() => setExpanded(true))
      return () => cancelAnimationFrame(id)
    } else {
      setExpanded(false)
      setCurrentThreadId(null)
      setCurrentSessionId(null)
      setCurrentThreadTitle(null)
      setSessionError(null)
      setMessages([])
      setHistoryOpen(false); setHistoryClosing(false)
    }
  }, [open, initialThreadId, loadMessages])

  // On open + expanded: for new chat just set a sessionId (thread is created on first send). Skip when opening shared thread.
  useEffect(() => {
    if (!open || !expanded || !agentId) return
    if (initialThreadId != null) return
    if (currentThreadId == null && currentSessionId == null) {
      const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      setCurrentSessionId(sessionId)
    }
  }, [open, expanded, agentId, initialThreadId, currentThreadId, currentSessionId])

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
    if (closing) {
      onClose()
      setClosing(false)
    }
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

  const displayTitle = truncateTitle(currentThreadTitle)
  const displayTitleFull = currentThreadTitle

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
    closeHistory()
  }

  const copyToClipboardFallback = useCallback((text) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    try {
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      return ok
    } catch (e) {
      document.body.removeChild(textarea)
      return false
    }
  }, [])

  const copyShareLink = useCallback(async () => {
    if (currentThreadId == null || !agentId) return
    setShareLinkLoading(true)
    setShareLinkCopied(false)
    setShareLinkUrl(null)
    try {
      const visitorId = getVisitorId()
      const { data } = await axios.get('/api/public/web-chat/share-link', {
        params: {
          agentId: Number(agentId),
          threadId: currentThreadId,
          visitorId: visitorId || undefined,
        },
      })
      if (data?.status && data?.data?.shareToken) {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/web-agent/${agentVapiId}?share=${data.data.shareToken}`
        let copied = false
        try {
          await navigator.clipboard.writeText(url)
          copied = true
        } catch (clipboardErr) {
          copied = copyToClipboardFallback(url)
        }
        if (copied) {
          setShareLinkCopied(true)
          setTimeout(() => setShareLinkCopied(false), 2000)
        } else {
          setShareLinkUrl(url)
        }
      }
    } catch (err) {
      console.error('Failed to get share link:', err?.message)
    } finally {
      setShareLinkLoading(false)
    }
  }, [currentThreadId, agentId, copyToClipboardFallback])

  const copyShareLinkFromModal = useCallback(() => {
    if (!shareLinkUrl) return
    try {
      navigator.clipboard.writeText(shareLinkUrl)
      setShareLinkCopied(true)
      setTimeout(() => setShareLinkCopied(false), 2000)
      setShareLinkUrl(null)
    } catch {
      if (copyToClipboardFallback(shareLinkUrl)) {
        setShareLinkCopied(true)
        setTimeout(() => setShareLinkCopied(false), 2000)
        setShareLinkUrl(null)
      }
    }
  }, [shareLinkUrl, copyToClipboardFallback])

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
      closeLlmProvider()
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
    [closeLlmProvider, getAuthToken, integrationForProvider]
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
        closeLlmProvider()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [llmProviderOpen, closeLlmProvider])

  // Ready when we have a thread (from first send or history) or a sessionId (new chat, thread created on first send)
  const sessionReady = !!(agentId && (currentThreadId != null || currentSessionId != null))

  useEffect(() => {
    if (!sendLoading) return
    const id = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length)
    }, 4000)
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

  const handleModalClose = (event, reason) => {
    if (reason === 'backdropClick' && event?.target && isAgentationTarget(event.target)) return
    if (closing) return
    onClose()
  }
  const showOverlay = open || closing
  if (!showOverlay) return null

  const modalContent = (
    <Modal
      open={showOverlay}
      // onClose={handleModalClose}
      closeAfterTransition
      aria-label="Chat"
      sx={{ zIndex: 9999 }}
      slotProps={{
        root: {
          sx: {
            // Disable MUI's default backdrop transition to prevent flicker on open
            '& .MuiBackdrop-root': { transition: 'none' },
          },
        },
      }}
      BackdropProps={{
        sx: {
          background: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        },
      }}
    >
      <div className="absolute inset-0 size-full">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0,0,0,0.05)',
            // backdropFilter: 'blur(4px)',
          }}
          aria-hidden
        />
        <div className="absolute inset-0 flex justify-center items-end pointer-events-none pb-5">
          <div
            className={cn(
              'pointer-events-auto flex flex-col overflow-hidden',
              'rounded-[32px] w-full max-w-[757px]',
              'border border-white',
              'backdrop-blur-[44px]',
              // Hide panel until expanded to avoid flicker of 0-height bar
              !expanded ? 'opacity-0' : 'opacity-100'
            )}
            style={{
              height: expanded ? '84vh' : 0,
              minHeight: expanded ? 504 : 0,
              background: 'rgba(255,255,255,0.8)',
              boxShadow:
                '0px -10px 45.9px 0px rgba(185,185,185,0.05), 0px -25px 38.9px 0px rgba(255,255,255,0.04)',
              transition: 'height 320ms cubic-bezier(0.34, 1.08, 0.64, 1), opacity 220ms ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
            onTransitionEnd={handleTransitionEnd}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between px-4 py-3 min-w-0 relative z-10">
              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/40 border border-white text-gray-700 transition-transform duration-150 hover:bg-white/60 active:scale-[0.98]"
                  style={{ boxShadow: '0px 23px 30.7px 0px rgba(0,0,0,0.05)' }}
                  aria-label="Close chat"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
                {/*(headerAvatar || agentName) && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/90 border border-white/70 overflow-hidden flex items-center justify-center shadow-sm">
                    {typeof headerAvatar === 'string' && headerAvatar.trim().length > 0 ? (
                      <Image
                        src={headerAvatar}
                        alt={agentName || 'Agent'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-semibold text-gray-700">
                        {agentName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                )*/}
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
                    className="flex-1 min-w-0 font-semibold text-[15px] text-gray-900 bg-white/70 rounded-xl px-2.5 py-1 border border-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="Chat title"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={startTitleEdit}
                    className={cn(
                      'flex-1 min-w-[80px] font-semibold text-[15px] text-gray-900 truncate text-left overflow-hidden block',
                      currentThreadId != null && 'hover:bg-white/60 rounded-lg px-1.5 -mx-1'
                    )}
                    title={currentThreadId != null ? (displayTitleFull !== displayTitle ? displayTitleFull : 'Click to edit title') : displayTitleFull}
                  >
                    {displayTitle}
                  </button>
                )}
              </div>
              <div ref={historyPanelRef} className="flex items-center gap-3 shrink-0 relative">
                <button
                  type="button"
                  onClick={openHistory}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/40 border border-white text-gray-700 transition-transform duration-150 hover:bg-white/60 active:scale-[0.98]"
                  style={{ boxShadow: '0px 23px 30.7px 0px rgba(0,0,0,0.05)' }}
                  aria-label="History"
                >
                  <RotateCcw className="w-[18px] h-[18px]" />
                </button>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={currentThreadId != null ? copyShareLink : undefined}
                        disabled={shareLinkLoading || currentThreadId == null}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 transition-colors shadow-sm disabled:opacity-60"
                        aria-label={shareLinkCopied ? 'Link copied' : currentThreadId != null ? 'Copy chat link' : 'Send a message to get a shareable link'}
                      >
                        {shareLinkLoading ? (
                          <span className="text-xs">...</span>
                        ) : shareLinkCopied ? (
                          <span className="text-xs text-green-600 font-medium">✓</span>
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                      {shareLinkCopied ? 'Link copied' : currentThreadId != null ? ' Copy link to share' : 'Send a message to get a shareable link'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* History dropdown: compact floating panel (like second screenshot) */}
                {(historyOpen || historyClosing) && (
                  <div
                    className={cn(
                      'absolute top-full right-0 mt-2 w-72 max-h-80 rounded-[12px] bg-white/80 border border-white backdrop-blur-[34px] overflow-hidden z-50 flex flex-col',
                      historyClosing ? 'chat-popover-exit-below' : 'chat-popover-enter-below'
                    )}
                    style={{ boxShadow: '0px 7px 147.2px 0px rgba(0,0,0,0.06)' }}
                    role="dialog"
                    aria-label="Chat history"
                  >
                    <div className="flex-shrink-0 flex items-center justify-between px-3 py-3 border-b border-[rgba(21,21,21,0.1)] bg-white/80">
                      <span className="text-[14px] font-normal text-[#666666]">History</span>
                      <button
                        type="button"
                        onClick={closeHistory}
                        className="p-1 rounded-full hover:bg-white text-gray-500 hover:text-gray-700 transition-transform duration-150 active:scale-[0.98]"
                        aria-label="Close history"
                      >
                        <X className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 py-1 px-1">
                      {historyLoading ? (
                        <p className="px-3 py-3 text-sm text-gray-500">Loading...</p>
                      ) : historyList.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-gray-500">No previous chats</p>
                      ) : (
                        historyList.map((t) => {
                          const isActive = currentThreadId === t.id
                          const createdAt = t.lastMessageAt || t.createdAt
                          const dateStr =
                            t.dateStr ||
                            (createdAt
                              ? new Date(createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                              : '')
                          const timeStr =
                            t.timeStr ||
                            (createdAt
                              ? new Date(createdAt).toLocaleTimeString(undefined, {
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                              : '')

                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => selectHistoryThread(t)}
                              className={cn(
                                'relative group w-full min-w-0 text-left px-3 py-2.5 text-[14px] rounded-[8px] flex flex-col gap-0.5 overflow-hidden',
                                isActive
                                  ? 'bg-[rgba(234,226,255,0.4)] text-brand-primary'
                                  : 'text-[#151515]'
                              )}
                              title={t.title || 'New chat'}
                            >
                              {!isActive && (
                                <span
                                  className="absolute inset-0 rounded-[999px] bg-transparent -translate-x-3 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                                  aria-hidden
                                />
                              )}
                              <span className="relative z-10 truncate block min-w-0 overflow-hidden">
                                {truncateTitle(t.title) || 'New chat'}
                              </span>
                              {(dateStr || timeStr) && (
                                <span className="relative z-10 text-xs text-gray-500">
                                  {dateStr}
                                  {timeStr ? `, ${timeStr}` : ''}
                                </span>
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Body: messages or empty state */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col px-4 py-4 relative z-0">
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="flex flex-col gap-3 px-4">
                  {messages.map((m) => {
                    const isInbound = m.direction === 'inbound'
                    const attachments = m.metadata?.attachments || []
                    const imageAttachments = attachments.filter((a) => a.type === 'image' && a.dataUrl)
                    const agentThumbRaw = agent?.thumb_profile_image || (typeof agentAvatar === 'string' ? agentAvatar : null)
                    const agentThumb = typeof agentThumbRaw === 'string' && agentThumbRaw.trim().length > 0 ? agentThumbRaw : null
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          'flex items-start gap-2 w-full',
                          isInbound ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {!isInbound && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex-shrink-0 cursor-default">
                                  {/*agentThumb ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0">
                                      <Image
                                        src={agentThumb}
                                        alt={agentName || 'Agent'}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 mt-2">
                                      {(agentName || 'A').charAt(0).toUpperCase()}
                                    </div>
                                  )*/}
                                  {agentImage(agent)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right">{agentName || 'Agent'}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <div
                          className={cn(
                            'max-w-[85%] min-w-0 overflow-hidden break-words',
                            'text-[14px] font-normal leading-[1.5] text-[#0e0e0e]',
                            isInbound
                              ? 'rounded-bl-[12px] rounded-br-[12px] rounded-tl-[12px] px-3 py-2 bg-white'
                              : 'rounded-bl-[8px] rounded-br-[8px] rounded-tr-[8px] px-4 py-2 bg-[rgba(246,247,249,0.28)]'
                          )}
                        >
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
                            <div className="whitespace-pre-wrap break-words text-black/80 [&_p]:mb-1 [&_p:last-child]:mb-0">
                              <MessageMarkdown content={normalizeMarkdownForDisplay(m.content)} />
                            </div>
                          ) : null}
                          <p className="mt-1 text-[11px] leading-tight text-gray-400">
                            {new Date(m.createdAt).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {isInbound && (
                          <div
                            className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-semibold text-xs flex-shrink-0 mt-2"
                            aria-hidden
                          >
                            {formData?.firstName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {sendLoading && (
                    <div className="flex items-end gap-3 w-full justify-start mt-3">
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
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/95 border border-white/80 min-w-[140px] shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
                        <span className="text-sm text-gray-600">
                          {THINKING_MESSAGES[thinkingIndex]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                  <div className="relative flex-shrink-0 mb-4">
                    <div className="relative z-10 flex items-center justify-center">
                      <AgentXOrb size={192} alt="Agent" />
                    </div>
                    <div
                      className="absolute inset-0 rounded-full blur-2xl -z-0 pointer-events-none"
                      style={{
                        width: '140%',
                        height: '140%',
                        left: '-20%',
                        top: '-10%',
                        background:
                          'radial-gradient(ellipse 60% 50% at 50% 85%, rgba(236,72,153,0.32) 0%, rgba(167,139,250,0.28) 35%, rgba(99,102,241,0.18) 60%, transparent 75%)',
                      }}
                    />
                  </div>
                  <p
                    className="text-center font-semibold text-[#0e0e0e] max-w-sm"
                    style={{ fontSize: '22px', lineHeight: '30px', letterSpacing: '-0.77px' }}
                  >
                    {emptyStateMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Footer: attached files + input (Plus = attach, Send) */}
            <div className="flex-shrink-0 px-4 pb-6 pt-4">
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
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/85 border border-white/80 text-gray-700 text-xs"
                    >
                      {file.name}
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="p-0.5 rounded hover:bg-gray-200 text-gray-500 transition-transform duration-150 active:scale-[0.98]"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="w-[18px] h-[18px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative group w-full max-w-[678px] mx-auto">
                <div className="chat-input-glow-layer-1" />
                <div className="chat-input-glow-layer-2" />
                <div className="chat-input-glow-layer-3" />
                <div className="chat-input-glow-layer-4" />
                <div className="chat-input-glow-layer-5" />
                <div className="chat-input-glow-layer-6" />
                <WebAgentChatInput
                  className="relative z-10"
                  inputRef={modalInputRef}
                  placeholder={sessionReady ? 'Ask me anything' : 'Connecting...'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onAttachFiles={(files) => setAttachedFiles((prev) => [...prev, ...files])}
                  onSubmit={handleSend}
                  disabled={!sessionReady || sendLoading}
                  stackedLayout
                  leftAddon={
                    canChangeLlmProvider ? (
                      <div ref={llmProviderRef} className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => (llmProviderOpen ? closeLlmProvider() : setLlmProviderOpen(true))}
                          disabled={llmLoading}
                          className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/40 border border-white text-gray-900 font-medium min-w-0 text-sm transition-transform duration-150 hover:bg-white/60 active:scale-[0.98]"
                          style={{ boxShadow: '0px 23px 30.7px 0px rgba(0,0,0,0.05)' }}
                          aria-label="LLM Provider"
                        >
                          {llmLoading ? (
                            <span className="text-sm">...</span>
                          ) : currentLlmIntegration ? (
                            <>
                              <span className={cn(
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full overflow-hidden',
                                currentLlmIntegration.provider === 'anthropic' && 'bg-[#E0775B]',
                                // currentLlmIntegration.provider === 'openai' && 'bg-[#10a37f]',
                                currentLlmIntegration.provider === 'google' && 'bg-[#4285f4]'
                              )}>
                                {currentLlmIntegration.provider === 'anthropic' && (
                                  <Image src="/Claude.jpeg" alt="" width={14} height={14} className="object-contain" />
                                )}
                                {currentLlmIntegration.provider === 'openai' && (
                                  <OpenAiLogoIcon size={19} className="text-brand-primary" />
                                )}
                                {currentLlmIntegration.provider === 'google' && (
                                  <Image src="/gemini.png" alt="" width={14} height={14} className="object-contain" />
                                )}
                              </span>
                              <span className="truncate max-w-[100px] text-sm">
                                {currentLlmIntegration.provider === 'anthropic' ? 'Claude AI' : currentLlmIntegration.provider === 'google' ? 'Gemini' : 'GPT'}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-black" />
                            </>
                          ) : (
                            <>
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                <span className="text-[10px] font-medium text-gray-500">LLM</span>
                              </span>
                              <span className="truncate max-w-[100px] text-sm">LLM</span>
                              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-black" />
                            </>
                          )}
                        </button>
                        {(llmProviderOpen || llmProviderClosing) && (
                          <div
                            className={cn(
                              'absolute left-0 bottom-full mb-2 w-[250px] rounded-2xl overflow-hidden z-50 py-1 bg-white/90 backdrop-blur-xl border border-white/70',
                              llmProviderClosing ? 'chat-popover-exit-above' : 'chat-popover-enter-above'
                            )}
                            style={{
                              boxShadow:
                                '0 0 0 1px rgba(15,23,42,0.04), 0 10px 30px rgba(15,23,42,0.12)',
                            }}
                          >
                            {LLM_PROVIDERS.map((p) => {
                              const hasKey = !!integrationForProvider(p.id)
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleLlmProviderSelect(p.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-white/70 active:scale-[0.99] transition-transform"
                                >
                                  {p.icon === 'anthropic' && (
                                    <Image src="/Claude.jpeg" alt="" width={20} height={20} className="rounded object-contain" />
                                  )}
                                  {/*<Sparkles className="w-5 h-5 text-[#10a37f]" />*/}
                                  {p.icon === 'openai' && (
                                    <OpenAiLogoIcon size={19} className="text-brand-primary" />
                                  )}
                                  {p.icon === 'google' && (
                                    <Image src="/gemini.png" alt="" width={20} height={20} className="rounded object-contain" />
                                  )}
                                  <span>{p.label}</span>
                                  {!hasKey && (
                                    <span className="text-xs text-amber-600 ml-auto">Add key</span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ) : null
                  }
                />
              </div>
            </div>
          </div>

          {shareLinkUrl && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-sm rounded-3xl">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-full max-w-md mx-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Share chat link</h3>
                <p className="text-xs text-gray-600 mb-2">Copy failed in the background. Copy the link below or use the button.</p>
                <input
                  type="text"
                  readOnly
                  value={shareLinkUrl}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setShareLinkUrl(null)}
                    className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={copyShareLinkFromModal}
                    className="flex-1 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
  return modalContent
}

export default WebAgentChatDrawer
