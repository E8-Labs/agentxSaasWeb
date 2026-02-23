import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Paperclip, X, CaretDown, CaretUp, Plus, PaperPlaneTilt } from '@phosphor-icons/react'
import { MessageCircleMore, Mail, MessageSquare, Bold, Underline, ListBullets, ListNumbers, FileText, Trash2, MessageSquareDot, Link2, Loader2 } from 'lucide-react'
import { Box, CircularProgress, FormControl, MenuItem, Modal, Select, Tooltip } from '@mui/material'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import UpgardView from '@/constants/UpgardView'
import { getUserLocalData } from '@/components/constants/constants'
import { toast } from '@/utils/toast'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/constants/UserRole'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import { getUniquesColumn } from '@/components/globalExtras/GetUniqueColumns'
import { getTempletes, getTempleteDetails, deleteTemplete, deleteAccount } from '@/components/pipeline/TempleteServices'
import Image from 'next/image'
import MessageComposerTabCN from './MessageComposerTabCN'
import SplitButtonCN from '../ui/SplitButtonCN'

// Tab icon for consolidated Messenger/Instagram: uses fb_message_icon PNG (accepts size/style like Lucide)
const MessengerTabIcon = ({ size = 20, style }) => (
  <img
    src="/svgIcons/fb_message_icon.png"
    width={size}
    height={size}
    alt=""
    className="object-contain flex-shrink-0"
    style={style}
  />
)
import { renderBrandedIcon } from '@/utilities/iconMasking'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'








// Helper function to get brand primary color as hex
const getBrandPrimaryHex = () => {
  if (typeof window === 'undefined') return '#7902DF'
  const root = document.documentElement
  const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
  if (brandPrimary) {
    const hslMatch = brandPrimary.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360
      const s = parseInt(hslMatch[2]) / 100
      const l = parseInt(hslMatch[3]) / 100

      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = l - c / 2

      let r = 0, g = 0, b = 0

      if (0 <= h && h < 1 / 6) {
        r = c; g = x; b = 0
      } else if (1 / 6 <= h && h < 2 / 6) {
        r = x; g = c; b = 0
      } else if (2 / 6 <= h && h < 3 / 6) {
        r = 0; g = c; b = x
      } else if (3 / 6 <= h && h < 4 / 6) {
        r = 0; g = x; b = c
      } else if (4 / 6 <= h && h < 5 / 6) {
        r = x; g = 0; b = c
      } else if (5 / 6 <= h && h < 1) {
        r = c; g = 0; b = x
      }

      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  return '#7902DF'
}

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

// Helper function to strip HTML tags and convert to plain text while preserving line breaks
const stripHTML = (html) => {
  if (!html) return ''
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    // Convert <p> tags to newlines before processing (Quill uses <p> for paragraphs)
    // Also convert <br> and <br/> to newlines
    let processedHtml = html
      .replace(/<p[^>]*>/gi, '\n')  // Convert opening <p> tags to newlines
      .replace(/<\/p>/gi, '')        // Remove closing </p> tags
      .replace(/<br\s*\/?>/gi, '\n') // Convert <br> and <br/> to newlines
      .replace(/<\/div>/gi, '\n')    // Convert closing </div> to newlines (for nested divs)
      .replace(/<div[^>]*>/gi, '')   // Remove opening <div> tags
    tempDiv.innerHTML = processedHtml
    const text = tempDiv.textContent || tempDiv.innerText || ''
    // Normalize multiple newlines to single newlines, but preserve intentional line breaks
    return text.replace(/\n{3,}/g, '\n\n').trim();
  }
  // Fallback for SSR: strip HTML tags and preserve line breaks
  return html
    .replace(/<p[^>]*>/gi, '\n')     // Convert <p> tags to newlines
    .replace(/<\/p>/gi, '')          // Remove closing </p> tags
    .replace(/<br\s*\/?>/gi, '\n')   // Convert <br> to newlines
    .replace(/<\/div>/gi, '\n')      // Convert closing </div> to newlines
    .replace(/<div[^>]*>/gi, '')     // Remove opening <div> tags
    .replace(/<[^>]*>/g, '')         // Remove any remaining HTML tags
    .replace(/&nbsp;/g, ' ')         // Convert &nbsp; to spaces
    .replace(/&amp;/g, '&')          // Convert &amp; to &
    .replace(/&lt;/g, '<')           // Convert &lt; to <
    .replace(/&gt;/g, '>')           // Convert &gt; to >
    .replace(/\n{3,}/g, '\n\n')      // Normalize multiple newlines
    .trim();
}

// Helper function to get character count from HTML
const getCharCountFromHTML = (html) => {
  if (!html) return 0
  return stripHTML(html).length
}

// Normalize SMS body for RichTextEditor: accept plain text or HTML; return HTML for editor
const smsBodyToEditorValue = (smsBody) => {
  if (!smsBody || typeof smsBody !== 'string') return ''
  const t = smsBody.trim()
  if (!t) return ''
  if (t.startsWith('<')) return smsBody
  return '<p>' + (smsBody || '').replace(/\n/g, '</p><p>') + '</p>'
}

// Same for social (Messenger/Instagram) body
const socialBodyToEditorValue = (body) => {
  if (!body || typeof body !== 'string') return ''
  const t = body.trim()
  if (!t) return ''
  if (t.startsWith('<')) return body
  return '<p>' + (body || '').replace(/\n/g, '</p><p>') + '</p>'
}




const MessageComposer = ({
  from = null,
  selectedUser,
  composerMode,
  setComposerMode,
  selectedThread,
  composerData,
  setComposerData,
  fetchPhoneNumbers,
  fetchEmailAccounts,
  showCC,
  setShowCC,
  showBCC,
  setShowBCC,
  ccEmails,
  ccInput,
  handleCcInputChange,
  handleCcInputKeyDown,
  handleCcInputPaste,
  handleCcInputBlur,
  removeCcEmail,
  bccEmails,
  bccInput,
  handleBccInputChange,
  handleBccInputKeyDown,
  handleBccInputPaste,
  handleBccInputBlur,
  removeBccEmail,
  phoneNumbers,
  selectedPhoneNumber,
  setSelectedPhoneNumber,
  emailAccounts,
  selectedEmailAccount,
  setSelectedEmailAccount,
  removeAttachment,
  richTextEditorRef,
  SMS_CHAR_LIMIT,
  handleFileChange,
  handleSendMessage,
  sendingMessage,
  onSendSocialMessage,
  hasFacebookConnection = false,
  hasInstagramConnection = false,
  onConnectionSuccess,
  onOpenAuthPopup,
  onCommentAdded,
}) => {
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')
  const [isExpanded, setIsExpanded] = useState(true)
  const [userData, setUserData] = useState(null)
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false)
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false)
  const phoneDropdownRef = useRef(null)
  const emailDropdownRef = useRef(null)
  const router = useRouter()

  // Comment state
  const [commentBody, setCommentBody] = useState('')
  const [teamMembers, setTeamMembers] = useState([])
  const [sendingComment, setSendingComment] = useState(false)
  const commentEditorRef = useRef(null)
  const commentEditorContainerRef = useRef(null)
  const composerContentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState('auto')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Mention state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [filteredTeamMembers, setFilteredTeamMembers] = useState([])
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const mentionDropdownRef = useRef(null)
  const [deletingEmailAccountId, setDeletingEmailAccountId] = useState(null)
  const [showDeleteEmailModal, setShowDeleteEmailModal] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)
  const [socialContent, setSocialContent] = useState('')
  const socialRichTextEditorRef = useRef(null)
  const [sendingSocialMessage, setSendingSocialMessage] = useState(false)
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [connectPlatform, setConnectPlatform] = useState('facebook')
  const [connectForm, setConnectForm] = useState({ externalId: '', accessToken: '', displayName: '' })
  const [connectSubmitting, setConnectSubmitting] = useState(false)
  const [connectingOAuth, setConnectingOAuth] = useState(false)

  // Variables state
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [selectedSubjectVariable, setSelectedSubjectVariable] = useState('')
  const [subjectVariablesDropdownOpen, setSubjectVariablesDropdownOpen] = useState(false)
  const subjectVariablesDropdownRef = useRef(null)
  const [selectedVariable, setSelectedVariable] = useState('')
  const [variablesDropdownOpen, setVariablesDropdownOpen] = useState(false)
  const variablesDropdownRef = useRef(null)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false)
  const templatesDropdownRef = useRef(null)
  const [templatesFetched, setTemplatesFetched] = useState(false) // Track if templates have been fetched for current mode

  // Plan capabilities
  const { planCapabilities } = usePlanCapabilities()
  const canSendSMS = planCapabilities?.allowTextMessages === true
  const shouldShowUpgradeView = composerMode === 'sms' && !canSendSMS


  const [delTempLoader, setDelTempLoader] = useState(null)


  //debugging
  useEffect(() => {
    console.log('[composerDataUseEffect] composer data changed')
    console.log('🔍 [composerDataUseEffect] composerMode:', composerMode)

  }, [composerMode])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
        setPhoneDropdownOpen(false)
      }
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        setEmailDropdownOpen(false)
      }
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target) &&
        !commentEditorContainerRef.current?.contains(event.target)) {
        setShowMentionDropdown(false)
      }
      if (subjectVariablesDropdownRef.current && !subjectVariablesDropdownRef.current.contains(event.target)) {
        setSubjectVariablesDropdownOpen(false)
      }
      if (templatesDropdownRef.current && !templatesDropdownRef.current.contains(event.target)) {
        setShowTemplatesDropdown(false)
      }
      if (variablesDropdownRef.current && !variablesDropdownRef.current.contains(event.target)) {
        setVariablesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const updateBrandColor = () => {
      setBrandPrimaryColor(getBrandPrimaryHex())
    }

    updateBrandColor()
    window.addEventListener('agencyBrandingUpdated', updateBrandColor)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', updateBrandColor)
    }
  }, [])

  // Get user data from localStorage
  useEffect(() => {
    const user = getUserLocalData()
    if (user) {
      setUserData(user)
    }
  }, [])

  // When selecting a Messenger/Instagram thread, switch to the corresponding tab
  useEffect(() => {
    if (selectedThread?.threadType === 'messenger') setComposerMode('facebook')
    else if (selectedThread?.threadType === 'instagram') setComposerMode('instagram')
  }, [selectedThread?.id, selectedThread?.threadType])

  // Smooth height transition when switching tabs
  useEffect(() => {
    if (!isExpanded || !composerContentRef.current) {
      setContentHeight('auto')
      setIsTransitioning(false)
      return
    }

    const element = composerContentRef.current
    let timeoutId = null
    let rafId1 = null
    let rafId2 = null

    // Get the current height before any changes
    const currentHeight = element.scrollHeight

    // Set explicit height immediately to lock current height
    setContentHeight(`${currentHeight}px`)

    // Force a reflow to ensure the height is set
    void element.offsetHeight

    // Enable transition AFTER setting the initial height
    setIsTransitioning(true)

    // Wait for React to render the new content
    // Use multiple requestAnimationFrame calls to ensure DOM has fully updated
    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        // Force another reflow
        void element.offsetHeight

        // One more frame to ensure content is rendered
        requestAnimationFrame(() => {
          // Measure new content height after mode change
          const newHeight = element.scrollHeight

          // Only animate if heights are different (with small threshold for rounding)
          if (Math.abs(newHeight - currentHeight) > 1) {
            // Animate to new height
            setContentHeight(`${newHeight}px`)

            // Reset to auto after transition completes
            timeoutId = setTimeout(() => {
              if (composerContentRef.current) {
                setContentHeight('auto')
              }
              setIsTransitioning(false)
            }, 350) // Slightly longer than transition duration
          } else {
            // Heights are the same, no transition needed
            setContentHeight('auto')
            setIsTransitioning(false)
          }
        })
      })
    })

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (rafId1) {
        cancelAnimationFrame(rafId1)
      }
      if (rafId2) {
        cancelAnimationFrame(rafId2)
      }
    }
  }, [composerMode, isExpanded])

  // Fetch team members for @ mentions
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await getTeamsList()
        if (response) {
          const members = []
          if (response.admin) {
            members.push({
              id: response.admin.id,
              name: response.admin.name,
              email: response.admin.email,
            })
          }
          if (response.data && response.data.length > 0) {
            for (const t of response.data) {
              if (t.status === 'Accepted' && t.invitedUser) {
                members.push({
                  id: t.invitedUser.id,
                  name: t.invitedUser.name,
                  email: t.invitedUser.email,
                })
              }
            }
          }
          setTeamMembers(members)
          setFilteredTeamMembers(members)
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
      }
    }
    if (composerMode === 'comment') {
      fetchTeamMembers()
    }
  }, [composerMode])

  // Fetch unique columns for variables
  const fetchUniqueColumns = async () => {
    try {
      const user = getUserLocalData()
      const userId = user?.user?.id
      const defaultColumns = [
        '{First Name}',
        '{Last Name}',
        '{Email}',
        '{Phone}',
        '{Address}',
      ]

      let res = await getUniquesColumn(userId)

      if (res && Array.isArray(res)) {
        const mergedColumns = [
          ...defaultColumns,
          ...res.filter((col) => !defaultColumns.includes(col)),
        ]
        setUniqueColumns(mergedColumns)
      } else {
        setUniqueColumns(defaultColumns)
      }
    } catch (error) {
      console.error('Error fetching unique columns:', error)
      setUniqueColumns([
        '{First Name}',
        '{Last Name}',
        '{Email}',
        '{Phone}',
        '{Address}',
      ])
    }
  }

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    if (composerMode !== 'email' && composerMode !== 'sms') return

    try {
      setTemplatesLoading(true)
      const user = getUserLocalData()
      const userId = user?.user?.id
      const communicationType = composerMode === 'email' ? 'email' : 'sms'

      const templatesData = await getTempletes(communicationType, userId)
      if (templatesData && Array.isArray(templatesData)) {
        setTemplates(templatesData)
      } else {
        setTemplates([])
      }
      setTemplatesFetched(true) // Mark as fetched after successful or failed attempt
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplates([])
      setTemplatesFetched(true) // Mark as fetched even on error to prevent infinite retries
    } finally {
      setTemplatesLoading(false)
    }
  }, [composerMode])

  // Fetch unique columns when email mode is active
  useEffect(() => {
    if (composerMode === 'email') {
      fetchUniqueColumns()
    }
  }, [composerMode])

  // Reset templates fetched flag when composer mode changes
  useEffect(() => {
    setTemplatesFetched(false)
    setTemplates([]) // Clear templates when mode changes
  }, [composerMode])

  // Fetch templates when dropdown is opened (only if not already fetched for current mode)
  useEffect(() => {
    if (showTemplatesDropdown && !templatesFetched && !templatesLoading) {
      fetchTemplates()
    }
  }, [showTemplatesDropdown, templatesFetched, templatesLoading, fetchTemplates])

  // Handle template selection
  const handleTemplateSelect = async (template) => {
    if (!template) return
    try {
      // Fetch full template details
      const user = getUserLocalData()
      const userId = user?.user?.id
      const details = await getTempleteDetails(template, userId)
      if (details) {
        if (composerMode === 'email') {
          console.log("details for email template is", details)
          // Populate email fields
          const subjectToSet = details.subject || template?.subject || ''
          // Populate email fields (use subjectToSet so list subject is used when details.subject is missing)
          setComposerData((prev) => ({
            ...prev,
            subject: subjectToSet,
            emailBody: details.content || '',
          }))

          // Handle CC/BCC if they exist
          if (details.ccEmails && Array.isArray(details.ccEmails) && details.ccEmails.length > 0) {
            // Note: CC/BCC handling would need to be passed up to parent or handled here
            // For now, we'll just set the email body and subject
          }
        } else if (composerMode === 'sms') {
          // Populate SMS body
          const smsContent = details.content || ''
          // Strip HTML if present and limit to SMS character limit
          const plainText = stripHTML(smsContent)
          setComposerData((prev) => ({
            ...prev,
            smsBody: plainText.substring(0, SMS_CHAR_LIMIT),
          }))
        }
      } else {
        // Fallback to template object directly
        if (composerMode === 'email') {
          setComposerData((prev) => ({
            ...prev,
            subject: template.subject || '',
            emailBody: template.content || '',
          }))
        } else if (composerMode === 'sms') {
          const plainText = stripHTML(template.content || '')
          setComposerData((prev) => ({
            ...prev,
            smsBody: plainText.substring(0, SMS_CHAR_LIMIT),
          }))
        }
      }

      setShowTemplatesDropdown(false)
    } catch (error) {
      console.error('Error loading template details:', error)
      // Fallback to template object
      if (composerMode === 'email') {
        setComposerData((prev) => ({
          ...prev,
          subject: template.subject || '',
          emailBody: template.content || '',
        }))
      } else if (composerMode === 'sms') {
        const plainText = stripHTML(template.content || '')
        setComposerData((prev) => ({
          ...prev,
          smsBody: plainText.substring(0, SMS_CHAR_LIMIT),
        }))
      }
      setShowTemplatesDropdown(false)
    }
  }

  // Check for @ mentions in editor
  const checkForMentions = useCallback(() => {
    if (composerMode !== 'comment' || !commentEditorContainerRef.current) {
      setShowMentionDropdown(false)
      return
    }

    const editorContainer = commentEditorContainerRef.current?.querySelector('.ql-editor')
    if (!editorContainer) {
      setShowMentionDropdown(false)
      return
    }

    // Get the selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowMentionDropdown(false)
      return
    }

    const range = selection.getRangeAt(0)

    // Check if selection is within the editor
    if (!editorContainer.contains(range.commonAncestorContainer)) {
      setShowMentionDropdown(false)
      return
    }

    // Get text up to cursor position using a simpler approach
    let text = ''
    try {
      // Create a range from start of editor to cursor
      const textRange = document.createRange()
      textRange.setStart(editorContainer, 0)
      textRange.setEnd(range.startContainer, range.startOffset)

      // Get text content from this range
      text = textRange.toString() || ''
    } catch (e) {
      // Fallback: if range doesn't work, use innerText and approximate
      const allText = editorContainer.innerText || editorContainer.textContent || ''
      text = allText
    }

    const atIndex = text.lastIndexOf('@')

    if (atIndex === -1) {
      setShowMentionDropdown(false)
      return
    }

    // Check if there's a space after @ (meaning mention is complete)
    const textAfterAt = text.substring(atIndex + 1)
    if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
      setShowMentionDropdown(false)
      return
    }

    // Get the query after @
    const query = textAfterAt.toLowerCase()
    setMentionQuery(query)

    // Filter team members - if query is empty (just "@"), show all members
    const filtered = query === ''
      ? teamMembers
      : teamMembers.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      )

    setFilteredTeamMembers(filtered)
    setSelectedMentionIndex(0)

    if (filtered.length > 0) {
      // Get cursor position for dropdown
      const rect = range.getBoundingClientRect()

      setMentionPosition({
        top: rect.bottom + 5,
        left: rect.left,
      })
      setShowMentionDropdown(true)
    } else {
      setShowMentionDropdown(false)
    }
  }, [composerMode, teamMembers])

  // Handle comment body change and detect @ mentions
  const handleCommentChange = (html) => {
    setCommentBody(html)
    // Use setTimeout to ensure DOM is updated
    setTimeout(checkForMentions, 50)
  }

  // Add event listeners for mention detection
  useEffect(() => {
    if (composerMode !== 'comment' || !commentEditorContainerRef.current) return

    let cleanup = null

    // Wait a bit for the editor to be ready
    const timeoutId = setTimeout(() => {
      const editorContainer = commentEditorContainerRef.current?.querySelector('.ql-editor')
      if (!editorContainer) return

      // Listen to various events that might indicate typing
      const handleInput = () => {
        setTimeout(checkForMentions, 10)
      }

      const handleKeyDown = (e) => {
        // Check for @ key specifically (Shift+2 on most keyboards)
        if (e.key === '@' || (e.key === '2' && e.shiftKey)) {
          setTimeout(checkForMentions, 10)
        }
      }

      const handleKeyUp = (e) => {
        // Check for @ key or any character
        if (e.key === '@' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)) {
          setTimeout(checkForMentions, 10)
        }
      }

      const handleSelectionChange = () => {
        setTimeout(checkForMentions, 10)
      }

      // Also listen on the container itself
      const container = commentEditorContainerRef.current

      editorContainer.addEventListener('input', handleInput, true)
      editorContainer.addEventListener('keydown', handleKeyDown, true)
      editorContainer.addEventListener('keyup', handleKeyUp, true)
      container.addEventListener('click', handleSelectionChange, true)
      document.addEventListener('selectionchange', handleSelectionChange)

      cleanup = () => {
        editorContainer.removeEventListener('input', handleInput, true)
        editorContainer.removeEventListener('keydown', handleKeyDown, true)
        editorContainer.removeEventListener('keyup', handleKeyUp, true)
        container.removeEventListener('click', handleSelectionChange, true)
        document.removeEventListener('selectionchange', handleSelectionChange)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (cleanup) cleanup()
    }
  }, [composerMode, checkForMentions, commentBody])

  // Handle keyboard navigation in mention dropdown
  useEffect(() => {
    if (!showMentionDropdown) return

    const handleKeyDown = (e) => {
      if (!showMentionDropdown || filteredTeamMembers.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMentionIndex((prev) =>
          prev < filteredTeamMembers.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleInsertMention(filteredTeamMembers[selectedMentionIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentionDropdown(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showMentionDropdown, filteredTeamMembers, selectedMentionIndex])

  // Insert mention into editor
  const handleInsertMention = (member) => {
    if (!commentEditorContainerRef.current || !member) return

    const editorContainer = commentEditorContainerRef.current.querySelector('.ql-editor')
    if (!editorContainer) return

    // Try to access Quill instance via RichTextEditor ref
    let quill = null
    if (commentEditorRef.current && commentEditorRef.current.getEditor) {
      quill = commentEditorRef.current.getEditor()
    }

    if (quill) {
      const selection = quill.getSelection(true)

      if (!selection) {
        return
      }

      // Get the current selection index
      const currentIndex = selection.index

      // Get text up to cursor to find @ position
      // getText includes newlines as \n characters
      const textBeforeCursor = quill.getText(0, currentIndex)
      const atIndex = textBeforeCursor.lastIndexOf('@')

      if (atIndex === -1) {
        return
      }

      // Use Quill's getContents to get the delta representation
      // This preserves line breaks and formatting correctly
      const contents = quill.getContents(0, currentIndex)

      // Map text position to Quill index by walking through delta ops
      let quillIndex = 0
      let textIndex = 0

      for (let i = 0; i < contents.ops.length; i++) {
        const op = contents.ops[i]
        if (op.insert) {
          const insertText = typeof op.insert === 'string' ? op.insert : ''
          const insertLength = insertText.length

          // Check if @ is within this op's text
          if (textIndex <= atIndex && atIndex < textIndex + insertLength) {
            // @ is in this op - calculate the exact Quill index
            quillIndex += (atIndex - textIndex)
            break
          }

          textIndex += insertLength
          quillIndex += insertLength
        }
        // Formatting ops don't affect text position
      }

      // Ensure quillIndex is valid
      if (quillIndex < 0) quillIndex = 0
      if (quillIndex > currentIndex) {
        // Fallback: if calculation failed, use text-based index
        quillIndex = atIndex
      }

      // Get text before deletion for comparison
      const textBeforeDelete = quill.getText()

      // Delete text from @ to cursor
      const deleteLength = currentIndex - quillIndex

      if (deleteLength > 0) {
        quill.deleteText(quillIndex, deleteLength)
      }

      // Insert mention with formatting
      const mentionText = `@${member.name} `
      const mentionTextWithoutSpace = `@${member.name}`

      // Insert the mention text first without formatting
      quill.insertText(quillIndex, mentionText, 'user')

      // Then apply formatting only to the mention text (excluding the trailing space)
      quill.formatText(quillIndex, mentionTextWithoutSpace.length, {
        color: brandPrimaryColor,
        bold: true,
      }, 'user')

      // Calculate cursor position after mention
      const newCursorPos = quillIndex + mentionText.length

      // Remove any formatting from text after the mention to prevent bleed
      const contentLength = quill.getLength()
      if (newCursorPos < contentLength - 1) {
        // Remove formatting from the space and any text after
        quill.formatText(newCursorPos, contentLength - newCursorPos - 1, {
          color: false,
          bold: false,
        }, 'user')
      }

      // Move cursor after mention and remove any active formatting
      quill.setSelection(newCursorPos, 'user')

      // Remove any active formatting at cursor position to prevent bleed
      quill.removeFormat(newCursorPos, 0, 'user')
    } else {
      // Fallback: use DOM manipulation
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const textNode = range.startContainer

      // Get text up to cursor position
      let text = ''
      if (textNode.nodeType === Node.TEXT_NODE) {
        text = textNode.textContent?.substring(0, range.startOffset) || ''
      }

      const atIndex = text.lastIndexOf('@')
      if (atIndex === -1) return

      // Find the @ position in the DOM
      let currentText = ''
      const walker = document.createTreeWalker(
        editorContainer,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node
      let foundAtNode = null
      let atOffset = 0

      while ((node = walker.nextNode())) {
        const nodeText = node.textContent || ''

        if (currentText.length + nodeText.length >= atIndex) {
          foundAtNode = node
          atOffset = atIndex - currentText.length
          break
        }

        currentText += nodeText
      }

      if (!foundAtNode) return

      // Delete text from @ to cursor
      const deleteRange = document.createRange()
      deleteRange.setStart(foundAtNode, atOffset)
      deleteRange.setEnd(range.startContainer, range.startOffset)
      deleteRange.deleteContents()

      // Insert mention with formatting
      const span = document.createElement('span')
      span.style.color = brandPrimaryColor
      span.style.fontWeight = 'bold'
      span.textContent = `@${member.name} `
      deleteRange.insertNode(span)

      // Move cursor after mention
      const newRange = document.createRange()
      newRange.setStartAfter(span)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)

      // Trigger onChange
      const html = editorContainer.innerHTML
      setCommentBody(html)
    }

    setShowMentionDropdown(false)
    setMentionQuery('')
  }

  // Handle sending comment
  const handleSendComment = async () => {
    if (!hasTextContent(commentBody) || !selectedThread?.id) {
      return
    }

    try {
      setSendingComment(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        return
      }

      const userData = JSON.parse(localData)
      const AuthToken = userData.token

      // Extract plain text from HTML comment body
      const plainText = stripHTML(commentBody).trim()

      if (!plainText) {
        return
      }

      // Extract mentioned user IDs from comment body
      // Match full user names (including spaces) by checking all team members
      const mentionedUserIds = []

      // For each team member, check if their name appears as a mention in the content
      for (const member of teamMembers) {
        if (!member.name) continue

        // Look for @ followed by the member's name (which may contain spaces)
        const mentionPattern = `@${member.name}`
        const mentionIndex = plainText.indexOf(mentionPattern)

        if (mentionIndex !== -1) {
          // Verify it's a valid mention (not part of a longer word)
          const charBefore = mentionIndex > 0 ? plainText[mentionIndex - 1] : ' '
          const charAfter = mentionIndex + mentionPattern.length < plainText.length
            ? plainText[mentionIndex + mentionPattern.length]
            : ' '

          // Valid mention if preceded by space/start and followed by space/end
          if ((charBefore === ' ' || charBefore === '\n' || mentionIndex === 0) &&
            (charAfter === ' ' || charAfter === '\n' || mentionIndex + mentionPattern.length === plainText.length)) {
            if (!mentionedUserIds.includes(member.id)) {
              mentionedUserIds.push(member.id)
            }
          }
        }
      }

      let ApiData = {
        threadId: selectedThread.id,
        leadId: selectedThread.leadId,
        content: plainText,
        mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
      }

      if (selectedUser?.id) {
        ApiData.userId = selectedUser.id
      }

      const response = await axios.post(Apis.postComment, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response && response.data && response.data.status === true) {
        setCommentBody('')
        setShowMentionDropdown(false)
        setMentionQuery('')
        if (onCommentAdded) {
          // Pass the new message data if available
          onCommentAdded(response.data.data)
        }
      }
    } catch (error) {
      console.error('Error sending comment:', error)
    } finally {
      setSendingComment(false)
    }
  }

  // Function to render Lucide icon with branding color
  const renderBrandedLucideIcon = (IconComponent, size = 20, isActive = false) => {
    if (typeof window === 'undefined') {
      return <IconComponent size={size} />
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')

    // Use brand color when active, muted gray when inactive
    const iconColor = isActive && brandColor && brandColor.trim()
      ? `hsl(${brandColor.trim()})`
      : 'hsl(0 0% 60%)' // Muted gray for inactive state

    return (
      <IconComponent
        size={size}
        style={{
          color: iconColor,
          stroke: iconColor,
          flexShrink: 0,
          transition: 'color 0.2s ease-in-out, stroke 0.2s ease-in-out',
        }}
      />
    )
  }


  // Handle template deletion
  const handleDeleteTemplate = async (template, e) => {
    e.stopPropagation() // Prevent template selection when clicking delete


    try {
      setDelTempLoader(template)
      console.log("template in handleDeleteTemplate is", template);
      // return
      const deleteTemplateResponse = await deleteTemplete(template)
      console.log("Delete Template Response is", deleteTemplateResponse);
      // Remove from templates list - check both id and templateId fields
      toast.success('Template deleted successfully')
      setTemplates((prev) => prev.filter((t) => {
        const templateId = template.id || template.templateId
        const tId = t.id || t.templateId
        return tId !== templateId
      }))
      setDelTempLoader(null)
      // If the deleted template was selected, clear selection


    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
      setDelTempLoader(null)
    }
  }

  // Handle email account deletion - opens confirmation modal
  const handleDeleteEmailAccount = (account, e) => {
    e.stopPropagation() // Prevent dropdown from closing
    setAccountToDelete(account)
    setShowDeleteEmailModal(true)
  }

  // Actually perform the deletion
  const confirmDeleteEmailAccount = async () => {
    if (!accountToDelete) return

    setDeletingEmailAccountId(accountToDelete.id)
    try {
      const response = await deleteAccount(accountToDelete)

      if (response || response === undefined) {
        // Refresh email accounts list
        if (fetchEmailAccounts) {
          await fetchEmailAccounts()
        }

        // If deleted account was selected, clear selection (fetchEmailAccounts will set a new default)
        if (selectedEmailAccount === accountToDelete.id.toString()) {
          setSelectedEmailAccount(null)
        }

        toast.success('Email account deleted successfully')
        setShowDeleteEmailModal(false)
        setAccountToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting email account:', error)
      toast.error(error?.response?.data?.message || 'Failed to delete email account')
    } finally {
      setDeletingEmailAccountId(null)
    }
  }

  const isSocialThread = selectedThread?.threadType === 'messenger' || selectedThread?.threadType === 'instagram'
  const isFacebookMode = composerMode === 'facebook'
  const isInstagramMode = composerMode === 'instagram'
  // Thread is replyable via Messenger if it's a messenger thread or has receiverMessengerPsid (e.g. merged SMS thread)
  const canReplyMessenger = (selectedThread?.threadType === 'messenger' || !!selectedThread?.receiverMessengerPsid) && hasFacebookConnection
  const canReplyInstagram = (selectedThread?.threadType === 'instagram' || !!selectedThread?.receiverInstagramPsid) && hasInstagramConnection
  const sendableSocial = (isFacebookMode && canReplyMessenger) || (isInstagramMode && canReplyInstagram)
  const isMessengerReply = selectedThread?.threadType === 'messenger' || !!selectedThread?.receiverMessengerPsid
  const showSocialComposer = false

  const handleSendSocial = async (e) => {
    e?.preventDefault()
    const raw = (composerData.socialBody ?? socialContent ?? '').trim()
    const text = stripHTML(raw).trim()
    if (!text || !selectedThread?.id || !onSendSocialMessage) return
    if (sendingSocialMessage) return
    setSendingSocialMessage(true)
    try {
      await onSendSocialMessage(selectedThread.id, text)
      setComposerData((prev) => ({ ...prev, socialBody: '' }))
      setSocialContent('')
      toast.success('Message sent')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send')
    } finally {
      setSendingSocialMessage(false)
    }
  }

  const openConnectModal = (platform) => {
    setConnectPlatform(platform)
    setConnectForm({ externalId: '', accessToken: '', displayName: '' })
    setConnectModalOpen(true)
  }

  const connectWithFacebookOAuth = async () => {
    const localData = localStorage.getItem('User')
    if (!localData) {
      toast.error('Please sign in to connect')
      return
    }
    const userData = JSON.parse(localData)
    const token = userData.token
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''
    try {
      setConnectingOAuth(true)
      let url = Apis.socialFacebookAuthorize
      const params = new URLSearchParams()
      if (redirectUrl) params.set('redirectUrl', redirectUrl)
      if (selectedUser?.id) params.set('userId', String(selectedUser.id))
      if (params.toString()) url += `?${params.toString()}`
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        toast.error(res.data?.message || 'Could not start Facebook connect')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not start Facebook connect')
    } finally {
      setConnectingOAuth(false)
    }
  }

  const handleConnectSubmit = async (e) => {
    e?.preventDefault()
    const externalId = (connectForm.externalId || '').trim()
    const accessToken = (connectForm.accessToken || '').trim()
    if (!externalId || !accessToken) {
      toast.error('Page/Account ID and Access Token are required')
      return
    }
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return
      const userData = JSON.parse(localData)
      const token = userData.token
      let url = Apis.socialConnections
      if (selectedUser?.id) url += `?userId=${selectedUser.id}`
      setConnectSubmitting(true)
      await axios.post(url, {
        platform: connectPlatform,
        externalId,
        accessToken,
        displayName: (connectForm.displayName || '').trim() || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      toast.success(connectPlatform === 'facebook' ? 'Facebook Page connected' : 'Instagram account connected')
      setConnectModalOpen(false)
      onConnectionSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to connect')
    } finally {
      setConnectSubmitting(false)
    }
  }

  const socialBody = composerData.socialBody ?? ''
  if (showSocialComposer) {
    return (
      <div className="mx-4 mb-4 rounded-lg bg-white border border-gray-200 px-4 py-3">
        <form onSubmit={handleSendSocial} className="flex gap-2">
          <Input
            value={socialBody}
            onChange={(e) => setComposerData((prev) => ({ ...prev, socialBody: e.target.value }))}
            placeholder={`Reply in ${isMessengerReply ? 'Messenger' : 'Instagram'}...`}
            className="flex-1 min-w-0"
            disabled={sendingSocialMessage}
          />
          <Button type="submit" disabled={!socialBody.trim() || sendingSocialMessage}>
            {sendingSocialMessage ? <CircularProgress size={18} color="inherit" sx={{ display: 'block' }} /> : 'Send'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-0 rounded-lg bg-white">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between border-b mb-2">
          <div className="flex items-center gap-2 pb-1">
            <MessageComposerTabCN
              icon={MessageSquareDot}
              label="Text"
              isActive={composerMode === 'sms'}
              onClick={() => {
                // When switching to SMS, preserve SMS body if it exists, otherwise convert email HTML to plain text
                if (composerMode === 'email' && !composerData.smsBody && composerData.emailBody) {
                  const plainText = stripHTML(composerData.emailBody)
                  setComposerData((prev) => ({
                    ...prev,
                    to: selectedThread?.receiverPhoneNumber || selectedThread?.lead?.phone || '',
                    smsBody: plainText.substring(0, SMS_CHAR_LIMIT) // Ensure it doesn't exceed SMS limit
                  }))
                } else {
                  setComposerData((prev) => ({
                    ...prev,
                    to: selectedThread?.receiverPhoneNumber || selectedThread?.lead?.phone || ''
                  }))
                }
                setComposerMode('sms')
                fetchPhoneNumbers()
                setIsExpanded(true)
              }}
            />
            <MessageComposerTabCN
              icon={Mail}
              label="Email"
              isActive={composerMode === 'email'}
              onClick={() => {
                // When switching to Email, preserve email body if it exists, otherwise convert SMS text to HTML
                if (composerMode === 'sms' && !composerData.emailBody && composerData.smsBody) {
                  // Convert plain text SMS to HTML format for email
                  const htmlBody = composerData.smsBody.replace(/\n/g, '<br>')
                  setComposerData((prev) => ({
                    ...prev,
                    to: selectedThread?.receiverEmail || selectedThread?.lead?.email || '',
                    emailBody: htmlBody
                  }))
                } else {
                  setComposerData((prev) => ({
                    ...prev,
                    to: selectedThread?.receiverEmail || selectedThread?.lead?.email || ''
                  }))
                }
                setComposerMode('email')
                setIsExpanded(true)
                // Only fetch if accounts are empty, otherwise the effect in Messages.js will restore selection
                if (emailAccounts.length === 0) {
                  fetchEmailAccounts()
                }
              }}
            />
            <MessageComposerTabCN
              icon={MessageSquare}
              label="Comment"
              isActive={composerMode === 'comment'}
              onClick={() => {
                setComposerMode('comment')
                setIsExpanded(true)
              }}
            />
            <MessageComposerTabCN
              icon={MessengerTabIcon}
              label="FB/IG DM"
              isActive={composerMode === 'facebook' || composerMode === 'instagram'}
              onClick={() => {
                setComposerMode(selectedThread?.threadType === 'instagram' ? 'instagram' : 'facebook')
                setIsExpanded(true)
              }}
            />
          </div>

          <div className="flex items-center gap-2">

            {composerMode === 'email' && (

              <div className="flex items-center border-[0.5px] border-gray-200 rounded-lg">
                <SplitButtonCN buttons={[{
                  label: 'Cc',
                  isSelected: showCC,
                  onClick: () => setShowCC(!showCC),
                },
                {
                  label: 'Bcc',
                  isSelected: showBCC,
                  onClick: () => setShowBCC(!showBCC),
                }]} />
                {/* <button
                  onClick={() => setShowCC(!showCC)}
                  className={`px-2 py-1 text-xs border-r rounded border-gray-200 transition-colors rounded rounded-r-none ${showCC ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Cc
            </button>
                <button
                  onClick={() => setShowBCC(!showBCC)}
                  className={`px-2 py-1 text-xs transition-colors rounded rounded-l-none ${showBCC ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Bcc
            </button> */}
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <CaretDown size={20} className="text-gray-600" />
              ) : (
                <CaretUp size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {(isFacebookMode || isInstagramMode) && !sendableSocial ? (
          <div className="mx-0 mb-4 mt-2 rounded-lg bg-muted/50 border border-muted px-4 py-3 space-y-4">
            {!hasFacebookConnection && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Connect a Facebook Page to send Messenger messages.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" className="w-fit" onClick={connectWithFacebookOAuth} disabled={connectingOAuth}>
                    {connectingOAuth ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5 mr-1.5" />}
                    Connect with Facebook
                  </Button>
                  <span className="text-xs text-muted-foreground">or</span>
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => openConnectModal('facebook')} disabled={connectingOAuth}>
                    Connect manually
                  </Button>
                </div>
              </div>
            )}
            {!hasInstagramConnection && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Connect an Instagram account to send messages.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" className="w-fit" onClick={connectWithFacebookOAuth} disabled={connectingOAuth}>
                    {connectingOAuth ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5 mr-1.5" />}
                    Connect with Instagram
                  </Button>
                  <span className="text-xs text-muted-foreground">or</span>
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => openConnectModal('instagram')} disabled={connectingOAuth}>
                    Connect manually
                  </Button>
                </div>
              </div>
            )}
            {hasFacebookConnection && hasInstagramConnection && (
              <p className="text-sm text-muted-foreground">
                Select a Messenger or Instagram conversation from the list to reply here.
              </p>
            )}
          </div>
        ) : !isExpanded ? (
          // Collapsed view - show text input with send button
          sendableSocial ? (
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={typeof socialBody === 'string' && socialBody.trim().startsWith('<') ? stripHTML(socialBody) : (socialBody ?? '')}
                onChange={(e) => setComposerData((prev) => ({ ...prev, socialBody: e.target.value }))}
                onFocus={() => setIsExpanded(true)}
                onClick={() => setIsExpanded(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if ((composerData.socialBody ?? '').trim() && !sendingSocialMessage) handleSendSocial(e)
                  }
                }}
                placeholder={`Reply in ${isMessengerReply ? 'Messenger' : 'Instagram'}...`}
                className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                style={{ height: '42px' }}
              />
              <button
                onClick={handleSendSocial}
                disabled={!(composerData.socialBody ?? '').trim() || sendingSocialMessage}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ height: '42px' }}
              >
                {sendingSocialMessage ? <CircularProgress size={20} color="inherit" sx={{ display: 'block' }} /> : <PaperPlaneTilt size={20} weight="fill" />}
              </button>
            </div>
          ) : (
          <div className="mt-2 flex items-center gap-2">
            <Input
              value={
                composerMode === 'sms'
                  ? stripHTML(composerData.smsBody)
                  : composerMode === 'comment'
                    ? stripHTML(commentBody)
                    : stripHTML(composerData.emailBody)
              }
              onChange={(e) => {
                if (composerMode === 'sms' && e.target.value.length <= SMS_CHAR_LIMIT) {
                  setComposerData((prev) => ({ ...prev, smsBody: e.target.value }))
                } else if (composerMode === 'email') {
                  // Convert plain text to HTML for email
                  const htmlBody = e.target.value.replace(/\n/g, '<br>')
                  setComposerData((prev) => ({ ...prev, emailBody: htmlBody }))
                } else if (composerMode === 'comment') {
                  const htmlBody = e.target.value.replace(/\n/g, '<br>')
                  setCommentBody(htmlBody)
                }
              }}
              onFocus={() => setIsExpanded(true)}
              onClick={() => setIsExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (composerMode === 'comment') {
                    if (hasTextContent(commentBody) && selectedThread?.leadId) {
                      handleSendComment()
                    }
                  } else {
                    const messageBody = composerMode === 'sms' ? composerData.smsBody : composerData.emailBody
                    if (hasTextContent(messageBody) &&
                      ((composerMode === 'sms' && selectedPhoneNumber && composerData.to) ||
                        (composerMode === 'email' && selectedEmailAccount && composerData.to))) {
                      handleSendMessage()
                    }
                  }
                }
              }}
              placeholder={composerMode === 'comment' ? 'Type a comment...' : 'Type your message...'}
              className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
              style={{ height: '42px' }}
            />
            <button
              onClick={composerMode === 'comment' ? handleSendComment : handleSendMessage}
              disabled={
                composerMode === 'comment'
                  ? (sendingComment || !hasTextContent(commentBody) || !selectedThread?.leadId)
                  : (sendingMessage ||
                    !hasTextContent(composerMode === 'sms' ? composerData.smsBody : composerData.emailBody) ||
                    (composerMode === 'email' && (!selectedEmailAccount || !composerData.to)) ||
                    (composerMode === 'sms' && (!selectedPhoneNumber || !composerData.to)))
              }
              className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ height: '42px' }}
            >
              <PaperPlaneTilt size={20} weight="fill" />
            </button>
          </div>
          )
        ) : (
          <div
            ref={composerContentRef}
            style={{
              height: contentHeight,
              overflow: 'hidden',
              transition: isTransitioning ? 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              willChange: isTransitioning ? 'height' : 'auto',
            }}
          >
            {/* Messenger/Instagram expanded: RichTextEditor with formatting toolbar (no From/Subject/CC/BCC/Templates) */}
            {sendableSocial ? (
              <div className="mt-2">
                <div className="mb-2">
                  <label className="text-sm font-semibold text-foreground">
                    {isMessengerReply ? 'Reply in Messenger' : 'Reply in Instagram'}
                  </label>
                </div>
                <div className="border border-brand-primary/20 rounded-lg bg-white">
                  <RichTextEditor
                    ref={socialRichTextEditorRef}
                    value={socialBodyToEditorValue(composerData.socialBody ?? '')}
                    onChange={(html) => setComposerData((prev) => ({ ...prev, socialBody: html }))}
                    placeholder="Type your message..."
                    availableVariables={[]}
                    toolbarPosition="bottom"
                    customToolbarElement={
                      <div className="flex justify-end p-2 border-t border-gray-100">
                        <button
                          onClick={handleSendSocial}
                          disabled={!hasTextContent(composerData.socialBody ?? '') || sendingSocialMessage}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {sendingSocialMessage ? (
                            <>
                              <CircularProgress size={16} color="inherit" sx={{ display: 'block' }} />
                              <span className="text-sm">Sending...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">Send</span>
                              <PaperPlaneTilt size={16} weight="fill" />
                            </>
                          )}
                        </button>
                      </div>
                    }
                  />
                </div>
              </div>
            ) : composerMode === 'comment' ? (
              <div className="mt-2">
                <div className="mb-2">
                  <label className="text-sm font-semibold text-foreground">Comment</label>
                </div>

                {/* Comment Input with Formatting Toolbar */}
                <div ref={commentEditorContainerRef} className="relative border border-brand-primary/20 rounded-lg bg-white">
                  <RichTextEditor
                    ref={commentEditorRef}
                    value={commentBody}
                    onChange={handleCommentChange}
                    placeholder="Use @ to mention a teammate. Comments are only visible to your team."
                    availableVariables={[]}
                    toolbarPosition="bottom"
                    customToolbarElement={
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer">
                          <button
                            type="button"
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            onClick={() => document.getElementById('comment-attachment-input')?.click()}
                            title="Attach file"
                          >
                            <Paperclip size={18} className="text-gray-600 hover:text-brand-primary" />
                          </button>
                          <input
                            id="comment-attachment-input"
                            type="file"
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        <button
                          onClick={handleSendComment}
                          disabled={
                            sendingComment ||
                            !hasTextContent(commentBody) ||
                            !selectedThread?.leadId
                          }
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {sendingComment ? (
                            <>
                              <CircularProgress size={16} className="text-white" />
                              <span className="text-sm">Sending...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">Send</span>
                              <PaperPlaneTilt size={16} weight="fill" />
                            </>
                          )}
                        </button>
                      </div>
                    }
                  />

                  {/* Mention Dropdown */}
                  {showMentionDropdown && filteredTeamMembers.length > 0 && (
                    <div
                      ref={mentionDropdownRef}
                      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px]"
                      style={{
                        top: `${mentionPosition.top}px`,
                        left: `${mentionPosition.left}px`,
                      }}
                    >
                      {filteredTeamMembers.map((member, index) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleInsertMention(member)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${index === selectedMentionIndex
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'text-gray-700'
                            }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold flex-shrink-0">
                            {member.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{member.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : shouldShowUpgradeView ? (
              <div className="py-8">
                <UpgardView
                  title="Unlock Text Messages"
                  subTitle="Upgrade to unlock this feature and start sending SMS messages to your leads."
                  userData={userData}
                  onUpgradeSuccess={(updatedUserData) => {
                    // Refresh user data after upgrade
                    if (updatedUserData) {
                      setUserData({ user: updatedUserData })
                    }
                  }}
                  setShowSnackMsg={() => { }}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex border-[0.5px] px-3 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary  items-center gap-2 flex-1">
                    <label className="text-sm text-[#737373] font-medium whitespace-nowrap">From:</label>
                    {composerMode === 'sms' ? (
                      <div className="flex-1 relative min-w-0" ref={phoneDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                          className="w-full px-3 py-2 bg-white text-left flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-700 truncate">
                            {selectedPhoneNumber
                              ? phoneNumbers.find((p) => p.id === parseInt(selectedPhoneNumber))?.phone || 'Select phone number'
                              : 'Select phone number'}
                          </span>
                          <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </button>
                        {phoneDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {phoneNumbers.length === 0 ? (
                              <div className="p-3">
                                <button
                                  onClick={() => {
                                    const tab = userData?.user?.userRole === UserRole.AgencySubAccount ? 6 : 7
                                    router.push(`/dashboard/myAccount?tab=${tab}`)
                                    setPhoneDropdownOpen(false)
                                  }}
                                  className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                  <Plus className="w-4 h-4" />
                                  Select Phone Number
                                </button>
                              </div>
                            ) : (
                              <>
                                {phoneNumbers.map((phone) => (
                                  <button
                                    key={phone.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPhoneNumber(phone.id.toString())
                                      setPhoneDropdownOpen(false)
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${selectedPhoneNumber === phone.id.toString() ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'
                                      }`}
                                  >
                                    {phone.phone}
                                  </button>
                                ))}
                                <div className="border-t border-gray-200 p-2">
                                  <button
                                    onClick={() => {
                                      if (from === 'admin') {
                                        const url = `/admin/users?userId=${selectedUser.id}&enablePermissionChecks=true&tab=account`
                                        window.open(url, '_blank')
                                      } else if (from === 'subaccount' || from === 'agency') {
                                        const url = `/agency/users?userId=${selectedUser.id}&enablePermissionChecks=true&tab=account`
                                        window.open(url, '_blank')
                                      } else {
                                        router.push('/dashboard/myAccount?tab=7')
                                      }
                                      setPhoneDropdownOpen(false)
                                    }}
                                    className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Get A2P Verified Number
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 relative min-w-0" ref={emailDropdownRef}>
                        {emailAccounts.length === 0 ? (
                          <button
                            onClick={() => onOpenAuthPopup && onOpenAuthPopup()}
                            className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            style={{ height: '42px' }}
                          >
                            Connect Email
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEmailDropdownOpen(!emailDropdownOpen)}
                              className="w-full px-3 py-2 bg-white text-left flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-700 truncate">
                                {selectedEmailAccount
                                  ? (() => {
                                    const account = emailAccounts.find((a) => a.id === parseInt(selectedEmailAccount))
                                    if (!account) return 'Select email account'
                                    const providerLabel = account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider || ''
                                    return `${account.email || account.name || account.displayName}${providerLabel ? ` (${providerLabel})` : ''}`
                                  })()
                                  : 'Select email account'}
                              </span>
                              <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </button>
                            {emailDropdownOpen && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
                                <div className="max-h-44 overflow-y-auto">
                                  {emailAccounts.map((account) => (
                                    <div
                                      key={account.id}
                                      className="group relative w-full"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedEmailAccount(account.id.toString())
                                          setEmailDropdownOpen(false)
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${selectedEmailAccount === account.id.toString() ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'
                                          }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>{account.email || account.name || account.displayName}</span>
                                          <div className="flex items-center gap-2">
                                            {account.provider && (
                                              <span className="text-xs text-gray-500">
                                                {account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider}
                                              </span>
                                            )}
                                            {/* Delete icon - visible on hover */}
                                            <button
                                              type="button"
                                              onClick={(e) => handleDeleteEmailAccount(account, e)}
                                              disabled={deletingEmailAccountId === account.id}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 flex-shrink-0"
                                              title="Delete email account"
                                            >
                                              {deletingEmailAccountId === account.id ? (
                                                <CircularProgress size={14} />
                                              ) : (
                                                <Trash2 size={14} />
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-gray-200 p-2">
                                  <button
                                    onClick={() => {
                                      if (onOpenAuthPopup) {
                                        onOpenAuthPopup()
                                      }
                                      setEmailDropdownOpen(false)
                                    }}
                                    className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Connect Email
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>


                </div>

                {composerMode === 'email' && (
                  <>
                    {/* CC and BCC fields - shown when toggled - Tag-based design on same line */}
                    {(showCC || showBCC) && (
                      <div className="flex items-start gap-4 mb-2 px-1">
                        {showCC && (
                          <div className="flex items-start gap-2 flex-1 w-full">
                            <div className="flex border-[0.5px] px-3 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary  items-center gap-2 flex-1">
                              <label className="text-sm font-medium whitespace-nowrap text-[#737373]">Cc:</label>
                              <div className="relative flex-1 min-w-0">
                                {/* Tag Input Container */}
                                <div
                                  className="flex flex-wrap items-center gap-2 px-3 py-2 "
                                >
                                  {/* CC Email Tags */}
                                  {ccEmails.map((email, index) => (
                                    <div
                                      key={`cc-${index}-${email}`}
                                      className="flex items-center gap-1 px-2 py-[1px] bg-gray-100 rounded-full text-sm"
                                    >
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
                                  {/* CC Input */}
                                  <input
                                    type="text"
                                    value={ccInput}
                                    onChange={handleCcInputChange}
                                    onKeyDown={handleCcInputKeyDown}
                                    onPaste={handleCcInputPaste}
                                    onBlur={handleCcInputBlur}
                                    placeholder={ccEmails.length === 0 ? 'Add CC recipients' : ''}
                                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                                    style={{
                                      height: '100%',
                                      minHeight: '24px',
                                      padding: 0,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {showBCC && (
                          <div className="flex items-start gap-2 flex-1 w-full">
                            <div className="flex border-[0.5px] px-3 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary  items-center gap-2 flex-1">
                              <label className="text-sm font-medium whitespace-nowrap text-[#737373]">Bcc:</label>
                              <div className="relative flex-1 min-w-0">
                                {/* Tag Input Container */}
                                <div
                                  className="flex flex-wrap items-center gap-2 px-3 py-2 "
                                >
                                  {/* BCC Email Tags */}
                                  {bccEmails.map((email, index) => (
                                    <div
                                      key={`bcc-${index}-${email}`}
                                      className="flex items-center gap-1 px-2 py-[1px] bg-gray-100 rounded-full text-sm"
                                    >
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
                                  {/* BCC Input */}
                                  <input
                                    type="text"
                                    value={bccInput}
                                    onChange={handleBccInputChange}
                                    onKeyDown={handleBccInputKeyDown}
                                    onPaste={handleBccInputPaste}
                                    onBlur={handleBccInputBlur}
                                    placeholder={bccEmails.length === 0 ? 'Add BCC recipients' : ''}
                                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                                    style={{
                                      height: '100%',
                                      minHeight: '24px',
                                      padding: 0,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="flex border-[0.5px] border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-brand-primary items-center flex-1 bg-white">
                        <div className="flex items-center gap-2 flex-1 px-3">
                          <label className="text-sm text-[#737373] font-medium whitespace-nowrap">Subject:</label>
                          <input
                            type="text"
                            value={composerData.subject}
                            onChange={(e) => setComposerData((prev) => ({ ...prev, subject: e.target.value }))}
                            placeholder="Enter subject"
                            className="flex-1 outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                          />
                        </div>
                        {/* Divider */}
                        {uniqueColumns && uniqueColumns.length > 0 && (
                          <div className="w-[0.5px] h-[36px]  bg-gray-200 flex-shrink-0"></div>
                        )}
                        {/* Variables dropdown */}
                        {uniqueColumns && uniqueColumns.length > 0 && (
                          <div className="relative flex-shrink-0" ref={subjectVariablesDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setSubjectVariablesDropdownOpen(!subjectVariablesDropdownOpen)}
                              className="px-3 w-32 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <span>Variables</span>
                              <CaretDown size={16} className="text-gray-400" />
                            </button>
                            {subjectVariablesDropdownOpen && (
                              <div className="absolute z-50 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px]">
                                {uniqueColumns.map((variable, index) => {
                                  const displayText = variable.startsWith('{') && variable.endsWith('}')
                                    ? variable
                                    : `{${variable}}`
                                  return (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() => {
                                        const variableText = variable.startsWith('{') && variable.endsWith('}')
                                          ? variable
                                          : `{${variable}}`
                                        setComposerData((prev) => ({ ...prev, subject: (prev.subject || '') + variableText }))
                                        setSubjectVariablesDropdownOpen(false)
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-gray-700"
                                    >
                                      {displayText}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Message Body and Send Button */}
                <div className="mb-2 px-1">
                  {composerMode === 'email' ? (
                    <>
                      {composerData.attachments.length > 0 && (
                        <div className="mb-1 flex flex-col gap-1">
                          {composerData.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                              <Paperclip size={14} className="text-gray-500" />
                              <span className="flex-1 truncate">{file.name}</span>
                              <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                              <button onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700 text-lg leading-none">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Relative container for RichTextEditor and overlapping buttons */}
                      <div className="relative">
                        <RichTextEditor
                          ref={richTextEditorRef}
                          value={composerData.emailBody}
                          onChange={(html) => setComposerData((prev) => ({ ...prev, emailBody: html }))}
                          placeholder="Type your message..."
                          availableVariables={uniqueColumns}
                          toolbarPosition="bottom"
                          customToolbarElement={
                            uniqueColumns && uniqueColumns.length > 0 ? (
                              <div className="relative" ref={variablesDropdownRef}>
                                <button
                                  type="button"
                                  onClick={() => setVariablesDropdownOpen(!variablesDropdownOpen)}
                                  className="px-3 py-2 w-32 border-gray-200 border-l-[0.5px] border-gray-200 focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-brand-primary flex items-center justify-between gap-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <span>Variables</span>
                                  <CaretDown size={16} className={`text-gray-400 transition-transform ${variablesDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {variablesDropdownOpen && (
                                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px] z-50">
                                    {uniqueColumns.map((variable, index) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return (
                                        <button
                                          key={index}
                                          type="button"
                                          onClick={() => {
                                            if (richTextEditorRef.current) {
                                              richTextEditorRef.current.insertVariable(variable)
                                            }
                                            setVariablesDropdownOpen(false)
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-gray-700"
                                        >
                                          {displayText}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : null
                          }
                        />

                      </div>

                      {/* Footer with Template, Character Count, and Send Button */}
                      {(composerMode === 'email' || composerMode === 'sms') && (
                        <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-gray-200">
                          {/* My Templates Button with Dropdown */}
                          <div className="relative" ref={templatesDropdownRef}>
                            <button
                              onClick={() => {
                                if (!showTemplatesDropdown && !templatesFetched && !templatesLoading) {
                                  fetchTemplates()
                                }
                                setShowTemplatesDropdown(!showTemplatesDropdown)
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                            >
                              {renderBrandedIcon("/messaging/templateIcon.svg", 18, 18)}
                              <span>Templates</span>
                              <CaretDown size={16} className={`transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Templates Dropdown */}
                            {showTemplatesDropdown && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
                                {templatesLoading ? (
                                  <div className="p-4 text-center">
                                    <CircularProgress size={20} />
                                  </div>
                                ) : templates.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-gray-500">
                                    No templates found
                                  </div>
                                ) : (
                                  templates.map((template) => (
                                    <Tooltip
                                      key={template.id || template.templateId}
                                      title={template.subject}
                                      arrow
                                      placement="right"
                                      componentsProps={{
                                        tooltip: {
                                          sx: {
                                            // pointerEvents: 'none',
                                            backgroundColor: '#ffffff', // Ensure white background
                                            color: '#333', // Dark text color
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            padding: '10px 15px',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                                          },
                                        },
                                        arrow: {
                                          sx: {
                                            color: '#ffffff', // Match tooltip background
                                          },
                                        },
                                      }}
                                    >
                                      <button
                                        key={template.id || template.templateId}
                                        onClick={() => handleTemplateSelect(template)}
                                        className="w-full flex flex-row items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                      >
                                        <div className="font-medium text-gray-900 truncate">
                                          {template.templateName || 'Untitled Template'}
                                        </div>
                                        {delTempLoader && ((delTempLoader.id || delTempLoader.templateId) === (template.id || template.templateId)) ? (
                                          <CircularProgress size={16} />
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={(e) => handleDeleteTemplate(template, e)}
                                            className="flex-shrink-0 p-1 rounded transition-colors"
                                            title="Delete template"
                                          >
                                            <Trash2 size={16} className="text-brand-primary" />
                                          </button>
                                        )}
                                      </button>
                                    </Tooltip>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                            <div className="flex items-center gap-2 ">
                            {/* Character count: SMS only (plain text length); email branch so this is for consistency if mode toggles */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 flex-1 justify-center">

                              {composerMode === 'sms' && (
                                <span>{getCharCountFromHTML(composerData.smsBody)}/{SMS_CHAR_LIMIT} char</span>
                              )}

                            </div>

                            {/* Send Button */}
                            <button
                              onClick={handleSendMessage}
                              disabled={
                                sendingMessage ||
                                (composerMode === 'email'
                                  ? (!hasTextContent(composerData.emailBody) || !selectedEmailAccount || !composerData.to)
                                  : (!hasTextContent(composerData.smsBody) || !selectedPhoneNumber || !composerData.to)
                                )
                              }
                              className="px-6 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {sendingMessage ? (
                                <>
                                  <CircularProgress size={16} className="text-white" />
                                  <span>Sending...</span>
                                </>
                              ) : (
                                <>
                                  <span>Send</span>
                                  <PaperPlaneTilt size={16} weight="fill" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* SMS/Text: same RichTextEditor as email with formatting toolbar and character limit */}
                      <div className="relative">
                        <RichTextEditor
                          ref={richTextEditorRef}
                          value={smsBodyToEditorValue(composerData.smsBody)}
                          onChange={(html) => setComposerData((prev) => ({ ...prev, smsBody: html }))}
                          placeholder="Type your message..."
                          availableVariables={uniqueColumns}
                          toolbarPosition="bottom"
                          maxCharLimit={SMS_CHAR_LIMIT}
                          customToolbarElement={
                            uniqueColumns && uniqueColumns.length > 0 ? (
                              <div className="relative" ref={variablesDropdownRef}>
                                <button
                                  type="button"
                                  onClick={() => setVariablesDropdownOpen(!variablesDropdownOpen)}
                                  className="px-3 py-2 w-32 border-gray-200 border-l-[0.5px] border-gray-200 focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-brand-primary flex items-center justify-between gap-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <span>Variables</span>
                                  <CaretDown size={16} className={`text-gray-400 transition-transform ${variablesDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {variablesDropdownOpen && (
                                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px] z-50">
                                    {uniqueColumns.map((variable, index) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return (
                                        <button
                                          key={index}
                                          type="button"
                                          onClick={() => {
                                            if (richTextEditorRef.current) {
                                              richTextEditorRef.current.insertVariable(variable)
                                            }
                                            setVariablesDropdownOpen(false)
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-gray-700"
                                        >
                                          {displayText}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : null
                          }
                        />
                      </div>

                      {/* Footer with Template, Character Count, and Send Button */}
                      <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-gray-200">
                        {/* My Templates Button with Dropdown */}
                        <div className="relative" ref={templatesDropdownRef}>
                          <button
                            onClick={() => {
                              if (!showTemplatesDropdown) {
                                fetchTemplates()
                              }
                              setShowTemplatesDropdown(!showTemplatesDropdown)
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                          >
                            {renderBrandedIcon("/messaging/templateIcon.svg", 18, 18)}
                            <span>Templates</span>
                            <CaretDown size={16} className={`transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Templates Dropdown */}
                          {showTemplatesDropdown && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
                              {templatesLoading ? (
                                <div className="p-4 text-center">
                                  <CircularProgress size={20} />
                                </div>
                              ) : templates.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  No templates found
                                </div>
                              ) : (
                                templates.map((template) => (
                                  <Tooltip
                                    key={template.id || template.templateId}
                                    title={template.content}
                                    arrow
                                    placement="right"
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          backgroundColor: '#ffffff',
                                          color: '#333',
                                          fontSize: '16px',
                                          fontWeight: '500',
                                          padding: '10px 15px',
                                          borderRadius: '8px',
                                          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                        },
                                      },
                                      arrow: {
                                        sx: {
                                          color: '#ffffff',
                                        },
                                      },
                                    }}
                                  >
                                    <button
                                      key={template.id || template.templateId}
                                      onClick={() => handleTemplateSelect(template)}
                                      className="flex items-center justify-between gap-2  w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-medium text-gray-900 truncate">
                                        {template.templateName || 'Untitled Template'}
                                      </div>
                                      {delTempLoader && ((delTempLoader.id || delTempLoader.templateId) === (template.id || template.templateId)) ? (
                                        <CircularProgress size={16} />
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteTemplate(template, e)}
                                          className="flex-shrink-0 p-1 rounded transition-colors"
                                          title="Delete template"
                                        >
                                          <Trash2 size={16} className="text-brand-primary" />
                                        </button>
                                      )}
                                    </button>
                                  </Tooltip>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Character Count (plain text length for SMS) */}
                          <div className="flex items-center gap-2 text-sm text-gray-500 flex-1 justify-center">
                            <span>
                              {getCharCountFromHTML(composerData.smsBody)}/{SMS_CHAR_LIMIT} char
                            </span>
                          </div>

                          {/* Send Button */}
                          <button
                            onClick={handleSendMessage}
                            disabled={
                              sendingMessage ||
                              !hasTextContent(composerData.smsBody) ||
                              (composerMode === 'sms' && (!selectedPhoneNumber || !composerData.to))
                            }
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {sendingMessage ? (
                              <>
                                <CircularProgress size={16} className="text-white" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <span>Send</span>
                                <PaperPlaneTilt size={16} weight="fill" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Email Account Confirmation Modal */}
      <Modal
        open={showDeleteEmailModal}
        onClose={() => {
          setShowDeleteEmailModal(false)
          setAccountToDelete(null)
        }}
        closeAfterTransition
        disablePortal={false}
        slotProps={{
          root: {
            style: {
              zIndex: 1500,
            },
          },
        }}
        sx={{
          zIndex: 1500,
        }}
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
            zIndex: 1500,
          },
        }}
      >
        <Box
          className="lg:w-3/12 sm:w-4/12 w-6/12"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '13px',
            zIndex: 1501,
          }}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="font-bold text-lg">
                Delete Email
              </div>
              <div className="font-regular text-sm mt-3">
                Are you sure you want to delete {accountToDelete?.email || accountToDelete?.name || accountToDelete?.displayName || 'this email account'}?
              </div>
              <div className="flex flex-row items-center gap-4 w-full mt-6">
                <button
                  className="w-1/2 font-bold text-lg text-[#6b7280] h-[50px]"
                  onClick={() => {
                    setShowDeleteEmailModal(false)
                    setAccountToDelete(null)
                  }}
                >
                  Cancel
                </button>
                {deletingEmailAccountId === accountToDelete?.id ? (
                  <div className="w-1/2 flex items-center justify-center h-[50px]">
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                ) : (
                  <button
                    className="w-1/2 text-red font-bold text-lg border border-[#00000020] rounded-xl h-[50px]"
                    onClick={confirmDeleteEmailAccount}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Connect Facebook / Instagram modal */}
      <Dialog open={connectModalOpen} onOpenChange={(open) => !connectSubmitting && setConnectModalOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connectPlatform === 'facebook' ? 'Connect Facebook Page' : 'Connect Instagram Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConnectSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {connectPlatform === 'facebook' ? 'Page ID' : 'Instagram Business Account ID'}
              </label>
              <Input
                value={connectForm.externalId}
                onChange={(e) => setConnectForm((f) => ({ ...f, externalId: e.target.value }))}
                placeholder={connectPlatform === 'facebook' ? 'Page ID from Meta Developer Console' : 'IG Business Account ID'}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
              <Input
                type="password"
                value={connectForm.accessToken}
                onChange={(e) => setConnectForm((f) => ({ ...f, accessToken: e.target.value }))}
                placeholder="Paste token from Meta Developer Console"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name (optional)</label>
              <Input
                value={connectForm.displayName}
                onChange={(e) => setConnectForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="e.g. Page name or @handle"
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setConnectModalOpen(false)} disabled={connectSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={connectSubmitting}>
                {connectSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MessageComposer
