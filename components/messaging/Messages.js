'use client'

import { ChevronLeft, ChevronRight, X, Download, Paperclip } from 'lucide-react'
import CloseBtn from '@/components/globalExtras/CloseBtn'
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
import ThreadsList from './ThreadsList'
import ConversationView from './ConversationView'
import MessageComposer from './MessageComposer'
import EmailTimelineModal from './EmailTimelineModal'
import { toast } from 'sonner'
import voicesList from '@/components/createagent/Voices'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import AuthSelectionPopup from '@/components/pipeline/AuthSelectionPopup'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import { Modal, Box } from '@mui/material'
import { useUser } from '@/hooks/redux-hooks'

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
  const [ccEmails, setCcEmails] = useState([])
  const [bccEmails, setBccEmails] = useState([])
  const [ccInput, setCcInput] = useState('')
  const [bccInput, setBccInput] = useState('')
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [messageOffset, setMessageOffset] = useState(0) // Offset of the oldest message currently loaded
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const messagesTopRef = useRef(null)
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
  const [showEmailTimeline, setShowEmailTimeline] = useState(false)
  const [emailTimelineLeadId, setEmailTimelineLeadId] = useState(null)
  const [emailTimelineSubject, setEmailTimelineSubject] = useState(null)
  const [emailTimelineMessages, setEmailTimelineMessages] = useState([])
  const [emailTimelineLoading, setEmailTimelineLoading] = useState(false)
  const [openEmailDetailId, setOpenEmailDetailId] = useState(null)
  const [showAuthSelectionPopup, setShowAuthSelectionPopup] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const threadsRequestIdRef = useRef(0)
  
  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([]) // Temporary selection in modal
  const [appliedTeamMemberIds, setAppliedTeamMemberIds] = useState([]) // Actually applied filter
  const [filterTeamMembers, setFilterTeamMembers] = useState([])


  const { user: reduxUser, setUser: setReduxUser,planCapabilities } = useUser()

  // Close email detail popover when clicking outside
  useEffect(() => {
    if (!openEmailDetailId) return
    const handleClickOutside = () => setOpenEmailDetailId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openEmailDetailId])

  // Normalize email header details for the popover
  const getEmailDetails = useCallback(
    (message) => {
      const headers =
        message.metadata?.headers ||
        message.metadata?.emailHeaders ||
        message.metadata?.rawHeaders ||
        {}

      const getHeader = (key) => {
        if (!headers) return ''
        const direct = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()]
        if (direct) return direct
        const foundKey = Object.keys(headers).find(
          (k) => k && k.toString().toLowerCase() === key.toLowerCase(),
        )
        return foundKey ? headers[foundKey] : ''
      }

      const ensureString = (val) => {
        if (!val) return ''
        if (Array.isArray(val)) return val.filter(Boolean).join(', ')
        return String(val)
      }

      const isOutbound = message.direction === 'outbound'

      // For outgoing messages: from = sender (user/agent), to = recipient (lead)
      // For incoming messages: from = sender (lead), to = recipient (user/agent)
      let fromEmail = ''
      let toEmail = ''

      if (isOutbound) {
        // Outgoing: from is the sender (user/agent email), to is the recipient (lead email)
        fromEmail = ensureString(
          message.fromEmail ||
            message.from ||
            message.sender ||
            message.senderEmail ||
            message.metadata?.from ||
            getHeader('from') ||
            userData?.user?.email ||
            ''
        )
        toEmail = ensureString(
          message.toEmail ||
            message.to ||
            message.receiverEmail ||
            message.metadata?.to ||
            getHeader('to') ||
            selectedThread?.lead?.email ||
            ''
        )
      } else {
        // Incoming: from is the sender (lead email), to is the recipient (user/agent email)
        fromEmail = ensureString(
          message.fromEmail ||
            message.from ||
            message.sender ||
            message.senderEmail ||
            message.metadata?.from ||
            getHeader('from') ||
            selectedThread?.lead?.email ||
            ''
        )
        toEmail = ensureString(
          message.toEmail ||
            message.to ||
            message.receiverEmail ||
            message.metadata?.to ||
            getHeader('to') ||
            userData?.user?.email ||
            ''
        )
      }

      return {
        from: fromEmail || 'Unknown sender',
        to: toEmail || 'Unknown recipient',
        cc: ensureString(message.metadata?.cc || message.cc || getHeader('cc')),
        subject: ensureString(message.subject || getHeader('subject')),
        date: message.createdAt ? moment(message.createdAt).format('MMM D, YYYY, h:mm A') : '',
        mailedBy: ensureString(message.metadata?.mailedBy || getHeader('mailed-by')),
        signedBy: ensureString(message.metadata?.signedBy || getHeader('signed-by')),
        security: ensureString(message.metadata?.security || getHeader('security')),
      }
    },
    [selectedThread?.lead?.email, userData?.user?.email],
  )
  
  // Helper function to get image URL for Next.js Image component
  const getImageUrl = (attachment, message = null) => {
    const getApiBaseUrl = () => {
      // if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      //   return 'http://localhost:8003/'
      // }
      return (
        // process.env.NEXT_PUBLIC_BASE_API_URL ||
        (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
          ? 'https://apimyagentx.com/agentx/'
          : 'https://apimyagentx.com/agentxtest/')
      )
    }
    const apiBaseUrl = getApiBaseUrl()
    
    // Direct URL from downloadData (for non-Gmail attachments)
    if (attachment.downloadData?.type === 'direct_url' && attachment.downloadData.url) {
      return attachment.downloadData.url
    }
    
    // Check if URL is the POST endpoint for Gmail attachments
    const isGmailPostEndpoint = attachment.url && 
      (attachment.url.includes('/api/agent/gmail-attachment') || 
       attachment.url.endsWith('/gmail-attachment'))
    
    // If URL is the POST endpoint, we need to construct GET endpoint from downloadData
    // For incoming emails, the URL will be like: https://apimyagentx.com/agentxtest/api/agent/gmail-attachment
    if (isGmailPostEndpoint || attachment.url?.includes('gmail-attachment')) {
      // Try to get messageId, attachmentId, and emailAccountId from various sources
      let messageId = attachment.downloadData?.messageId || attachment.messageId
      let attachmentId = attachment.downloadData?.attachmentId || attachment.attachmentId
      let emailAccountId = attachment.downloadData?.emailAccountId || attachment.emailAccountId
      
      // Fallback to message-level fields if attachment doesn't have them
      if (message) {
        if (!messageId && message.emailMessageId) {
          messageId = message.emailMessageId
        }
        if (!emailAccountId && message.emailAccountId) {
          emailAccountId = message.emailAccountId
        }
      }
      
      // If we have all required fields, construct the GET endpoint URL
      if (messageId && attachmentId && emailAccountId) {
        // Use GET endpoint: /gmail-attachment/:messageId/:emailAccountId?attachmentId=...
        // This is for images from our server, so Next.js Image can be used
        return `${apiBaseUrl}api/agent/gmail-attachment/${encodeURIComponent(messageId)}/${encodeURIComponent(emailAccountId)}?attachmentId=${encodeURIComponent(attachmentId)}`
      }
      
      console.warn('⚠️ Gmail attachment detected but missing required fields:', {
        messageId,
        attachmentId,
        emailAccountId,
        attachment: attachment.fileName,
        downloadData: attachment.downloadData,
      })
      
      return null
    }
    
    // Direct URL from attachment (not Gmail attachment endpoint)
    // This could be external URLs or other attachment types
    if (attachment.url && !attachment.url.includes('gmail-attachment')) {
      return attachment.url
    }
    
    // Fallback: Try to construct from downloadData even if URL doesn't indicate Gmail
    if (attachment.downloadData) {
      let messageId = attachment.downloadData.messageId || attachment.messageId
      let attachmentId = attachment.downloadData.attachmentId || attachment.attachmentId
      let emailAccountId = attachment.downloadData.emailAccountId || attachment.emailAccountId
      
      if (message) {
        if (!messageId && message.emailMessageId) {
          messageId = message.emailMessageId
        }
        if (!emailAccountId && message.emailAccountId) {
          emailAccountId = message.emailAccountId
        }
      }
      
      if (messageId && attachmentId && emailAccountId) {
        return `${apiBaseUrl}api/agent/gmail-attachment/${encodeURIComponent(messageId)}/${encodeURIComponent(emailAccountId)}?attachmentId=${encodeURIComponent(attachmentId)}`
      }
    }
    
    // Final fallback to attachment downloadData URL
    if (attachment.downloadData?.url) {
      return attachment.downloadData.url
    }
    
    console.warn('⚠️ Cannot construct image URL - missing required fields:', {
      url: attachment.url,
      downloadData: attachment.downloadData,
      attachment: attachment.fileName,
    })
    
    return null
  }
  
  // Helper function to check if image is from our server (for Next.js Image optimization)
  const isImageFromOurServer = (url) => {
    if (!url) return false
    
    const ourDomains = [
      'apimyagentx.com',
      'localhost:8003',
      'localhost',
    ]
    
    try {
      const urlObj = new URL(url)
      return ourDomains.some(domain => urlObj.hostname.includes(domain))
    } catch (e) {
      // If URL parsing fails, check if it's a relative path or contains our API path
      return url.includes('/api/agent/gmail-attachment') || url.startsWith('/')
    }
  }
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: null,
    title: null,
    type: SnackbarTypes.Error,
  })

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
  const fetchThreads = useCallback(async (searchQuery = '', teamMemberIdsFilter = []) => {
    console.log('fetchThreads is called')
    const requestId = ++threadsRequestIdRef.current
    try {
      setLoading(true)
      // Clear threads immediately when starting a new fetch to prevent showing stale data
      // Only clear if there's a search query (to avoid flicker on initial load)
      if (searchQuery && searchQuery.trim()) {
        setThreads([])
      }
      
      const localData = localStorage.getItem('User')
      if (!localData) {
        setThreads([])
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const params = {}
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      // Add teamMemberIds to query if filter is active
      if (teamMemberIdsFilter && teamMemberIdsFilter.length > 0) {
        params.teamMemberIds = teamMemberIdsFilter.join(',')
      }

      const response = await axios.get(Apis.getMessageThreads, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      console.log("Api path is ", Apis.getMessageThreads)
      console.log("params is ", params)
      console.log("response is ", response)

      // Ignore responses for stale requests so older calls can't overwrite newer results
      if (requestId !== threadsRequestIdRef.current) {
        console.log('requestId is not the current requestId, returning')
        return
      }

      if (response.data?.status && Array.isArray(response.data?.data)) {
        console.log('response.data.data is:', response.data.data)
        // Sort by lastMessageAt descending
        const sortedThreads = response.data.data.sort((a, b) => {
          const dateA = new Date(a.lastMessageAt || a.createdAt)
          const dateB = new Date(b.lastMessageAt || b.createdAt)
          return dateB - dateA
        })
        console.log('sortedThreads is:', sortedThreads)
        setThreads(sortedThreads)
      } else {
        // Clear threads if no valid response or empty results
        setThreads([])
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      // Clear threads on error only if this is the latest request
      if (requestId === threadsRequestIdRef.current) {
        setThreads([])
      }
    } finally {
      // Only clear loading state for the latest request
      if (requestId === threadsRequestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Fetch messages for a thread
  const fetchMessages = useCallback(
    async (threadId, offset = null, append = false) => {
      if (!threadId) return

      try {
        if (append) {
          setLoadingOlderMessages(true)
        } else {
          setMessagesLoading(true)
        }
        
        const localData = localStorage.getItem('User')
        if (!localData) return

        const userData = JSON.parse(localData)
        const token = userData.token

        let actualOffset = offset
        
        // For initial load, fetch a larger batch to get the most recent messages
        if (!append && offset === null) {
          // Fetch a large batch to get the most recent messages
          // We'll take the last 30 from the fetched batch
          const response = await axios.get(
            `${Apis.getMessagesForThread}/${threadId}/messages`,
            {
              params: {
                limit: 500, // Fetch a large batch to ensure we get recent messages
                offset: 0,
              },
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.data?.status && response.data?.data) {
            const allMessages = response.data.data
            // Take the last 30 messages (most recent)
            const fetchedMessages = allMessages.slice(-MESSAGES_PER_PAGE)
            // Calculate the offset of the oldest message we're showing
            // If we fetched 500 and took last 30, the oldest is at offset 470 (if there are 500+ messages)
            // If we fetched less than 500, it means we got all messages, so offset is 0
            const oldestMessageOffset = allMessages.length >= 500 
              ? Math.max(0, allMessages.length - MESSAGES_PER_PAGE)
              : 0
            
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
            
            // Set messages (newest at bottom)
            setMessages(fetchedMessages)
            
            // Check if there are more older messages
            // If we got exactly 500, there might be more. If less, we got all messages.
            setHasMoreMessages(allMessages.length >= 500)
            setMessageOffset(oldestMessageOffset)
            
            // Scroll to bottom after loading
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
              }
            }, 100)
            
            setMessagesLoading(false)
            return
          }
        }
        
        // For loading older messages (append = true)
        if (append && actualOffset !== null) {
          // Calculate offset for older messages (before current oldest)
          actualOffset = Math.max(0, actualOffset - MESSAGES_PER_PAGE)
        } else if (actualOffset === null) {
          actualOffset = 0
        }

        const response = await axios.get(
          `${Apis.getMessagesForThread}/${threadId}/messages`,
          {
            params: {
              limit: MESSAGES_PER_PAGE,
              offset: actualOffset,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status && response.data?.data) {
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
            // Store scroll position before prepending
            const container = messagesContainerRef.current
            const scrollHeight = container?.scrollHeight || 0
            const scrollTop = container?.scrollTop || 0
            
            // Prepend older messages at the top
            setMessages((prev) => [...fetchedMessages, ...prev])
            
            // Restore scroll position after prepending (maintain scroll position)
            setTimeout(() => {
              if (container) {
                const newScrollHeight = container.scrollHeight
                const heightDifference = newScrollHeight - scrollHeight
                container.scrollTop = scrollTop + heightDifference
              }
            }, 0)
            
            // Update offset to the oldest message now loaded
            setMessageOffset(actualOffset)
            // Check if there are more older messages
            setHasMoreMessages(actualOffset > 0 && fetchedMessages.length === MESSAGES_PER_PAGE)
          } else {
            // Set messages (newest at bottom)
            setMessages(fetchedMessages)
            // Scroll to bottom after loading
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
              }
            }, 100)
            
            // Check if there are more messages
            setHasMoreMessages(fetchedMessages.length === MESSAGES_PER_PAGE)
            setMessageOffset(actualOffset + fetchedMessages.length)
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        if (append) {
          setLoadingOlderMessages(false)
        } else {
          setMessagesLoading(false)
        }
      }
    },
    []
  )

  // Load older messages when scrolling to top
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || messagesLoading || loadingOlderMessages || !hasMoreMessages) {
      return
    }

    const container = messagesContainerRef.current
    // Load when near the top (within 100px)
    if (container.scrollTop <= 100 && selectedThread) {
      fetchMessages(selectedThread.id, messageOffset, true)
    }
  }, [messagesLoading, loadingOlderMessages, hasMoreMessages, selectedThread, messageOffset, fetchMessages])

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
    fetchMessages(thread.id, null, false) // null means initial load
    if (thread.unreadCount > 0) {
      markThreadAsRead(thread.id)
    }
    
    // Clear email timeline state when switching threads
    setEmailTimelineSubject(null)
    setEmailTimelineMessages([])
    setEmailTimelineLeadId(null)
    setReplyToMessage(null)
    
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

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Handle CC email input
  const handleCcInputChange = (e) => {
    const value = e.target.value
    setCcInput(value)
  }

  const handleCcInputPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const emails = pastedText.split(/[,\s]+/).filter(email => email.trim() && isValidEmail(email.trim()))
    const newEmails = emails.filter(email => !ccEmails.includes(email.trim()))
    if (newEmails.length > 0) {
      setCcEmails([...ccEmails, ...newEmails.map(e => e.trim())])
    }
    // Set remaining text as input if there's invalid content
    const remaining = pastedText.split(/[,\s]+/).filter(email => email.trim() && !isValidEmail(email.trim())).join(' ')
    if (remaining.trim()) {
      setCcInput(remaining)
    } else {
      setCcInput('')
    }
  }

  const handleCcInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || (e.key === ' ' && ccInput.trim())) {
      e.preventDefault()
      const email = ccInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && isValidEmail(email)) {
        if (!ccEmails.includes(email)) {
          setCcEmails([...ccEmails, email])
        }
        setCcInput('')
      }
    } else if (e.key === 'Backspace' && ccInput === '' && ccEmails.length > 0) {
      // Remove last email if backspace pressed on empty input
      setCcEmails(ccEmails.slice(0, -1))
    }
  }

  const removeCcEmail = (emailToRemove) => {
    setCcEmails(ccEmails.filter((email) => email !== emailToRemove))
  }

  // Handle BCC email input
  const handleBccInputChange = (e) => {
    const value = e.target.value
    setBccInput(value)
  }

  const handleBccInputPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const emails = pastedText.split(/[,\s]+/).filter(email => email.trim() && isValidEmail(email.trim()))
    const newEmails = emails.filter(email => !bccEmails.includes(email.trim()))
    if (newEmails.length > 0) {
      setBccEmails([...bccEmails, ...newEmails.map(e => e.trim())])
    }
    // Set remaining text as input if there's invalid content
    const remaining = pastedText.split(/[,\s]+/).filter(email => email.trim() && !isValidEmail(email.trim())).join(' ')
    if (remaining.trim()) {
      setBccInput(remaining)
    } else {
      setBccInput('')
    }
  }

  const handleBccInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || (e.key === ' ' && bccInput.trim())) {
      e.preventDefault()
      const email = bccInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && isValidEmail(email)) {
        if (!bccEmails.includes(email)) {
          setBccEmails([...bccEmails, email])
        }
        setBccInput('')
      }
    } else if (e.key === 'Backspace' && bccInput === '' && bccEmails.length > 0) {
      // Remove last email if backspace pressed on empty input
      setBccEmails(bccEmails.slice(0, -1))
    }
  }

  const removeBccEmail = (emailToRemove) => {
    setBccEmails(bccEmails.filter((email) => email !== emailToRemove))
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
    if (thread.receiverEmail) {
      return thread.receiverEmail.charAt(0).toUpperCase()
    }
    return 'L'
  }

  // Get display name for thread (full name, not just initial)
  const getThreadDisplayName = (thread) => {
    // Try lead name first
    if (thread.lead?.firstName) {
      const lastName = thread.lead?.lastName ? ` ${thread.lead.lastName}` : ''
      return `${thread.lead.firstName}${lastName}`
    }
    if (thread.lead?.name) {
      return thread.lead.name
    }
    // Fallback to email or phone if lead is null
    if (thread.receiverEmail) {
      return thread.receiverEmail
    }
    if (thread.receiverPhoneNumber) {
      return thread.receiverPhoneNumber
    }
    return 'Unknown Contact'
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
    
    // Extract plain text from HTML if needed for pattern matching
    let text = content
    if (typeof document !== 'undefined' && content.includes('<')) {
      try {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        text = tempDiv.textContent || tempDiv.innerText || content
      } catch (e) {
        // If HTML parsing fails, use original content
        text = content
      }
    }
    
    // Pattern 1: "Replying to [subject] [sender]" - Gmail style
    // Match patterns like "Replying to test Noah Nega Technical Developer"
    // This pattern indicates the start of quoted/signature content
    const replyingToPattern = /Replying\s+to\s+[^\n]+/i
    const replyingToMatch = text.match(replyingToPattern)
    if (replyingToMatch) {
      const matchIndex = text.indexOf(replyingToMatch[0])
      // If there's content before "Replying to", that's the actual reply
      if (matchIndex > 0) {
        text = text.substring(0, matchIndex).trim()
      } else {
        // "Replying to" is at the start - check if there's actual reply content
        // Look for the pattern and see what comes after
        const afterHeader = text.substring(replyingToMatch[0].length).trim()
        // If what follows is clearly quoted content (quotes, phone, URLs), remove everything
        if (afterHeader.match(/^["'].*["']|^\(?\d{3}\)?|^www\.|^http/i)) {
          // This is all quoted/signature content, return empty
          text = ''
        } else {
          // Might have some content, but "Replying to" header should be removed
          // The actual reply would be before this, so if it's at start, there's no reply
          text = ''
        }
      }
    }
    
    // Pattern 2: "On [date] [time] [sender] wrote:" and everything after
    // Match patterns like "On Fri, Nov 28, 2025 at 7:18 AM Tech Connect wrote:"
    const onDatePattern = /On\s+\w+,\s+\w+\s+\d+,\s+\d+\s+at\s+\d+:\d+\s+(?:AM|PM)\s+[^:]+:\s*/i
    const onDateMatch = text.match(onDatePattern)
    if (onDateMatch) {
      const index = text.indexOf(onDateMatch[0])
      if (index > 0) {
        text = text.substring(0, index).trim()
      }
    }
    
    // Pattern 3: Remove lines starting with ">" (quoted lines)
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
    
    // Pattern 4: Remove "-----Original Message-----" and everything after
    const originalMessagePattern = /-----Original Message-----/i
    if (text.match(originalMessagePattern)) {
      const index = text.toLowerCase().indexOf('-----original message-----')
      if (index > 0) {
        text = text.substring(0, index).trim()
      }
    }
    
    // Pattern 5: Remove signature blocks and quoted content (phone numbers, URLs, quotes, etc.)
    // Look for patterns like phone numbers, URLs, quoted text, or common signature indicators
    const lines = text.split('\n')
    const cleanedLines = []
    let foundSignature = false
    
    // Common signature indicators
    const signaturePatterns = [
      /^[\s]*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/, // Phone numbers like (408) 679.9068
      /^[\s]*(www\.|http:\/\/|https:\/\/)/i, // URLs
      /^[\s]*Best\s+regards/i,
      /^[\s]*Sincerely/i,
      /^[\s]*Thanks/i,
      /^[\s]*Regards/i,
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // Skip empty lines if we haven't found signature yet
      if (!trimmedLine && !foundSignature) {
        cleanedLines.push(line)
        continue
      }
      
      // Check if this line matches a signature pattern
      const isSignatureLine = signaturePatterns.some(pattern => pattern.test(trimmedLine))
      
      // Check if line contains quoted text in quotes (like "Don't postpone...")
      // This often indicates quoted content from the original email
      const isQuotedText = trimmedLine.match(/^["'].*["']$/) && trimmedLine.length > 15
      
      // Check if line looks like a standalone quote (starts and ends with quotes)
      if (isQuotedText) {
        foundSignature = true
        break
      }
      
      if (isSignatureLine) {
        foundSignature = true
        break
      }
      
      // If we haven't found signature yet, keep the line
      if (!foundSignature) {
        cleanedLines.push(line)
      }
    }
    
    text = cleanedLines.join('\n').trim()
    
    // Pattern 6: Remove content after common email separators
    const separators = [
      /^From:.*$/m,
      /^Sent:.*$/m,
      /^To:.*$/m,
      /^Subject:.*$/m,
      /^Date:.*$/m,
    ]
    
    for (const separator of separators) {
      const match = text.match(separator)
      if (match) {
        const index = text.indexOf(match[0])
        if (index > 0) {
          text = text.substring(0, index).trim()
        }
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

  // Helper function to normalize email subject for threading
  const normalizeSubject = (subject) => {
    if (!subject) return ''
    // Normalize subject by removing "Re:", "Fwd:", etc. for threading
    return subject
      .replace(/^(re|fwd|fw|aw):\s*/i, '')
      .replace(/^\[.*?\]\s*/, '')
      .trim()
  }

  // Handle reply click
  const handleReplyClick = (message) => {
    if (!message || !selectedThread?.lead?.id) return
    
    // Set the message to reply to
    setReplyToMessage(message)
    
    // Open EmailTimelineModal with reply mode
    setShowEmailTimeline(true)
    setEmailTimelineLeadId(selectedThread.lead.id)
    
    // Set subject for threading (normalize it)
    if (message.subject) {
      const normalizedSubject = normalizeSubject(message.subject)
      setEmailTimelineSubject(normalizedSubject)
      // Also update composer subject for threading
      setComposerData((prev) => ({ ...prev, subject: normalizedSubject }))
    } else {
      setEmailTimelineSubject(null)
    }
  }

  // Handle opening email timeline (for Load More or subject click)
  const handleOpenEmailTimeline = (subject) => {
    if (!selectedThread?.lead?.id) return
    
    setShowEmailTimeline(true)
    setEmailTimelineLeadId(selectedThread.lead.id)
    
    if (subject) {
      const normalizedSubject = normalizeSubject(subject)
      setEmailTimelineSubject(normalizedSubject)
      // Update composer subject for threading when viewing email timeline
      setComposerData((prev) => ({ ...prev, subject: normalizedSubject }))
    } else {
      setEmailTimelineSubject(null)
    }
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
          toast.success('Message sent successfully', {
            style: {
              width: 'fit-content',
              maxWidth: '400px',
              whiteSpace: 'nowrap',
            },
          })
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
            fetchMessages(selectedThread.id, null, false)
            fetchThreads(searchValue || "", appliedTeamMemberIds)
          }, 500)
        } else {
          toast.error('Failed to send message')
        }
      } else {
        // Send Email with attachments
        // Determine subject for threading
        let emailSubject = composerData.subject
        
        // Find the most recent message in the thread to use as replyToMessageId
        // This ensures proper Gmail threading with In-Reply-To and References headers
        let replyToMessageId = null
        
        // Use emailTimelineMessages if available (from Load More or subject click), otherwise use messages from thread
        let emailMessages = emailTimelineMessages.length > 0 
          ? emailTimelineMessages 
          : messages.filter(msg => msg.messageType === 'email' && msg.subject)
        
        // If we have emailTimelineSubject but no emailTimelineMessages, try to fetch them
        if (emailTimelineSubject && emailTimelineMessages.length === 0 && selectedThread?.leadId) {
          try {
            const localData = localStorage.getItem('User')
            if (localData) {
              const userData = JSON.parse(localData)
              const token = userData.token
              
              const response = await axios.get(Apis.getEmailsBySubject, {
                params: {
                  leadId: selectedThread.leadId,
                  subject: emailTimelineSubject,
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              })
              
              if (response.data?.status && response.data?.data) {
                emailMessages = response.data.data
                console.log(`📧 Fetched ${emailMessages.length} emails by subject for threading`)
              }
            }
          } catch (error) {
            console.error('Error fetching emails by subject:', error)
            // Fallback to messages from thread
            emailMessages = messages.filter(msg => msg.messageType === 'email' && msg.subject)
          }
        }
        
        // If subject is empty, try to get subject from thread context
        if (!emailSubject || emailSubject.trim() === '') {
          // Check if we have emailTimelineSubject (from Load More or subject click)
          if (emailTimelineSubject) {
            emailSubject = emailTimelineSubject
          } else if (emailMessages.length > 0) {
            // Use the most recent email's subject (normalized)
            // emailTimelineMessages are sorted oldest to newest, regular messages are oldest to newest
            const mostRecentEmail = emailMessages[emailMessages.length - 1]
            emailSubject = normalizeSubject(mostRecentEmail.subject)
          }
        } else {
          // Normalize the subject to ensure proper threading
          emailSubject = normalizeSubject(emailSubject)
        }
        
        // If we have email messages, find the most recent one that matches the subject
        // This ensures Gmail threads the email correctly by using the correct message for reply headers
        if (emailMessages.length > 0 && emailSubject) {
          // Filter messages that match the normalized subject (for proper threading)
          const normalizedSubject = emailSubject.toLowerCase().trim()
          const matchingMessages = emailMessages.filter(msg => {
            const msgSubject = normalizeSubject(msg.subject).toLowerCase().trim()
            return msgSubject === normalizedSubject
          })
          
          if (matchingMessages.length > 0) {
            // Get the most recent matching email message (messages are sorted oldest to newest)
            const mostRecentEmail = matchingMessages[matchingMessages.length - 1]
            replyToMessageId = mostRecentEmail.id
            console.log(`📧 Using most recent matching message ${replyToMessageId} for threading with subject: ${emailSubject}`)
          } else if (emailMessages.length > 0) {
            // Fallback: use the most recent email even if subject doesn't match exactly
            // This can happen if subjects have slight variations
            const mostRecentEmail = emailMessages[emailMessages.length - 1]
            replyToMessageId = mostRecentEmail.id
            console.log(`📧 Using most recent message ${replyToMessageId} for threading (subject match not found)`)
          }
        }
        
        // If still no subject, use a default
        if (!emailSubject || emailSubject.trim() === '') {
          emailSubject = 'No Subject'
        }
        
        const formData = new FormData()
        formData.append('leadId', selectedThread.leadId)
        formData.append('subject', emailSubject)
        formData.append('body', composerData.body)
        
        // Add replyToMessageId if we found one (for proper Gmail threading)
        if (replyToMessageId) {
          formData.append('replyToMessageId', replyToMessageId.toString())
          console.log(`📧 Sending email with replyToMessageId: ${replyToMessageId} for subject: ${emailSubject}`)
        } else {
          console.warn(`⚠️ No replyToMessageId found for subject: ${emailSubject}. Email may create a new thread. Available messages: ${emailMessages.length}`)
        }
        // Join CC and BCC arrays into comma-separated strings
        const ccString = ccEmails.join(', ')
        const bccString = bccEmails.join(', ')
        formData.append('cc', ccString || '')
        formData.append('bcc', bccString || '')
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
          toast.success('Email sent successfully', {
            style: {
              width: 'fit-content',
              maxWidth: '400px',
              whiteSpace: 'nowrap',
            },
          })
          // Reset composer but preserve subject if we're in an email thread context
          // Prioritize emailTimelineSubject (set when Load More or subject is clicked)
          const preservedSubject = emailTimelineSubject || 
            (composerData.subject && composerData.subject.trim() ? normalizeSubject(composerData.subject) : '')
          setComposerData({
            to: selectedThread.receiverEmail || selectedThread.lead?.email || '',
            subject: preservedSubject,
            body: '',
            cc: '',
            bcc: '',
            attachments: [],
          })
          // Clear CC/BCC arrays and inputs
          setCcEmails([])
          setBccEmails([])
          setCcInput('')
          setBccInput('')
          // Clear CC/BCC visibility
          setShowCC(false)
          setShowBCC(false)

          // Refresh messages and threads
          setTimeout(() => {
            fetchMessages(selectedThread.id, null, false)
            fetchThreads(searchValue || "", appliedTeamMemberIds)
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

  // Auto-select first thread when threads are loaded
  useEffect(() => {
    if (!selectedThread && threads.length > 0) {
      const firstThread = threads[0]
      setSelectedThread(firstThread)
      setMessageOffset(0)
      setHasMoreMessages(true)
      setMessages([])
      fetchMessages(firstThread.id, null, false)
      if (firstThread.unreadCount > 0) {
        markThreadAsRead(firstThread.id)
      }
    }
  }, [threads, selectedThread, fetchMessages, markThreadAsRead])

  // Fetch email timeline messages
  const fetchEmailTimeline = useCallback(async (leadId, subject = null) => {
    if (!leadId) return
    
    try {
      setEmailTimelineLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      // If subject is provided, use the new endpoint to get emails by subject
      if (subject) {
        try {
          const response = await axios.get(Apis.getEmailsBySubject, {
            params: {
              leadId: leadId,
              subject: subject,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.data?.status && response.data?.data) {
            // Sort by date ascending (oldest first) - like a chat conversation
            const sortedMessages = [...response.data.data].sort((a, b) => {
              const dateA = new Date(a.createdAt)
              const dateB = new Date(b.createdAt)
              return dateA - dateB
            })
            setEmailTimelineMessages(sortedMessages)
          } else {
            setEmailTimelineMessages([])
          }
        } catch (error) {
          console.error('Error fetching emails by subject:', error)
          setEmailTimelineMessages([])
        }
        return
      }

      // Fallback to original behavior: fetch all threads for this lead, then filter for email messages
      const threadsResponse = await axios.get(Apis.getMessageThreads, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (threadsResponse.data?.status && threadsResponse.data?.data) {
        // Find threads for this lead
        const leadThreads = threadsResponse.data.data.filter(
          (thread) => thread.lead?.id === leadId
        )

        // Fetch messages for each thread and filter for emails only
        const allEmailMessages = []
        for (const thread of leadThreads) {
          try {
            const messagesResponse = await axios.get(
              `${Apis.getMessagesForThread}/${thread.id}/messages`,
              {
                params: {
                  limit: 1000, // Get all messages
                  offset: 0,
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            )

            if (messagesResponse.data?.status && messagesResponse.data?.data) {
              // Filter for email messages only
              const emailMessages = messagesResponse.data.data.filter(
                (msg) => msg.messageType === 'email'
              )
              allEmailMessages.push(...emailMessages)
            }
          } catch (error) {
            console.error(`Error fetching messages for thread ${thread.id}:`, error)
          }
        }

        // Sort by date ascending (oldest first) - like a chat conversation
        allEmailMessages.sort((a, b) => {
          const dateA = new Date(a.createdAt)
          const dateB = new Date(b.createdAt)
          return dateA - dateB
        })

        setEmailTimelineMessages(allEmailMessages)
      }
    } catch (error) {
      console.error('Error fetching email timeline:', error)
      setEmailTimelineMessages([])
    } finally {
      setEmailTimelineLoading(false)
    }
  }, [])

  // Fetch email timeline when modal opens
  useEffect(() => {
    if (showEmailTimeline && emailTimelineLeadId) {
      fetchEmailTimeline(emailTimelineLeadId, emailTimelineSubject)
    }
  }, [showEmailTimeline, emailTimelineLeadId, emailTimelineSubject, fetchEmailTimeline])

  // Initial load for phone numbers and email accounts
  useEffect(() => {
    fetchPhoneNumbers()
    fetchEmailAccounts()
  }, [fetchPhoneNumbers, fetchEmailAccounts])

  // Handle search with debounce and initial load
  useEffect(() => {
    // Clear threads immediately when search value changes (before debounce)
    // This prevents showing stale threads while the new search is loading
    if (searchValue && searchValue.trim()) {
      setThreads([])
    }
    
    const timeoutId = setTimeout(() => {
      // Fetch threads with search query and team member filter (only use applied filter)
      fetchThreads(searchValue || '', appliedTeamMemberIds)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchValue, appliedTeamMemberIds, fetchThreads])
  
  // Fetch team members on mount
  useEffect(() => {
    const getMyTeam = async () => {
      try {
        let response = await getTeamsList()
        if (response) {
          const filterMembers = []
          if (response.admin) {
            filterMembers.push({
              id: response.admin.id,
              name: response.admin.name,
              email: response.admin.email,
            })
          }
          if (response.data && response.data.length > 0) {
            for (const t of response.data) {
              if (t.status == 'Accepted' && t.invitedUser) {
                filterMembers.push({
                  id: t.invitedUser.id,
                  name: t.invitedUser.name,
                  email: t.invitedUser.email,
                })
              }
            }
          }
          setFilterTeamMembers(filterMembers)
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
      }
    }
    getMyTeam()
  }, [])
  
  // Handler for team member filter selection
  const handleTeamMemberFilterToggle = (memberId) => {
    setSelectedTeamMemberIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })
  }
  
  // Handler to apply filter
  const handleApplyFilter = () => {
    const newAppliedIds = [...selectedTeamMemberIds]
    setAppliedTeamMemberIds(newAppliedIds) // Apply the selected filters
    setShowFilterModal(false)
    // Pass the IDs directly instead of relying on state
    fetchThreads(searchValue || '', newAppliedIds)
  }
  
  // Handler to clear filter
  const handleClearFilter = () => {
    setSelectedTeamMemberIds([])
    setAppliedTeamMemberIds([])
    setShowFilterModal(false)
    // Pass empty array directly instead of relying on state
    fetchThreads(searchValue || '', [])
  }
  
  // When opening the filter modal, sync selectedTeamMemberIds with appliedTeamMemberIds
  const handleOpenFilterModal = () => {
    setSelectedTeamMemberIds([...appliedTeamMemberIds])
    setShowFilterModal(true)
  }

  // Delete thread handler
  const handleDeleteThread = useCallback(async (leadId, threadId) => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      // Delete the thread (not the lead)
      const response = await axios.delete(
        `${Apis.deleteThread}/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        toast.success('Thread deleted successfully', {
          style: {
            width: 'fit-content',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
          },
        })
        // Refresh threads
        fetchThreads(searchValue, appliedTeamMemberIds)
        // Clear selected thread if it was deleted
        if (selectedThread?.id === threadId) {
          setSelectedThread(null)
          setMessages([])
        }
      } else {
        toast.error(response.data?.message || 'Failed to delete thread')
      }
    } catch (error) {
      console.error('Error deleting thread:', error)
      toast.error(error.response?.data?.message || 'Error deleting thread')
    }
  }, [searchValue, selectedThread, fetchThreads])

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
    <>
      <AgentSelectSnackMessage
        isVisible={snackbar.isVisible}
        title={snackbar.title}
        message={snackbar.message}
        type={snackbar.type}
        time={4000}
        hide={() => setSnackbar({ ...snackbar, isVisible: false })}
      />
      
      <div className="w-full h-screen flex flex-row bg-white">
        {/* Left Sidebar - Thread List */}
        <ThreadsList
          loading={loading}
          threads={threads}
          selectedThread={selectedThread}
          onSelectThread={handleThreadSelect}
          onNewMessage={() => setShowNewMessageModal(true)}
          getLeadName={getLeadName}
          getThreadDisplayName={getThreadDisplayName}
          getRecentMessageType={getRecentMessageType}
          formatUnreadCount={formatUnreadCount}
          onDeleteThread={handleDeleteThread}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleOpenFilterModal}
          selectedTeamMemberIdsCount={appliedTeamMemberIds.length}
        />

        {/* Right Side - Messages View */}
        <div className="flex-1 flex flex-col h-screen">
          {selectedThread ? (
            <>
              {/* Messages Header */}
              {/* <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    {selectedThread.lead?.firstName || selectedThread.lead?.name || 'Unknown Lead'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Click here for more info</p>
                </div>
              </div> */}

              {/* Messages Container */}
              <ConversationView
                selectedThread={selectedThread}
                messages={messages}
                messagesLoading={messagesLoading}
                loadingOlderMessages={loadingOlderMessages}
                messagesContainerRef={messagesContainerRef}
                messagesEndRef={messagesEndRef}
                messagesTopRef={messagesTopRef}
                sanitizeHTML={sanitizeHTML}
                getLeadName={getLeadName}
                getAgentAvatar={getAgentAvatar}
                getImageUrl={getImageUrl}
                setImageAttachments={setImageAttachments}
                setCurrentImageIndex={setCurrentImageIndex}
                setImageModalOpen={setImageModalOpen}
                setSnackbar={setSnackbar}
                SnackbarTypes={SnackbarTypes}
                openEmailDetailId={openEmailDetailId}
                setOpenEmailDetailId={setOpenEmailDetailId}
                getEmailDetails={getEmailDetails}
                setShowEmailTimeline={setShowEmailTimeline}
                setEmailTimelineLeadId={setEmailTimelineLeadId}
                setEmailTimelineSubject={setEmailTimelineSubject}
                onReplyClick={handleReplyClick}
                onOpenEmailTimeline={handleOpenEmailTimeline}
              />

              {/* Composer */}
              <MessageComposer
                composerMode={composerMode}
                setComposerMode={setComposerMode}
                selectedThread={selectedThread}
                composerData={composerData}
                setComposerData={setComposerData}
                fetchPhoneNumbers={fetchPhoneNumbers}
                fetchEmailAccounts={fetchEmailAccounts}
                showCC={showCC}
                setShowCC={setShowCC}
                showBCC={showBCC}
                setShowBCC={setShowBCC}
                ccEmails={ccEmails}
                ccInput={ccInput}
                handleCcInputChange={handleCcInputChange}
                handleCcInputKeyDown={handleCcInputKeyDown}
                handleCcInputPaste={handleCcInputPaste}
                removeCcEmail={removeCcEmail}
                bccEmails={bccEmails}
                bccInput={bccInput}
                handleBccInputChange={handleBccInputChange}
                handleBccInputKeyDown={handleBccInputKeyDown}
                handleBccInputPaste={handleBccInputPaste}
                removeBccEmail={removeBccEmail}
                phoneNumbers={phoneNumbers}
                selectedPhoneNumber={selectedPhoneNumber}
                setSelectedPhoneNumber={setSelectedPhoneNumber}
                emailAccounts={emailAccounts}
                selectedEmailAccount={selectedEmailAccount}
                setSelectedEmailAccount={setSelectedEmailAccount}
                removeAttachment={removeAttachment}
                richTextEditorRef={richTextEditorRef}
                SMS_CHAR_LIMIT={SMS_CHAR_LIMIT}
                handleFileChange={handleFileChange}
                handleSendMessage={handleSendMessage}
                sendingMessage={sendingMessage}
                onOpenAuthPopup={() => setShowAuthSelectionPopup(true)}
              />
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
              fetchThreads(searchValue || "", appliedTeamMemberIds)
            }, 1000)
          }
        }}
        mode="email"
      />

      {/* Image Viewer Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => {
                setImageModalOpen(false)
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
                onClick={() => {
                  setCurrentImageIndex(currentImageIndex - 1)
                }}
                className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Button */}
            {imageAttachments.length > 1 && currentImageIndex < imageAttachments.length - 1 && (
              <button
                onClick={() => {
                  setCurrentImageIndex(currentImageIndex + 1)
                }}
                className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Image or Loading Placeholder */}
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              {imageAttachments[currentImageIndex] && getImageUrl(imageAttachments[currentImageIndex], null) ? (
                <>
                  {(() => {
                    const imageUrl = getImageUrl(imageAttachments[currentImageIndex], null)
                    const isFromOurServer = isImageFromOurServer(imageUrl)
                    
                    // Use Next.js Image for images from our server (Gmail attachments)
                    if (isFromOurServer) {
                      return (
                        <Image
                          src={imageUrl}
                          alt={imageAttachments[currentImageIndex]?.fileName || 'Image'}
                          width={1920}
                          height={1080}
                          className="max-w-full max-h-[90vh] object-contain"
                          unoptimized
                        />
                      )
                    }
                    
                    // For external images, use Next.js Image with unoptimized prop
                    return (
                      <Image
                        src={imageUrl}
                        alt={imageAttachments[currentImageIndex]?.fileName || 'Image'}
                        width={1920}
                        height={1080}
                        className="max-w-full max-h-[90vh] object-contain"
                        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                        unoptimized
                      />
                    )
                  })()}
                  
                  {/* Image Info & Download */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-4">
                    <span className="text-sm">
                      {imageAttachments[currentImageIndex]?.fileName || imageAttachments[currentImageIndex]?.originalName || 'Image'} 
                      {imageAttachments.length > 1 && ` (${currentImageIndex + 1} / ${imageAttachments.length})`}
                    </span>
                    <button
                      onClick={() => {
                        const attachment = imageAttachments[currentImageIndex]
                        const imageUrl = getImageUrl(attachment, null)
                        if (imageUrl) {
                          const a = document.createElement('a')
                          a.href = imageUrl
                          a.download = attachment.fileName || attachment.originalName || 'image'
                          a.target = '_blank'
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                        }
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

      {/* Email Timeline Modal */}
      <EmailTimelineModal
        open={showEmailTimeline}
        onClose={() => {
          setShowEmailTimeline(false)
          setEmailTimelineLeadId(null)
          // Keep emailTimelineSubject and emailTimelineMessages so we can use them for threading
          // when sending from the main composer. They'll be cleared when a new thread is selected.
          // setEmailTimelineSubject(null)
          // setEmailTimelineMessages([])
          setReplyToMessage(null)
        }}
        leadId={emailTimelineLeadId}
        subject={emailTimelineSubject}
        messages={emailTimelineMessages}
        loading={emailTimelineLoading}
        selectedThread={selectedThread}
        emailAccounts={emailAccounts}
        selectedEmailAccount={selectedEmailAccount}
        setSelectedEmailAccount={setSelectedEmailAccount}
        onSendSuccess={async () => {
          if (emailTimelineLeadId && emailTimelineSubject) {
            await fetchEmailTimeline(emailTimelineLeadId, emailTimelineSubject)
          }
        }}
        fetchThreads={fetchThreads}
        onOpenAuthPopup={() => setShowAuthSelectionPopup(true)}
        replyToMessage={replyToMessage}
      />

      {/* Auth Selection Popup for Gmail Connection */}
      <AuthSelectionPopup
        open={showAuthSelectionPopup}
        onClose={() => setShowAuthSelectionPopup(false)}
        onSuccess={() => {
          setShowAuthSelectionPopup(false)
          fetchEmailAccounts()
        }}
        setShowEmailTempPopup={() => {}}
        showEmailTempPopup={false}
        setSelectedGoogleAccount={() => {}}
      />

      {/* Filter Modal for Team Members */}
      <Modal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 max-h-[70vh] rounded-[13px]"
          sx={{
            height: 'auto',
            bgcolor: 'transparent',
            p: 0,
            mx: 'auto',
            my: '50vh',
            transform: 'translateY(-55%)',
            borderRadius: '13px',
            border: 'none',
            outline: 'none',
            overflow: 'hidden',
          }}
        >
          <div className="flex flex-col w-full">
            <div
              className="w-full rounded-[13px] overflow-hidden"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                paddingInline: 30,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row items-center justify-between mb-4">
                <div style={{ fontWeight: '700', fontSize: 22 }}>
                  Filter
                </div>
                <CloseBtn onClick={() => setShowFilterModal(false)} />
              </div>
              
              <div
                className="mt-4"
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #00000020',
                  borderRadius: '13px',
                  padding: '10px',
                }}
              >
                {filterTeamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No team members available
                  </div>
                ) : (
                  filterTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-row items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleTeamMemberFilterToggle(member.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeamMemberIds.includes(member.id)}
                        onChange={() => handleTeamMemberFilterToggle(member.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-gray-900">
                          {member.name}
                        </span>
                        {member.email && (
                          <span className="text-sm text-gray-500">
                            {member.email}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="w-full mt-4">
                <button
                  onClick={handleApplyFilter}
                  className="bg-purple h-[50px] rounded-xl text-white w-full"
                  style={{
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
    </>
  )
}

export default Messages
