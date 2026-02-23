import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import CallTranscriptModal from '@/components/dashboard/leads/extras/CallTranscriptModal'
import EmailBubble from './EmailBubble'
import MessageBubble from './MessageBubble'
import SuggestedLeadLinks from './SuggestedLeadLinks'
import SystemMessage from './SystemMessage'
import PlatformIcon from './PlatformIcon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import axios from 'axios'

const ConversationView = ({
  selectedThread,
  messages,
  messagesLoading,
  loadingOlderMessages = false,
  messagesContainerRef,
  messagesEndRef,
  messagesTopRef,
  sanitizeHTML,
  sanitizeHTMLForEmailBody,
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
  onOpenMessageSettings,
  onOpenAiChat,
  onGenerateCallSummaryDrafts,
  hasAiKey = null,
  allowAIEmailAndText = false,
  shouldShowAllowAiEmailAndTextUpgrade = false,
  shouldShowAiEmailAndTextRequestFeature = false,
  onShowUpgrade,
  onShowRequestFeature,
  onLinkToLeadFromMessage,
  linkingLeadId = null,
}) => {

  //lead details
  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null)

  // State for transcript modal
  const [showTranscriptModal, setShowTranscriptModal] = useState(null)

  // Helper function to normalize email subject for threading comparison
  const normalizeSubject = (subject) => {
    if (!subject) return ''
    // Normalize subject by removing "Re:", "Fwd:", etc. for threading
    return subject
      .replace(/^(re|fwd|fw|aw):\s*/i, '')
      .replace(/^\[.*?\]\s*/, '')
      .trim();
  }

  // Track if we've already populated composer from last message for current thread
  const hasPopulatedComposerRef = useRef(false)
  const lastThreadIdRef = useRef(null)

  //code for fetch lead details
  useEffect(() => {
    console.log("trying to fetch lead details")
    fetchLeadDetails()
  }, [selectedThread])

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
          (att.type || '').toLowerCase() === 'image' ||
          att.mimeType?.startsWith('image/') ||
          att.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i),
      )

      const currentIdx = allImages.findIndex(
        (att) =>
          att.attachmentId === enrichedAttachment.attachmentId ||
          att.fileName === enrichedAttachment.fileName ||
          (att.url && att.url === enrichedAttachment.url),
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

  //fetch lead details
  const fetchLeadDetails = async () => {
    if (!selectedThread?.leadId) return
    try {
      console.log("fetching lead details")
      const Token = AuthToken();
      const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedThread?.leadId}`
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${Token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        console.log("response.data.data is", response.data.data)
        if (response.data.status === true) {
          setSelectedLeadsDetails(response.data.data)
        }
      } else {
        console.error("Error fetching lead details", response.data.message)
      }
    } catch (error) {
      console.error("Error fetching lead details", error)
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
                    <SystemMessage
                      selectedLead={selectedThread?.leadId}
                      leadName={selectedLeadsDetails?.firstName || selectedLeadsDetails?.name}
                      message={message}
                      getAgentAvatar={getAgentAvatar}
                      selectedThread={selectedThread}
                      onReadTranscript={(item) => {
                        setShowTranscriptModal(item)
                      }}
                      onOpenMessageSettings={onOpenMessageSettings}
                      onOpenAiChat={onOpenAiChat}
                      onGenerateCallSummaryDrafts={onGenerateCallSummaryDrafts}
                      hasAiKey={hasAiKey}
                      allowAIEmailAndText={allowAIEmailAndText}
                      shouldShowAllowAiEmailAndTextUpgrade={shouldShowAllowAiEmailAndTextUpgrade}
                      shouldShowAiEmailAndTextRequestFeature={shouldShowAiEmailAndTextRequestFeature}
                      onShowUpgrade={onShowUpgrade}
                      onShowRequestFeature={onShowRequestFeature}
                    />
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
                            {(message.messageType === 'messenger' || message.messageType === 'instagram' || message.messageType === 'email' || message.messageType === 'sms') && (
                              <PlatformIcon type={message.messageType} size={8} showInBadge badgeSize="sm" />
                            )}
                          </div>
                        )}

                        <div className="flex flex-col max-w-[75%] min-w-[220px]">
                          {isEmail ? (
                            <EmailBubble
                              message={message}
                              isOutbound={isOutbound}
                              sanitizeHTML={sanitizeHTML}
                              sanitizeHTMLForEmailBody={sanitizeHTMLForEmailBody}
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
                            <MessageBubble message={message} isOutbound={isOutbound} onAttachmentClick={handleAttachmentClick} getImageUrl={getImageUrl} />
                          )}
                          {!isEmail && !isOutbound && message.metadata?.suggestedLeads?.length && selectedThread?.id && onLinkToLeadFromMessage && (
                            <SuggestedLeadLinks
                              suggestedLeads={message.metadata.suggestedLeads}
                              threadId={selectedThread.id}
                              onLink={onLinkToLeadFromMessage}
                              linkingLeadId={linkingLeadId}
                            />
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
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="flex-shrink-0 cursor-pointer"
                                  onClick={() => {
                                    console.log("message details", message)
                                  }}
                                  aria-label={message ? `${message?.agent?.name || message?.senderUser?.name}` : 'Agent'}
                                >
                                  {/* {getAgentAvatar(message)} */}
                                  <div className="relative flex-shrink-0">
                                    {getAgentAvatar(message)}
                                    {(message.messageType === 'messenger' || message.messageType === 'instagram' || message.messageType === 'email' || message.messageType === 'sms') && (
                                      <PlatformIcon type={message.messageType} size={8} showInBadge badgeSize="sm" />
                                    )}
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {message?.agent?.name || message?.senderUser?.name || 'Agent'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            });
          })()}
          <div ref={messagesEndRef} />
        </>
      )}
      {/* Call Transcript Modal */}
      <CallTranscriptModal
        // selectedLead={selectedThread.leadId}
        open={!!showTranscriptModal}
        onClose={(open) => {
          if (!open) {
            setShowTranscriptModal(null)
          }
        }}
        callId={showTranscriptModal?.callId || showTranscriptModal?.id || ''}
        callData={showTranscriptModal}
      />
    </div>
  );
}

export default ConversationView
