'use client'

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import { Paperclip, CaretDown, Plus } from '@phosphor-icons/react'
import { Drawer } from '@mui/material'
import { toast } from 'sonner'

import Apis from '@/components/apis/Apis'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Input } from '@/components/ui/input'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'

const EmailTimelineModal = ({
  open,
  onClose,
  leadId,
  subject,
  messages,
  loading,
  selectedThread,
  emailAccounts,
  selectedEmailAccount,
  setSelectedEmailAccount,
  onSendSuccess,
  fetchThreads,
  onOpenAuthPopup,
  replyToMessage,
}) => {
  const [replyBody, setReplyBody] = useState('')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [sending, setSending] = useState(false)
  const richTextEditorRef = useRef(null)
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false)
  const emailDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        setEmailDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Format reply subject (add "Re:" prefix if not present)
  const formatReplySubject = (originalSubject) => {
    if (!originalSubject) return ''
    const trimmed = originalSubject.trim()
    if (/^re:\s*/i.test(trimmed)) {
      return trimmed // Already has "Re:" prefix
    }
    return `Re: ${trimmed}`
  }

  // Format quoted message content (WhatsApp-style)
  const formatQuotedMessage = (message) => {
    if (!message) return ''
    
    // Extract sender name
    let senderName = 'Unknown'
    if (message.direction === 'outbound') {
      senderName = 'You'
    } else {
      senderName = selectedThread?.lead?.firstName || 
                   selectedThread?.lead?.name || 
                   message.fromEmail?.split('@')[0] || 
                   'Unknown'
    }
    
    // Format timestamp
    const timestamp = moment(message.createdAt).format('MMM D, YYYY, h:mm A')
    
    // Extract plain text from HTML content
    const plainText = htmlToPlainText(message.content || '')
    
    // Format with > prefix on each line
    const quotedLines = plainText.split('\n').map(line => `> ${line}`).join('\n')
    
    // Combine into WhatsApp-style quote
    return `> ${senderName} wrote on ${timestamp}:\n${quotedLines}\n\n`
  }

  // Initialize reply fields when replyToMessage changes
  useEffect(() => {
    if (replyToMessage && open) {
      // Determine recipient email
      let recipientEmail = ''
      if (replyToMessage.direction === 'outbound') {
        // Replying to outbound message - reply to the recipient
        recipientEmail = replyToMessage.toEmail || 
                        replyToMessage.metadata?.to || 
                        selectedThread?.lead?.email || 
                        ''
      } else {
        // Replying to inbound message - reply to the sender
        recipientEmail = replyToMessage.fromEmail || 
                        replyToMessage.metadata?.from || 
                        (replyToMessage.metadata?.headers?.from ? 
                          replyToMessage.metadata.headers.from.match(/<(.+)>/)?.pop() || 
                          replyToMessage.metadata.headers.from : 
                          '') ||
                        selectedThread?.lead?.email || 
                        ''
      }
      setReplyToEmail(recipientEmail)
      
      // Format subject with "Re:" prefix
      if (replyToMessage.subject) {
        setReplySubject(formatReplySubject(replyToMessage.subject))
      } else if (subject) {
        setReplySubject(formatReplySubject(subject))
      } else {
        setReplySubject('')
      }
      
      // Format quoted message content
      const quotedContent = formatQuotedMessage(replyToMessage)
      setReplyBody(quotedContent)
      
      // Focus the editor after a short delay
      setTimeout(() => {
        if (richTextEditorRef.current) {
          // Try to focus the editor if it has a focus method
          const editorElement = richTextEditorRef.current
          if (editorElement && typeof editorElement.focus === 'function') {
            editorElement.focus()
          }
        }
      }, 100)
    } else if (!replyToMessage) {
      // Clear reply fields when not in reply mode
      setReplyToEmail('')
      setReplySubject('')
      setReplyBody('')
    }
  }, [replyToMessage, open, subject, selectedThread])

  const handleClose = () => {
    setReplyBody('')
    setReplyToEmail('')
    setReplySubject('')
    onClose()
  }

  const handleSend = async () => {
    // Use reply subject if in reply mode, otherwise use timeline subject
    const emailSubject = replyToMessage ? replySubject : (subject || '')
    
    if (!replyBody.trim() || !selectedEmailAccount || !leadId || !emailSubject) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSending(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const formData = new FormData()
      formData.append('leadId', leadId)
      formData.append('subject', emailSubject)
      formData.append('body', replyBody)
      formData.append('emailAccountId', selectedEmailAccount)
      
      // Add replyToMessageId if replying to a specific message
      if (replyToMessage && replyToMessage.id) {
        formData.append('replyToMessageId', replyToMessage.id.toString())
      }

      const response = await axios.post(Apis.sendEmailToLead, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.status) {
        toast.success('Email sent successfully')
        setReplyBody('')
        setReplyToEmail('')
        setReplySubject('')
        if (onSendSuccess) {
          await onSendSuccess()
        }
        if (fetchThreads) {
          fetchThreads()
        }
      } else {
        toast.error(response.data?.message || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(error.response?.data?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const getRecipientEmail = () => {
    // If in reply mode, use the replyToEmail
    if (replyToMessage && replyToEmail) {
      return replyToEmail
    }
    
    // Otherwise, use the default logic
    if (!messages || messages.length === 0) {
      return selectedThread?.lead?.email || ''
    }
    const firstMessage = messages[0]
    if (firstMessage.direction === 'outbound') {
      return firstMessage.toEmail || selectedThread?.lead?.email || ''
    } else {
      return firstMessage.fromEmail || selectedThread?.lead?.email || ''
    }
  }
  
  const getDisplaySubject = () => {
    // If in reply mode, use the reply subject
    if (replyToMessage && replySubject) {
      return replySubject
    }
    // Otherwise, use the timeline subject
    return subject || ''
  }
  
  const getReplySenderName = () => {
    if (!replyToMessage) return ''
    
    if (replyToMessage.direction === 'outbound') {
      return 'You'
    } else {
      return selectedThread?.lead?.firstName || 
             selectedThread?.lead?.name || 
             replyToMessage.fromEmail?.split('@')[0] || 
             'Unknown'
    }
  }

  const getSenderName = (message) => {
    const isOutbound = message.direction === 'outbound'
    return isOutbound
      ? 'You'
      : selectedThread?.lead?.firstName || selectedThread?.lead?.name || 'Unknown'
  }

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: '45%',
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
          <div>
            <h2 className="text-xl font-semibold">{subject || 'Email Timeline'}</h2>
            {replyToMessage && (
              <p className="text-sm text-gray-500 mt-0.5">
                Replying to {getReplySenderName()}
              </p>
            )}
          </div>
          <CloseBtn onClick={handleClose} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading emails...</p>
              </div>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No emails found</p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {messages.map((message, index) => {
                const showDateSeparator =
                  index === 0 ||
                  moment(message.createdAt).format('YYYY-MM-DD') !==
                    moment(messages[index - 1].createdAt).format('YYYY-MM-DD')

                const senderName = getSenderName(message)

                return (
                  <React.Fragment key={message.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-3">
                        <div className="border-t border-gray-200 flex-1"></div>
                        <span className="px-4 text-xs text-gray-400">
                          {moment(message.createdAt).format('MMMM DD, YYYY')}
                        </span>
                        <div className="border-t border-gray-200 flex-1"></div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                          <Image
                            src="/messaging/email message type icon.svg"
                            width={16}
                            height={16}
                            alt="Email"
                            className="object-contain"
                          />
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm">{senderName}</span>
                          <span className="text-xs text-gray-500">
                            {moment(message.createdAt).format('h:mm A')}
                          </span>
                        </div>

                        {message.subject && (
                          <div className="font-semibold mb-1 text-sm">
                            Subject: {message.subject}
                          </div>
                        )}

                        <div className="bg-gray-100 rounded-lg px-3 py-2 mb-1">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {htmlToPlainText(message.content || '')}
                          </div>
                        </div>

                        {/* Attachments */}
                        {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1">
                            {message.metadata.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-brand-primary">
                                <Paperclip size={14} />
                                <span className="underline">
                                  {attachment.originalName || attachment.fileName || `Attachment ${idx + 1}`}
                                </span>
                                {attachment.size && (
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(attachment.size)})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </div>

        {/* Reply Composer */}
        {messages && messages.length > 0 && subject && leadId && (
          <div className="border-t pt-4 mt-4 bg-white">
            <div className="space-y-3">
            
              {/* Subject field - show when in reply mode */}
              {replyToMessage && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Subject:</label>
                  <Input
                    value={getDisplaySubject()}
                    readOnly
                    className="flex-1 bg-gray-50 cursor-not-allowed h-[42px] border-[0.5px] border-gray-200 rounded-lg"
                    style={{ height: '42px' }}
                  />
                </div>
              )}

              {/* Message body */}
              <div className="border border-gray-200 rounded-lg">
                <RichTextEditor
                  ref={richTextEditorRef}
                  value={replyBody}
                  onChange={(content) => setReplyBody(content)}
                  placeholder="Type your message..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Send button */}
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={handleSend}
                  disabled={sending || !replyBody.trim() || !selectedEmailAccount}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                    sending || !replyBody.trim() || !selectedEmailAccount
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-brand-primary hover:bg-brand-primary/90'
                  }`}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1.5 8.5L14.5 1.5M14.5 1.5L9.5 14.5M14.5 1.5L1.5 8.5L6.5 11.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default EmailTimelineModal

