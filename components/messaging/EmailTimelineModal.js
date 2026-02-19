'use client'

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'
import { Paperclip, CaretDown, Plus, X } from '@phosphor-icons/react'
import { Drawer } from '@mui/material'
import { toast } from '@/utils/toast'

import Apis from '@/components/apis/Apis'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Input } from '@/components/ui/input'
import { AgentXOrb } from '@/components/common/AgentXOrb'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'

// Helper function to check if HTML body has actual text content
const hasTextContent = (html) => {
  if (!html) return false
  // Create a temporary div to parse HTML
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    return textContent.trim().length > 0
  }
  // Fallback for SSR: strip HTML tags and check
  const textOnly = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return textOnly.length > 0
}

// Helper function to linkify text (convert URLs to clickable links)
const linkifyText = (text) => {
  if (!text) return ''

  // First convert HTML to plain text
  const plainText = htmlToPlainText(text)

  // Escape HTML to avoid injection when rendering as HTML
  const escapeHtml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const escaped = escapeHtml(plainText)

  // Detect URLs (with or without protocol) and convert to links
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi

  const linked = escaped.replace(urlRegex, (match) => {
    const hasProtocol = match.startsWith('http://') || match.startsWith('https://')
    const href = hasProtocol ? match : `https://${match}`
    return `<a href="${href}" class="underline text-brand-primary hover:text-brand-primary/80" target="_blank" rel="noopener noreferrer">${match}</a>`
  })

  // Preserve newlines
  return linked.replace(/\n/g, '<br />');
}

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
  const [ccEmails, setCcEmails] = useState([])
  const [bccEmails, setBccEmails] = useState([])
  const [ccInput, setCcInput] = useState('')
  const [bccInput, setBccInput] = useState('')
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [currentUserData, setCurrentUserData] = useState(null)

  // Get current user data from localStorage on mount
  useEffect(() => {
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        setCurrentUserData(userData)
      }
    } catch (error) {
      // Silently fail if localStorage access fails
    }
  }, [])

  // Close dropdown when clicking outside (but not when clicking Agentation toolbar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target?.closest?.('[data-feedback-toolbar]') ||
        event.target?.closest?.('[data-annotation-popup]') ||
        event.target?.closest?.('[data-annotation-marker]')
      ) {
        return
      }
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

  // Helper function to parse CC/BCC from message metadata
  const parseEmailList = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(e => e && e.trim())
    if (typeof value === 'string') {
      return value.split(',').map(e => e.trim()).filter(e => e)
    }
    return []
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
      
      // Extract CC and BCC from message metadata
      const ccList = parseEmailList(replyToMessage.metadata?.cc || replyToMessage.cc)
      const bccList = parseEmailList(replyToMessage.metadata?.bcc || replyToMessage.bcc)
      
      setCcEmails(ccList)
      setBccEmails(bccList)
      setShowCC(ccList.length > 0)
      setShowBCC(bccList.length > 0)
      
      // Keep reply body blank - user will type their own reply
      setReplyBody('')
      
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
      setCcEmails([])
      setBccEmails([])
      setCcInput('')
      setBccInput('')
      setShowCC(false)
      setShowBCC(false)
    }
  }, [replyToMessage, open, subject, selectedThread])

  const handleClose = () => {
    setReplyBody('')
    setReplyToEmail('')
    setReplySubject('')
    setCcEmails([])
    setBccEmails([])
    setCcInput('')
    setBccInput('')
    setShowCC(false)
    setShowBCC(false)
    setImageErrors(new Set())
    onClose()
  }

  // CC/BCC email management functions
  const addCcEmail = (email) => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && !ccEmails.includes(trimmedEmail)) {
      setCcEmails([...ccEmails, trimmedEmail])
      setCcInput('')
    }
  }

  const removeCcEmail = (email) => {
    setCcEmails(ccEmails.filter(e => e !== email))
  }

  const addBccEmail = (email) => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && !bccEmails.includes(trimmedEmail)) {
      setBccEmails([...bccEmails, trimmedEmail])
      setBccInput('')
    }
  }

  const removeBccEmail = (email) => {
    setBccEmails(bccEmails.filter(e => e !== email))
  }

  const handleCcInputChange = (e) => {
    setCcInput(e.target.value)
  }

  const handleCcInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (ccInput.trim()) {
        addCcEmail(ccInput)
      }
    }
  }

  const handleCcInputBlur = () => {
    if (ccInput.trim()) {
      addCcEmail(ccInput)
    }
  }

  const handleCcInputPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const emails = pastedText.split(/[,\s]+/).filter(e => e.trim())
    emails.forEach(email => {
      if (email.trim() && !ccEmails.includes(email.trim())) {
        addCcEmail(email)
      }
    })
  }

  const handleBccInputChange = (e) => {
    setBccInput(e.target.value)
  }

  const handleBccInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (bccInput.trim()) {
        addBccEmail(bccInput)
      }
    }
  }

  const handleBccInputBlur = () => {
    if (bccInput.trim()) {
      addBccEmail(bccInput)
    }
  }

  const handleBccInputPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const emails = pastedText.split(/[,\s]+/).filter(e => e.trim())
    emails.forEach(email => {
      if (email.trim() && !bccEmails.includes(email.trim())) {
        addBccEmail(email)
      }
    })
  }

  const handleSend = async () => {
    // Use reply subject if in reply mode, otherwise use timeline subject
    // If replySubject is empty but we're in reply mode, regenerate it from replyToMessage
    let emailSubject = replyToMessage ? replySubject : (subject || '')
    if (replyToMessage && !emailSubject && replyToMessage.subject) {
      emailSubject = formatReplySubject(replyToMessage.subject)
      setReplySubject(emailSubject) // Save it for next time
    }
    
    if (!hasTextContent(replyBody) || !selectedEmailAccount || !leadId || !emailSubject) {
      toast.error('Please fill in all required fields', {
        style: {
          width: 'fit-content',
          maxWidth: '400px',
          whiteSpace: 'nowrap',
        },
      })
      return
    }

    try {
      setSending(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in', {
          style: {
            width: 'fit-content',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
          },
        })
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const formData = new FormData()
      formData.append('leadId', leadId)
      formData.append('subject', emailSubject)
      formData.append('body', replyBody)
      formData.append('emailAccountId', selectedEmailAccount)
      
      // Add CC and BCC if they exist
      if (ccEmails.length > 0) {
        formData.append('cc', ccEmails.join(', '))
      }
      if (bccEmails.length > 0) {
        formData.append('bcc', bccEmails.join(', '))
      }
      
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
        toast.success('Email sent successfully', {
          style: {
            width: 'fit-content',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
          },
        })
        // Clear reply body but keep subject, email, CC, and BCC for next reply
        setReplyBody('')
        // Don't clear replySubject - keep it for subsequent replies in the same thread
        // Only regenerate if it's empty (shouldn't happen, but safety check)
        if (!replySubject && replyToMessage?.subject) {
          setReplySubject(formatReplySubject(replyToMessage.subject))
        }
        // Don't clear replyToEmail, CC, or BCC either - keep them for subsequent replies
        if (onSendSuccess) {
          await onSendSuccess()
        }
        if (fetchThreads) {
          fetchThreads()
        }
      } else {
        toast.error(response.data?.message || 'Failed to send email', {
          style: {
            width: 'fit-content',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
          },
        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(error.response?.data?.message || 'Failed to send email', {
        style: {
          width: 'fit-content',
          maxWidth: '400px',
          whiteSpace: 'nowrap',
        },
      })
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

  // Get avatar for a message (profile image or first letter)
  const getMessageAvatar = (message) => {
    const isOutbound = message.direction === 'outbound'
    const senderName = getSenderName(message)
    const avatarLetter = senderName.charAt(0).toUpperCase()
    
    // Create a unique key for this message's avatar
    const avatarKey = `avatar-${message.id}-${isOutbound ? 'outbound' : 'inbound'}`

    // For outbound messages: check senderUser, agent, or current user profile image
    if (isOutbound) {
      // Priority 1: Team member sender profile image
      if (message.senderUser?.thumb_profile_image && !imageErrors.has(avatarKey)) {
        return (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img
              src={message.senderUser.thumb_profile_image}
              alt={message.senderUser.name || 'You'}
              className="w-full h-full object-cover rounded-full"
              onError={() => {
                setImageErrors(prev => new Set([...prev, avatarKey]))
              }}
            />
          </div>
        )
      }
      
      // Priority 2: Agent profile image
      if (message.agent?.thumb_profile_image && !imageErrors.has(avatarKey)) {
        return (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img
              src={message.agent.thumb_profile_image}
              alt={message.agent.name || 'Agent'}
              className="w-full h-full object-cover rounded-full"
              onError={() => {
                setImageErrors(prev => new Set([...prev, avatarKey]))
              }}
            />
          </div>
        )
      }
      
      // Priority 3: Current user profile image from localStorage
      if (currentUserData?.user?.thumb_profile_image && !imageErrors.has(avatarKey)) {
        return (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img
              src={currentUserData.user.thumb_profile_image}
              alt={currentUserData.user.name || currentUserData.user.firstName || 'You'}
              className="w-full h-full object-cover rounded-full"
              onError={() => {
                setImageErrors(prev => new Set([...prev, avatarKey]))
              }}
            />
          </div>
        )
      }
    } else {
      // For inbound messages: check lead profile image
      const profileImage = selectedThread?.lead?.thumb_profile_image
      if (profileImage && !imageErrors.has(avatarKey)) {
        return (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <img
              src={profileImage}
              alt={senderName}
              className="w-full h-full object-cover rounded-full"
              onError={() => {
                setImageErrors(prev => new Set([...prev, avatarKey]))
              }}
            />
          </div>
        )
      }
    }

    // Fallback: orb for outbound (no agent/user image), first letter for inbound
    if (isOutbound) {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
          <AgentXOrb width={40} height={40} />
        </div>
      )
    }
    return (
      <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
        {avatarLetter}
      </div>
    )
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
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
                    <div className="flex flex-col w-full">
                      <div
                        className={`flex items-start gap-3 w-full ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.direction !== 'outbound' && (
                          <div className="relative flex-shrink-0">
                            {getMessageAvatar(message)}
                          </div>
                        )}

                        <div className="flex flex-col max-w-[80%] min-w-[240px]">
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.direction === 'outbound' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-semibold text-sm">{senderName}</span>
                              <span className={`text-xs ${message.direction === 'outbound' ? 'text-white' : 'text-gray-600'}`}>
                                {moment(message.createdAt).format('h:mm A')}
                              </span>
                            </div>

                            <div 
                              className={`text-sm whitespace-pre-wrap ${message.direction === 'outbound' ? 'text-white [&_a]:!text-white [&_a:hover]:!text-white/80' : 'text-gray-800'}`}
                              dangerouslySetInnerHTML={{
                                __html: linkifyText(message.content || ''),
                              }}
                            />

                            {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                              <div className="flex flex-col gap-1 mt-3">
                                {message.metadata.attachments.map((attachment, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 text-sm ${
                                      message.direction === 'outbound' ? 'text-white' : 'text-brand-primary'
                                    }`}
                                  >
                                    <Paperclip size={14} />
                                    <span className="underline">
                                      {attachment.originalName || attachment.fileName || `Attachment ${idx + 1}`}
                                    </span>
                                    {attachment.size && (
                                      <span
                                        className={`text-xs ${
                                          message.direction === 'outbound' ? 'text-white/70' : 'text-gray-500'
                                        }`}
                                      >
                                        ({formatFileSize(attachment.size)})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {message.direction === 'outbound' && (
                          <div className="flex-shrink-0">
                            {getMessageAvatar(message)}
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
          <div className="border-t pt-2 mt-2 bg-white">
            <div className="space-y-2">
            
              {/* CC and BCC toggle buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCC(!showCC)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    showCC ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cc
                </button>
                <button
                  onClick={() => setShowBCC(!showBCC)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    showBCC ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bcc
                </button>
              </div>

              {/* CC field */}
              {showCC && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium w-16">Cc:</label>
                  <div className="relative flex-1">
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2 min-h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary overflow-y-auto">
                      {ccEmails.map((email, index) => (
                        <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                          <span className="text-gray-700">{email}</span>
                          <button
                            type="button"
                            onClick={() => removeCcEmail(email)}
                            className="text-gray-500 hover:text-gray-700 ml-1"
                          >
                            <X size={14} weight="bold" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={ccInput}
                        onChange={handleCcInputChange}
                        onKeyDown={handleCcInputKeyDown}
                        onPaste={handleCcInputPaste}
                        onBlur={handleCcInputBlur}
                        placeholder={ccEmails.length === 0 ? 'Add CC recipients' : ''}
                        className="flex-1 h-full min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BCC field */}
              {showBCC && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium w-16">Bcc:</label>
                  <div className="relative flex-1">
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2 min-h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary overflow-y-auto">
                      {bccEmails.map((email, index) => (
                        <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                          <span className="text-gray-700">{email}</span>
                          <button
                            type="button"
                            onClick={() => removeBccEmail(email)}
                            className="text-gray-500 hover:text-gray-700 ml-1"
                          >
                            <X size={14} weight="bold" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={bccInput}
                        onChange={handleBccInputChange}
                        onKeyDown={handleBccInputKeyDown}
                        onPaste={handleBccInputPaste}
                        onBlur={handleBccInputBlur}
                        placeholder={bccEmails.length === 0 ? 'Add BCC recipients' : ''}
                        className="flex-1 h-full min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Message body */}
              <div className="relative">
                <RichTextEditor
                  ref={richTextEditorRef}
                  value={replyBody}
                  onChange={(content) => setReplyBody(content)}
                  placeholder="Type your message..."
                  toolbarPosition="bottom"
                  className="min-h-[80px]"
                />
                
                {/* Overlapping send button above toolbar */}
                <div className="absolute bottom-[2px] right-0 flex items-center gap-2 z-10 pr-2">
                  <button
                    onClick={handleSend}
                    disabled={sending || !hasTextContent(replyBody) || !selectedEmailAccount}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 ${
                      sending || !hasTextContent(replyBody) || !selectedEmailAccount
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
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default EmailTimelineModal
