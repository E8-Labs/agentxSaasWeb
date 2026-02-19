'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import moment from 'moment'
import { PaperPlaneTilt, CircleNotch, Paperclip } from '@phosphor-icons/react'
import { ChevronDown } from 'lucide-react'
import { Drawer, CircularProgress } from '@mui/material'
import Image from 'next/image'
import { toast } from '@/utils/toast'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { AgentXOrb } from '@/components/common/AgentXOrb'
import CallTranscriptCN from '@/components/dashboard/leads/extras/CallTranscriptCN'
import DropdownCn from '@/components/dashboard/leads/extras/DropdownCn'
import RichTextEditor from '@/components/common/RichTextEditor'
import Apis from '@/components/apis/Apis'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import voicesList from '@/components/createagent/Voices'
import remarkGfm from 'remark-gfm'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Markdown components for AI replies: compact styling inside the chat bubble
// li > p as inline so "1." and "Identify the Bottleneck:" stay on same line (remark-gfm wraps list text in <p>)
const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="text-base font-semibold mb-1.5 mt-2 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }) => (
    <li className="leading-relaxed [&>p]:inline [&>p]:m-0 [&>p:not(:last-child)]:mr-1">
      {children}
    </li>
  ),
  pre: ({ children }) => (
    <pre className="whitespace-pre-wrap break-words max-w-full my-2 p-2 rounded bg-muted text-sm">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-')
    return isBlock ? (
      <code className={cn(className, 'whitespace-pre-wrap break-words')}>{children}</code>
    ) : (
      <code className="break-words rounded px-1 py-0.5 bg-muted">{children}</code>
    )
  },
}

// Lottie animation for "Thinking..." state (load once)
let thinkingAnimationData = null
try {
  thinkingAnimationData = require('../../public/assets/animation/subAccountLoader.json')
} catch {
  // fallback if path differs
}

// Helpers for rich text (match MessageComposer)
const hasTextContent = (html) => {
  if (!html) return false
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    return textContent.trim().length > 0
  }
  const textOnly = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return textOnly.length > 0
}

const stripHTML = (html) => {
  if (!html) return ''
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    let processedHtml = html
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
    tempDiv.innerHTML = processedHtml
    const text = tempDiv.textContent || tempDiv.innerText || ''
    return text.replace(/\n{3,}/g, '\n\n').trim()
  }
  return html
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const AiChatModal = ({
  open,
  onClose,
  callData,
  callSummaryMessage,
  selectedThread,
  parentMessageId,
  onPlayRecording,
  onCopyCallId,
  onReadTranscript,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [aiKeyError, setAiKeyError] = useState(false)
  const [agentsList, setAgentsList] = useState([]) // from API: array of { id: mainAgentId, name, agents: [{ id: agentId, name, ... }] }
  const [selectedAgentId, setSelectedAgentId] = useState(null) // AgentModel.id (sub-agent), loaded from message settings (DB)
  const [agentsLoading, setAgentsLoading] = useState(false)
  const [userAvatarImageError, setUserAvatarImageError] = useState(false)
  const [failedUserAvatarIds, setFailedUserAvatarIds] = useState(() => new Set())
  const messagesEndRef = useRef(null)
  const aiEditorRef = useRef(null)
  const hasLoadedRef = useRef(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus editor when modal opens
  useEffect(() => {
    if (open && aiEditorRef.current) {
      const timer = setTimeout(() => {
        const editor = aiEditorRef.current?.getEditor?.()
        if (editor?.root) editor.root.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  const messagesList = [
    "Sipping coffee...",
    "Typing...",
    "Dreaming...",
    "Creating...",
    "Still on it...",
    "Don't leave yet...",
    "Stay with me...",
  ];

  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    // if (!isLoading) {
    //   setRotatingIndex(0);
    //   return;
    // }
    const id = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % messagesList.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isLoading]);

  // Load user's agents for prompt dropdown (no pagination = get up to 100)
  const loadAgents = useCallback(async () => {
    if (!open) return
    setAgentsLoading(true)
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return
      const userData = JSON.parse(localData)
      const token = userData.token
      const res = await fetch(`${Apis.getAgents}?pagination=false`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (data?.status && Array.isArray(data?.data)) {
        setAgentsList(data.data)
      }
    } catch (error) {
      console.error('Error loading agents for AI chat:', error)
    } finally {
      setAgentsLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (open) loadAgents()
  }, [open, loadAgents])

  // When modal opens, load persisted AI chat agent from message settings (DB)
  const loadMessageSettingsForAgent = useCallback(async () => {
    if (!open) return
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await fetch(Apis.getMessageSettings, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (data?.status && data?.data) {
        const id = data.data.aiChatSelectedAgentId
        setSelectedAgentId(id === undefined || id === null ? null : id)
      }
    } catch (error) {
      console.error('Error loading message settings for AI chat agent:', error)
    }
  }, [open])

  useEffect(() => {
    if (open) loadMessageSettingsForAgent()
  }, [open, loadMessageSettingsForAgent])


  // Get auth token from localStorage (same as other API calls)
  const getAuthToken = () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return null
      const userData = JSON.parse(localData)
      return userData?.token ?? null
    } catch {
      return null
    }
  }

  // Load persisted chat history when modal opens
  const loadChatHistory = useCallback(async () => {
    if (!parentMessageId || !open) return

    setIsLoadingHistory(true)
    try {
      const token = getAuthToken()
      const res = await fetch(
        `${Apis.aiChat}?parentMessageId=${parentMessageId}`,
        {
          method: 'GET',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            'Content-Type': 'application/json',
          },
        },
      )
      const data = await res.json()

      if (data.status && data.data) {
        setMessages(
          data.data.map((msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            createdAt: msg.createdAt,
            ...(msg.senderUser && { senderUser: msg.senderUser }),
          })),
        )
      }
    } catch (error) {
      console.error('Error loading AI chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [parentMessageId, open])

  useEffect(() => {
    if (open && parentMessageId && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadChatHistory()
    }
    if (!open) {
      hasLoadedRef.current = false
    }
  }, [open, parentMessageId, loadChatHistory])

  // Reset state when modal closes (keep selectedAgentId so it persists for next open)
  const handleClose = () => {
    setInputValue('')
    setMessages([])
    setAiKeyError(false)
    setUserAvatarImageError(false)
    onClose()
  }

  // Reset user avatar error when modal opens so profile image is retried
  useEffect(() => {
    if (open) {
      setUserAvatarImageError(false)
      setFailedUserAvatarIds(new Set())
    }
  }, [open])

  // Flat list of sub-agents (AgentModel) for dropdown; include thumb and voiceId for avatar (profile image → voice avatar → orb, same as myAgentX)
  const flatAgentsList = React.useMemo(() => {
    if (!Array.isArray(agentsList)) return []
    return agentsList.flatMap((m) =>
      (m.agents || []).map((a) => ({
        id: a.id,
        name: a.name || m.name || `Agent ${a.id}`,
        thumb_profile_image: a.thumb_profile_image || null,
        voiceId: a.voiceId || null,
      })),
    )
  }, [agentsList])

  // Agent avatar for dropdown: profile image → voice avatar (from voiceId) → orb fallback (same logic as myAgentX getAgentProfileImage)
  const getAgentAvatarForDropdown = (agent, size = 20) => {
    if (!agent) return <AgentXOrb width={size} height={size} className="shrink-0 rounded-full" />
    if (agent.thumb_profile_image) {
      return (
        <Image
          src={agent.thumb_profile_image}
          width={size}
          height={size}
          alt=""
          className="rounded-full object-cover shrink-0"
          unoptimized
        />
      )
    }
    if (agent.voiceId) {
      const selectedVoice = voicesList.find((v) => v.voice_id === agent.voiceId)
      if (selectedVoice?.img) {
        return (
          <Image
            src={selectedVoice.img}
            width={size}
            height={size}
            alt=""
            className="rounded-full object-cover shrink-0"
          />
        )
      }
    }
    return <AgentXOrb width={size} height={size} className="shrink-0 rounded-full" />
  }

  // Persist selected AI chat agent to message settings (DB)
  const persistAgentSelectionToDb = useCallback(async (agentId) => {
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await fetch(Apis.updateMessageSettings, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiChatSelectedAgentId: agentId === null || agentId === undefined ? null : agentId,
        }),
      })
      const data = await res.json()
      if (!data?.status) {
        toast.error(data?.message || 'Failed to save agent preference')
      }
    } catch (error) {
      console.error('Error saving AI chat agent preference:', error)
      toast.error('Failed to save agent preference')
    }
  }, [])

  const agentDropdownOptions = React.useMemo(() => {
    const defaultOpt = {
      label: (
        <span className="flex items-center gap-2">
          <AgentXOrb width={20} height={20} />
          <span>Sky</span>
        </span>
      ),
      value: '__default__',
      onSelect: () => {
        setSelectedAgentId(null)
        persistAgentSelectionToDb(null)
      },
    }
    const agentOpts = flatAgentsList.map((agent) => ({
      label: (
        <span className="flex items-center gap-2">
          {getAgentAvatarForDropdown(agent, 20)}
          <span className="truncate">{agent.name}</span>
        </span>
      ),
      value: agent.id,
      onSelect: () => {
        setSelectedAgentId(agent.id)
        persistAgentSelectionToDb(agent.id)
      },
    }))
    return [defaultOpt, ...agentOpts]
  }, [flatAgentsList, persistAgentSelectionToDb])

  const agentDropdownLabel =
    selectedAgentId != null
      ? (flatAgentsList.find((a) => a.id == selectedAgentId)?.name ?? 'Select agent')
      : 'Sky'

  // Trigger icon: orb for Sky, agent avatar for selected agent (profile → voice avatar → orb, same as myAgentX)
  const AgentDropdownTriggerIcon = ({ className }) => {
    const sel = flatAgentsList.find((a) => a.id == selectedAgentId)
    if (sel) {
      return (
        <span className={cn('shrink-0 mr-2', className)}>
          {getAgentAvatarForDropdown(sel, 24)}
        </span>
      )
    }
    return <AgentXOrb width={24} height={24} className={cn('shrink-0 mr-2', className)} />
  }

  const handleSend = async () => {
    const messageText = stripHTML(inputValue).trim()
    if (!messageText || isLoading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      content: messageText,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('<p><br></p>')
    setIsLoading(true)

    try {
      const token = getAuthToken()
      if (!token) {
        toast.error('Please log in again to use AI Chat.')
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
        setIsLoading(false)
        return
      }

      const res = await fetch(Apis.aiChat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parentMessageId,
          threadId: selectedThread?.id,
          message: messageText,
          agentId: selectedAgentId || undefined,
        }),
      })

      const data = await res.json()

      if (data.code === 'AI_KEY_NOT_CONFIGURED') {
        setAiKeyError(true)
        // Remove the optimistic user message since we can't process it
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
        return
      }

      if (!data.status) {
        toast.error(data.message || 'Failed to get AI response')
        // Remove the optimistic user message on failure
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
        return
      }

      // Replace optimistic user message with persisted one (include senderUser for avatar)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id
            ? {
              id: data.userMessage.id,
              content: data.userMessage.content,
              role: data.userMessage.role,
              createdAt: data.userMessage.createdAt,
              ...(data.userMessage.senderUser && { senderUser: data.userMessage.senderUser }),
            }
            : m,
        ),
      )

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: data.assistantMessage.id,
          content: data.assistantMessage.content,
          role: data.assistantMessage.role,
          createdAt: data.assistantMessage.createdAt,
        },
      ])
    } catch (error) {
      console.error('Error sending AI chat message:', error)
      toast.error('Failed to send message. Please try again.')
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (hasTextContent(inputValue)) handleSend()
    }
  }

  // Get lead name for header
  const getLeadName = () => {
    if (selectedThread?.lead?.firstName && selectedThread?.lead?.lastName) {
      return `${selectedThread.lead.firstName} ${selectedThread.lead.lastName}`
    }
    return (
      selectedThread?.lead?.firstName ||
      selectedThread?.lead?.name ||
      selectedThread?.lead?.phone ||
      'AI Chat'
    )
  }

  // Get caller name from the call summary message
  const getCallerName = () => {
    if (callSummaryMessage?.callerAgent?.name) {
      return callSummaryMessage.callerAgent.name
    }
    if (callSummaryMessage?.caller?.name) {
      return callSummaryMessage.caller.name
    }
    if (callSummaryMessage?.agent?.name) {
      return callSummaryMessage.agent.name
    }
    if (callSummaryMessage?.senderUser?.name) {
      return callSummaryMessage.senderUser.name
    }
    return null
  }

  const callerName = getCallerName()
  const callDate = callSummaryMessage?.createdAt
    ? moment(callSummaryMessage.createdAt).format('MMM D, h:mm A')
    : ''

  // Current (logged-in) user for outgoing message avatar: profile pic if available, else first letter
  const currentUserForAvatar = React.useMemo(() => {
    try {
      const local = localStorage.getItem('User')
      if (!local) return { thumb_profile_image: null, name: null }
      const data = JSON.parse(local)
      const user = data?.user || data
      return {
        thumb_profile_image: user?.thumb_profile_image || null,
        name: user?.name || user?.firstName || null,
      }
    } catch {
      return { thumb_profile_image: null, name: null }
    }
  }, [open])

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: '40%',
          borderRadius: '20px',
          padding: '0px',
          boxShadow: 3,
          margin: '1%',
          backgroundColor: 'white',
          height: '96.5vh',
          overflow: 'hidden',
          scrollbarWidth: 'none',
        },
      }}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
        },
      }}
    >
      <div className="flex flex-col w-full h-full py-1 px-4 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Image
              src="/otherAssets/starsIcon2.png"
              height={20}
              width={20}
              alt="AI"
            />
            <h2 className="text-xl font-semibold">AI Chat</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Agent dropdown: same style as stage dropdown (DropdownCn) */}
            {agentsLoading ? (
              <div className="flex items-center rounded-md border border-muted/90 bg-white shadow-sm h-[36px] px-4 min-w-[140px]">
                <CircularProgress size={20} />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <DropdownCn
                label={agentDropdownLabel}
                icon={AgentDropdownTriggerIcon}
                options={agentDropdownOptions}
                align="end"
                chevronIcon={ChevronDown}
              />
            )}
            <CloseBtn onClick={handleClose} />
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {/* Call summary as first message */}
          {callData && (
            <div className="flex flex-col items-center mb-6">
              {/* Date separator */}
              <div className="flex items-center justify-center mb-3 w-full">
                <div className="border-t border-gray-200 flex-1" />
                <span className="px-4 text-xs text-muted-foreground">
                  {callSummaryMessage?.createdAt
                    ? moment(callSummaryMessage.createdAt).format(
                      'MMMM DD, YYYY',
                    )
                    : 'Today'}
                </span>
                <div className="border-t border-gray-200 flex-1" />
              </div>

              {/* Called by label */}
              {callerName ? (
                <div className="text-sm text-system-text text-center px-4 mb-2">
                  Called by{' '}
                  <strong className="font-semibold">{callerName}</strong> on{' '}
                  {callDate}
                </div>
              ) : (
                <div className="text-sm text-system-text text-center px-4 mb-2">
                  <strong className="font-semibold">This lead</strong> was
                  called on {callDate}
                </div>
              )}

              {/* Call summary card (no AI actions) */}
              <div className="w-full max-w-2xl px-4">
                <div className="rounded-xl border border-border bg-background px-4 pb-2 shadow-sm">
                  <CallTranscriptCN
                    item={callData}
                    onPlayRecording={onPlayRecording}
                    onCopyCallId={onCopyCallId}
                    onReadTranscript={onReadTranscript}
                    leadName={selectedThread?.lead?.firstName}
                    leadId={selectedThread?.lead?.id}
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI Key Error State */}
          {aiKeyError && (
            <div className="flex items-center justify-center px-6 py-4 mb-4 mx-2 rounded-xl border border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-800 text-center">
                Connect an AI provider in{' '}
                <strong>Message Settings</strong> to use AI Chat.
              </p>
            </div>
          )}

          {/* Loading history */}
          {isLoadingHistory && (
            <div className="flex items-center justify-center py-8">
              <CircleNotch
                size={24}
                className="animate-spin text-muted-foreground"
              />
            </div>
          )}

          {/* Chat messages */}
          <div className="space-y-3 px-2">
            {messages.filter(Boolean).map((msg) => {
              const isUser = msg.role === 'user'

              return (
                <div key={msg.id} className="flex flex-col w-full">
                  <div
                    className={`flex items-end gap-2 w-full ${isUser ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    {/* AI avatar on left */}
                    {!isUser && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                          <AgentXOrb width={32} height={32} />
                        </div>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`max-w-[75%] min-w-[100px] min-w-0 overflow-hidden break-words px-4 py-2.5 text-sm leading-relaxed ${isUser
                        ? 'bg-brand-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                        : 'bg-gray-100 text-foreground rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                        }`}
                    >
                      {isUser ? (
                        msg.content
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {msg.content || ''}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* User avatar on right: sender's profile pic (from API) or current user's, else first letter */}
                    {isUser && (() => {
                      const sender = msg.senderUser ?? currentUserForAvatar
                      const avatarId = msg.senderUser?.id ?? 'current'
                      const thumb = msg.senderUser?.thumb_profile_image ?? currentUserForAvatar?.thumb_profile_image
                      const displayName = (msg.senderUser?.name ?? msg.senderUser?.firstName) || currentUserForAvatar?.name
                      const imageFailed = failedUserAvatarIds.has(avatarId) || (avatarId === 'current' && userAvatarImageError)
                      return (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                            {thumb && !imageFailed ? (
                              <Image
                                src={thumb}
                                width={32}
                                height={32}
                                alt=""
                                className="w-full h-full object-cover"
                                unoptimized
                                onError={() => setFailedUserAvatarIds((prev) => new Set(prev).add(avatarId))}
                              />
                            ) : (
                              <span className="text-white font-semibold text-xs bg-brand-primary w-full h-full flex items-center justify-center">
                                {(displayName || 'Y').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`mt-1 text-[10px] text-muted-foreground ${isUser ? 'text-right mr-10' : 'ml-10'
                      }`}
                  >
                    {msg?.createdAt ? moment(msg.createdAt).format('h:mm A') : ''}
                  </div>
                </div>
              )
            })}

            {/* Loading indicator: Lottie animation + rotating message every 0.5s */}
            {isLoading && (
              <div className="flex items-end gap-3 w-full justify-start">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden">
                  {thinkingAnimationData && (
                    <Lottie
                      animationData={thinkingAnimationData}
                      loop
                      style={{ width: 48, height: 48 }}
                    />
                  )}
                  {!thinkingAnimationData && (
                    <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                  )}
                </div>
                <div className=" text-foreground rounded-tr-2xl rounded-bl-2xl rounded-br-2xl px-4 py-3 flex items-center gap-2 min-w-[120px]">
                  <span className="text-sm text-gray-600">{messagesList[rotatingIndex]}</span>
                  {/*<div className="flex-1 min-w-[60px] border-b border-dashed border-gray-300" aria-hidden />*/}
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Input area - same formatting toolbar as MessageComposer (Bold, Underline, Lists, Paperclip, Send) */}
        <div className="border-t border-border pt-3 pb-3">
          <div
            className={`relative border border-brand-primary/20 rounded-lg bg-white transition-opacity ${aiKeyError || isLoading ? 'pointer-events-none opacity-60' : ''
              }`}
          >
            <RichTextEditor
              ref={aiEditorRef}
              value={inputValue}
              onChange={setInputValue}
              placeholder={
                aiKeyError
                  ? 'AI provider not configured...'
                  : isLoading
                    ? 'Waiting for response...'
                    : 'Type your message...'
              }
              availableVariables={[]}
              toolbarPosition="bottom"
              customToolbarElement={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Attach file (coming soon)"
                    disabled={aiKeyError || isLoading}
                  >
                    <Paperclip size={18} className="text-gray-600 hover:text-brand-primary" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={
                      !hasTextContent(inputValue) || isLoading || aiKeyError
                    }
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={16} className="text-white" />
                        <span className="text-sm">Sending...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">Send</span>
                        <PaperPlaneTilt size={16} weight="fill" />
                      </>
                    )}
                  </button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default AiChatModal
