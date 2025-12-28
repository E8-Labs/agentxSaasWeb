import React from 'react'
import moment from 'moment'
import Image from 'next/image'
import { Paperclip } from '@phosphor-icons/react'

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
            className={`text-sm flex items-center gap-2 hover:opacity-80 text-left ${
              isOutbound ? 'text-white/90' : 'text-brand-primary'
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
}) => (
  <>
    <div
      className={`px-4 py-3 ${
        isOutbound
          ? 'bg-brand-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
          : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
      }`}
    >
      {message.subject && (
        <div className="font-semibold mb-2 relative flex items-start">
          <span 
            className="font-normal cursor-pointer"
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
          </span>
          <div
            onClick={(e) => {
              e.stopPropagation()
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
            className="hover:underline cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 ml-1"
            title={message.subject}
          >
            {message.subject}
          </div>
          {openEmailDetailId === message.id && (
            <div
              className={`absolute z-50 mt-2 w-80 max-w-[90vw] rounded shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35),0_10px_30px_-20px_rgba(15,23,42,0.25)] border border-gray-100 bg-white text-gray-900 ${
                isOutbound ? 'right-0' : 'left-0'
              }`}
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
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Message details</span>
              </div>
              {(() => {
                const details = getEmailDetails(message)
                const rows = [
                  { label: 'from', value: details.from },
                  { label: 'to', value: details.to },
                  { label: 'cc', value: details.cc },
                  { label: 'date', value: details.date },
                  { label: 'subject', value: details.subject },
                  { label: 'mailed-by', value: details.mailedBy },
                  { label: 'signed-by', value: details.signedBy },
                  { label: 'security', value: details.security },
                ].filter((row) => row.value)

                return (
                  <div className="px-4 py-3 text-sm text-gray-700 space-y-2">
                    {rows.length === 0 ? (
                      <div className="text-xs text-gray-500">No metadata available.</div>
                    ) : (
                      rows.map((row) => (
                        <div key={row.label} className="flex items-start gap-2">
                          <span className="text-gray-500 capitalize whitespace-nowrap">{row.label}:</span>
                          <span className="font-medium break-words text-left">{row.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}
      <div
        className={`prose prose-sm max-w-none ${
          isOutbound
            ? 'text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_p]:!text-white [&_strong]:!text-white [&_em]:!text-white [&_a]:!text-white [&_ul]:!text-white [&_ol]:!text-white [&_li]:!text-white [&_span]:!text-white [&_*]:!text-white'
            : 'text-black'
        }`}
        style={isOutbound ? { color: 'white' } : {}}
        dangerouslySetInnerHTML={{
          __html: sanitizeHTML(message.content),
        }}
      />

      <AttachmentList message={message} isOutbound={isOutbound} onAttachmentClick={onAttachmentClick} />

      <div className="mt-3 flex items-center justify-end gap-3">
        <span className={`text-xs ${isOutbound ? 'text-white' : 'text-black'}`}>{moment(message.createdAt).format('h:mm A')}</span>
      </div>
    </div>
  </>
)

const MessageBubble = ({ message, isOutbound, onAttachmentClick }) => (
  <div
    className={`px-4 py-3 ${
      isOutbound
        ? 'bg-brand-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
        : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
    }`}
  >
    <div className={`whitespace-pre-wrap ${isOutbound ? 'text-white' : 'text-black'}`}>{message.content}</div>
    <AttachmentList message={message} isOutbound={isOutbound} onAttachmentClick={onAttachmentClick} />
    <div className="mt-3 flex items-center justify-end gap-2">
      <span className={`text-xs ${isOutbound ? 'text-white' : 'text-black'}`}>{moment(message.createdAt).format('h:mm A')}</span>
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
}) => {
  // Helper function to normalize email subject for threading comparison
  const normalizeSubject = (subject) => {
    if (!subject) return ''
    // Normalize subject by removing "Re:", "Fwd:", etc. for threading
    return subject
      .replace(/^(re|fwd|fw|aw):\s*/i, '')
      .replace(/^\[.*?\]\s*/, '')
      .trim()
  }
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
      style={{ scrollBehavior: 'smooth', paddingRight: '1.5rem' }}
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
                <div
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
                    <div className={`text-xs mb-1 ${isOutbound ? 'text-right' : 'text-left'} text-gray-500 px-2`}>
                      <span className="italic">
                        Replying to:{' '}
                        {parentMessage.messageType === 'email' && parentMessage.subject
                          ? `"${parentMessage.subject.replace(/^Re:\s*/i, '')}"`
                          : parentMessage.content
                          ? `"${parentMessage.content.substring(0, 12)}${parentMessage.content.length > 12 ? '...' : ''}"`
                          : 'message'}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-start gap-3 w-full ${isOutbound ? 'justify-end' : 'justify-start'} relative`}
                  >
                    {!isOutbound && (
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
                          {getLeadName(selectedThread)}
                        </div>
                        {isEmail ? (
                          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                            <Image src="/messaging/email message type icon.svg" width={16} height={16} alt="Email" className="object-contain" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                            <Image src="/messaging/text type message icon.svg" width={16} height={16} alt="SMS" className="object-contain" />
                          </div>
                        )}
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

                    {isOutbound && <div className="flex-shrink-0">{getAgentAvatar(message)}</div>}
                  </div>
                </div>
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
