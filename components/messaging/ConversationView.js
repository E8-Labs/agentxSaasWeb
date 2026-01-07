import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { Paperclip } from '@phosphor-icons/react'
import { htmlToPlainText } from '@/utilities/textUtils'
import { toast } from 'sonner'
import { Modal, Box } from '@mui/material'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import CallTranscriptCN from '@/components/dashboard/leads/extras/CallTranscriptCN'

const AttachmentList = ({ message, isOutbound, onAttachmentClick }) => {
  if (!message.metadata?.attachments || message.metadata.attachments.length === 0) return null

  return (
    <div className={`mt-3 flex flex-col gap-2 ${isOutbound ? 'text-white' : 'text-black'}`}>
      {message.metadata.attachments.map((attachment, idx) => {
        const isImage =
          attachment.mimeType?.startsWith('image/') ||
          attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)

        const enrichedAttachment = {
          ...attachment,
          downloadData: attachment.downloadData || {
            messageId: attachment.messageId || message.emailMessageId,
            attachmentId: attachment.attachmentId,
            emailAccountId: attachment.emailAccountId || message.emailAccountId,
          },
          messageId: attachment.messageId || attachment.downloadData?.messageId || message.emailMessageId,
          attachmentId: attachment.attachmentId || attachment.downloadData?.attachmentId,
          emailAccountId: attachment.emailAccountId || attachment.downloadData?.emailAccountId || message.emailAccountId,
        }

        return (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault()
              onAttachmentClick(enrichedAttachment, message, isImage)
            }}
            className={`text-sm flex items-center gap-2 hover:opacity-80 text-left ${isOutbound ? 'text-white/90' : 'text-brand-primary'
              }`}
          >
            <Paperclip size={14} />
            <span className="underline">
              {enrichedAttachment.originalName || enrichedAttachment.fileName || `Attachment ${idx + 1}`}
            </span>
            {enrichedAttachment.size && (
              <span className={`text-xs ${isOutbound ? 'text-white/70' : 'text-gray-500'}`}>
                ({(enrichedAttachment.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

const EmailBubble = ({
  message,
  isOutbound,
  sanitizeHTML,
  openEmailDetailId,
  setOpenEmailDetailId,
  getEmailDetails,
  selectedThread,
  onOpenEmailTimeline,
  setShowEmailTimeline,
  setEmailTimelineLeadId,
  setEmailTimelineSubject,
  onAttachmentClick,
  onReplyClick,
  isLastMessage = false,
  updateComposerFromMessage,
}) => (
  <>
    <div
      className={`px-4 py-2 ${isOutbound
        ? 'text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
        : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
        }`}
      style={isOutbound ? { backgroundColor: 'hsl(var(--brand-primary))' } : {}}
    >
      {message.subject && (
        <div className="font-semibold mb-2 flex items-start">
          <span
            className="font-normal cursor-pointer text-xs relative"
            onMouseEnter={(e) => {
              e.stopPropagation()
              setOpenEmailDetailId(message.id)
            }}
            onMouseLeave={(e) => {
              e.stopPropagation()
              setOpenEmailDetailId(null)
            }}
          >
            Subject:
            {openEmailDetailId === message.id && (
              <div
                className={`absolute z-50 w-auto min-w-fit max-w-[90vw] rounded-lg shadow-lg border border-gray-200 bg-white text-gray-900 ${isLastMessage
                  ? `bottom-full mb-1 ${isOutbound ? 'right-full mr-2' : 'left-full ml-2'}`
                  : `top-full mt-1 ${isOutbound ? 'right-full mr-2' : 'left-full ml-2'}`
                  }`}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  setOpenEmailDetailId(message.id)
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation()
                  setOpenEmailDetailId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-2 border-b border-gray-200">
                  <span className="text-[11px] font-medium text-gray-700">Message details</span>
                </div>
                {(() => {
                  const details = getEmailDetails(message)
                  const rows = [
                    { label: 'from', value: details.from },
                    { label: 'to', value: details.to },
                    { label: 'cc', value: details.cc },
                    { label: 'bcc', value: details.bcc },
                    { label: 'date', value: details.date },
                    { label: 'subject', value: details.subject },
                    { label: 'mailed-by', value: details.mailedBy },
                    { label: 'signed-by', value: details.signedBy },
                    { label: 'security', value: details.security },
                  ].filter((row) => row.value)

                  return (
                    <div className="px-2.5 py-2 text-[11px] text-gray-600 space-y-1">
                      {rows.length === 0 ? (
                        <div className="text-[10px] text-gray-400">No metadata available.</div>
                      ) : (
                        rows.map((row) => (
                          <div key={row.label} className="flex items-start gap-2">
                            <span className="text-gray-500 capitalize whitespace-nowrap min-w-[60px] text-[11px]">{row.label}:</span>
                            <span className="text-gray-700 break-words text-left text-[11px] leading-relaxed">{row.value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </span>
          <div
            onClick={(e) => {
              e.stopPropagation()
              // Update composer fields from this message when subject is clicked
              if (updateComposerFromMessage && message.messageType === 'email') {
                updateComposerFromMessage(message)
              }
              if (onOpenEmailTimeline && message.subject) {
                onOpenEmailTimeline(message.subject)
              } else if (setShowEmailTimeline && setEmailTimelineLeadId && selectedThread?.lead?.id) {
                setShowEmailTimeline(true)
                setEmailTimelineLeadId(selectedThread.lead.id)
                if (setEmailTimelineSubject && message.subject) {
                  setEmailTimelineSubject(message.subject)
                }
              }
            }}
            className="hover:underline cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 ml-1 text-xs"
            title={message.subject}
          >
            {message.subject}
          </div>
        </div>
      )}
      <div
        className={`prose prose-sm max-w-none break-words ${isOutbound
          ? 'text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_p]:!text-white [&_strong]:!text-white [&_em]:!text-white [&_a]:!text-white [&_a:hover]:!text-white/80 [&_ul]:!text-white [&_ol]:!text-white [&_li]:!text-white [&_span]:!text-white [&_*]:!text-white'
          : 'text-black'
          }`}
        style={isOutbound ? { color: 'white' } : {}}
        dangerouslySetInnerHTML={{
          __html: sanitizeAndLinkifyHTML(message.content, sanitizeHTML),
        }}
      />

      <AttachmentList message={message} isOutbound={isOutbound} onAttachmentClick={onAttachmentClick} />


    </div>
    <div className="mt-1 mr-1 flex items-center justify-end gap-3">
      <span className={`text-[10px] text-[#00000060]`}>{moment(message.createdAt).format('h:mm A')}</span>
    </div>
  </>
)

const linkifyText = (text) => {
  if (!text) return ''

  // Escape HTML to avoid injection when rendering as HTML
  const escapeHtml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const escaped = escapeHtml(text)

  // Detect URLs (with or without protocol) and convert to links
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi

  const linked = escaped.replace(urlRegex, (match) => {
    const hasProtocol = match.startsWith('http://') || match.startsWith('https://')
    const href = hasProtocol ? match : `https://${match}`
    return `<a href="${href}" class="underline text-brand-primary hover:text-brand-primary/80" target="_blank" rel="noopener noreferrer">${match}</a>`
  })

  // Preserve newlines
  return linked.replace(/\n/g, '<br />')
}

// Helper function to sanitize HTML, convert to plain text, and linkify URLs
const sanitizeAndLinkifyHTML = (html, sanitizeHTML) => {
  if (!html) return ''

  // First convert HTML to plain text (this preserves URLs as text)
  // We do this before sanitizing to ensure URLs aren't broken by HTML processing
  let plainText = htmlToPlainText(html)

  // Remove quoted text from plain text (simpler and more reliable than HTML processing)
  // Remove lines starting with "On ... wrote:"
  plainText = plainText.replace(/^On\s+.*?wrote:.*$/gmi, '')
  // Remove lines starting with common email headers
  plainText = plainText.replace(/^(From|Sent|To|Subject|Date):.*$/gmi, '')
  // Remove quoted text blocks (lines starting with >)
  plainText = plainText.replace(/^>.*$/gm, '')
  // Remove content after common separators
  const separatorIndex = plainText.search(/^(From|Sent|To|Subject|Date):/m)
  if (separatorIndex > 0) {
    plainText = plainText.substring(0, separatorIndex).trim()
  }
  // Clean up multiple newlines
  plainText = plainText.replace(/\n{3,}/g, '\n\n').trim()

  // Now linkify URLs in the cleaned plain text
  return linkifyText(plainText)
}

/**
 * SystemMessage component for displaying system activity messages
 * (stage changes, team assignments, comments, etc.)
 */
const SystemMessage = ({ message, getAgentAvatar, selectedThread }) => {
  const [showAudioPlay, setShowAudioPlay] = useState(null)
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
        .replace(/'/g, '&#39;')
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
            console.warn('⚠️ [SystemMessage] Invalid mention position:', {
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
    return content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-system-text">$1</strong>')
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
    const callData = {
      id: activityData.callId,
      callId: activityData.synthflowCallId || activityData.callId,
      duration: activityData.duration || 0,
      recordingUrl: activityData.recordingUrl,
      transcript: activityData.transcript,
      callSummary: activityData.callSummary || {},
    }

    // Get caller name from senderUser or agent
    const getCallerName = () => {
      if (message.senderUser?.name) {
        return message.senderUser.name
      }
      if (message.senderUser?.firstName) {
        return message.senderUser.firstName
      }
      if (message.agent?.name) {
        return message.agent.name
      }
      if (selectedThread?.lead?.firstName) {
        return selectedThread.lead.firstName
      }
      return 'Unknown'
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
      // You might want to open a transcript modal here
      console.log('Read transcript for:', item)
    }

    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center my-4 cursor-default">
                {/* Activity log: Called by [Name] on [Date] */}
                <div className="text-xs text-system-text text-center px-4 mb-2">
                  Called by <strong className="font-semibold">{callerName}</strong> on {callDate}
                </div>
                <div className="w-full max-w-2xl px-4">
                  <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                    <CallTranscriptCN
                      item={callData}
                      onPlayRecording={handlePlayRecording}
                      onCopyCallId={handleCopyCallId}
                      onReadTranscript={handleReadTranscript}
                    />
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 16V8M14 12H22M6 4H10C12.2091 4 14 5.79086 14 8V16C14 18.2091 12.2091 20 10 20H6C3.79086 20 2 18.2091 2 16V8C2 5.79086 3.79086 4 6 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
            <TooltipContent>
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
          <TooltipContent>
            <p>{dateString}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

const MessageBubble = ({ message, isOutbound, onAttachmentClick }) => (
  <div className="flex flex-col">
    <div
      className={`px-4 py-2 ${isOutbound
        ? 'text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
        : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
        }`}
      style={isOutbound ? { backgroundColor: 'hsl(var(--brand-primary))' } : {}}
    >
      <div
        className={`prose prose-sm max-w-none break-words whitespace-pre-wrap ${isOutbound
          ? 'text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_p]:!text-white [&_strong]:!text-white [&_em]:!text-white [&_a]:!text-white [&_a:hover]:!text-white/80 [&_ul]:!text-white [&_ol]:!text-white [&_li]:!text-white [&_span]:!text-white [&_*]:!text-white'
          : 'text-black'
          }`}
        style={isOutbound ? { color: 'white' } : {}}
        dangerouslySetInnerHTML={{ __html: linkifyText(message.content || '') }}
      />
      <AttachmentList message={message} isOutbound={isOutbound} onAttachmentClick={onAttachmentClick} />
    </div>
    <div className="flex items-center justify-end gap-2 mt1 mr-1">
      <span className={`text-[10px] text-[#00000060]`}>{moment(message.createdAt).format('h:mm A')}</span>
    </div>
  </div>
)
const ConversationView = ({
  selectedThread,
  messages,
  messagesLoading,
  loadingOlderMessages = false,
  messagesContainerRef,
  messagesEndRef,
  messagesTopRef,
  sanitizeHTML,
  getLeadName,
  getAgentAvatar,
  getImageUrl,
  setImageAttachments,
  setCurrentImageIndex,
  setImageModalOpen,
  setSnackbar,
  SnackbarTypes,
  openEmailDetailId,
  setOpenEmailDetailId,
  getEmailDetails,
  setShowEmailTimeline,
  setEmailTimelineLeadId,
  setEmailTimelineSubject,
  onReplyClick,
  onOpenEmailTimeline,
  updateComposerFromMessage,
}) => {

  console.log('🔍 [ConversationView] selectedThread:', selectedThread)
  
  // Helper function to normalize email subject for threading comparison
  const normalizeSubject = (subject) => {
    if (!subject) return ''
    // Normalize subject by removing "Re:", "Fwd:", etc. for threading
    return subject
      .replace(/^(re|fwd|fw|aw):\s*/i, '')
      .replace(/^\[.*?\]\s*/, '')
      .trim()
  }

  // Track if we've already populated composer from last message for current thread
  const hasPopulatedComposerRef = useRef(false)
  const lastThreadIdRef = useRef(null)

  // When messages load, populate composer with last email message's subject, CC, and BCC
  useEffect(() => {
    // Reset if thread changed
    if (selectedThread?.id !== lastThreadIdRef.current) {
      hasPopulatedComposerRef.current = false
      lastThreadIdRef.current = selectedThread?.id || null
    }

    if (!messages || messages.length === 0 || !updateComposerFromMessage || hasPopulatedComposerRef.current) {
      return
    }

    // Find the last email message (sorted by createdAt, descending)
    const emailMessages = messages
      .filter(msg => msg.messageType === 'email')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    if (emailMessages.length > 0) {
      const lastEmailMessage = emailMessages[0]
      console.log('🔍 [ConversationView] Populating composer from last email message:', {
        messageId: lastEmailMessage.id,
        subject: lastEmailMessage.subject,
        ccEmails: lastEmailMessage.ccEmails,
        bccEmails: lastEmailMessage.bccEmails,
      })
      updateComposerFromMessage(lastEmailMessage)
      hasPopulatedComposerRef.current = true
    }
  }, [messages, updateComposerFromMessage, selectedThread?.id])

  if (!selectedThread) return null

  const handleAttachmentClick = (enrichedAttachment, message, isImage) => {
    const getApiBaseUrl = () => {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:8003/'
      }
      return (
        process.env.NEXT_PUBLIC_BASE_API_URL ||
        (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
          ? 'https://apimyagentx.com/agentx/'
          : 'https://apimyagentx.com/agentxtest/')
      )
    }

    if (isImage) {
      const allImages = message.metadata.attachments.filter(
        (att) =>
          att.mimeType?.startsWith('image/') ||
          att.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i),
      )

      const currentIdx = allImages.findIndex(
        (att) => att.attachmentId === enrichedAttachment.attachmentId || att.fileName === enrichedAttachment.fileName,
      )

      const imagesWithData = allImages.map((img) => {
        let imgDownloadData = img.downloadData
        if (!imgDownloadData && img.url) {
          const urlMatch = img.url.match(/gmail-attachment\/([^/]+)\/(.+)\/(\d+)/)
          if (urlMatch) {
            imgDownloadData = {
              messageId: urlMatch[1],
              attachmentId: urlMatch[2],
              emailAccountId: urlMatch[3],
            }
          }
        }
        if (!imgDownloadData && img.attachmentId) {
          imgDownloadData = {
            messageId: img.messageId || message.emailMessageId,
            attachmentId: img.attachmentId,
            emailAccountId: img.emailAccountId || message.emailAccountId,
          }
        }

        const finalDownloadData = {
          messageId: imgDownloadData?.messageId || img.messageId || message.emailMessageId,
          attachmentId: imgDownloadData?.attachmentId || img.attachmentId,
          emailAccountId: imgDownloadData?.emailAccountId || img.emailAccountId || message.emailAccountId,
        }

        return {
          ...img,
          downloadData: finalDownloadData,
          messageId: finalDownloadData.messageId,
          attachmentId: finalDownloadData.attachmentId,
          emailAccountId: finalDownloadData.emailAccountId,
        }
      })

      setImageAttachments(imagesWithData)
      setCurrentImageIndex(currentIdx >= 0 ? currentIdx : 0)
      setImageModalOpen(true)
      return
    }

    const imageUrl = getImageUrl(enrichedAttachment, message)
    if (imageUrl) {
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = enrichedAttachment.fileName || enrichedAttachment.originalName || 'attachment'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      setSnackbar({
        isVisible: true,
        title: 'Missing attachment data',
        message: 'Please refresh and try again.',
        type: SnackbarTypes.Error,
      })
    }
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4 bg-white"
      style={{ scrollBehavior: 'auto', paddingRight: '1.5rem' }}
    >
      {/* Loader for older messages at top */}
      {loadingOlderMessages && (
        <div ref={messagesTopRef} className="text-center text-gray-500 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
            <span className="text-sm">Loading older messages...</span>
          </div>
        </div>
      )}

      {messagesLoading && messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-400">This is the start of your conversation</p>
            <p className="text-xs text-gray-400 mt-1">Today</p>
          </div>
        </div>
      ) : (
        <>
          {(() => {
            // Build a map of messages by ID for quick lookup
            const messageMap = new Map()
            messages.forEach(msg => messageMap.set(msg.id, msg))

            // First, sort ALL messages chronologically (oldest first)
            const sortedMessages = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

            // Build reply depth map - calculate depth for each message based on reply chain
            const calculateDepth = (msg, depthMap = new Map(), visited = new Set()) => {
              if (depthMap.has(msg.id)) {
                return depthMap.get(msg.id)
              }

              if (visited.has(msg.id)) {
                // Circular reference - treat as root
                depthMap.set(msg.id, 0)
                return 0
              }

              visited.add(msg.id)

              const replyToId = msg.metadata?.replyToMessageId
              if (replyToId && messageMap.has(replyToId)) {
                const parentDepth = calculateDepth(messageMap.get(replyToId), depthMap, visited)
                const depth = parentDepth + 1
                depthMap.set(msg.id, depth)
                return depth
              } else {
                // Root message
                depthMap.set(msg.id, 0)
                return 0
              }
            }

            const depthMap = new Map()
            sortedMessages.forEach(msg => calculateDepth(msg, depthMap))

            // Build result with depth information, maintaining chronological order
            const messagesWithDepth = sortedMessages.map(msg => ({
              message: msg,
              depth: depthMap.get(msg.id) || 0,
              replyToId: msg.metadata?.replyToMessageId,
            }))

            return messagesWithDepth.map(({ message, depth, replyToId }, index) => {
              const isOutbound = message.direction === 'outbound'
              const isEmail = message.messageType === 'email'
              const isSystem = message.messageType === 'system'
              const isLastMessage = index === messagesWithDepth.length - 1
              const parentMessage = replyToId ? messageMap.get(replyToId) : null

              // For email messages, only show "Replying to" if the normalized subjects match
              // If subjects don't match, it's a new thread, not a reply
              let isReply = false
              if (replyToId && parentMessage && isEmail) {
                const currentSubject = normalizeSubject(message.subject || '')
                const parentSubject = normalizeSubject(parentMessage.subject || '')
                // Only consider it a reply if subjects match (same thread)
                isReply = currentSubject.toLowerCase() === parentSubject.toLowerCase() && currentSubject !== ''
              } else if (replyToId && !isEmail) {
                // For non-email messages (SMS), use the original logic
                isReply = true
              }

              const showDateSeparator =
                index === 0 ||
                moment(message.createdAt).format('YYYY-MM-DD') !== moment(messagesWithDepth[index - 1].message.createdAt).format('YYYY-MM-DD')

              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                      <div className="border-t border-gray-200 flex-1"></div>
                      <span className="px-4 text-xs text-gray-400">
                        {moment(message.createdAt).format('MMMM DD, YYYY')}
                      </span>
                      <div className="border-t border-gray-200 flex-1"></div>
                    </div>
                  )}
                  {/* Render system messages (including comments) as centered messages */}
                  {isSystem ? (
                    <SystemMessage message={message} getAgentAvatar={getAgentAvatar} selectedThread={selectedThread} />
                  ) : (
                  <div
                    data-message-id={message.id}
                    className={`flex flex-col w-full ${isOutbound ? 'items-end pe-2' : 'items-start'} ${isEmail ? 'mb-6' : 'mb-3'} relative`}
                    style={
                      isReply && depth > 0
                        ? {
                            [isOutbound ? 'marginRight' : 'marginLeft']: `${depth * 24}px`,
                          }
                        : {}
                    }
                  >
                    {isReply && parentMessage && (
                      <div className={`text-xs mb-1 text-gray-500 ${isOutbound ? 'flex justify-end w-full pe-2' : 'text-left'}`}>
                        <div className={`${isOutbound ? 'max-w-[75%] min-w-[220px] text-left' : ''}`}>
                          <span className="italic">
                            Replying to:{' '}
                            {parentMessage.messageType === 'email' && parentMessage.subject
                              ? `"${parentMessage.subject.replace(/^Re:\s*/i, '')}"`
                              : parentMessage.content
                                ? `"${parentMessage.content.substring(0, 12)}${parentMessage.content.length > 12 ? '...' : ''}"`
                                : 'message'}
                          </span>
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex items-start gap-3 w-full ${isOutbound ? 'justify-end' : 'justify-start'} relative`}
                    >
                      {!isOutbound && (
                        <div className="relative flex-shrink-0">
                          <div className="w-[26px] h-[26px] rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-xs">
                            {getLeadName(selectedThread)}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col max-w-[75%] min-w-[220px]">
                        {isEmail ? (
                          <EmailBubble
                            message={message}
                            isOutbound={isOutbound}
                            sanitizeHTML={sanitizeHTML}
                            openEmailDetailId={openEmailDetailId}
                            setOpenEmailDetailId={setOpenEmailDetailId}
                            getEmailDetails={getEmailDetails}
                            selectedThread={selectedThread}
                            onOpenEmailTimeline={onOpenEmailTimeline}
                            setShowEmailTimeline={setShowEmailTimeline}
                            setEmailTimelineLeadId={setEmailTimelineLeadId}
                            setEmailTimelineSubject={setEmailTimelineSubject}
                            onAttachmentClick={handleAttachmentClick}
                            onReplyClick={onReplyClick}
                            isLastMessage={isLastMessage}
                            updateComposerFromMessage={updateComposerFromMessage}
                          />
                        ) : (
                          <MessageBubble message={message} isOutbound={isOutbound} onAttachmentClick={handleAttachmentClick} />
                        )}
                        {isEmail && !isOutbound && onReplyClick && (
                          <div className="mt-1 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onReplyClick(message)
                              }}
                              type="button"
                              className="text-xs text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>

                      {isOutbound && (
                        <div className="flex-shrink-0">
                          {console.log('🔍 [ConversationView] Rendering avatar for message:', {
                            messageId: message.id,
                            isOutbound,
                            hasSenderUser: !!message.senderUser,
                            senderUser: message.senderUser,
                            messageDirection: message.direction,
                          })}
                          {getAgentAvatar(message)}
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </React.Fragment>
              )
            })
          })()}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}

export default ConversationView
