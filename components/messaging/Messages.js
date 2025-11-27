'use client'

import { EnvelopeSimple, Paperclip, PaperPlaneTilt, Plus, Star } from '@phosphor-icons/react'
import { Mail, Search } from 'lucide-react'
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

  const MESSAGES_PER_PAGE = 30
  const SMS_CHAR_LIMIT = 160

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
    // This would need to come from the API - for now assume SMS
    return thread.threadType || 'sms'
  }

  // Format unread count
  const formatUnreadCount = (count) => {
    if (!count || count === 0) return null
    return count > 9 ? '9+' : count.toString()
  }

  // Sanitize HTML for display
  const sanitizeHTML = (html) => {
    if (typeof window === 'undefined') return html
    return DOMPurify.sanitize(html || '', {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'h2', 'h3', 'h4'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    })
  }

  // Get agent image for outbound messages
  const getAgentAvatar = (message) => {
    if (message.agent?.thumb_profile_image) {
      return (
        <Image
          src={message.agent.thumb_profile_image}
          alt="Agent"
          width={40}
          height={40}
          className="rounded-full"
          style={{ objectFit: 'cover' }}
        />
      )
    }
    // Fallback to default avatar
    return (
      <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
        A
      </div>
    )
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedThread || !composerData.body.trim()) return
    if (composerMode === 'email' && !composerData.to.trim()) return

    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

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
        // Send Email
        const response = await axios.post(
          Apis.sendEmailToLead,
          {
            leadId: selectedThread.leadId,
            subject: composerData.subject,
            body: composerData.body,
            cc: composerData.cc || null,
            bcc: composerData.bcc || null,
            emailAccountId: selectedEmailAccount || null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
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
                You don't have any<br />messages
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
                      {/* Email icon overlay for email threads */}
                      {getRecentMessageType(thread) === 'email' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center border border-gray-200">
                          <Mail className="text-brand-primary" size={10} fill="currentColor" />
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
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Star size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <EnvelopeSimple size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-gray-600 text-lg">🗑️</span>
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
                          className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} ${
                            isEmail ? 'mb-6' : 'mb-3'
                          }`}
                        >
                          <div
                            className={`flex items-start gap-3 max-w-[75%] ${
                              isOutbound ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            {/* Avatar */}
                            {!isOutbound ? (
                              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {getLeadName(selectedThread)}
                              </div>
                            ) : (
                              <div className="flex-shrink-0">
                                {getAgentAvatar(message)}
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isOutbound
                                  ? 'bg-brand-primary text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {isEmail && message.subject && (
                                <div className="font-semibold mb-2">
                                  Email Subject: {message.subject}
                                </div>
                              )}
                              {isEmail ? (
                                <div
                                  className="prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{
                                    __html: sanitizeHTML(message.content),
                                  }}
                                />
                              ) : (
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              )}
                              {isEmail && (
                                <button className="text-xs underline mt-2">
                                  {isOutbound ? 'Load more' : 'Reply'}
                                </button>
                              )}
                              <div
                                className={`text-xs mt-2 flex items-center gap-2 ${
                                  isOutbound ? 'text-white/80' : 'text-gray-500'
                                }`}
                              >
                                <span>{moment(message.createdAt).format('h:mm A')}</span>
                                {isOutbound && (
                                  <span className="text-white/70">
                                    {message.status === 'delivered' ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
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
            <div className={`border-t border-gray-200 px-6 py-4 bg-white ${composerMode === 'email' ? 'min-h-[400px]' : 'min-h-[180px]'}`}>
              {/* Mode Tabs with Icons */}
              <div className="flex items-center gap-6 border-b mb-4">
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

              {/* From Field */}
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium w-16">From:</label>
                {composerMode === 'sms' ? (
                  <div className="flex-1 relative">
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
                  <div className="flex-1 relative">
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

              {/* To Field - Read-only */}
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium w-16">To:</label>
                <Input
                  value={composerData.to}
                  readOnly
                  className="flex-1 bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Email Fields - Only show when email mode is selected */}
              {composerMode === 'email' && (
                <>
                  {/* CC/BCC Toggle Buttons - Next to To label */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1"></div>
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
                  </div>

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
                        className="flex-1"
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
                        className="flex-1"
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
                      className="flex-1"
                    />
                  </div>
                </>
              )}

              {/* Message Body */}
              <div className="mb-4">
                {composerMode === 'email' ? (
                  <RichTextEditor
                    ref={richTextEditorRef}
                    value={composerData.body}
                    onChange={(html) => setComposerData({ ...composerData, body: html })}
                    placeholder="Type your message..."
                    availableVariables={[]}
                  />
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
                <div className="flex items-center gap-2">
                  {composerMode === 'email' && (
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Paperclip size={20} className="text-gray-600" />
                    </button>
                  )}
                </div>
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
                <button
                  onClick={handleSendMessage}
                  disabled={
                    !composerData.body.trim() ||
                    (composerMode === 'email' && !composerData.subject.trim()) ||
                    (composerMode === 'sms' && !selectedPhoneNumber) ||
                    (composerMode === 'email' && !selectedEmailAccount)
                  }
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-lg flex items-center gap-2 hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Send
                  <PaperPlaneTilt size={18} />
                </button>
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
    </div>
  )
}

export default Messages

