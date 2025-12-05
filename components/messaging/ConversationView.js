import React from 'react'
import moment from 'moment'
import Image from 'next/image'
import { Paperclip } from '@phosphor-icons/react'

const ConversationView = ({
  selectedThread,
  messages,
  messagesLoading,
  messagesContainerRef,
  messagesEndRef,
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
}) => {
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
      className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white"
      style={{ scrollBehavior: 'smooth' }}
    >
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
            
            // Build reply tree structure - organize messages by reply relationships
            const buildReplyTree = (messages) => {
              const rootMessages = []
              const messageChildren = new Map()
              
              messages.forEach(msg => {
                const replyToId = msg.metadata?.replyToMessageId
                if (replyToId && messageMap.has(replyToId)) {
                  // This is a reply
                  if (!messageChildren.has(replyToId)) {
                    messageChildren.set(replyToId, [])
                  }
                  messageChildren.get(replyToId).push(msg)
                } else {
                  // This is a root message (not a reply)
                  rootMessages.push(msg)
                }
              })
              
              // Sort children by creation time
              messageChildren.forEach(children => {
                children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              })
              
              // Build flat list with reply relationships
              const result = []
              const addMessageAndReplies = (msg, depth = 0) => {
                result.push({ message: msg, depth, replyToId: msg.metadata?.replyToMessageId })
                const children = messageChildren.get(msg.id) || []
                children.forEach(child => addMessageAndReplies(child, depth + 1))
              }
              
              // Sort root messages by creation time
              rootMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              rootMessages.forEach(msg => addMessageAndReplies(msg))
              
              return result
            }
            
            const messagesWithDepth = buildReplyTree(messages)
            
            return messagesWithDepth.map(({ message, depth, replyToId }, index) => {
              const isOutbound = message.direction === 'outbound'
              const isEmail = message.messageType === 'email'
              const isReply = !!replyToId
              const parentMessage = replyToId ? messageMap.get(replyToId) : null
              
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
                    className={`flex flex-col ${isOutbound ? 'items-end me-4' : 'items-start'} ${isEmail ? 'mb-6' : 'mb-3'} relative`}
                    style={isReply && depth > 0 ? { 
                      [isOutbound ? 'marginRight' : 'marginLeft']: `${depth * 24}px` 
                    } : {}}
                  >
                    {/* Reply indicator - show which message this is replying to */}
                    {isReply && parentMessage && (
                      <div className={`text-xs mb-1 ${isOutbound ? 'text-right' : 'text-left'} text-gray-500 px-2`}>
                        <span className="italic">
                          ↳ Replying to {parentMessage.direction === 'outbound' ? 'your message' : `${getLeadName(selectedThread)}'s message`}
                          {parentMessage.subject && `: "${parentMessage.subject.replace(/^Re:\s*/i, '')}"`}
                        </span>
                      </div>
                    )}
                  <div
                    className={`flex items-start gap-3 max-w-[75%] ${isOutbound ? 'flex-row-reverse' : 'flex-row'} relative`}
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

                    <div
                      className={`px-4 py-3 ${
                        isOutbound
                          ? 'bg-brand-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                          : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                      }`}
                    >
                      {isEmail && message.subject && (
                        <div className="font-semibold mb-2 relative">
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
                            Subject:{' '}
                            {openEmailDetailId === message.id && (
                              <div
                                className={`absolute z-50 mt-2 w-80 max-w-[90vw] rounded-2xl shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35),0_10px_30px_-20px_rgba(15,23,42,0.25)] border border-gray-100 bg-white text-gray-900 ${
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
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenEmailDetailId(null)
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    Close
                                  </button>
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
                                          <div key={row.label} className="flex gap-3">
                                            <span className="w-24 text-right text-gray-500 capitalize">{row.label}:</span>
                                            <span className="flex-1 font-medium break-words">{row.value}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            )}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (setShowEmailTimeline && setEmailTimelineLeadId && selectedThread?.lead?.id) {
                                setShowEmailTimeline(true)
                                setEmailTimelineLeadId(selectedThread.lead.id)
                                if (setEmailTimelineSubject && message.subject) {
                                  setEmailTimelineSubject(message.subject)
                                }
                              }
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            {message.subject}
                          </button>
                        </div>
                      )}
                      {isEmail ? (
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
                      ) : (
                        <div className={`whitespace-pre-wrap ${isOutbound ? 'text-white' : 'text-black'}`}>{message.content}</div>
                      )}

                      {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
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
                              emailAccountId:
                                attachment.emailAccountId || attachment.downloadData?.emailAccountId || message.emailAccountId,
                            }

                            return (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleAttachmentClick(enrichedAttachment, message, isImage)
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
                      )}

                      {isEmail && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (setShowEmailTimeline && setEmailTimelineLeadId && selectedThread?.lead?.id) {
                                setShowEmailTimeline(true)
                                setEmailTimelineLeadId(selectedThread.lead.id)
                                if (setEmailTimelineSubject && message.subject) {
                                  setEmailTimelineSubject(message.subject)
                                }
                              }
                            }}
                            type="button"
                            className={`text-xs font-bold underline ${
                              isOutbound ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-800'
                            }`}
                          >
                            {'Load more'}
                          </button>
                        </div>
                      )}
                      <div className={`text-xs mt-2 flex items-center gap-2 ${isOutbound ? 'text-white' : 'text-black'}`}>
                        <span>{moment(message.createdAt).format('h:mm A')}</span>
                      </div>
                    </div>

                    {isOutbound && (
                      <div className="absolute -bottom-1 -right-9 flex-shrink-0 z-10">{getAgentAvatar(message)}</div>
                    )}
                  </div>
                  
                  {/* Reply Button - Below bubble, right-aligned */}
                  {isEmail && onReplyClick && (
                    <div className="mt-1 text-right" style={{ width: '75%', maxWidth: '75%' }}>
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
