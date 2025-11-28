'use client'

import { EnvelopeSimple, Paperclip, PaperPlaneTilt, Plus, Star } from '@phosphor-icons/react'
import { Search, ChevronLeft, ChevronRight, X, Download } from 'lucide-react'
import axios from 'axios'
import DOMPurify from 'dompurify'
import moment from 'moment'
import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Apis from '@/components/apis/Apis'
import RichTextEditor from '@/components/common/RichTextEditor'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import { agentImage, getAgentImageWithMemoji } from '@/utilities/agentUtilities'
import { Input } from '@/components/ui/input'
import NewMessageModal from './NewMessageModal'
import { toast } from 'sonner'
import voicesList from '@/components/createagent/Voices'

const Messages = () => {
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [composerMode, setComposerMode] = useState('sms') // 'sms' or 'email'
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [composerData, setComposerData] = useState({
    to: '',
    subject: '',
    body: '',
    cc: '',
    bcc: '',
    attachments: [],
  })
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [messageOffset, setMessageOffset] = useState(0)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const richTextEditorRef = useRef(null)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [emailAccounts, setEmailAccounts] = useState([])
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null)
  const [selectedEmailAccount, setSelectedEmailAccount] = useState(null)
  const [userData, setUserData] = useState(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageAttachments, setImageAttachments] = useState([])
  const [currentImageUrl, setCurrentImageUrl] = useState(null)

  const MESSAGES_PER_PAGE = 30
  const SMS_CHAR_LIMIT = 160
  const MAX_ATTACHMENTS = 5
  const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB

  // Handle file attachment changes
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const maxSizeInBytes = MAX_ATTACHMENT_SIZE

    // Check if adding new files would exceed the attachment count limit
    if (composerData.attachments.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`)
      return
    }

    // Calculate current total size of existing attachments
    const currentTotalSize = composerData.attachments.reduce(
      (total, file) => total + file.size,
      0,
    )

    // Check if adding new files would exceed the size limit
    const newFilesTotalSize = files.reduce(
      (total, file) => total + file.size,
      0,
    )
    const wouldExceedLimit =
      currentTotalSize + newFilesTotalSize > maxSizeInBytes

    if (wouldExceedLimit) {
      toast.error("Total file size can't be more than 10MB")
      return
    }

    setComposerData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }))
  }

  // Remove attachment
  const removeAttachment = (index) => {
    setComposerData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(Apis.getMessageThreads, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        // Sort by lastMessageAt descending
        const sortedThreads = response.data.data.sort((a, b) => {
          const dateA = new Date(a.lastMessageAt || a.createdAt)
          const dateB = new Date(b.lastMessageAt || b.createdAt)
          return dateB - dateA
        })
        setThreads(sortedThreads)
        
        // Auto-select first thread if none selected
        if (!selectedThread && sortedThreads.length > 0) {
          setSelectedThread(sortedThreads[0])
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedThread])

  // Fetch messages for a thread
  const fetchMessages = useCallback(
    async (threadId, offset = 0, append = false) => {
      if (!threadId) return

      try {
        setMessagesLoading(true)
        const localData = localStorage.getItem('User')
        if (!localData) return

        const userData = JSON.parse(localData)
        const token = userData.token

        const response = await axios.get(
          `${Apis.getMessagesForThread}/${threadId}/messages`,
          {
            params: {
              limit: MESSAGES_PER_PAGE,
              offset: offset,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status && response.data?.data) {
          // API returns messages in ASC order, but we want them in DESC for display (newest at bottom)
          const fetchedMessages = response.data.data
          
          // Debug: Log messages with attachments and metadata structure
          fetchedMessages.forEach((msg) => {
            console.log(`🔍 Message ${msg.id} (${msg.messageType}):`, {
              hasMetadata: !!msg.metadata,
              metadataType: typeof msg.metadata,
              hasAttachments: !!msg.metadata?.attachments,
              attachmentsCount: msg.metadata?.attachments?.length || 0,
              metadataKeys: msg.metadata ? Object.keys(msg.metadata) : [],
            })
            if (msg.metadata?.attachments && msg.metadata.attachments.length > 0) {
              console.log(
                `📎 Message ${msg.id} has ${msg.metadata.attachments.length} attachments:`,
                msg.metadata.attachments,
              )
            } else if (msg.metadata && !msg.metadata.attachments) {
              console.log(`⚠️ Message ${msg.id} has metadata but no attachments:`, msg.metadata)
            }
          })
          
          if (append) {
            // Prepend older messages
            setMessages((prev) => [...fetchedMessages, ...prev])
          } else {
            // Set messages (newest at bottom)
            setMessages(fetchedMessages)
            // Scroll to bottom after loading
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
              }
            }, 100)
          }

          // Check if there are more messages
          setHasMoreMessages(fetchedMessages.length === MESSAGES_PER_PAGE)
          setMessageOffset(offset + fetchedMessages.length)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setMessagesLoading(false)
      }
    },
    []
  )

  // Load older messages when scrolling to top
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || messagesLoading || !hasMoreMessages) {
      return
    }

    const container = messagesContainerRef.current
    if (container.scrollTop === 0 && selectedThread) {
      fetchMessages(selectedThread.id, messageOffset, true)
    }
  }, [messagesLoading, hasMoreMessages, selectedThread, messageOffset, fetchMessages])

  // Mark thread as read
  const markThreadAsRead = useCallback(async (threadId) => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      await axios.patch(`${Apis.markThreadAsRead}/${threadId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      // Update thread in list
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, unreadCount: 0 } : t
        )
      )
    } catch (error) {
      console.error('Error marking thread as read:', error)
    }
  }, [])

  // Handle thread selection
  const handleThreadSelect = (thread) => {
    setSelectedThread(thread)
    setMessageOffset(0)
    setHasMoreMessages(true)
    setMessages([])
    fetchMessages(thread.id, 0, false)
    if (thread.unreadCount > 0) {
      markThreadAsRead(thread.id)
    }
    
    // Set composer data based on current mode
    const receiverEmail = thread.receiverEmail || thread.lead?.email || ''
    const receiverPhone = thread.receiverPhoneNumber || thread.lead?.phone || ''
    
    setComposerData((prev) => ({
      ...prev,
      to: composerMode === 'email' ? receiverEmail : receiverPhone,
      subject: '',
      body: '',
    }))
  }

  // Get lead name for avatar
  const getLeadName = (thread) => {
    if (thread.lead?.firstName) {
      return thread.lead.firstName.charAt(0).toUpperCase()
    }
    if (thread.lead?.name) {
      return thread.lead.name.charAt(0).toUpperCase()
    }
    if (thread.receiverPhoneNumber) {
      return thread.receiverPhoneNumber.slice(-1)
    }
    return 'L'
  }

  // Get most recent message type
  const getRecentMessageType = (thread) => {
    // Check the last message in the thread
    if (thread.messages && thread.messages.length > 0) {
      const lastMessage = thread.messages[0] // Most recent message is first in the array
      return lastMessage.messageType || 'sms'
    }
    // Fallback to threadType if no messages
    return thread.threadType || 'sms'
  }

  // Format unread count
  const formatUnreadCount = (count) => {
    if (!count || count === 0) return null
    return count > 9 ? '9+' : count.toString()
  }

  // Remove quoted reply text from email content
  const removeQuotedText = (content) => {
    if (!content || typeof window === 'undefined') return content
    if (typeof content !== 'string') return content
    
    let text = content
    
    // Pattern 1: "On [date] [time] [sender] wrote:" and everything after
    // Match patterns like "On Fri, Nov 28, 2025 at 7:18 AM Tech Connect wrote:"
    const onDatePattern = /On\s+\w+,\s+\w+\s+\d+,\s+\d+\s+at\s+\d+:\d+\s+(?:AM|PM)\s+[^:]+:\s*/i
    const onDateMatch = text.match(onDatePattern)
    if (onDateMatch) {
      const index = text.indexOf(onDateMatch[0])
      if (index > 0) {
        text = text.substring(0, index).trim()
      }
    }
    
    // Pattern 2: Remove lines starting with ">" (quoted lines)
    if (text.includes('>')) {
      const lines = text.split('\n')
      const cleanedLines = []
      let foundQuoteStart = false
      
      for (const line of lines) {
        // Check if this line starts a quote block
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('>') || trimmedLine.match(/^On\s+\w+,\s+\w+\s+\d+/i)) {
          foundQuoteStart = true
          break
        }
        if (!foundQuoteStart) {
          cleanedLines.push(line)
        }
      }
      
      text = cleanedLines.join('\n').trim()
    }
    
    // Pattern 3: Remove "-----Original Message-----" and everything after
    const originalMessagePattern = /-----Original Message-----/i
    if (text.match(originalMessagePattern)) {
      const index = text.toLowerCase().indexOf('-----original message-----')
      if (index > 0) {
        text = text.substring(0, index).trim()
      }
    }
    
    return text
  }

  // Sanitize HTML for display
  const sanitizeHTML = (html) => {
    if (typeof window === 'undefined') return html
    if (!html) return ''
    
    // Remove quoted text first
    const cleanedContent = removeQuotedText(html)
    
    return DOMPurify.sanitize(cleanedContent || '', {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'h2', 'h3', 'h4'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    })
  }

  // Get agent/user avatar for outbound messages
  const getAgentAvatar = (message) => {
    // Priority 1: Agent image or bitmoji
    if (message.agent) {
      // Try agent image first
      if (message.agent.thumb_profile_image) {
        return (
          <Image
            src={message.agent.thumb_profile_image}
            alt="Agent"
            width={32}
            height={32}
            className="rounded-full"
            style={{ objectFit: 'cover' }}
          />
        )
      }
      
      // Try agent bitmoji (from voiceId)
      if (message.agent.voiceId) {
        const selectedVoice = voicesList.find(
          (voice) => voice.voice_id === message.agent.voiceId,
        )
        if (selectedVoice && selectedVoice.img) {
          return (
            <Image
              src={selectedVoice.img}
              alt="Agent"
              width={32}
              height={32}
              className="rounded-full"
              style={{ objectFit: 'cover' }}
            />
          )
        }
      }
    }
    
    // Priority 2: User profile image
    if (userData?.user?.thumb_profile_image) {
      return (
        <Image
          src={userData.user.thumb_profile_image}
          alt="User"
          width={32}
          height={32}
          className="rounded-full"
          style={{ objectFit: 'cover' }}
        />
      )
    }
    
    // Priority 3: User profile letter
    const userName = userData?.user?.name || userData?.user?.firstName || 'U'
    const userLetter = userName.charAt(0).toUpperCase()
    return (
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-primary font-semibold text-sm border-2 border-brand-primary">
        {userLetter}
      </div>
    )
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedThread || !composerData.body.trim()) return
    if (composerMode === 'email' && !composerData.to.trim()) return
    if (sendingMessage) return // Prevent double submission

    setSendingMessage(true)

    try {
      const localData = localStorage.getItem('User')
      if (!localData) {
        setSendingMessage(false)
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      if (composerMode === 'sms') {
        // Send SMS using existing API
        const response = await axios.post(
          Apis.sendSMSToLead,
          {
            leadId: selectedThread.leadId,
            content: composerData.body,
            smsPhoneNumberId: selectedPhoneNumber || null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status) {
          toast.success('Message sent successfully')
          // Reset composer
          setComposerData({
            to: selectedThread.receiverPhoneNumber || '',
            subject: '',
            body: '',
            cc: '',
            bcc: '',
            attachments: [],
          })

          // Refresh messages and threads
          setTimeout(() => {
            fetchMessages(selectedThread.id, 0, false)
            fetchThreads()
          }, 500)
        } else {
          toast.error('Failed to send message')
        }
      } else {
        // Send Email with attachments
        const formData = new FormData()
        formData.append('leadId', selectedThread.leadId)
        formData.append('subject', composerData.subject)
        formData.append('body', composerData.body)
        formData.append('cc', composerData.cc || '')
        formData.append('bcc', composerData.bcc || '')
        formData.append('emailAccountId', selectedEmailAccount || '')

        // Add attachments
        if (composerData.attachments && composerData.attachments.length > 0) {
          composerData.attachments.forEach((file) => {
            formData.append('attachments', file)
          })
        }

        const response = await axios.post(
          Apis.sendEmailToLead,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        )

        if (response.data?.status) {
          toast.success('Email sent successfully')
          // Reset composer
          setComposerData({
            to: selectedThread.receiverEmail || selectedThread.lead?.email || '',
            subject: '',
            body: '',
            cc: '',
            bcc: '',
            attachments: [],
          })
          // Clear CC/BCC visibility
          setShowCC(false)
          setShowBCC(false)

          // Refresh messages and threads
          setTimeout(() => {
            fetchMessages(selectedThread.id, 0, false)
            fetchThreads()
          }, 500)
        } else {
          toast.error('Failed to send email')
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Fetch phone numbers
  const fetchPhoneNumbers = useCallback(async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(Apis.a2pNumbers, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setPhoneNumbers(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedPhoneNumber(response.data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error)
    }
  }, [])

  // Fetch email accounts
  const fetchEmailAccounts = useCallback(async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(Apis.gmailAccount, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setEmailAccounts(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedEmailAccount(response.data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching email accounts:', error)
    }
  }, [])

  // Get user data from localStorage
  useEffect(() => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const user = JSON.parse(localData)
      setUserData(user)
    }
  }, [])

  // Hide support widget on messages page
  useEffect(() => {
    // Add a style tag to hide support widget
    const styleId = 'hide-support-widget-messages'
    let styleElement = document.getElementById(styleId)
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    // Hide support widget button - target multiple possible selectors
    styleElement.textContent = `
      /* Hide Get Help button on messages page */
      [style*="bottom: 30"][style*="right: 10"],
      [style*="bottom: 24"][style*="right: 10"],
      [style*="bottom: 6"][style*="right: 6"],
      [style*="bottom: 30px"][style*="right: 10px"],
      [style*="bottom: 24px"][style*="right: 10px"],
      [style*="bottom: 6px"][style*="right: 6px"] {
        display: none !important;
      }
    `

    // Also try to hide by finding elements with "Get Help" text
    const hideSupportWidget = () => {
      const allElements = document.querySelectorAll('button, div, a')
      allElements.forEach((el) => {
        const text = el.textContent || el.innerText || ''
        if (text.includes('Get Help') || text.includes('getHelp')) {
          const style = window.getComputedStyle(el)
          if (style.position === 'fixed') {
            const bottom = style.bottom
            if (bottom === '30px' || bottom === '24px' || bottom === '6px') {
              el.style.display = 'none'
            }
          }
        }
      })
    }

    // Hide immediately and set up interval to catch dynamically added elements
    hideSupportWidget()
    const interval = setInterval(hideSupportWidget, 500)

    return () => {
      // Remove style tag and clear interval
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement)
      }
      clearInterval(interval)
    }
  }, [])

  // Update "To" field when thread or mode changes
  useEffect(() => {
    if (selectedThread) {
      if (composerMode === 'sms') {
        const receiverPhone = selectedThread.receiverPhoneNumber || selectedThread.lead?.phone || ''
        setComposerData((prev) => ({ ...prev, to: receiverPhone }))
      } else {
        const receiverEmail = selectedThread.receiverEmail || selectedThread.lead?.email || ''
        setComposerData((prev) => ({ ...prev, to: receiverEmail }))
      }
    }
  }, [selectedThread, composerMode])

  // Initial load
  useEffect(() => {
    fetchThreads()
    fetchPhoneNumbers()
    fetchEmailAccounts()
  }, [fetchThreads, fetchPhoneNumbers, fetchEmailAccounts])

  // Setup scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="w-full h-screen flex flex-row bg-white">
      {/* Left Sidebar - Thread List */}
      <div className="w-80 border-r border-gray-200 flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <h1 className="text-3xl font-bold text-black">Messages</h1>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
              />
            </div>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="w-10 h-10 p-0 bg-brand-primary hover:bg-brand-primary/90 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Image
                src="/messaging/edit chat icon.svg"
                width={24}
                height={24}
                alt="New message"
                className="filter brightness-0 invert"
              />
            </button>
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading threads...</div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              {/* <div className="mb-6">
                <Image
                  src="/messaging/no message icon.svg"
                  width={120}
                  height={120}
                  alt="No messages"
                  className="opacity-60"
                />
              </div> */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                {`You don't have any<br />messages`}
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-sm">
                Looks like your inbox is empty, your<br />
                messages will show up here when you<br />
                start your campaign.
              </p>
            </div>
          ) : (
            <div className="px-6">
              {threads.map((thread, index) => (
                <div
                  key={thread.id}
                  onClick={() => handleThreadSelect(thread)}
                  className={`relative py-4 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    selectedThread?.id === thread.id ? 'bg-brand-primary/5' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Dotted line indicator */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-full">
                    <div className="w-full h-full border-l-2 border-dotted border-gray-200"></div>
                  </div>

                  <div className="flex items-start gap-3 pl-4">
                    {/* Avatar with unread indicator */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-lg">
                        {getLeadName(thread)}
                      </div>
                      {/* Message type icon overlay */}
                      {getRecentMessageType(thread) === 'email' ? (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                          <Image
                            src="/messaging/email message type icon.svg"
                            width={12}
                            height={12}
                            alt="Email"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                          <Image
                            src="/messaging/text type message icon.svg"
                            width={12}
                            height={12}
                            alt="SMS"
                            className="object-contain"
                          />
                        </div>
                      )}
                      {/* Unread count badge */}
                      {thread.unreadCount > 0 && formatUnreadCount(thread.unreadCount) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center font-semibold shadow-sm">
                          {formatUnreadCount(thread.unreadCount)}
                        </div>
                      )}
                    </div>

                    {/* Thread Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm text-black truncate">
                          {thread.lead?.firstName || thread.lead?.name || 'Unknown Lead'}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {moment(thread.lastMessageAt || thread.createdAt).format('h:mm A')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {(() => {
                          const lastMessage = thread.messages?.[0]
                          if (!lastMessage) return 'No messages yet'
                          // Strip HTML tags for preview
                          const text = lastMessage.content?.replace(/<[^>]*>/g, '') || ''
                          // Show "You: " prefix for outbound messages
                          const prefix = lastMessage.direction === 'outbound' ? 'You: ' : ''
                          return prefix + text.substring(0, 40) + (text.length > 40 ? '...' : '')
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Messages View */}
      <div className="flex-1 flex flex-col h-screen">
        {selectedThread ? (
          <>
            {/* Messages Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  {selectedThread.lead?.firstName || selectedThread.lead?.name || 'Unknown Lead'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Click here for more info</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors">
                  <Star size={20} className="text-gray-600 hover:text-brand-primary" />
                </button>
                <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors">
                  <EnvelopeSimple size={20} className="text-gray-600 hover:text-brand-primary" />
                </button>
                <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors">
                  <span className="text-gray-600 text-lg hover:text-brand-primary">🗑️</span>
                </button>
              </div>
            </div>

            {/* Messages Container */}
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
                  {messages.map((message, index) => {
                    const isOutbound = message.direction === 'outbound'
                    const isEmail = message.messageType === 'email'
                    const showDateSeparator =
                      index === 0 ||
                      moment(message.createdAt).format('YYYY-MM-DD') !==
                        moment(messages[index - 1].createdAt).format('YYYY-MM-DD')

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
                          className={`flex ${isOutbound ? 'justify-end me-4' : 'justify-start'} ${
                            isEmail ? 'mb-6' : 'mb-3'
                          } relative`}
                        >
                          <div
                            className={`flex items-start gap-3 max-w-[75%] ${
                              isOutbound ? 'flex-row-reverse' : 'flex-row'
                            } relative`}
                          >
                            {/* Avatar for inbound messages */}
                            {!isOutbound && (
                              <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
                                  {getLeadName(selectedThread)}
                                </div>
                                {/* Message type icon overlay */}
                                {isEmail ? (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                    <Image
                                      src="/messaging/email message type icon.svg"
                                      width={12}
                                      height={12}
                                      alt="Email"
                                      className="object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                    <Image
                                      src="/messaging/text type message icon.svg"
                                      width={12}
                                      height={12}
                                      alt="SMS"
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`px-4 py-3 ${
                                isOutbound
                                  ? 'bg-brand-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                                  : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                              }`}
                            >
                              {isEmail && message.subject && (
                                <div className="font-semibold mb-2">
                                  Subject: {message.subject}
                                </div>
                              )}
                              {isEmail ? (
                                <div
                                  className={`prose prose-sm max-w-none ${isOutbound ? 'text-white' : 'text-black'}`}
                                  dangerouslySetInnerHTML={{
                                    __html: sanitizeHTML(message.content),
                                  }}
                                />
                              ) : (
                                <div className={`whitespace-pre-wrap ${isOutbound ? 'text-white' : 'text-black'}`}>{message.content}</div>
                              )}
                              
                              {/* Attachments */}
                              {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                                <div className={`mt-3 flex flex-col gap-2 ${isOutbound ? 'text-white' : 'text-black'}`}>
                                  {message.metadata.attachments.map((attachment, idx) => {
                                    const isImage = attachment.mimeType?.startsWith('image/') || 
                                                   attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                                    
                                    const handleAttachmentClick = (e) => {
                                      e.preventDefault()
                                      
                                      // Get API base URL (use localhost for local dev, or from env)
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
                                      
                                      const apiBaseUrl = getApiBaseUrl()
                                      
                                      // Extract download data - support both new format (downloadData) and old format (parse from URL)
                                      let downloadData = attachment.downloadData
                                      
                                      if (!downloadData) {
                                        // Try to parse from old URL format: /gmail-attachment/:messageId/:attachmentId/:emailAccountId
                                        if (attachment.url) {
                                          const urlMatch = attachment.url.match(/gmail-attachment\/([^\/]+)\/(.+)\/(\d+)/)
                                          if (urlMatch) {
                                            downloadData = {
                                              messageId: urlMatch[1],
                                              attachmentId: urlMatch[2],
                                              emailAccountId: urlMatch[3],
                                            }
                                          }
                                        }
                                        
                                        // Fallback: use direct attachment properties
                                        if (!downloadData && attachment.attachmentId) {
                                          downloadData = {
                                            messageId: attachment.messageId,
                                            attachmentId: attachment.attachmentId,
                                            emailAccountId: attachment.emailAccountId,
                                          }
                                        }
                                      }
                                      
                                      // Check if it's a direct URL download (for outgoing emails with uploaded files)
                                      if (downloadData && downloadData.type === 'direct_url' && downloadData.url) {
                                        // For direct URLs, download directly
                                        if (isImage) {
                                          // Get all image attachments from this message
                                          const allImages = message.metadata.attachments.filter(att => 
                                            att.mimeType?.startsWith('image/') || 
                                            att.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                                          )
                                          
                                          const currentIdx = allImages.findIndex(att => 
                                            att.attachmentId === attachment.attachmentId ||
                                            att.fileName === attachment.fileName
                                          )
                                          
                                          setImageAttachments(allImages.map(img => ({
                                            ...img,
                                            downloadData: img.downloadData || downloadData,
                                            blobUrl: null,
                                          })))
                                          setCurrentImageIndex(currentIdx >= 0 ? currentIdx : 0)
                                          setImageModalOpen(true)
                                          
                                          // Load image directly from URL
                                          fetch(downloadData.url)
                                            .then(response => {
                                              if (!response.ok) throw new Error(`Failed to load: ${response.status}`)
                                              return response.blob()
                                            })
                                            .then(blob => {
                                              const imageUrl = window.URL.createObjectURL(blob)
                                              setImageAttachments(prev => prev.map((img, imgIdx) => 
                                                imgIdx === currentIdx ? { ...img, blobUrl: imageUrl } : img
                                              ))
                                            })
                                            .catch(error => {
                                              console.error('Error loading image:', error)
                                              alert(`Failed to load image: ${error.message}`)
                                            })
                                        } else {
                                          // For non-images, download directly
                                          const a = document.createElement('a')
                                          a.href = downloadData.url
                                          a.download = attachment.fileName || attachment.originalName || 'attachment'
                                          document.body.appendChild(a)
                                          a.click()
                                          document.body.removeChild(a)
                                        }
                                        return
                                      }
                                      
                                      // For Gmail attachments, need messageId, attachmentId, and emailAccountId
                                      if (!downloadData || !downloadData.messageId || !downloadData.attachmentId || !downloadData.emailAccountId) {
                                        // If we have a direct URL, use it
                                        if (attachment.url && !attachment.url.includes('gmail-attachment')) {
                                          if (isImage) {
                                            const allImages = message.metadata.attachments.filter(att => 
                                              att.mimeType?.startsWith('image/') || 
                                              att.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                                            )
                                            const currentIdx = allImages.findIndex(att => 
                                              att.attachmentId === attachment.attachmentId ||
                                              att.fileName === attachment.fileName
                                            )
                                            setImageAttachments(allImages.map(img => ({
                                              ...img,
                                              downloadData: { type: 'direct_url', url: img.url },
                                              blobUrl: null,
                                            })))
                                            setCurrentImageIndex(currentIdx >= 0 ? currentIdx : 0)
                                            setImageModalOpen(true)
                                            fetch(attachment.url)
                                              .then(response => response.blob())
                                              .then(blob => {
                                                const imageUrl = window.URL.createObjectURL(blob)
                                                setImageAttachments(prev => prev.map((img, imgIdx) => 
                                                  imgIdx === currentIdx ? { ...img, blobUrl: imageUrl } : img
                                                ))
                                              })
                                              .catch(error => {
                                                console.error('Error loading image:', error)
                                                alert(`Failed to load image: ${error.message}`)
                                              })
                                            return
                                          } else {
                                            const a = document.createElement('a')
                                            a.href = attachment.url
                                            a.download = attachment.fileName || attachment.originalName || 'attachment'
                                            document.body.appendChild(a)
                                            a.click()
                                            document.body.removeChild(a)
                                            return
                                          }
                                        }
                                        alert('Missing attachment data. Please refresh and try again.')
                                        return
                                      }
                                      
                                      // If it's an image, open modal immediately (synchronously, before any async operations)
                                      if (isImage) {
                                        // Get all image attachments from this message
                                        const allImages = message.metadata.attachments.filter(att => 
                                          att.mimeType?.startsWith('image/') || 
                                          att.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
                                        )
                                        
                                        // Find current image index
                                        const currentIdx = allImages.findIndex(att => 
                                          att.attachmentId === attachment.attachmentId ||
                                          att.fileName === attachment.fileName
                                        )
                                        
                                        // Set up image attachments with download data
                                        const imagesWithData = allImages.map((img) => {
                                          let imgDownloadData = img.downloadData
                                          if (!imgDownloadData) {
                                            if (img.url) {
                                              const urlMatch = img.url.match(/gmail-attachment\/([^\/]+)\/(.+)\/(\d+)/)
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
                                                messageId: img.messageId,
                                                attachmentId: img.attachmentId,
                                                emailAccountId: img.emailAccountId,
                                              }
                                            }
                                          }
                                          return {
                                            ...img,
                                            downloadData: imgDownloadData || downloadData,
                                            blobUrl: null, // Will be loaded
                                          }
                                        })
                                        
                                        // Open modal immediately with placeholder (synchronously, before fetch)
                                        setImageAttachments(imagesWithData)
                                        setCurrentImageIndex(currentIdx >= 0 ? currentIdx : 0)
                                        setImageModalOpen(true)
                                        
                                        // Load the clicked image in the background (async, after modal is open)
                                        const currentImage = imagesWithData[currentIdx >= 0 ? currentIdx : 0]
                                        
                                        // Check if it's a direct URL
                                        if (currentImage.downloadData?.type === 'direct_url' && currentImage.downloadData.url) {
                                          fetch(currentImage.downloadData.url)
                                            .then(response => {
                                              if (!response.ok) throw new Error(`Failed to load: ${response.status}`)
                                              return response.blob()
                                            })
                                            .then(blob => {
                                              const imageUrl = window.URL.createObjectURL(blob)
                                              setImageAttachments(prev => prev.map((img, imgIdx) => 
                                                imgIdx === currentIdx ? { ...img, blobUrl: imageUrl } : img
                                              ))
                                            })
                                            .catch(error => {
                                              console.error('Error loading image:', error)
                                              alert(`Failed to load image: ${error.message}`)
                                            })
                                        } else if (currentImage.url && !currentImage.url.includes('gmail-attachment')) {
                                          // Direct URL from attachment
                                          fetch(currentImage.url)
                                            .then(response => {
                                              if (!response.ok) throw new Error(`Failed to load: ${response.status}`)
                                              return response.blob()
                                            })
                                            .then(blob => {
                                              const imageUrl = window.URL.createObjectURL(blob)
                                              setImageAttachments(prev => prev.map((img, imgIdx) => 
                                                imgIdx === currentIdx ? { ...img, blobUrl: imageUrl } : img
                                              ))
                                            })
                                            .catch(error => {
                                              console.error('Error loading image:', error)
                                              alert(`Failed to load image: ${error.message}`)
                                            })
                                        } else if (downloadData.messageId && downloadData.attachmentId && downloadData.emailAccountId) {
                                          // Gmail attachment
                                          fetch(`${apiBaseUrl}api/agent/gmail-attachment`, {
                                            method: 'POST',
                                            headers: {
                                              'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(downloadData),
                                          })
                                            .then(response => {
                                              if (!response.ok) {
                                                throw new Error(`Failed to download attachment: ${response.status}`)
                                              }
                                              return response.blob()
                                            })
                                            .then(blob => {
                                              const imageUrl = window.URL.createObjectURL(blob)
                                              setImageAttachments(prev => prev.map((img, imgIdx) => 
                                                imgIdx === currentIdx ? { ...img, blobUrl: imageUrl } : img
                                              ))
                                            })
                                            .catch(error => {
                                              console.error('Error loading image:', error)
                                              alert(`Failed to load image: ${error.message}`)
                                            })
                                        }
                                      } else {
                                        // For non-images, download directly
                                        fetch(`${apiBaseUrl}api/agent/gmail-attachment`, {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                          },
                                          body: JSON.stringify(downloadData),
                                        })
                                          .then(response => {
                                            if (!response.ok) {
                                              const errorText = response.text()
                                              console.error('❌ Attachment download failed:', response.status, errorText)
                                              throw new Error(`Failed to download attachment: ${response.status}`)
                                            }
                                            return response.blob()
                                          })
                                          .then(blob => {
                                            const url = window.URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = attachment.fileName || attachment.originalName || 'attachment'
                                            document.body.appendChild(a)
                                            a.click()
                                            document.body.removeChild(a)
                                            window.URL.revokeObjectURL(url)
                                          })
                                          .catch(error => {
                                            console.error('Error downloading attachment:', error)
                                            alert(`Failed to download attachment: ${error.message}`)
                                          })
                                      }
                                    }
                                    
                                    return (
                                      <button
                                        key={idx}
                                        onClick={handleAttachmentClick}
                                        className={`text-sm flex items-center gap-2 hover:opacity-80 text-left ${
                                          isOutbound ? 'text-white/90' : 'text-brand-primary'
                                        }`}
                                      >
                                        <Paperclip size={14} />
                                        <span className="underline">
                                          {attachment.fileName || attachment.originalName || `Attachment ${idx + 1}`}
                                        </span>
                                        {attachment.size && (
                                          <span className={`text-xs ${isOutbound ? 'text-white/70' : 'text-gray-500'}`}>
                                            ({(attachment.size / 1024).toFixed(1)} KB)
                                          </span>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                              
                              {/* Load more button - show on all email messages */}
                              {isEmail && (
                                <button className={`text-xs font-bold underline mt-2 ${
                                  isOutbound 
                                    ? 'text-white hover:text-white/80' 
                                    : 'text-black hover:text-gray-800'
                                }`}>
                                  {'Load more'}
                                </button>
                              )}
                              <div
                                className={`text-xs mt-2 flex items-center gap-2 ${
                                  isOutbound ? 'text-white' : 'text-black'
                                }`}
                              >
                                <span>{moment(message.createdAt).format('h:mm A')}</span>
                              </div>
                            </div>
                            
                            {/* Avatar for outbound messages - positioned outside bubble at bottom right */}
                            {isOutbound && (
                              <div className="absolute -bottom-1 -right-9 flex-shrink-0 z-10">
                                {getAgentAvatar(message)}
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Composer */}
            <div className="mx-4 mb-4 border border-gray-200 rounded-lg bg-white">
              <div className={`px-6 py-4 ${composerMode === 'email' ? 'min-h-[400px]' : 'min-h-[180px]'}`}>
              {/* Mode Tabs with Icons and CC/BCC buttons */}
              <div className="flex items-center justify-between border-b mb-4">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      setComposerMode('sms')
                      const receiverPhone = selectedThread.receiverPhoneNumber || selectedThread.lead?.phone || ''
                      setComposerData((prev) => ({ ...prev, to: receiverPhone }))
                      fetchPhoneNumbers()
                    }}
                    className={`flex items-center gap-2 px-0 py-3 text-sm font-medium relative ${
                      composerMode === 'sms'
                        ? 'text-brand-primary'
                        : 'text-gray-600'
                    }`}
                  >
                    <Image
                      src="/messaging/sms toggle.svg"
                      width={20}
                      height={20}
                      alt="SMS"
                      className={composerMode === 'sms' ? 'opacity-100' : 'opacity-60'}
                    />
                    <span>SMS</span>
                    {composerMode === 'sms' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setComposerMode('email')
                      const receiverEmail = selectedThread.receiverEmail || selectedThread.lead?.email || ''
                      setComposerData((prev) => ({ ...prev, to: receiverEmail }))
                      fetchEmailAccounts()
                    }}
                    className={`flex items-center gap-2 px-0 py-3 text-sm font-medium relative ${
                      composerMode === 'email'
                        ? 'text-brand-primary'
                        : 'text-gray-600'
                    }`}
                  >
                    <Image
                      src="/messaging/email toggle.svg"
                      width={20}
                      height={20}
                      alt="Email"
                      className={composerMode === 'email' ? 'opacity-100' : 'opacity-60'}
                    />
                    <span>Email</span>
                    {composerMode === 'email' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                    )}
                  </button>
                </div>
                {/* CC/BCC Toggle Buttons - Vertically centered with tabs */}
                {composerMode === 'email' && (
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
                )}
              </div>

              {/* From and To Fields - Side by side */}
              <div className="flex items-center justify-between gap-4 mb-4">
                {/* From Field - Left side */}
                <div className="flex items-center gap-2 flex-1 max-w-[35%]">
                  <label className="text-sm font-medium whitespace-nowrap">From:</label>
                  {composerMode === 'sms' ? (
                    <div className="flex-1 relative min-w-0">
                      <select
                        value={selectedPhoneNumber || ''}
                        onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none pr-8"
                      >
                        <option value="">Select phone number</option>
                        {phoneNumbers.map((phone) => (
                          <option key={phone.id} value={phone.id}>
                            {phone.phone}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 relative min-w-0">
                      <select
                        value={selectedEmailAccount || ''}
                        onChange={(e) => setSelectedEmailAccount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none pr-8"
                      >
                        <option value="">Select email account</option>
                        {emailAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.email || account.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* To Field - Right side */}
                <div className="flex items-center gap-2 flex-1 max-w-[35%]">
                  <label className="text-sm font-medium whitespace-nowrap">To:</label>
                  <Input
                    value={composerData.to}
                    readOnly
                    className="flex-1 bg-gray-50 cursor-not-allowed min-w-0 focus-visible:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Email Fields - Only show when email mode is selected */}
              {composerMode === 'email' && (
                <>
                  {/* CC Field */}
                  {showCC && (
                    <div className="flex items-center gap-2 mb-4">
                      <label className="text-sm font-medium w-16">Cc:</label>
                      <Input
                        value={composerData.cc}
                        onChange={(e) =>
                          setComposerData({ ...composerData, cc: e.target.value })
                        }
                        placeholder="Add CC recipients"
                        className="flex-1 focus-visible:ring-brand-primary"
                      />
                    </div>
                  )}

                  {/* BCC Field */}
                  {showBCC && (
                    <div className="flex items-center gap-2 mb-4">
                      <label className="text-sm font-medium w-16">Bcc:</label>
                      <Input
                        value={composerData.bcc}
                        onChange={(e) =>
                          setComposerData({ ...composerData, bcc: e.target.value })
                        }
                        placeholder="Add BCC recipients"
                        className="flex-1 focus-visible:ring-brand-primary"
                      />
                    </div>
                  )}

                  {/* Subject Field */}
                  <div className="flex items-center gap-2 mb-4">
                    <label className="text-sm font-medium w-16">Subject:</label>
                    <Input
                      value={composerData.subject}
                      onChange={(e) =>
                        setComposerData({ ...composerData, subject: e.target.value })
                      }
                      placeholder="Email subject"
                      className="flex-1 focus-visible:ring-brand-primary"
                    />
                  </div>
                </>
              )}

              {/* Message Body */}
              <div className="mb-4">
                {composerMode === 'email' ? (
                  <>
                    {/* Attachments list */}
                    {composerData.attachments.length > 0 && (
                      <div className="mb-2 flex flex-col gap-1">
                        {composerData.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                          >
                            <Paperclip size={14} className="text-gray-500" />
                            <span className="flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                            <button
                              onClick={() => removeAttachment(idx)}
                              className="text-red-500 hover:text-red-700 text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <RichTextEditor
                      ref={richTextEditorRef}
                      value={composerData.body}
                      onChange={(html) => setComposerData({ ...composerData, body: html })}
                      placeholder="Type your message..."
                      availableVariables={[]}
                    />
                  </>
                ) : (
                  <textarea
                    value={composerData.body}
                    onChange={(e) => {
                      // Enforce max 160 characters for SMS
                      if (e.target.value.length <= SMS_CHAR_LIMIT) {
                        setComposerData({ ...composerData, body: e.target.value })
                      }
                    }}
                    placeholder="Type your message..."
                    maxLength={SMS_CHAR_LIMIT}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[100px] resize-none"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 mt-4">
                {/* Char count and credits for SMS */}
                {composerMode === 'sms' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      {composerData.body.length}/{SMS_CHAR_LIMIT} char
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>
                      {Math.floor((userData?.user?.totalSecondsAvailable || 0) / 60)} credits left
                    </span>
                  </div>
                )}
                {/* Attachment button - only for email mode */}
                {composerMode === 'email' && (
                  <label className="cursor-pointer">
                    <button
                      type="button"
                      className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors"
                      onClick={() => document.getElementById('attachment-input')?.click()}
                    >
                      <Paperclip size={20} className="text-gray-600 hover:text-brand-primary" />
                    </button>
                    <input
                      id="attachment-input"
                      type="file"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
                <button
                  onClick={handleSendMessage}
                  disabled={
                    sendingMessage ||
                    !composerData.body.trim() ||
                    (composerMode === 'email' && !composerData.subject.trim()) ||
                    (composerMode === 'sms' && !selectedPhoneNumber) ||
                    (composerMode === 'email' && !selectedEmailAccount)
                  }
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-lg flex items-center gap-2 hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {sendingMessage ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      Send
                      <PaperPlaneTilt size={18} />
                    </>
                  )}
                </button>
              </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <div className="mb-6">
              <Image
                src="/messaging/no message icon.svg"
                width={120}
                height={120}
                alt="No conversation selected"
                className="opacity-60"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No message selected
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
            Select message to begin conversation
            </p>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        open={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onSend={(result) => {
          // Refresh threads after sending (even if partial success)
          if (result.sent > 0) {
            setTimeout(() => {
              fetchThreads()
            }, 1000)
          }
        }}
        mode="sms"
      />

      {/* Image Viewer Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => {
                setImageModalOpen(false)
                imageAttachments.forEach(img => {
                  if (img.blobUrl) {
                    window.URL.revokeObjectURL(img.blobUrl)
                  }
                })
                setImageAttachments([])
                setCurrentImageIndex(0)
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Previous Button */}
            {imageAttachments.length > 1 && currentImageIndex > 0 && (
              <button
                onClick={async () => {
                  const prevIndex = currentImageIndex - 1
                  const prevAttachment = imageAttachments[prevIndex]
                  
                  // Load image if not already loaded
                  if (!prevAttachment.blobUrl) {
                    try {
                      // Check if it's a direct URL
                      if (prevAttachment.downloadData?.type === 'direct_url' && prevAttachment.downloadData.url) {
                        const response = await fetch(prevAttachment.downloadData.url)
                        if (response.ok) {
                          const blob = await response.blob()
                          const imageUrl = window.URL.createObjectURL(blob)
                          setImageAttachments(prev => prev.map((img, idx) => 
                            idx === prevIndex ? { ...img, blobUrl: imageUrl } : img
                          ))
                        }
                      } else if (prevAttachment.url && !prevAttachment.url.includes('gmail-attachment')) {
                        // Direct URL from attachment
                        const response = await fetch(prevAttachment.url)
                        if (response.ok) {
                          const blob = await response.blob()
                          const imageUrl = window.URL.createObjectURL(blob)
                          setImageAttachments(prev => prev.map((img, idx) => 
                            idx === prevIndex ? { ...img, blobUrl: imageUrl } : img
                          ))
                        }
                      } else {
                        // Gmail attachment
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
                        
                        const apiBaseUrl = getApiBaseUrl()
                        const downloadData = prevAttachment.downloadData || {
                          messageId: prevAttachment.messageId,
                          attachmentId: prevAttachment.attachmentId,
                          emailAccountId: prevAttachment.emailAccountId,
                        }
                        
                        if (downloadData.messageId && downloadData.attachmentId && downloadData.emailAccountId) {
                          const response = await fetch(`${apiBaseUrl}api/agent/gmail-attachment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(downloadData),
                          })
                          
                          if (response.ok) {
                            const blob = await response.blob()
                            const imageUrl = window.URL.createObjectURL(blob)
                            setImageAttachments(prev => prev.map((img, idx) => 
                              idx === prevIndex ? { ...img, blobUrl: imageUrl } : img
                            ))
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error loading previous image:', error)
                    }
                  }
                  
                  setCurrentImageIndex(prevIndex)
                }}
                className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Button */}
            {imageAttachments.length > 1 && currentImageIndex < imageAttachments.length - 1 && (
              <button
                onClick={async () => {
                  const nextIndex = currentImageIndex + 1
                  const nextAttachment = imageAttachments[nextIndex]
                  
                  // Load image if not already loaded
                  if (!nextAttachment.blobUrl) {
                    try {
                      // Check if it's a direct URL
                      if (nextAttachment.downloadData?.type === 'direct_url' && nextAttachment.downloadData.url) {
                        const response = await fetch(nextAttachment.downloadData.url)
                        if (response.ok) {
                          const blob = await response.blob()
                          const imageUrl = window.URL.createObjectURL(blob)
                          setImageAttachments(prev => prev.map((img, idx) => 
                            idx === nextIndex ? { ...img, blobUrl: imageUrl } : img
                          ))
                        }
                      } else if (nextAttachment.url && !nextAttachment.url.includes('gmail-attachment')) {
                        // Direct URL from attachment
                        const response = await fetch(nextAttachment.url)
                        if (response.ok) {
                          const blob = await response.blob()
                          const imageUrl = window.URL.createObjectURL(blob)
                          setImageAttachments(prev => prev.map((img, idx) => 
                            idx === nextIndex ? { ...img, blobUrl: imageUrl } : img
                          ))
                        }
                      } else {
                        // Gmail attachment
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
                        
                        const apiBaseUrl = getApiBaseUrl()
                        const downloadData = nextAttachment.downloadData || {
                          messageId: nextAttachment.messageId,
                          attachmentId: nextAttachment.attachmentId,
                          emailAccountId: nextAttachment.emailAccountId,
                        }
                        
                        if (downloadData.messageId && downloadData.attachmentId && downloadData.emailAccountId) {
                          const response = await fetch(`${apiBaseUrl}api/agent/gmail-attachment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(downloadData),
                          })
                          
                          if (response.ok) {
                            const blob = await response.blob()
                            const imageUrl = window.URL.createObjectURL(blob)
                            setImageAttachments(prev => prev.map((img, idx) => 
                              idx === nextIndex ? { ...img, blobUrl: imageUrl } : img
                            ))
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error loading next image:', error)
                    }
                  }
                  
                  setCurrentImageIndex(nextIndex)
                }}
                className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Image or Loading Placeholder */}
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              {imageAttachments[currentImageIndex]?.blobUrl ? (
                <>
                  <img
                    src={imageAttachments[currentImageIndex].blobUrl}
                    alt={imageAttachments[currentImageIndex]?.fileName || 'Image'}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                  
                  {/* Image Info & Download */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-4">
                    <span className="text-sm">
                      {imageAttachments[currentImageIndex]?.fileName || 'Image'} 
                      {imageAttachments.length > 1 && ` (${currentImageIndex + 1} / ${imageAttachments.length})`}
                    </span>
                    <button
                      onClick={() => {
                        const attachment = imageAttachments[currentImageIndex]
                        const a = document.createElement('a')
                        a.href = imageAttachments[currentImageIndex].blobUrl
                        a.download = attachment.fileName || attachment.originalName || 'image'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                      }}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title="Download image"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  <span className="text-sm">Loading image...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages

