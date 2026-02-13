import React, { useState, useRef, useEffect, useCallback } from 'react'
import moment from 'moment'
import axios from 'axios'
import { toast } from '@/utils/toast'
import { Modal, Box } from '@mui/material'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mail, ChevronDown, MessagesSquare, MessageSquareDot } from 'lucide-react'
import CallTranscriptCN from '@/components/dashboard/leads/extras/CallTranscriptCN'
import Image from 'next/image'
import Apis from '@/components/apis/Apis'

const MessageDotsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9" cy="10" r="0.5" fill="currentColor" />
    <circle cx="12" cy="10" r="0.5" fill="currentColor" />
    <circle cx="15" cy="10" r="0.5" fill="currentColor" />
  </svg>
)

const AI_ACTION_LABELS = {
  email: 'AI Email',
  text: 'AI Text',
  chat: 'AI Chat',
}

const isDevelopment = process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT !== 'Production'

/**
 * SystemMessage component for displaying system activity messages
 * (stage changes, team assignments, comments, etc.)
 */
const SystemMessage = ({ message, getAgentAvatar, selectedThread, onReadTranscript, onOpenMessageSettings, onOpenAiChat, onGenerateCallSummaryDrafts, selectedLead, leadName }) => {
  const [showAudioPlay, setShowAudioPlay] = useState(null)
  const [aiActionType, setAiActionType] = useState(null)
  const [aiActionInput, setAiActionInput] = useState('')
  const [hasAiKey, setHasAiKey] = useState(null) // null = loading, true/false
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false)
  const aiActionRef = useRef(null)

  useEffect(() => {
    if (aiActionType && aiActionRef.current) {
      // Small delay to let the textarea render before scrolling
      setTimeout(() => {
        aiActionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    }
  }, [aiActionType])

  // Check if user has an AI key (for call_summary AI Actions). Refetch when AI Action is opened so we pick up keys added in Message Settings.
  const fetchHasAiKey = useCallback(async () => {
    if (message?.activityType !== 'call_summary') return
    try {
      const localData = localStorage.getItem('User')
      if (!localData) {
        setHasAiKey(false)
        return
      }
      const userData = JSON.parse(localData)
      const token = userData.token
      const res = await axios.get(`${Apis.BasePath}api/mail/settings`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const data = res.data?.data
      const hasKey = !!(data?.aiIntegrationId || (data?.aiIntegration && typeof data.aiIntegration === 'object'))
      setHasAiKey(hasKey)
    } catch {
      setHasAiKey(false)
    }
  }, [message?.activityType])

  useEffect(() => {
    if (message?.activityType === 'call_summary') {
      fetchHasAiKey()
    }
  }, [message?.activityType, fetchHasAiKey])

  // Get avatar for comment sender
  const getCommentAvatar = () => {
    if (!message || message.activityType !== 'comment') return null

    // Use getAgentAvatar if available (for consistency with message avatars)
    if (getAgentAvatar && typeof getAgentAvatar === 'function') {
      // Create a message-like object for getAgentAvatar
      const messageLike = {
        id: message.id,
        senderUser: message.senderUser,
        agent: message.agent,
        direction: 'outbound', // Comments are always from team members
      }
      return getAgentAvatar(messageLike)
    }

    // Fallback: check senderUser directly
    if (message.senderUser?.thumb_profile_image) {
      return (
        <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
          <img
            src={message.senderUser.thumb_profile_image}
            alt={message.senderUser.name || 'Team Member'}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to letter if image fails
              e.target.style.display = 'none'
              const parent = e.target.parentElement
              if (parent) {
                const name = message.senderUser?.name || message.senderUser?.email || 'T'
                const letter = name.charAt(0).toUpperCase()
                parent.className = 'w-[26px] h-[26px] rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-xs flex-shrink-0'
                parent.textContent = letter
              }
            }}
          />
        </div>
      )
    }

    // Fallback to first letter
    const senderName = message.senderUser?.name || message.senderUser?.email || 'T'
    const avatarLetter = senderName.charAt(0).toUpperCase()
    return (
      <div className="w-[26px] h-[26px] rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
        {avatarLetter}
      </div>
    )
  }
  // Parse content and highlight mentions if it's a comment
  const parseContent = (content) => {
    if (!content) return ''

    // Escape HTML first
    const escapeHtml = (str) => {
      if (!str) return ''
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // If it's a comment, highlight @mentions using position-based bolding
    if (message.activityType === 'comment') {
      // Use mention positions if available (more reliable than regex)
      if (message.mentionPositions && Array.isArray(message.mentionPositions) && message.mentionPositions.length > 0) {
        // Sort mentions by start position (descending) to process from end to start
        // This prevents position shifts when inserting HTML
        const sortedMentions = [...message.mentionPositions].sort((a, b) => b.start - a.start)

        // Build result array working backwards from end
        const parts = []
        let currentIndex = content.length

        // Process mentions from end to start
        sortedMentions.forEach((mention, idx) => {
          // Verify positions are within bounds
          if (mention.start < 0 || mention.end > content.length || mention.start >= mention.end) {
            console.warn('[SystemMessage] Invalid mention position:', {
              start: mention.start,
              end: mention.end,
              contentLength: content.length,
            })
            return
          }

          // Add text between this mention and the previous one (if any)
          if (mention.end < currentIndex) {
            const textAfter = content.substring(mention.end, currentIndex)
            parts.unshift(escapeHtml(textAfter))
          }

          // Add the mention (bolded)
          const mentionText = mention.text || content.substring(mention.start, mention.end)
          const escapedMention = escapeHtml(mentionText)
          parts.unshift(`<span class="font-semibold text-system-text cursor-pointer hover:underline">${escapedMention}</span>`)

          currentIndex = mention.start
        })

        // Add any remaining text at the beginning
        if (currentIndex > 0) {
          const textBefore = content.substring(0, currentIndex)
          parts.unshift(escapeHtml(textBefore))
        }

        // Join all parts and replace newlines
        let processedContent = parts.join('').replace(/\n/g, '<br>')

        // Wrap entire content in small text (text-xs) with black color for gray bubble
        return `<span class="text-xs text-black">${processedContent}</span>`
      }

      // Fallback: if no mention positions, try to extract from metadata directly
      // Try to extract mentions from metadata if mentionPositions wasn't set
      let mentionsFromMetadata = []
      if (message.metadata) {
        let metadata = message.metadata
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata)
          } catch (e) {
            metadata = {}
          }
        }
        mentionsFromMetadata = metadata.mentions || metadata.activityData?.mentions || []
      }

      // If we found mentions in metadata, use position-based bolding
      if (mentionsFromMetadata.length > 0) {
        const sortedMentions = [...mentionsFromMetadata].sort((a, b) => b.start - a.start)
        const parts = []
        let currentIndex = content.length

        sortedMentions.forEach((mention) => {
          if (mention.start < 0 || mention.end > content.length || mention.start >= mention.end) {
            return
          }

          if (mention.end < currentIndex) {
            const textAfter = content.substring(mention.end, currentIndex)
            parts.unshift(escapeHtml(textAfter))
          }

          const mentionText = mention.text || content.substring(mention.start, mention.end)
          const escapedMention = escapeHtml(mentionText)
          parts.unshift(`<span class="font-semibold text-system-text cursor-pointer hover:underline">${escapedMention}</span>`)

          currentIndex = mention.start
        })

        if (currentIndex > 0) {
          const textBefore = content.substring(0, currentIndex)
          parts.unshift(escapeHtml(textBefore))
        }

        let processedContent = parts.join('').replace(/\n/g, '<br>')
        return `<span class="text-xs text-black">${processedContent}</span>`
      }

      // Final fallback: use regex matching (for backward compatibility)
      let escaped = escapeHtml(content)
      escaped = escaped.replace(/\n/g, '<br>')

      if (message.mentionedUsers && message.mentionedUsers.length > 0) {
        message.mentionedUsers.forEach((user) => {
          // Try to match various patterns for the user
          const patterns = [
            user.name ? new RegExp(`@${escapeHtml(user.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi') : null,
            user.email ? new RegExp(`@${escapeHtml(user.email.split('@')[0]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi') : null,
          ].filter(Boolean)

          patterns.forEach((pattern) => {
            escaped = escaped.replace(pattern, (match) => {
              // Make mentions semi-bold, clickable, and #0E0E0E color
              return `<span class="font-semibold text-system-text cursor-pointer hover:underline">${match}</span>`
            })
          })
        })
      }

      // Wrap entire content in small text (text-xs) with black color for gray bubble
      return `<span class="text-xs text-black">${escaped}</span>`
    }

    // For other system messages (stage changes, assignments), parse markdown-style bold (**text**)
    // Use system-text color (#0E0E0E) for bold text
    return content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-system-text">$1</strong>');
  }

  // Format the date for the tooltip
  const formatDate = (date) => {
    if (!date) return ''
    return moment(date).format('MMMM DD, YYYY [at] h:mm A')
  }

  const dateString = message.createdAt ? formatDate(message.createdAt) : ''

  // Handle call_summary activity type - render CallTranscriptCN component
  if (message.activityType === 'call_summary') {
    const activityData = message.metadata?.activityData || {}
    // Use displayCallId if available (prioritizes twilioCallSid for dialer calls), otherwise fallback to synthflowCallId or callId
    // Ensure we always have a valid callId - convert to string if it's a number
    const callId = activityData.displayCallId || activityData.twilioCallSid || activityData.synthflowCallId || (activityData.callId ? String(activityData.callId) : null)
    const callData = {
      id: activityData.callId,
      callId: callId || String(activityData.callId || ''), // Ensure callId is never null/undefined
      duration: activityData.duration || 0,
      recordingUrl: activityData.recordingUrl,
      transcript: activityData.transcript,
      callSummary: activityData.callSummary || null, // Can be null if no summary available
    }

    // Get caller name from senderUser or agent
    const getCallerName = () => {
      if (message.callerAgent?.name) {//returns the calling agent
        return message.callerAgent?.name
      }
      if (message.caller?.name) {
        return message.caller?.name
      }

      if (message.agent?.name) {
        return message.agent.name
      }
      if (message.senderUser?.name) {
        return message.senderUser.name
      }
      return null
    }

    const callerName = getCallerName()
    const callDate = message.createdAt ? moment(message.createdAt).format('MMM D, h:mm A') : ''

    // Handler functions for call actions
    const handlePlayRecording = (recordingUrl, callId) => {
      if (recordingUrl) {
        setShowAudioPlay({ recordingUrl, callId })
      } else {
        toast.error('No recording available', {
          style: {
            width: 'fit-content',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
          },
        })
      }
    }

    const handleCopyCallId = async (callId) => {
      if (callId) {
        try {
          await navigator.clipboard.writeText(callId)
          toast.success('Call ID copied to clipboard', {
            style: {
              width: 'fit-content',
              maxWidth: '400px',
              whiteSpace: 'nowrap',
            },
          })
        } catch (error) {
          toast.error('Failed to copy Call ID', {
            style: {
              width: 'fit-content',
              maxWidth: '400px',
              whiteSpace: 'nowrap',
            },
          })
        }
      }
    }

    const handleReadTranscript = (item) => {
      // Call the parent handler to open transcript modal
      if (onReadTranscript) {
        onReadTranscript(item)
      }
    }

    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center my-4 cursor-default">
                {/* Activity log: Called by [Name] on [Date] */}

                {
                  callerName === null ?
                    (<div className="text-xs text-system-text text-center px-4 mb-2">
                      <strong className="font-semibold">This lead</strong> was called on {callDate}
                    </div>) :
                    (

                      <div className="text-xs text-system-text text-center px-4 mb-2">
                        Called by <strong className="font-semibold">{callerName}</strong> on {callDate}
                      </div>
                    )
                }

                <div className="w-full max-w-2xl px-4">
                  <div className={`rounded-xl border border-border bg-background px-4 ${aiActionType ? 'pb-4' : 'pb-2'} shadow-sm`}>
                    <CallTranscriptCN
                      leadId={selectedLead}
                      leadName={leadName}
                      item={callData}
                      onPlayRecording={handlePlayRecording}
                      onCopyCallId={handleCopyCallId}
                      onReadTranscript={handleReadTranscript}
                      bottomRightContent={
                        isDevelopment ? (
                          hasAiKey === true ? (
                            <DropdownMenu onOpenChange={(open) => { if (open) fetchHasAiKey() }}>
                              <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
                                  <Image
                                    src="/otherAssets/starsIcon2.png"
                                    height={14}
                                    width={14}
                                    alt="AI"
                                  />
                                  <span>{aiActionType ? AI_ACTION_LABELS[aiActionType] : 'AI Action'}</span>
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[140px]">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAiActionType('email')
                                    setAiActionInput('')
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Mail className="h-4 w-4" />
                                  <span>Email</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAiActionType('text')
                                    setAiActionInput('')
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <MessageSquareDot />
                                  <span>Text</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (typeof onOpenAiChat === 'function') {
                                      onOpenAiChat({
                                        message,
                                        callData,
                                        onPlayRecording: handlePlayRecording,
                                        onCopyCallId: handleCopyCallId,
                                        onReadTranscript: handleReadTranscript,
                                      })
                                    }
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <MessagesSquare className="h-4 w-4" />
                                  <span>Chat</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : hasAiKey === false ? (
                            <HoverCard openDelay={200} closeDelay={100} onOpenChange={(open) => { if (open) fetchHasAiKey() }}>
                              <HoverCardTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors cursor-pointer">
                                  <Image
                                    src="/otherAssets/starsIcon2.png"
                                    height={14}
                                    width={14}
                                    alt="AI"
                                  />
                                  <span>{aiActionType ? AI_ACTION_LABELS[aiActionType] : 'AI Action'}</span>
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </HoverCardTrigger>
                              <HoverCardContent align="end" className="w-auto">
                                <div className="flex flex-col gap-3">
                                  <p className="text-sm font-medium text-foreground">API key required</p>
                                  <p className="text-xs text-muted-foreground">
                                    Add an AI provider API key to use AI actions.
                                  </p>
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                      if (typeof onOpenMessageSettings === 'function') {
                                        onOpenMessageSettings()
                                      }
                                    }}
                                  >
                                    Add API key
                                  </Button>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <button className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground opacity-70 cursor-default" disabled>
                              <Image src="/otherAssets/starsIcon2.png" height={14} width={14} alt="AI" />
                              <span>AI Action</span>
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          )
                        ) : null
                      }
                    />

                    {aiActionType && (
                      <div ref={aiActionRef} className="mt-3 border-t border-border pt-3">
                        <Textarea
                          placeholder="Send a follow up message to lead"
                          value={aiActionInput}
                          onChange={(e) => setAiActionInput(e.target.value)}
                          className="min-h-[80px] resize-none text-sm"
                          disabled={followUpSubmitting}
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setAiActionType(null)
                              setAiActionInput('')
                            }}
                            disabled={followUpSubmitting}
                            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={followUpSubmitting || !(aiActionInput || '').trim()}
                            onClick={async () => {
                              const userInput = (aiActionInput || '').trim()
                              if (!userInput || !selectedThread?.id || !message?.id) return
                              const messageType = aiActionType === 'email' ? 'email' : 'sms'
                              setFollowUpSubmitting(true)
                              try {
                                const localData = localStorage.getItem('User')
                                if (!localData) {
                                  toast.error('Please log in again.')
                                  return
                                }
                                const { token } = JSON.parse(localData)
                                const res = await axios.post(
                                  Apis.generateCallSummaryFollowUpDrafts,
                                  {
                                    threadId: selectedThread.id,
                                    messageType,
                                    parentMessageId: message.id,
                                    userInputMessage: userInput,
                                  },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                      'Content-Type': 'application/json',
                                    },
                                  },
                                )
                                if (res.data?.status && Array.isArray(res.data?.data) && res.data.data.length > 0) {
                                  if (typeof onGenerateCallSummaryDrafts === 'function') {
                                    onGenerateCallSummaryDrafts(res.data.data, message.id)
                                  }
                                  setAiActionType(null)
                                  setAiActionInput('')
                                  toast.success('Follow-up drafts generated. Select one to send.')
                                } else {
                                  toast.error(res.data?.message || 'Failed to generate drafts')
                                }
                              } catch (err) {
                                console.error('Error generating call-summary follow-up drafts:', err)
                                toast.error(err.response?.data?.message || 'Failed to generate drafts')
                              } finally {
                                setFollowUpSubmitting(false)
                              }
                            }}
                            className="px-4 py-1.5 text-xs font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {followUpSubmitting ? 'Generating...' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            {dateString && (
              <TooltipContent className="bg-black">
                <p>{dateString}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Audio Player Modal */}
        <Modal
          open={!!showAudioPlay}
          onClose={() => setShowAudioPlay(null)}
          closeAfterTransition
          BackdropProps={{
            sx: {
              backgroundColor: '#00000020',
            },
          }}
        >

          <Box
            className="lg:w-3/12 sm:w-5/12 w-8/12"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              outline: 'none',
            }}
          >
            <div className="flex flex-row justify-center">
              <div
                className="w-full flex flex-col items-end"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                }}
              >
                <button
                  className="mb-3"
                  style={{ fontWeight: '600', fontSize: 15 }}
                  onClick={() => {
                    if (showAudioPlay?.callId) {
                      window.open(`/recordings/${showAudioPlay.callId}`, '_blank')
                      setShowAudioPlay(null)
                    }
                  }}
                >
                  <Image
                    src={'/otherAssets/share.png'}
                    height={20}
                    width={20}
                    alt="*"
                  />
                </button>

                <audio
                  id="custom-audio"
                  controls
                  style={{ width: '100%' }}
                  src={showAudioPlay?.recordingUrl}
                />

                <button
                  className="w-full h-[50px] rounded-lg bg-brand-primary text-white mt-4"
                  style={{ fontWeight: '600', fontSize: 15 }}
                  onClick={() => {
                    setShowAudioPlay(null)
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </Box>
        </Modal>
      </>
    )
  }

  // Handle comments with gray bubble background, right-aligned
  if (message.activityType === 'comment') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col w-full items-end pe-2 mb-3 cursor-default">
              <div className="flex items-start gap-3 w-full justify-end">
                <div className="flex flex-col max-w-[75%] min-w-[220px]">
                  <div className="px-4 py-2 bg-gray-100 text-black rounded-tl-2xl rounded-bl-2xl rounded-br-2xl">
                    <div
                      className="prose prose-sm max-w-none break-words text-xs text-black"
                      dangerouslySetInnerHTML={{ __html: parseContent(message.content) }}
                    />
                  </div>
                  <div className="mt-1 mr-1 flex items-center justify-end gap-3">
                    <span className="text-[10px] text-[#00000060]">
                      {moment(message.createdAt).format('h:mm A')}
                    </span>
                  </div>
                </div>
                {/* Profile picture for comment sender */}
                <div className="flex-shrink-0">
                  {getCommentAvatar()}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          {dateString && (
            <TooltipContent className="bg-black text-white">
              <p>{dateString}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Regular system messages (stage changes, assignments)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center my-4 cursor-default">
            <div className="text-xs text-system-text text-center px-4">
              <div dangerouslySetInnerHTML={{ __html: parseContent(message.content) }} />
            </div>
          </div>
        </TooltipTrigger>
        {dateString && (
          <TooltipContent className="bg-black text-white">
            <p>{dateString}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export default SystemMessage
