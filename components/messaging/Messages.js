'use client'

import { ChevronLeft, ChevronRight, X, Download, Paperclip } from 'lucide-react'
import axios from 'axios'
import DOMPurify from 'dompurify'
import moment from 'moment'
import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

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
import { toast } from '@/utils/toast'
import voicesList from '@/components/createagent/Voices'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import AuthSelectionPopup from '@/components/pipeline/AuthSelectionPopup'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import { useUser } from '@/hooks/redux-hooks'
import UnlockMessagesView from './UnlockMessagesView'
import MessageHeader from './MessageHeader'
import ConversationHeader from './ConversationHeader'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import MessageSettingsModal from './MessageSettingsModal'
import DraftCards from './DraftCards'

const Messages = ({ selectedUser = null, agencyUser = null}) => {
  const searchParams = useSearchParams()
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [composerMode, setComposerMode] = useState('sms') // 'sms' or 'email'
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [composerData, setComposerData] = useState({
    to: '',
    subject: '',
    smsBody: '',
    emailBody: '',
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
  const latestMessageIdRef = useRef(null)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [newMessageMode, setNewMessageMode] = useState('sms')
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
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)
  const [showMessageSettingsModal, setShowMessageSettingsModal] = useState(false)

  // Draft state for AI-generated responses
  const [drafts, setDrafts] = useState([])
  const [draftsLoading, setDraftsLoading] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState(null)
  const [lastInboundMessageId, setLastInboundMessageId] = useState(null)

  // Debug: Log when modal state changes
  useEffect(() => {}, [showUpgradePlanModal])

  // Filter state
  const [filterType, setFilterType] = useState('all') // 'all' or 'unreplied'
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([]) // Temporary selection in modal
  const [appliedTeamMemberIds, setAppliedTeamMemberIds] = useState([]) // Actually applied filter
  const [filterTeamMembers, setFilterTeamMembers] = useState([])
  const [showFilterPopover, setShowFilterPopover] = useState(false)
  const hasActiveFilters =
    filterTeamMembers.length > 0 &&
    appliedTeamMemberIds.length > 0 &&
    appliedTeamMemberIds.length < filterTeamMembers.length


  const { user: reduxUser, setUser: setReduxUser, planCapabilities } = useUser()
  // Check if user has access to messaging features
  const hasMessagingAccess = reduxUser?.planCapabilities?.allowEmails === true || reduxUser?.planCapabilities?.allowTextMessages === true

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

      // Get CC/BCC from multiple sources
      let ccValue = ''
      if (message.ccEmails && Array.isArray(message.ccEmails) && message.ccEmails.length > 0) {
        ccValue = message.ccEmails.join(', ')
      } else {
        ccValue = ensureString(message.metadata?.cc || message.cc || getHeader('cc'))
      }

      let bccValue = ''
      if (message.bccEmails && Array.isArray(message.bccEmails) && message.bccEmails.length > 0) {
        bccValue = message.bccEmails.join(', ')
      } else {
        bccValue = ensureString(message.metadata?.bcc || message.bcc || getHeader('bcc'))
      }

      return {
        from: fromEmail || 'Unknown sender',
        to: toEmail || 'Unknown recipient',
        cc: ccValue,
        bcc: bccValue,
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
    const requestId = ++threadsRequestIdRef.current
    const isSearch = searchQuery && searchQuery.trim()
    try {
      setLoading(true)
      // Set searchLoading if this is a search operation
      if (isSearch) {
        setSearchLoading(true)
      }
      // Clear threads immediately when starting a new fetch to prevent showing stale data
      // Only clear if there's a search query (to avoid flicker on initial load)
      if (isSearch) {
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
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        params.userId = selectedUser.id
      }

      const response = await axios.get('/api/messaging/threads', {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      // Ignore responses for stale requests so older calls can't overwrite newer results
      if (requestId !== threadsRequestIdRef.current) {
        return
      }

      if (response.data?.status && Array.isArray(response.data?.data)) {
        // Sort by lastMessageAt descending
        const sortedThreads = response.data.data.sort((a, b) => {
          const dateA = new Date(a.lastMessageAt || a.createdAt)
          const dateB = new Date(b.lastMessageAt || b.createdAt)
          return dateB - dateA
        })

        // Store all threads (for filtering)
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
        // Clear searchLoading if this was a search operation
        if (isSearch) {
          setSearchLoading(false)
        }
      }
    }
  }, [selectedUser])

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
          const params = {
            limit: 500, // Fetch a large batch to ensure we get recent messages
            offset: 0,
          }
          // Add userId if viewing subaccount from admin/agency
          if (selectedUser?.id) {
            params.userId = selectedUser.id
          }

          const response = await axios.get(
            `${Apis.getMessagesForThread}/${threadId}/messages`,
            {
              params,
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
              if (msg.metadata?.attachments && msg.metadata.attachments.length > 0) {} else if (msg.metadata && !msg.metadata.attachments) {}
            })

            // Set messages (newest at bottom)
            setMessages(fetchedMessages)

            // Update latest message ID ref
            if (fetchedMessages.length > 0) {
              latestMessageIdRef.current = fetchedMessages[fetchedMessages.length - 1]?.id || null
            }

            // Check if there are more older messages
            // If we got exactly 500, there might be more. If less, we got all messages.
            setHasMoreMessages(allMessages.length >= 500)
            setMessageOffset(oldestMessageOffset)

            // Scroll to bottom instantly after DOM update (no visible animation)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
                }
              })
            })

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

        const params = {
          limit: MESSAGES_PER_PAGE,
          offset: actualOffset,
        }
        // Add userId if viewing subaccount from admin/agency
        if (selectedUser?.id) {
          params.userId = selectedUser.id
        }

        const response = await axios.get(
          `${Apis.getMessagesForThread}/${threadId}/messages`,
          {
            params,
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
            if (msg.metadata?.attachments && msg.metadata.attachments.length > 0) {} else if (msg.metadata && !msg.metadata.attachments) {}
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

            // Update latest message ID ref
            if (fetchedMessages.length > 0) {
              latestMessageIdRef.current = fetchedMessages[fetchedMessages.length - 1]?.id || null
            }

            // Scroll to bottom instantly after DOM update (no visible animation)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
                }
              })
            })

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
    [selectedUser]
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

      let apiPath = `${Apis.markThreadAsRead}/${threadId}/read`
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        apiPath = `${apiPath}?userId=${selectedUser.id}`
      }

      await axios.patch(apiPath, {}, {
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
  }, [selectedUser])

  // Fetch pending drafts for the last inbound message in a thread
  const fetchDrafts = useCallback(async (threadId, messageId = null) => {
    if (!threadId) return

    // If no messageId provided, don't fetch (will be called once we know the last inbound message)
    if (!messageId) {
      setDrafts([])
      return
    }

    try {
      setDraftsLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const params = { threadId, messageId }
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        params.userId = selectedUser.id
      }

      const response = await axios.get(Apis.getDraftsForThread, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        // Filter for pending drafts only
        const pendingDrafts = response.data.data.filter(d => d.status === 'pending')
        setDrafts(pendingDrafts)
      } else {
        setDrafts([])
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
      setDrafts([])
    } finally {
      setDraftsLoading(false)
    }
  }, [selectedUser])

  // Select a draft and populate the composer
  const handleSelectDraft = useCallback((draft) => {
    if (!draft) return

    setSelectedDraft(draft)

    // Set composer mode based on draft type
    setComposerMode(draft.messageType || 'sms')

    // Populate composer with draft content
    if (draft.messageType === 'email') {
      setComposerData(prev => ({
        ...prev,
        emailBody: draft.content || '',
        subject: draft.subject || prev.subject,
      }))
    } else {
      setComposerData(prev => ({
        ...prev,
        smsBody: draft.content || '',
      }))
    }
  }, [])

  // Discard a draft
  const handleDiscardDraft = useCallback(async (draftId) => {
    if (!draftId) return

    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      let apiPath = `${Apis.discardDraft}/${draftId}`
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        apiPath = `${apiPath}?userId=${selectedUser.id}`
      }

      const response = await axios.delete(apiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status) {
        // Remove the discarded draft from state
        setDrafts(prev => prev.filter(d => d.id !== draftId))
        // Clear selected draft if it was the one being discarded
        if (selectedDraft?.id === draftId) {
          setSelectedDraft(null)
        }
        toast.success('Draft discarded')
      } else {
        toast.error(response.data?.message || 'Failed to discard draft')
      }
    } catch (error) {
      console.error('Error discarding draft:', error)
      toast.error(error.response?.data?.message || 'Error discarding draft')
    }
  }, [selectedUser, selectedDraft])

  // Update latest message ID ref when messages change
  useEffect(() => {
    if (messages.length > 0) {
      latestMessageIdRef.current = messages[messages.length - 1]?.id || null
    } else {
      latestMessageIdRef.current = null
    }
  }, [messages])

  // Track last inbound message and fetch drafts only if last message is inbound
  useEffect(() => {
    if (!selectedThread?.id || messages.length === 0) {
      setDrafts([])
      setLastInboundMessageId(null)
      setSelectedDraft(null)
      return
    }

    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // Only show drafts if the last message is inbound (from the lead)
    if (lastMessage && lastMessage.direction === 'inbound') {
      setLastInboundMessageId(lastMessage.id)
      // Fetch drafts for this specific inbound message
      fetchDrafts(selectedThread.id, lastMessage.id)
    } else {
      // Last message is outbound, clear drafts
      setDrafts([])
      setLastInboundMessageId(null)
      setSelectedDraft(null)
    }
  }, [messages, selectedThread?.id, fetchDrafts])

  // Poll for new messages every 5 seconds when a thread is selected
  useEffect(() => {
    if (!selectedThread?.id) {
      latestMessageIdRef.current = null
      return
    }

    const pollForNewMessages = async () => {
      try {
        const localData = localStorage.getItem('User')
        if (!localData) return

        const userData = JSON.parse(localData)
        const token = userData.token

        // Get the most recent message ID we currently have from ref
        const currentLatestMessageId = latestMessageIdRef.current

        // Only poll if we have messages loaded (initial load will set the ref)
        if (!currentLatestMessageId) {
          // Wait for initial load to complete
          return
        }

        // Fetch the latest messages (just the most recent ones to check for new messages)
        // Fetch a larger batch to ensure we get the most recent messages, then take the last ones
        const params = {
          limit: 50, // Fetch a larger batch to ensure we get recent messages
          offset: 0,
        }
        // Add userId if viewing subaccount from admin/agency
        if (selectedUser?.id) {
          params.userId = selectedUser.id
        }

        const response = await axios.get(
          `${Apis.getMessagesForThread}/${selectedThread.id}/messages`,
          {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status && response.data?.data) {
          const allFetchedMessages = response.data.data

          // Messages are returned in ascending order (oldest first), so get the last ones
          // Take the last 10 messages to check for new ones
          const latestMessages = allFetchedMessages.slice(-10)

          // Get the most recent message from the fetched batch
          const serverLatestMessage = allFetchedMessages.length > 0
            ? allFetchedMessages[allFetchedMessages.length - 1]
            : null

          // Check if there are new messages (messages with IDs greater than our latest)
          if (currentLatestMessageId && serverLatestMessage) {
            if (serverLatestMessage.id > currentLatestMessageId) {
              // Get all messages with IDs greater than our latest from the entire fetched batch
              const newMessages = allFetchedMessages.filter(
                (msg) => msg.id > currentLatestMessageId
              )

              if (newMessages.length > 0) {
                // Append new messages to the current messages
                setMessages((prevMessages) => {
                  // Avoid duplicates
                  const existingIds = new Set(prevMessages.map((m) => m.id))
                  const uniqueNewMessages = newMessages.filter(
                    (m) => !existingIds.has(m.id)
                  )

                  if (uniqueNewMessages.length > 0) {
                    // Sort by ID to maintain order
                    const allMessages = [...prevMessages, ...uniqueNewMessages].sort(
                      (a, b) => a.id - b.id
                    )

                    // Update the ref with the new latest message ID
                    latestMessageIdRef.current = allMessages[allMessages.length - 1]?.id || null

                    // Scroll to bottom when new messages arrive
                    setTimeout(() => {
                      if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop =
                          messagesContainerRef.current.scrollHeight
                      }
                    }, 100)

                    return allMessages
                  }

                  return prevMessages
                })

                // Update thread unread count if needed
                setThreads((prevThreads) =>
                  prevThreads.map((t) =>
                    t.id === selectedThread.id
                      ? { ...t, unreadCount: (t.unreadCount || 0) + newMessages.length }
                      : t
                  )
                )
              } else {}
            } else {}
          } else if (!currentLatestMessageId && allFetchedMessages.length > 0) {
            // If we don't have any messages yet, but there are messages, fetch them
            // This handles the case where messages arrive before initial load completes
            fetchMessages(selectedThread.id, null, false)
          }
        }
      } catch (error) {
        console.error('Error polling for new messages:', error)
        // Don't show error to user, just log it
      }
    }

    // Poll for new drafts (only if there's a last inbound message)
    const pollForDrafts = async () => {
      // Only poll if we have a last inbound message ID
      if (!lastInboundMessageId) return

      try {
        const localData = localStorage.getItem('User')
        if (!localData) return

        const userData = JSON.parse(localData)
        const token = userData.token

        const params = { threadId: selectedThread.id, messageId: lastInboundMessageId }
        if (selectedUser?.id) {
          params.userId = selectedUser.id
        }

        const response = await axios.get(Apis.getDraftsForThread, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.data?.status && response.data?.data) {
          const pendingDrafts = response.data.data.filter(d => d.status === 'pending')
          setDrafts(pendingDrafts)
        }
      } catch (error) {
        // Silently fail for draft polling
      }
    }

    pollForNewMessages()
    pollForDrafts()
    const intervalId = setInterval(() => {
      pollForNewMessages()
      pollForDrafts()
    }, 5000)

    // Cleanup interval when thread changes or component unmounts
    return () => {
      clearInterval(intervalId)
    };
  }, [selectedThread?.id, fetchMessages, selectedUser, lastInboundMessageId])

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

    // Clear draft state when switching threads (will be refetched when messages load)
    setDrafts([])
    setSelectedDraft(null)
    setLastInboundMessageId(null)

    // Clear email timeline state when switching threads
    setEmailTimelineSubject(null)
    setEmailTimelineMessages([])
    setEmailTimelineLeadId(null)
    setReplyToMessage(null)

    // Set composer data based on current mode
    const receiverEmail = thread.lead?.email// || thread.receiverEmail || ''
    const receiverPhone = thread.receiverPhoneNumber || thread.lead?.phone || ''

    // Pre-populate CC/BCC from thread if available
    // Handle both array format and JSON string format
    let threadCcEmails = []
    let threadBccEmails = []

    if (thread.ccEmails) {
      if (Array.isArray(thread.ccEmails)) {
        threadCcEmails = thread.ccEmails
      } else if (typeof thread.ccEmails === 'string') {
        try {
          threadCcEmails = JSON.parse(thread.ccEmails)
        } catch (e) {
          console.warn('Failed to parse thread.ccEmails:', e)
          threadCcEmails = []
        }
      }
    }

    if (thread.bccEmails) {
      if (Array.isArray(thread.bccEmails)) {
        threadBccEmails = thread.bccEmails
      } else if (typeof thread.bccEmails === 'string') {
        try {
          threadBccEmails = JSON.parse(thread.bccEmails)
        } catch (e) {
          console.warn('Failed to parse thread.bccEmails:', e)
          threadBccEmails = []
        }
      }
    }

    setCcEmails(threadCcEmails)
    setBccEmails(threadBccEmails)
    setCcInput('')
    setBccInput('')

    setComposerData((prev) => ({
      ...prev,
      to: composerMode === 'email' ? receiverEmail : receiverPhone,
      subject: '',
      // Don't clear bodies when switching threads - preserve them
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
    // Check if input contains comma (likely pasted multiple emails or typed with comma)
    if (value.includes(',')) {
      const emails = value.split(',').map(email => email.trim()).filter(email => email)
      emails.forEach(email => {
        if (isValidEmail(email) && !ccEmails.includes(email)) {
          setCcEmails(prev => [...prev, email])
        }
      })
      setCcInput('')
    } else {
      setCcInput(value)
    }
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
    } else if (e.key === 'Backspace' && !ccInput && ccEmails.length > 0) {
      // Remove last email if backspace pressed on empty input
      setCcEmails(ccEmails.slice(0, -1))
    }
  }

  const handleCcInputBlur = () => {
    if (ccInput.trim()) {
      const email = ccInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && isValidEmail(email) && !ccEmails.includes(email)) {
        setCcEmails([...ccEmails, email])
      }
      setCcInput('')
    }
  }

  const removeCcEmail = (emailToRemove) => {
    setCcEmails(ccEmails.filter((email) => email !== emailToRemove))
  }

  // Handle BCC email input
  const handleBccInputChange = (e) => {
    const value = e.target.value
    // Check if input contains comma (likely pasted multiple emails or typed with comma)
    if (value.includes(',')) {
      const emails = value.split(',').map(email => email.trim()).filter(email => email)
      emails.forEach(email => {
        if (isValidEmail(email) && !bccEmails.includes(email)) {
          setBccEmails(prev => [...prev, email])
        }
      })
      setBccInput('')
    } else {
      setBccInput(value)
    }
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
    } else if (e.key === 'Backspace' && !bccInput && bccEmails.length > 0) {
      // Remove last email if backspace pressed on empty input
      setBccEmails(bccEmails.slice(0, -1))
    }
  }

  const handleBccInputBlur = () => {
    if (bccInput.trim()) {
      const email = bccInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && isValidEmail(email) && !bccEmails.includes(email)) {
        setBccEmails([...bccEmails, email])
      }
      setBccInput('')
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

    // Preserve <br> tags by converting them to newlines before processing
    // This way they survive the textContent extraction
    let text = content.replace(/<br\s*\/?>/gi, '\n')

    // Extract plain text from HTML if needed for pattern matching
    if (typeof document !== 'undefined' && text.includes('<')) {
      try {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = text
        text = tempDiv.textContent || tempDiv.innerText || text
      } catch (e) {
        // If HTML parsing fails, use original content
        text = text
      }
    }

    // Note: We'll convert newlines back to <br> in sanitizeHTML, so we keep them as \n here

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

    // Ensure <br> tags are preserved and newlines are converted to <br> if needed
    let processedContent = cleanedContent || ''

    // Normalize line endings first (handle \r\n, \r, and \n)
    processedContent = processedContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // If content doesn't have HTML tags but has newlines, convert them to <br>
    if (!/<[^>]+>/.test(processedContent) && processedContent.includes('\n')) {
      processedContent = processedContent.replace(/\n/g, '<br>')
    } else if (processedContent.includes('\n')) {
      // If it has HTML tags but also has newlines, convert newlines to <br>
      // But preserve existing <br> tags
      processedContent = processedContent.replace(/\n/g, '<br>')
    }

    // Also handle HTML divs that represent line breaks
    // Gmail/Outlook often use <div> tags for each line
    // Pattern: <div>text</div> should become text<br>
    // But be careful not to break nested structures

    // First, handle the common Gmail pattern: <div dir="ltr">Line 1<div>Line 2</div><div>Line 3</div></div>
    // This should become: Line 1<br>Line 2<br>Line 3

    // Step 1: Convert simple divs with just text (no nested tags) - but only if they're direct children
    // Match: <div>text</div> where text doesn't contain tags
    processedContent = processedContent.replace(/<div[^>]*>([^<]+)<\/div>/gi, '$1<br>')

    // Step 2: Handle closing div followed by opening div (represents line break between divs)
    processedContent = processedContent.replace(/<\/div>\s*<div[^>]*>/gi, '<br>')

    // Step 3: Clean up empty divs
    processedContent = processedContent.replace(/<div[^>]*><\/div>/gi, '')

    // Step 4: Handle nested divs - convert outer div structure to preserve inner content
    // Pattern: <div><div>text</div></div> should become text<br>
    processedContent = processedContent.replace(/<div[^>]*><div[^>]*>([^<>]+)<\/div><\/div>/gi, '$1<br>')

    // Step 5: Remove any remaining div tags that might have attributes but no content
    processedContent = processedContent.replace(/<div[^>]*><\/div>/gi, '')

    // Step 6: Remove trailing <br> if at end (but keep if it's meaningful)
    processedContent = processedContent.replace(/<br>\s*$/gi, '')

    // Step 7: Also handle any remaining newlines that weren't converted (fallback for content that wasn't processed by backend)
    processedContent = processedContent.replace(/\n/g, '<br>')

    // Step 8: Clean up multiple consecutive <br> tags (more than 2) to max 2
    processedContent = processedContent.replace(/(<br>\s*){3,}/gi, '<br><br>')

    return DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'h2', 'h3', 'h4', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      KEEP_CONTENT: true,
    })
  }

  // Helper function to normalize email subject for threading
  const normalizeSubject = (subject) => {
    if (!subject) return ''
    // Normalize subject by removing "Re:", "Fwd:", etc. for threading
    return subject
      .replace(/^(re|fwd|fw|aw):\s*/i, '')
      .replace(/^\[.*?\]\s*/, '')
      .trim();
  }

  // Update composer fields (subject, CC, BCC) from a message
  const updateComposerFromMessage = (message) => {
    if (!message || message.messageType !== 'email') return

    // Extract and normalize subject
    if (message.subject) {
      const normalizedSubject = normalizeSubject(message.subject)
      setComposerData((prev) => ({ ...prev, subject: normalizedSubject }))
    }

    // Extract CC emails
    let ccEmailsArray = []
    if (message.ccEmails && Array.isArray(message.ccEmails) && message.ccEmails.length > 0) {
      ccEmailsArray = message.ccEmails
    } else if (message.metadata?.cc) {
      // Try to parse from metadata if it's a string
      if (typeof message.metadata.cc === 'string') {
        ccEmailsArray = message.metadata.cc.split(',').map(e => e.trim()).filter(e => e)
      } else if (Array.isArray(message.metadata.cc)) {
        ccEmailsArray = message.metadata.cc
      }
    }

    // Extract BCC emails
    let bccEmailsArray = []
    if (message.bccEmails && Array.isArray(message.bccEmails) && message.bccEmails.length > 0) {
      bccEmailsArray = message.bccEmails
    } else if (message.metadata?.bcc) {
      // Try to parse from metadata if it's a string
      if (typeof message.metadata.bcc === 'string') {
        bccEmailsArray = message.metadata.bcc.split(',').map(e => e.trim()).filter(e => e)
      } else if (Array.isArray(message.metadata.bcc)) {
        bccEmailsArray = message.metadata.bcc
      }
    }

    // Update CC/BCC state
    if (ccEmailsArray.length > 0) {
      setCcEmails(ccEmailsArray)
    }
    if (bccEmailsArray.length > 0) {
      setBccEmails(bccEmailsArray)
    }
  }

  // Handle reply click
  const handleReplyClick = (message) => {
    if (!message || !selectedThread?.lead?.id) return

    // Set the message to reply to
    setReplyToMessage(message)

    // Update composer fields from this message
    updateComposerFromMessage(message)

    // Open EmailTimelineModal with reply mode
    setShowEmailTimeline(true)
    setEmailTimelineLeadId(selectedThread.lead.id)

    // Set subject for threading (normalize it)
    if (message.subject) {
      const normalizedSubject = normalizeSubject(message.subject)
      setEmailTimelineSubject(normalizedSubject)
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
    // Priority 1: Team member sender (if message was sent by a team member)
    if (message.senderUser) {
      // Try team member profile image first
      if (message.senderUser.thumb_profile_image) {
        return (
          <div
            className="flex items-center justify-center"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'white',
              overflow: 'hidden',
            }}
          >
            <img
              src={message.senderUser.thumb_profile_image}
              alt={message.senderUser.name || 'Team Member'}
              className="rounded-full"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                console.error('❌ [getAgentAvatar] Failed to load profile image:', message.senderUser.thumb_profile_image, e)
              }}
              onLoad={() => {}}
            />
          </div>
        );
      }

      // Fallback to team member name initial
      const teamMemberName = message.senderUser.name || message.senderUser.email || 'T'
      const teamMemberLetter = teamMemberName.charAt(0).toUpperCase()
      return (
        <div className="w-[26px] h-[26px] rounded-full bg-white flex items-center justify-center text-brand-primary font-semibold text-xs border-2 border-brand-primary">
          {teamMemberLetter}
        </div>
      )
    }

    // Priority 2: Agent image or bitmoji
    if (message.agent) {
      // Try agent image first
      if (message.agent.thumb_profile_image) {
        return (
          <Image
            src={message.agent.thumb_profile_image}
            alt="Agent"
            width={26}
            height={26}
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
              width={26}
              height={26}
              className="rounded-full"
              style={{ objectFit: 'cover' }}
            />
          )
        }
      }
    }

    // Priority 3: User profile image
    if (userData?.user?.thumb_profile_image) {
      return (
        <Image
          src={userData.user.thumb_profile_image}
          alt="User"
          width={26}
          height={26}
          className="rounded-full"
          style={{ objectFit: 'cover' }}
        />
      )
    }

    // Priority 4: User profile letter
    const userName = userData?.user?.name || userData?.user?.firstName || 'U'
    const userLetter = userName.charAt(0).toUpperCase()
    return (
      <div className="w-[26px] h-[26px] rounded-full bg-white flex items-center justify-center text-brand-primary font-semibold text-xs border-2 border-brand-primary">
        {userLetter}
      </div>
    )
  }

  // Handle send message
  const handleSendMessage = async () => {
    // Get the appropriate message body based on mode
    const messageBody = composerMode === 'sms' ? composerData.smsBody : composerData.emailBody

    if (!selectedThread || !messageBody.trim()) return
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
        const smsPayload = {
          leadId: selectedThread.leadId,
          content: messageBody,
          smsPhoneNumberId: selectedPhoneNumber || null,
        }
        // Add userId if viewing subaccount from admin/agency
        if (selectedUser?.id) {
          smsPayload.userId = selectedUser.id
        }

        const response = await axios.post(
          Apis.sendSMSToLead,
          smsPayload,
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
          // Reset composer - only clear the SMS body
          setComposerData((prev) => ({
            ...prev,
            to: selectedThread.lead?.email || selectedThread.receiverPhoneNumber || '',
            smsBody: '',
            cc: '',
            bcc: '',
            attachments: [],
          }))

          // If a draft was selected, mark it as sent and clear drafts
          if (selectedDraft) {
            try {
              let apiPath = `${Apis.sendDraft}/${selectedDraft.id}/send`
              if (selectedUser?.id) {
                apiPath = `${apiPath}?userId=${selectedUser.id}`
              }
              await axios.post(apiPath, {}, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              })
            } catch (e) {
              // Silently fail marking draft as sent
            }
          }
          // Clear drafts after sending
          setDrafts([])
          setSelectedDraft(null)

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

              let params = {
                leadId: selectedThread.leadId,
                subject: emailTimelineSubject,
              }
              // Add userId if viewing subaccount from admin/agency
              if (selectedUser?.id) {
                params.userId = selectedUser.id
              }

              const response = await axios.get(Apis.getEmailsBySubject, {
                params,
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              })

              if (response.data?.status && response.data?.data) {
                emailMessages = response.data.data
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
          } else if (emailMessages.length > 0) {
            // Fallback: use the most recent email even if subject doesn't match exactly
            // This can happen if subjects have slight variations
            const mostRecentEmail = emailMessages[emailMessages.length - 1]
            replyToMessageId = mostRecentEmail.id
          }
        }

        // If still no subject, use a default
        if (!emailSubject || emailSubject.trim() === '') {
          emailSubject = 'No Subject'
        }

        const formData = new FormData()
        formData.append('leadId', selectedThread.leadId)
        formData.append('subject', emailSubject)
        formData.append('body', messageBody)

        // Add userId if viewing subaccount from admin/agency
        if (selectedUser?.id) {
          formData.append('userId', selectedUser.id.toString())
        }

        // Add threadId for CC/BCC persistence
        if (selectedThread?.id) {
          formData.append('threadId', selectedThread.id.toString())
        }

        // Add replyToMessageId if we found one (for proper Gmail threading)
        if (replyToMessageId) {
          formData.append('replyToMessageId', replyToMessageId.toString())
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
          // Reset composer - only clear the email body
          setComposerData((prev) => ({
            ...prev,
            to: selectedThread.lead?.email || selectedThread.receiverEmail || '',
            subject: preservedSubject,
            emailBody: '',
            cc: '',
            bcc: '',
            attachments: [],
          }))
          // Clear CC/BCC arrays and inputs
          setCcEmails([])
          setBccEmails([])
          setCcInput('')
          setBccInput('')
          // Clear CC/BCC visibility
          setShowCC(false)
          setShowBCC(false)

          // If a draft was selected, mark it as sent and clear drafts
          if (selectedDraft) {
            try {
              let apiPath = `${Apis.sendDraft}/${selectedDraft.id}/send`
              if (selectedUser?.id) {
                apiPath = `${apiPath}?userId=${selectedUser.id}`
              }
              await axios.post(apiPath, {}, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              })
            } catch (e) {
              // Silently fail marking draft as sent
            }
          }
          // Clear drafts after sending
          setDrafts([])
          setSelectedDraft(null)

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

      let apiPath = Apis.a2pNumbers
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        apiPath = `${apiPath}?userId=${selectedUser.id}`
      }

      const response = await axios.get(apiPath, {
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
  }, [selectedUser])

  // Fetch email accounts
  const fetchEmailAccounts = useCallback(async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      let apiPath = Apis.gmailAccount
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        apiPath = `${apiPath}?userId=${selectedUser.id}`
      }

      const response = await axios.get(apiPath, {
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
  }, [selectedUser])

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
        const receiverEmail = selectedThread.lead?.email || selectedThread.receiverEmail || ''
        setComposerData((prev) => ({ ...prev, to: receiverEmail }))
      }
    }
  }, [selectedThread, composerMode])

  // Auto-select thread when threads are loaded (prioritize threadId from query params)
  useEffect(() => {
    if (!selectedThread && threads.length > 0) {
      // Check if threadId is provided in query params (from notification click)
      const threadIdFromParams = searchParams?.get('threadId')
      const messageIdFromParams = searchParams?.get('messageId')
      
      let threadToSelect = null
      
      if (threadIdFromParams) {
        // Find the thread matching the threadId from query params
        threadToSelect = threads.find(
          (t) => t.id.toString() === threadIdFromParams.toString()
        )
      }
      
      // Fallback to first thread if no match found or no query param
      if (!threadToSelect) {
        threadToSelect = threads[0]
      }
      
      if (threadToSelect) {
        setSelectedThread(threadToSelect)
        setMessageOffset(0)
        setHasMoreMessages(true)
        setMessages([])
        fetchMessages(threadToSelect.id, null, false)
        // Drafts will be fetched automatically by the messages effect when messages load
        if (threadToSelect.unreadCount > 0) {
          markThreadAsRead(threadToSelect.id)
        }
      }
    }
  }, [threads, selectedThread, fetchMessages, markThreadAsRead, searchParams])

  // Scroll to specific message when messages are loaded and messageId is in query params
  useEffect(() => {
    const messageIdFromParams = searchParams?.get('messageId')
    if (messageIdFromParams && messages.length > 0 && !messagesLoading) {
      // Wait a bit for DOM to render, then scroll to message
      const scrollTimer = setTimeout(() => {
        const messageElement = document.querySelector(
          `[data-message-id="${messageIdFromParams}"]`
        )
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Highlight the message briefly
          messageElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
          setTimeout(() => {
            messageElement.style.backgroundColor = ''
          }, 2000)
        }
      }, 500)
      
      return () => clearTimeout(scrollTimer)
    }
  }, [messages, messagesLoading, searchParams])

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
          const params = {
            leadId: leadId,
            subject: subject,
          }
          // Add userId if viewing subaccount from admin/agency
          if (selectedUser?.id) {
            params.userId = selectedUser.id
          }

          const response = await axios.get(Apis.getEmailsBySubject, {
            params,
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
      const threadsParams = {}
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        threadsParams.userId = selectedUser.id
      }

      const threadsResponse = await axios.get('/api/messaging/threads', {
        params: threadsParams,
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
  }, [selectedUser])

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
      setSearchLoading(true) // Set search loading immediately when search starts
    } else {
      setSearchLoading(false) // Clear search loading when search is cleared
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

  // Handler for team member filter selection (single-select + "All")
  const handleTeamMemberFilterSelect = (memberId = null) => {
    if (memberId === null) {
      setSelectedTeamMemberIds([])
    } else {
      setSelectedTeamMemberIds([memberId])
    }
  }

  // Handler to apply filter
  const handleApplyFilter = () => {
    const newAppliedIds = [...selectedTeamMemberIds]
    setAppliedTeamMemberIds(newAppliedIds) // Apply the selected filters
    setShowFilterPopover(false)
    // Pass the IDs directly instead of relying on state
    fetchThreads(searchValue || '', newAppliedIds)
  }

  // Handler to clear filter
  const handleClearFilter = () => {
    setSelectedTeamMemberIds([])
    setAppliedTeamMemberIds([])
    setShowFilterPopover(false)
    // Pass empty array directly instead of relying on state
    fetchThreads(searchValue || '', [])
  }

  // When opening the filter modal, sync selectedTeamMemberIds with appliedTeamMemberIds
  // Delete thread handler
  const handleDeleteThread = useCallback(async (leadId, threadId) => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      // Delete the thread (not the lead)

      let path = `${Apis.deleteThread}/${threadId}`
      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        path = `${path}?userId=${selectedUser.id}`
      }

      const response = await axios.delete(path,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        setSnackbar({
          isVisible: true,
          message: response.data?.message || 'Thread deleted successfully',
          type: SnackbarTypes.Success,
        })
        // Refresh threads
        fetchThreads(searchValue, appliedTeamMemberIds)
        // Clear selected thread if it was deleted
        if (selectedThread?.id === threadId) {
          setSelectedThread(null)
          setMessages([])
        }
      } else {
        setSnackbar({
          isVisible: true,
          message: response.data?.message || 'Failed to delete thread',
          type: SnackbarTypes.Error,
        })
      }
    } catch (error) {
      console.error('Error deleting thread:', error)
      setSnackbar({
        isVisible: true,
        message: error.response?.data?.message || 'Error deleting thread',
        type: SnackbarTypes.Error,
      })
    }
  }, [searchValue, selectedThread, fetchThreads, selectedUser])

  // Setup scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Scroll to bottom instantly when messages are loaded (only if not loading older messages or initial load)
  useEffect(() => {
    // Only scroll if:
    // 1. Not loading older messages (to preserve scroll position)
    // 2. Not in initial loading state
    // 3. Container and messages exist
    if (
      !loadingOlderMessages &&
      !messagesLoading &&
      messagesContainerRef.current &&
      messages.length > 0
    ) {
      // Use double requestAnimationFrame to ensure DOM has fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            // Set scroll position directly (no animation) - instantly jump to bottom
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
          }
        })
      })
    }
  }, [messages.length, loadingOlderMessages, messagesLoading])

  // If user doesn't have access to emails or text messages, show empty state
  if (!hasMessagingAccess) {
    return (
      <>
        <div className={`w-full h-full flex flex-col items-center justify-center bg-white }`}>
          <Image
            src={'/otherAssets/noTemView.png'}
            height={280}
            width={240}
            alt="No messaging access"
          />

          <div className="w-full flex flex-col items-center -mt-12 gap-4">
            <div style={{ fontWeight: '700', fontSize: 22 }}>
              Unlock Messaging
            </div>
            <div style={{ fontWeight: '400', fontSize: 15 }}>
              Upgrade your plan to send and receive emails and text messages
            </div>
          </div>

          <div className="">
            <button
              className="rounded-lg text-white bg-brand-primary mt-8"
              style={{
                fontWeight: '500',
                fontSize: '16',
                height: '50px',
                width: '173px',
              }}
              onClick={() => {
                setShowUpgradePlanModal(true)
              }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
        {/* Upgrade Plan Modal - For users without messaging access */}
        {showUpgradePlanModal && (
          <UpgradePlan
            key="upgrade-plan-modal"
            open={showUpgradePlanModal}
            handleClose={(upgradeResult) => {
              setShowUpgradePlanModal(false)
              // Refresh user data if upgrade was successful
              if (upgradeResult) {
                // The component will re-render and check hasMessagingAccess again
                window.location.reload() // Simple reload to refresh user data
              }
            }}
            currentFullPlan={reduxUser?.plan || reduxUser?.user?.plan}
            from={reduxUser?.userRole === 'AgencySubAccount' ? 'SubAccount' : 'User'}
            selectedUser={selectedUser}
          />
        )}
      </>
    );
  }

  return (
    <div className = {`w-full flex flex-col h-full ${selectedUser && agencyUser ? "mt-[18vh]" : ""}`}>
      <AgentSelectSnackMessage
        isVisible={snackbar.isVisible}
        title={snackbar.title}
        message={snackbar.message}
        type={snackbar.type}
        time={4000}
        hide={() => setSnackbar({ ...snackbar, isVisible: false })}
      />
      
      {/* Upgrade Plan Modal - Always available */}
      <UpgradePlan
        open={showUpgradePlanModal}
        handleClose={(upgradeResult) => {
          setShowUpgradePlanModal(false)
          // Refresh user data if upgrade was successful
          if (upgradeResult) {
            // Optionally refresh threads or user data
            fetchThreads(searchValue || '', appliedTeamMemberIds)
          }
        }}
        currentFullPlan={reduxUser?.plan}
        from={reduxUser?.userRole === 'AgencySubAccount' ? 'SubAccount' : 'User'}
        selectedUser={selectedUser}
      />

      {
      !hasMessagingAccess? (
          <UnlockMessagesView />
        ) : (
          <div className={`w-full h-full flex flex-col bg-white`}>
            <MessageHeader selectedThread={selectedThread} selectedUser={selectedUser} />
            <div className="flex-1 flex flex-row">
              {/* Left Sidebar - Thread List */}
              {(() => {
                // Helper function to check if a thread is unreplied
                // A thread is unreplied if the last message is inbound (from lead)
                const isUnrepliedThread = (thread) => {
                  // Check if thread has messages array
                  if (thread.messages && thread.messages.length > 0) {
                    // Get the most recent message (first in array if sorted by date desc)
                    const lastMessage = thread.messages[0]
                    return lastMessage.direction === 'inbound'
                  }
                  
                  // If no messages array, check if thread has lastMessage property
                  if (thread.lastMessage) {
                    return thread.lastMessage.direction === 'inbound'
                  }
                  
                  // If no message info, check thread direction
                  // Default to unreplied if we can't determine (safer assumption)
                  return thread.direction === 'inbound' || !thread.direction
                }

                // Calculate counts
                const allCount = threads.length
                const unrepliedCount = threads.filter(isUnrepliedThread).length

                // Filter threads based on filterType
                const filteredThreads = filterType === 'unreplied'
                  ? threads.filter(isUnrepliedThread)
                  : threads

                return (
                  <ThreadsList
                    loading={loading}
                    threads={filteredThreads}
                    selectedThread={selectedThread}
                    onSelectThread={handleThreadSelect}
                    onNewMessage={(mode) => {
                      setNewMessageMode(mode || 'sms')
                      setShowNewMessageModal(true)
                    }}
                    getLeadName={getLeadName}
                    getThreadDisplayName={getThreadDisplayName}
                    getRecentMessageType={getRecentMessageType}
                    formatUnreadCount={formatUnreadCount}
                    onDeleteThread={handleDeleteThread}
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchLoading={searchLoading}
                    showFilterPopover={showFilterPopover}
                    onFilterToggle={(open) => {
                      if (open) {
                        setSelectedTeamMemberIds([...appliedTeamMemberIds])
                      }
                      setShowFilterPopover(open)
                    }}
                    filterTeamMembers={filterTeamMembers}
                    selectedTeamMemberIds={selectedTeamMemberIds}
                    onSelectTeamMember={handleTeamMemberFilterSelect}
                    onApplyFilter={handleApplyFilter}
                    onClearFilter={handleClearFilter}
                    hasActiveFilters={hasActiveFilters}
                    selectedTeamMemberIdsCount={appliedTeamMemberIds.length}
                    filterType={filterType}
                    onFilterTypeChange={setFilterType}
                    allCount={allCount}
                    unrepliedCount={unrepliedCount}
                    onContactCreated={() => {
                      // Refresh threads after contact creation
                      fetchThreads(searchValue || '', appliedTeamMemberIds)
                    }}
                    selectedUser={selectedUser}
                    agencyUser={agencyUser}
                    onOpenMessageSettings={() => setShowMessageSettingsModal(true)}
                  />
                )
              })()}

              {/* Right Side - Messages View */}
              <div className={`flex-1 flex flex-col ${selectedUser && !agencyUser ? 'h-[70vh]' : 'h-[93vh]'}`}>
                {selectedThread ? (
                  <>
                    {/* Messages Header */}
                    <ConversationHeader
                    selectedUser={selectedUser}
                    selectedThread={selectedThread} getRecentMessageType={getRecentMessageType} formatUnreadCount={formatUnreadCount} getLeadName={getLeadName} />

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
                      updateComposerFromMessage={updateComposerFromMessage}
                    />

                    {/* AI-Generated Draft Responses */}
                    <DraftCards
                      drafts={drafts}
                      loading={draftsLoading}
                      onSelectDraft={handleSelectDraft}
                      onDiscardDraft={handleDiscardDraft}
                      selectedDraftId={selectedDraft?.id}
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
                      handleCcInputBlur={handleCcInputBlur}
                      removeCcEmail={removeCcEmail}
                      bccEmails={bccEmails}
                      bccInput={bccInput}
                      handleBccInputChange={handleBccInputChange}
                      handleBccInputKeyDown={handleBccInputKeyDown}
                      handleBccInputPaste={handleBccInputPaste}
                      handleBccInputBlur={handleBccInputBlur}
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
                      onCommentAdded={(newMessage) => {
                        // If new message is provided, add it to messages and refresh
                        if (newMessage) {
                          setMessages((prev) => [...prev, newMessage])
                          setTimeout(() => {
                            if (messagesEndRef.current) {
                              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
                            }
                          }, 100)
                        }
                        // Refresh threads to update last message/unread count
                        fetchThreads(searchValue || "", appliedTeamMemberIds)

                      }}
                      selectedUser={selectedUser}
                      searchLoading={searchLoading}
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
                mode={newMessageMode}
                selectedUser={selectedUser}
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

                getLeadName={getLeadName}
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
                setShowEmailTempPopup={() => { }}
                showEmailTempPopup={false}
                setSelectedGoogleAccount={() => { }}
              />

              {/* Message Settings Modal */}
              <MessageSettingsModal
                open={showMessageSettingsModal}
                onClose={() => setShowMessageSettingsModal(false)}
                selectedUser={selectedUser}
              />

            </div>
          </div>
        )}
    </div>
  )
}

export default Messages
