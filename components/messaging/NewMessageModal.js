'use client'

import { Box, CircularProgress, Modal, Popover, Tooltip } from '@mui/material'
import { Check, PaperPlaneTilt, X, CaretDown, Plus } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from '@/utils/toast'
import { useRouter } from 'next/navigation'

import Apis from '@/components/apis/Apis'
import RichTextEditor from '@/components/common/RichTextEditor'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { getUserLocalData, UpgradeTagWithModal } from '@/components/constants/constants'
import { PersistanceKeys } from '@/constants/Constants'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import AuthSelectionPopup from '@/components/pipeline/AuthSelectionPopup'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import UpgardView from '@/constants/UpgardView'
import { getUniquesColumn } from '@/components/globalExtras/GetUniqueColumns'
import { Paperclip, X as XIcon, MessageCircleMore, Mail, AlertTriangle, ChevronDown, Trash2, MessageSquareDot } from 'lucide-react'
import { FormControl, ListSubheader, MenuItem, Select } from '@mui/material'
import { useUser } from '@/hooks/redux-hooks'
import ToggleGroupCN from '@/components/ui/ToggleGroupCN'
import SplitButtonCN from '@/components/ui/SplitButtonCN'
import { TypographyCaption } from '@/lib/typography'
import { getTempletes, getTempleteDetails, createTemplete, updateTemplete, deleteTemplete, deleteAccount } from '@/components/pipeline/TempleteServices'
import { renderBrandedIcon } from '@/utilities/iconMasking'
import { getGmailWatchErrorInfo } from '@/utils/gmailWatchError'
import UpgradePlanView from '../callPausedPoupup/UpgradePlanView'
import { messageMarkdownToHtml } from './messageMarkdown'

/** Sliding pill background for MUI Select Menu: follows hovered menu item, 2% black, 8px radius. */
const SlidingPillMenuList = React.forwardRef((props, ref) => {
  const [pill, setPill] = useState({ top: 0, height: 0, visible: false })
  const handleMouseMove = (e) => {
    const item = e.target?.closest?.('.MuiMenuItem-root')
    if (item && ref?.current) {
      const r = item.getBoundingClientRect()
      const listRect = ref.current.getBoundingClientRect()
      setPill({
        top: r.top - listRect.top + ref.current.scrollTop,
        height: r.height,
        visible: true,
      })
    }
  }
  const handleMouseLeave = () => setPill((v) => ({ ...v, visible: false }))
  return (
    <div
      style={{ position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {pill.visible && (
        <div
          style={{
            position: 'absolute',
            left: 4,
            right: 4,
            top: pill.top,
            height: pill.height,
            borderRadius: 8,
            backgroundColor: 'rgba(0,0,0,0.02)',
            pointerEvents: 'none',
            transition: 'top 0.15s ease-out, height 0.15s ease-out',
          }}
        />
      )}
      <ul ref={ref} {...props} />
    </div>
  )
})
SlidingPillMenuList.displayName = 'SlidingPillMenuList'

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

const NewMessageModal = ({
  open,
  onClose,
  onSend,
  mode = 'sms',
  // Pipeline mode props
  isPipelineMode = false,
  onSaveTemplate = null,
  isEditing = false,
  editingRow = null,
  selectedUser = null,
  isLeadMode = false,
  isBookingStage = false,
  isFromAdminOrAgency = null,
  elevatedZIndex = false, // When true, modal and overlays use z-index above TeamMemberActivityDrawer (5000)
}) => {
  const modalZIndex = elevatedZIndex ? 15020 : 1500
  console.log("modalZIndex in newmessage modal is", modalZIndex);
  const [selectedMode, setSelectedMode] = useState(mode)
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredLeads, setFilteredLeads] = useState([])
  const [selectedLeads, setSelectedLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [emailAccounts, setEmailAccounts] = useState([])
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null)
  const [selectedEmailAccount, setSelectedEmailAccount] = useState(null)
  const [selectedPhoneNumberObj, setSelectedPhoneNumberObj] = useState(null)
  const [selectedEmailAccountObj, setSelectedEmailAccountObj] = useState(null)
  const [smsMessageBody, setSmsMessageBody] = useState('')
  const [emailMessageBody, setEmailMessageBody] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [ccEmails, setCcEmails] = useState([])
  const [bccEmails, setBccEmails] = useState([])
  const [ccInput, setCcInput] = useState('')
  const [bccInput, setBccInput] = useState('')
  const [userData, setUserData] = useState(null)
  const [showLeadList, setShowLeadList] = useState(false)
  const [showAuthSelectionPopup, setShowAuthSelectionPopup] = useState(false)
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false)
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false)
  const phoneAnchorRef = useRef(null)
  const emailAnchorRef = useRef(null)
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [selectedVariable, setSelectedVariable] = useState('')
  const [selectedSubjectVariable, setSelectedSubjectVariable] = useState('')
  const [selectedSmsVariable, setSelectedSmsVariable] = useState('')
  const [smsVariableSearchQuery, setSmsVariableSearchQuery] = useState('')
  const [subjectVariableSearchQuery, setSubjectVariableSearchQuery] = useState('')
  const [variableSearchQuery, setVariableSearchQuery] = useState('')
  const [attachments, setAttachments] = useState([])
  const smsTextareaRef = useRef(null)
  const smsVariableSearchInputRef = useRef(null)
  const subjectVariableSearchInputRef = useRef(null)
  const variableSearchInputRef = useRef(null)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [deletingEmailAccountId, setDeletingEmailAccountId] = useState(null)
  const [showDeleteEmailModal, setShowDeleteEmailModal] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)
  const [emailListPopoverAnchor, setEmailListPopoverAnchor] = useState(null)
  const [emailListPopoverType, setEmailListPopoverType] = useState(null) // 'cc' or 'bcc'
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const richTextEditorRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const leadSearchRef = useRef(null)
  const templatesDropdownRef = useRef(null)
  const attachmentDropdownRef = useRef(null)
  const attachmentDropdownTimeoutRef = useRef(null)
  const router = useRouter()
  const [IsdefaultCadence, setIsdefaultCadence] = useState(null)
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false)
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [delTempLoader, setDelTempLoader] = useState(null)
  // Plan capabilities
  const { planCapabilities } = usePlanCapabilities()

  const { user: reduxUser, setUser: setReduxUser } = useUser()

  // SMS character limit
  const SMS_CHAR_LIMIT = 300

  // Check if user can send messages/emails
  // For SMS: check allowTextMessages capability
  // For Email: always allow (emails are separate from SMS capability)
  const canSendSMS = planCapabilities?.allowTextMessages === true
  const canSendEmail = true // Emails are always allowed

  // Determine if upgrade view should be shown (only for SMS tab)
  const shouldShowUpgradeView = selectedMode === 'sms' && !canSendSMS

  const hasSmsAccess = reduxUser?.planCapabilities?.allowTextMessages === true
  const hasEmailAccess = reduxUser?.planCapabilities?.allowEmails === true


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

  useEffect(() => {
    console.log("mode in NewMessageModal is", mode);
  }, [mode])

  // useEffect(() => {
  //   const consolesList = [
  //     { key: "isEditing", value: isEditing },
  //     { key: "IsdefaultCadence", value: IsdefaultCadence },
  //     { key: "isPipelineMode", value: isPipelineMode },
  //     { key: "open", value: open },
  //     { key: "selectedMode", value: selectedMode },
  //     { key: "selectedUser", value: selectedUser },
  //     { key: "selectedTemplate", value: selectedTemplate },
  //     { key: "selectedPhoneNumber", value: selectedPhoneNumber },
  //     { key: "selectedEmailAccount", value: selectedEmailAccount }
  //   ]
  //   if(open === true){

  //     console.log("--------------------------------")
  //     consolesList.forEach(item => {
  //       console.log(`key is ${item.key}: ${item.value}`)
  //     })
  //     console.log("--------------------------------")
  //   }
  // }, [isEditing, IsdefaultCadence, isPipelineMode, open, selectedMode, selectedUser, selectedTemplate, selectedPhoneNumber, selectedEmailAccount])

  // Update brand color on branding changes
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

  // Sync mode prop with selectedMode state when modal opens or mode prop changes
  // useEffect(() => {
  //   if (open && mode) {
  //     setSelectedMode(mode)
  //   }
  // }, [open, mode])

  // Check for default cadence flag when modal opens in pipeline mode
  useEffect(() => {
    if (isPipelineMode && open) {
      const isDefault = localStorage.getItem(PersistanceKeys.isDefaultCadenceEditing)
      if (isDefault) {
        try {
          const parsed = JSON.parse(isDefault)
          setIsdefaultCadence(false)
        } catch (e) {
          setIsdefaultCadence(false)
        }
      } else {
        setIsdefaultCadence(false)
      }
    }
  }, [isPipelineMode, open])

  // Reset saveAsTemplate when modal opens
  useEffect(() => {
    if (open) {
      // Always reset to false when modal opens
      console.log('🔵 [NewMessageModal] Modal opened - Resetting saveAsTemplate to false')
      setSaveAsTemplate(false)
    } else {
      console.log('🔵 [NewMessageModal] Modal closed')
    }
  }, [open])

  // Track saveAsTemplate state changes
  useEffect(() => {
    console.log('🔄 [saveAsTemplate State Changed]:', {
      saveAsTemplate,
      type: typeof saveAsTemplate,
      value: saveAsTemplate,
      isTrue: saveAsTemplate === true,
      isFalse: saveAsTemplate === false,
      truthy: !!saveAsTemplate
    })
  }, [saveAsTemplate])

  // Fetch data when modal opens or mode changes
  useEffect(() => {
    // console.log("Editing row is", editingRow);
    if (open) {
      if (selectedMode === 'sms' && canSendSMS) {
        fetchPhoneNumbers()
      } else if (selectedMode === 'email') {
        fetchEmailAccounts()
      }
    }
  }, [open, selectedMode])

  // Load template data when editing in pipeline mode
  useEffect(() => {
    if (isPipelineMode && isEditing && editingRow && open) {
      const loadTemplateData = async () => {
        try {
          // First fetch templates if not already loaded
          if (templates.length === 0) {
            await fetchTemplates()
          }

          if (editingRow.templateId) {
            const user = getUserLocalData()
            const userId = getTargetUserId() || user?.user?.id
            const details = await getTempleteDetails({ templateId: editingRow.templateId, id: editingRow.templateId }, userId)

            // Find and set the selected template from templates list
            // Re-fetch templates to ensure we have the latest list
            const communicationType = selectedMode === 'email' ? 'email' : 'sms'
            const templatesData = await getTempletes(communicationType, userId)
            if (templatesData && Array.isArray(templatesData)) {
              setTemplates(templatesData)
              const matchingTemplate = templatesData.find(
                (t) => t.id === editingRow.templateId || t.templateId === editingRow.templateId
              )
              if (matchingTemplate) {
                setSelectedTemplate(matchingTemplate)
              }
            }

            if (details) {
              if (selectedMode === 'email') {
                setEmailSubject(details.subject || '')
                setEmailMessageBody(details.content || '')
                if (details.ccEmails) {
                  const parsedCc = Array.isArray(details.ccEmails)
                    ? details.ccEmails
                    : (typeof details.ccEmails === 'string' ? JSON.parse(details.ccEmails) : [])
                  setCcEmails(parsedCc)
                  if (parsedCc.length > 0) setShowCC(true)
                }
                if (details.bccEmails) {
                  const parsedBcc = Array.isArray(details.bccEmails)
                    ? details.bccEmails
                    : (typeof details.bccEmails === 'string' ? JSON.parse(details.bccEmails) : [])
                  setBccEmails(parsedBcc)
                  if (parsedBcc.length > 0) setShowBCC(true)
                }
                if (details.attachments) {
                  setAttachments(Array.isArray(details.attachments) ? details.attachments : [])
                }
              } else if (selectedMode === 'sms') {
                const plainText = stripHTML(details.content || '')
                setSmsMessageBody(plainText.substring(0, SMS_CHAR_LIMIT))
              }
            }
          }
        } catch (error) {
          console.error('Error loading template data:', error)
        }
      }
      loadTemplateData()
    } else if (!isEditing && open) {
      // Reset form when not editing
      setSmsMessageBody('')
      setEmailMessageBody('')
      setEmailSubject('')
      setCcEmails([])
      setBccEmails([])
      setAttachments([])
      setSelectedTemplate(null)
    }
  }, [isPipelineMode, isEditing, editingRow, open, selectedMode, selectedUser])

  // Set account/phone when they're loaded and we're editing
  useEffect(() => {
    if (isPipelineMode && isEditing && editingRow && open) {
      if (selectedMode === 'email' && editingRow.emailAccountId && emailAccounts.length > 0) {
        const accountId = editingRow.emailAccountId.toString()
        const account = emailAccounts.find((a) => a.id === parseInt(accountId))
        if (account && selectedEmailAccount !== accountId) {
          setSelectedEmailAccount(accountId)
          setSelectedEmailAccountObj(account)
        }
      } else if (selectedMode === 'sms' && editingRow.smsPhoneNumberId && phoneNumbers.length > 0) {
        const phoneId = editingRow.smsPhoneNumberId.toString()
        const phone = phoneNumbers.find((p) => p.id === parseInt(phoneId))
        if (phone && selectedPhoneNumber !== phoneId) {
          setSelectedPhoneNumber(phoneId)
          setSelectedPhoneNumberObj(phone)
        }
      }
    }
  }, [isPipelineMode, isEditing, editingRow, open, selectedMode, emailAccounts, phoneNumbers, selectedEmailAccount, selectedPhoneNumber])

  // Search leads using the messaging search endpoint
  const searchLeads = async (searchTerm = '') => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      // Only search if we have a search term (minimum 1 character)
      if (!searchTerm || searchTerm.trim().length < 1) {
        setFilteredLeads([])
        setLoading(false)
        return
      }

      let apiPath = `${Apis.searchLeadsForMessaging}?search=${encodeURIComponent(searchTerm.trim())}&limit=50`
      if (selectedUser) {
        apiPath = `${Apis.searchLeadsForMessaging}?search=${encodeURIComponent(searchTerm.trim())}&limit=50&userId=${selectedUser.id}`
      }

      // console.log("ApiPath for search leads is", apiPath);

      const response = await axios.get(apiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        const leadsData = Array.isArray(response.data.data)
          ? response.data.data
          : []
        setFilteredLeads(leadsData)
        // Ensure dropdown stays open when results arrive
        setShowLeadList(true)
      } else {
        setFilteredLeads([])
      }
    } catch (error) {
      console.error('Error searching leads:', error)
      setFilteredLeads([])
    } finally {
      setLoading(false)
    }
  }

  // Get userId for API calls: when agency views subaccount or admin views another account, use that user's id
  const getUserIdFromUrl = () => {
    if (typeof window === 'undefined') return null
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get('userId')
    return userId ? parseInt(userId, 10) : null
  }

  const getTargetUserId = () => selectedUser?.id || getUserIdFromUrl() || null

  // Fetch phone numbers (A2P verified) for current user or for selected subaccount when agency/admin viewing
  const fetchPhoneNumbers = async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      let path = Apis.a2pNumbers
      const targetUserId = getTargetUserId()
      if (targetUserId) {
        path = path + '?userId=' + targetUserId
      }

      const response = await axios.get(path, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setPhoneNumbers(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedPhoneNumber(response.data.data[0].id)
          setSelectedPhoneNumberObj(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error)
    }
  }

  // Fetch email accounts (for current user or for selected subaccount when agency/admin viewing)
  const fetchEmailAccounts = async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const targetUserId = getTargetUserId()

      let apiUrl = Apis.gmailAccount
      if (targetUserId) {
        apiUrl += `?userId=${targetUserId}`
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setEmailAccounts(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedEmailAccount(response.data.data[0].id)
          setSelectedEmailAccountObj(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching email accounts:', error)
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
        // Remove from local state
        const updatedAccounts = emailAccounts.filter((a) => a.id !== accountToDelete.id)
        setEmailAccounts(updatedAccounts)

        // If deleted account was selected, select first available account or clear selection
        if (selectedEmailAccount === accountToDelete.id.toString()) {
          if (updatedAccounts.length > 0) {
            setSelectedEmailAccount(updatedAccounts[0].id.toString())
            setSelectedEmailAccountObj(updatedAccounts[0])
          } else {
            setSelectedEmailAccount(null)
            setSelectedEmailAccountObj(null)
          }
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

  // Get selected user for AuthSelectionPopup
  const getSelectedUser = () => {
    try {
      const selectedUserData = localStorage.getItem('selectedUser')
      if (selectedUserData && selectedUserData !== 'undefined') {
        return JSON.parse(selectedUserData)
      }
      const user = getUserLocalData()
      return user?.user || null
    } catch (error) {
      console.error('Error getting selected user:', error)
      return null
    }
  }

  // Search leads with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!searchQuery.trim()) {
      setFilteredLeads([])
      // Don't hide the list if user is actively searching - only hide if completely empty
      if (selectedLeads.length === 0) {
        setShowLeadList(false)
      }
      return
    }

    // Show list when user starts typing
    setShowLeadList(true)

    // Debounce search - wait 300ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      searchLeads(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, selectedLeads.length])

  // Get user data from localStorage
  useEffect(() => {
    const user = getUserLocalData()
    if (user) {
      setUserData(user)
    }
  }, [open])

  // Keep focus on Variables search input when query changes (prevents MUI Menu from stealing focus on backspace/typing)
  useEffect(() => {
    const id = setTimeout(() => {
      smsVariableSearchInputRef.current?.focus()
    }, 0)
    return () => clearTimeout(id)
  }, [smsVariableSearchQuery])

  useEffect(() => {
    const id = setTimeout(() => {
      subjectVariableSearchInputRef.current?.focus()
    }, 0)
    return () => clearTimeout(id)
  }, [subjectVariableSearchQuery])

  useEffect(() => {
    const id = setTimeout(() => {
      variableSearchInputRef.current?.focus()
    }, 0)
    return () => clearTimeout(id)
  }, [variableSearchQuery])

  // Fetch unique columns for variables (for current user or selected subaccount when agency/admin viewing)
  const fetchUniqueColumns = async () => {
    try {
      const user = getUserLocalData()
      const userId = getTargetUserId() || user?.user?.id
      const defaultColumns = [
        '{First Name}',
        '{Last Name}',
        '{Email}',
        '{Phone}',
        '{Address}',
      ]

      const bookingVariables = [
        '{Appointment DateTime}',
        '{Timezone}',
        '{Duration}',
        '{Meeting Location}',
      ]

      let res = await getUniquesColumn(userId)

      let columns
      if (res && Array.isArray(res)) {
        columns = [
          ...defaultColumns,
          ...res.filter((col) => !defaultColumns.includes(col)),
        ]
      } else {
        columns = [...defaultColumns]
      }

      if (isBookingStage) {
        columns = [
          ...columns,
          ...bookingVariables.filter((col) => !columns.includes(col)),
        ]
      }

      setUniqueColumns(columns)
    } catch (error) {
      console.error('Error fetching unique columns:', error)
      const fallback = [
        '{First Name}',
        '{Last Name}',
        '{Email}',
        '{Phone}',
        '{Address}',
      ]
      if (isBookingStage) {
        fallback.push('{Appointment DateTime}', '{Timezone}', '{Duration}', '{Meeting Location}')
      }
      setUniqueColumns(fallback)
    }
  }

  // Fetch templates (for current user or for selected subaccount when agency/admin viewing)
  const fetchTemplates = async () => {
    if (selectedMode !== 'email' && selectedMode !== 'sms') return

    try {
      setTemplatesLoading(true)
      const user = getUserLocalData()
      const userId = getTargetUserId() || user?.user?.id
      const communicationType = selectedMode === 'email' ? 'email' : 'sms'

      const templatesData = await getTempletes(communicationType, userId)
      if (templatesData && Array.isArray(templatesData)) {
        setTemplates(templatesData)
      } else {
        setTemplates([])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }

  // Handle template selection
  const handleTemplateSelect = async (template) => {
    if (!template) {
      setSelectedTemplate(null)
      return
    }

    // Set the selected template
    setSelectedTemplate(template)

    try {
      // Fetch full template details (for current user or selected subaccount when agency/admin viewing)
      const user = getUserLocalData()
      const userId = getTargetUserId() || user?.user?.id
      const details = await getTempleteDetails(template, userId)

      if (details) {
        if (selectedMode === 'email') {
          // Populate email fields
          setEmailSubject(details.subject || '')
          setEmailMessageBody(details.content || '')

          // Handle CC/BCC if they exist
          if (details.ccEmails && Array.isArray(details.ccEmails) && details.ccEmails.length > 0) {
            setCcEmails(details.ccEmails)
          }
          if (details.bccEmails && Array.isArray(details.bccEmails) && details.bccEmails.length > 0) {
            setBccEmails(details.bccEmails)
          }
        } else if (selectedMode === 'sms') {
          // Populate SMS body
          const smsContent = details.content || ''
          // Strip HTML if present and limit to SMS character limit
          const plainText = stripHTML(smsContent)
          setSmsMessageBody(plainText.substring(0, SMS_CHAR_LIMIT))
        }
      } else {
        // Fallback to template object directly
        if (selectedMode === 'email') {
          setEmailSubject(template.subject || '')
          setEmailMessageBody(template.content || '')
        } else if (selectedMode === 'sms') {
          const plainText = stripHTML(template.content || '')
          setSmsMessageBody(plainText.substring(0, SMS_CHAR_LIMIT))
        }
      }

      setShowTemplatesDropdown(false)
    } catch (error) {
      console.error('Error loading template details:', error)
      // Fallback to template object
      if (selectedMode === 'email') {
        setEmailSubject(template.subject || '')
        setEmailMessageBody(template.content || '')
      } else if (selectedMode === 'sms') {
        const plainText = stripHTML(template.content || '')
        setSmsMessageBody(plainText.substring(0, SMS_CHAR_LIMIT))
      }
      setShowTemplatesDropdown(false)
    }
  }

  // Handle template deletion
  const handleDeleteTemplate = async (template, e) => {
    e.stopPropagation() // Prevent template selection when clicking delete


    try {
      console.log("Passign selected template is", selectedTemplate);
      // return;
      setDelTempLoader(template)
      const templatePayload = getTargetUserId() ? { ...template, selectedUser } : template
      const delTemplateResponse = await deleteTemplete(templatePayload);
      console.log("delTemplateResponse is", delTemplateResponse);
      // Remove from templates list - check both id and templateId fields
      if (delTemplateResponse?.status === true) {
        toast.success("Template deleted successfully")
        // If the deleted template was selected, clear selection
        // if (selectedTemplate && (selectedTemplate.id === template.id || selectedTemplate.templateId === template.templateId)) {
        console.log("selectedTemplate is", selectedTemplate);
        setSelectedTemplate(null)
        setTemplates((prev) => prev.filter((t) => {
          const templateId = template.id || template.templateId
          const tId = t.id || t.templateId
          return tId !== templateId
        }))
        // Clear form fields
        if (selectedMode === 'email') {
          setEmailSubject('')
          setEmailMessageBody('')
          setCcEmails([])
          setBccEmails([])
        } else {
          setSmsMessageBody('')
        }
        // }
      } else {
        toast.error(delTemplateResponse.message)
      }

      setDelTempLoader(null)


      // toast.success('Template deleted successfully')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
      setDelTempLoader(null)
    }
  }

  // Fetch templates when dropdown is opened
  useEffect(() => {
    if (showTemplatesDropdown && templates.length === 0 && !templatesLoading) {
      fetchTemplates()
    }
  }, [showTemplatesDropdown, selectedMode])

  // Handle file attachment
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const maxSizeInBytes = 10 * 1024 * 1024 // 10MB
    const maxAttachments = 5

    if (attachments.length + files.length > maxAttachments) {
      toast.error(`Maximum ${maxAttachments} attachments allowed`)
      return
    }

    const currentTotalSize = attachments.reduce(
      (total, file) => total + file.size,
      0,
    )

    const newFilesTotalSize = files.reduce(
      (total, file) => total + file.size,
      0,
    )

    if (currentTotalSize + newFilesTotalSize > maxSizeInBytes) {
      toast.error("File size can't be more than 10MB")
      return
    }

    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Initial load
  useEffect(() => {
    if (open) {
      // Don't fetch leads on initial load - wait for user to search
      if (selectedMode === 'sms') {
        fetchPhoneNumbers()
        fetchUniqueColumns() // Fetch columns for SMS variables
      } else {
        fetchEmailAccounts()
        fetchUniqueColumns()
      }
    }
  }, [open, selectedMode, isBookingStage])

  // Close dropdowns when clicking outside (but not when clicking Agentation toolbar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target?.closest?.('[data-feedback-toolbar]') ||
        event.target?.closest?.('[data-annotation-popup]') ||
        event.target?.closest?.('[data-annotation-marker]')
      ) {
        return
      }
      if (templatesDropdownRef.current && !templatesDropdownRef.current.contains(event.target)) {
        setShowTemplatesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Reset when modal closes
  // Reset saveAsTemplate when modal opens
  useEffect(() => {
    if (open) {
      // Always reset to false when modal opens
      setSaveAsTemplate(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      // Clear attachment dropdown timeout
      if (attachmentDropdownTimeoutRef.current) {
        clearTimeout(attachmentDropdownTimeoutRef.current)
        attachmentDropdownTimeoutRef.current = null
      }
      setSelectedLeads([])
      setSearchQuery('')
      setSmsMessageBody('')
      setEmailMessageBody('')
      setEmailSubject('')
      setCcEmails([])
      setBccEmails([])
      setCcInput('')
      setBccInput('')
      setShowCC(false)
      setShowBCC(false)
      setPhoneDropdownOpen(false)
      setEmailDropdownOpen(false)
      setAttachments([])
      setSelectedVariable('')
      setSelectedTemplate(null)
      setShowAttachmentDropdown(false)
      setSaveAsTemplate(false)
    }
  }, [open])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (attachmentDropdownTimeoutRef.current) {
        clearTimeout(attachmentDropdownTimeoutRef.current)
        attachmentDropdownTimeoutRef.current = null
      }
    }
  }, [])

  // Toggle lead selection
  const toggleLeadSelection = (lead) => {
    setSelectedLeads((prev) => {
      const exists = prev.find((l) => l.id === lead.id)
      if (exists) {
        // Remove lead but keep dropdown open for multi-select
        return prev.filter((l) => l.id !== lead.id)
      } else {
        // Add lead but keep dropdown open for multi-select
        return [...prev, lead]
      }
    })
  }

  // Remove lead from selection
  const removeLead = (leadId) => {
    setSelectedLeads((prev) => prev.filter((l) => l.id !== leadId))
  }

  // Handle click outside to hide lead list (but not when clicking Agentation toolbar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target?.closest?.('[data-feedback-toolbar]') ||
        event.target?.closest?.('[data-annotation-popup]') ||
        event.target?.closest?.('[data-annotation-marker]')
      ) {
        return
      }
      if (leadSearchRef.current && !leadSearchRef.current.contains(event.target)) {
        setShowLeadList(false)
        // Clear search query when closing dropdown if no leads selected
        if (selectedLeads.length === 0) {
          setSearchQuery('')
        }
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, selectedLeads.length])

  // Handle send
  const handleSend = async () => {
    console.log("editing row template id is", editingRow?.templateId)
    // return
    // Get the appropriate message body based on mode
    const messageBody = selectedMode === 'sms' ? smsMessageBody : emailMessageBody

    console.log('🚀 [handleSend] Starting send process:', {
      selectedMode,
      saveAsTemplate,
      saveAsTemplateType: typeof saveAsTemplate,
      saveAsTemplateValue: saveAsTemplate,
      messageBodyLength: messageBody?.length || 0,
      isPipelineMode,
      isLeadMode
    })

    // return

    // Pipeline mode: create/update template instead of sending
    if (isPipelineMode) {
      console.log('🔧 [Pipeline Mode] Creating template in pipeline mode')
      if (!messageBody.trim()) {
        toast.error('Please enter a message')
        return
      }
      if (selectedMode === 'email' && !emailSubject.trim()) {
        toast.error('Please enter a subject')
        return
      }
      if (selectedMode === 'sms' && !selectedPhoneNumber) {
        toast.error('Please select a phone number')
        return
      }
      if (selectedMode === 'email' && !selectedEmailAccount) {
        toast.error('Please select an email account')
        return
      }

      setSending(true)
      try {
        const user = getUserLocalData()
        const userId = selectedUser?.id || getUserIdFromUrl() || user?.user?.id


        // Generate template name from subject or use first 15 chars of body for SMS
        const actualMessageBody = selectedMode === 'sms' ? smsMessageBody : emailMessageBody
        const templateName = selectedMode === 'email'
          ? (emailSubject?.trim() || 'Email Template')
          : (actualMessageBody?.trim() ? actualMessageBody.trim().substring(0, 15) : 'SMS Template')

        // Helper: check if current form content is unchanged from a template (for "attach only" case)
        const isContentUnchangedFromTemplate = (tpl) => {
          if (!tpl) return false
          if (selectedMode === 'email') {
            const subjectSame = (emailSubject || '').trim() === (tpl.subject || '').trim()
            const bodySame = (actualMessageBody || '').trim() === (tpl.content || '').trim()
            const ccParsed = Array.isArray(tpl.ccEmails) ? tpl.ccEmails : (typeof tpl.ccEmails === 'string' ? (() => { try { return JSON.parse(tpl.ccEmails || '[]') } catch { return [] } })() : [])
            const bccParsed = Array.isArray(tpl.bccEmails) ? tpl.bccEmails : (typeof tpl.bccEmails === 'string' ? (() => { try { return JSON.parse(tpl.bccEmails || '[]') } catch { return [] } })() : [])
            const ccSame = JSON.stringify(ccEmails || []) === JSON.stringify(ccParsed)
            const bccSame = JSON.stringify(bccEmails || []) === JSON.stringify(bccParsed)
            return subjectSame && bodySame && ccSame && bccSame
          }
          const bodySame = (actualMessageBody || '').trim() === (typeof tpl.content === 'string' ? stripHTML(tpl.content).trim() : '').trim()
          return bodySame
        }

        // Determine templateType: when updating existing we keep 'user'; when creating new from "Update template" unchecked we use 'auto'
        const isUserTemplate = saveAsTemplate === true
        const templateTypeForNew = isUserTemplate ? 'user' : 'auto'
        const templateTypeForUpdate = 'user' // When updating existing template, always keep it user-visible

        console.log('🔧 [Pipeline Mode] Template creation:', {
          saveAsTemplate,
          isUserTemplate,
          templateName,
          actualMessageBody: actualMessageBody?.substring(0, 20),
          selectedTemplateId: selectedTemplate?.id,
          isEditing,
          editingRowTemplateId: editingRow?.templateId
        })

        let templateData = {
          communicationType: selectedMode,
          templateName: templateName,
          content: actualMessageBody || messageBody,
          templateType: templateTypeForNew,
        }

        // Add email-specific fields
        if (selectedMode === 'email') {
          templateData.subject = emailSubject
          templateData.ccEmails = ccEmails
          templateData.bccEmails = bccEmails
          templateData.attachments = attachments
        }

        // Add SMS-specific fields
        if (selectedMode === 'sms') {
          const phoneObj = phoneNumbers.find((p) => p.id === parseInt(selectedPhoneNumber))
          templateData.phone = phoneObj?.phone || ''
        }

        // Add userId if provided
        if (userId) {
          templateData.userId = userId
        }

        let response = null
        let isUpdating = false
        let attachOnlyTemplateId = null // When true, we skip API and use this template id for the row

        // --- Selected an existing template from dropdown ---
        if (selectedTemplate && selectedTemplate.id) {
          console.log("Api trigering for selected template id is", selectedTemplate.id)
          if (saveAsTemplate) {
            // 2) Update template checked: update existing template, keep templateType = 'user'
            isUpdating = true
            templateData.templateType = templateTypeForUpdate
            console.log('🔧 [Pipeline Mode] Updating selected template (Update template checked), templateType=user')
            response = await updateTemplete(templateData, selectedTemplate.id)
          } else if (isContentUnchangedFromTemplate(selectedTemplate)) {
            // 1) No changes: just attach template to cadence row (no API call)
            attachOnlyTemplateId = selectedTemplate.id
            console.log('🔧 [Pipeline Mode] Attach only: using selected template id', attachOnlyTemplateId)
          } else {
            // 3) Update template unchecked but content changed: create new template with templateType = 'auto'
            isUpdating = false
            templateData.templateType = 'auto'
            console.log('🔧 [Pipeline Mode] Creating new template (content changed, Update template unchecked), templateType=auto')
            response = await createTemplete(templateData)
          }
        }
        // --- Editing existing cadence row (no template selected from dropdown, or row had a template) ---
        else if (isEditing && editingRow?.templateId && !IsdefaultCadence) {
          console.log("Api trigering for editing row template id is", editingRow.templateId)
          if (saveAsTemplate) {
            // Update existing row's template, keep templateType = 'user'
            isUpdating = true
            templateData.templateType = templateTypeForUpdate
            console.log('🔧 [Pipeline Mode] Updating existing row template (Update template checked), templateType=user')
            response = await updateTemplete(templateData, editingRow.templateId)
          } else if (selectedTemplate && isContentUnchangedFromTemplate(selectedTemplate)) {
            attachOnlyTemplateId = selectedTemplate.id
            console.log('🔧 [Pipeline Mode] Attach only (editing row): using template id', attachOnlyTemplateId)
          } else {
            // Create new template with templateType = 'auto' and attach to row
            isUpdating = false
            templateData.templateType = 'auto'
            console.log('🔧 [Pipeline Mode] Creating new template for edited row (Update template unchecked), templateType=auto')
            response = await createTemplete(templateData)
          }
        }
        // --- New row or default cadence: create template ---
        else {
          console.log("Api trigering for creating new template")
          isUpdating = false
          templateData.templateType = templateTypeForNew
          console.log('🔧 [Pipeline Mode] Creating new template, templateType=', templateData.templateType)
          response = await createTemplete(templateData)
        }

        if (attachOnlyTemplateId !== null || response?.data?.status === true) {
          // Resolve template id: attach-only uses selected template id; otherwise use API response
          const createdTemplate = attachOnlyTemplateId !== null
            ? { id: attachOnlyTemplateId }
            : response?.data?.data
          const templateId = createdTemplate?.id
          let message = ''
          if (attachOnlyTemplateId !== null) {
            message = 'Template attached to stage'
          } else if (!saveAsTemplate) {
            if (isUpdating) {
              message = `${selectedMode[0].toUpperCase() + selectedMode.slice(1)} updated successfully`
            } else {
              message = `${selectedMode[0].toUpperCase() + selectedMode.slice(1)} created successfully`
            }
          } else {
            message = response?.data?.message || 'Template saved successfully'
          }
          toast.success(message || response?.data?.message)

          // Call onSaveTemplate with template data for pipeline
          if (onSaveTemplate && templateId) {
            const pipelineData = {
              templateId,
              communicationType: selectedMode,
            }
            if (selectedMode === 'email') {
              pipelineData.emailAccountId = selectedEmailAccount
            } else if (selectedMode === 'sms') {
              pipelineData.smsPhoneNumberId = selectedPhoneNumber
              const phoneObj = phoneNumbers.find((p) => p.id === parseInt(selectedPhoneNumber))
              pipelineData.phone = phoneObj
            }
            onSaveTemplate(pipelineData)
          }

          // Close modal
          setTimeout(() => {
            onClose()
          }, 500)
        } else {
          toast.error(response?.data?.message || 'Failed to save template')
        }
      } catch (error) {
        console.error('Error saving template:', error)
        toast.error('An error occurred while saving the template')
      } finally {
        setSending(false)
      }
      return

    } else if (isLeadMode) {
      console.log('👤 [Lead Mode] Starting lead mode send:', {
        saveAsTemplate,
        saveAsTemplateType: typeof saveAsTemplate,
        selectedMode,
        messageBodyLength: messageBody?.length || 0
      })

      // Validation
      if (!messageBody.trim()) {
        toast.error('Please enter a message')
        return
      }
      if (selectedMode === 'email' && !emailSubject.trim()) {
        toast.error('Please enter a subject')
        return
      }
      if (selectedMode === 'sms' && !selectedPhoneNumber) {
        toast.error('Please select a phone number')
        return
      }
      if (selectedMode === 'email' && !selectedEmailAccount) {
        toast.error('Please select an email account')
        return
      }

      setSending(true)
      try {
        // Prepare message data
        let data = null

        if (selectedMode === 'sms') {
          // Backend requires smsPhoneNumberId (A2P From number record id)
          const smsFromId = selectedPhoneNumberObj?.id ?? selectedPhoneNumber
          data = {
            content: messageBody,
            phone: selectedPhoneNumber,
            smsPhoneNumberId: smsFromId,
            mode: selectedMode,
          }
        } else if (selectedMode === 'email') {
          data = {
            subject: emailSubject,
            content: messageBody, // Use 'content' not 'body' to match sendEmailToLead
            ccEmails: ccEmails,
            bccEmails: bccEmails,
            attachments: attachments,
            gmailAccountId: selectedEmailAccountObj?.id || selectedEmailAccount,
            mode: selectedMode,
          }
        }

        // Send message
        if (onSend && data) {
          await onSend(data)
        }

        // Always create template - type depends on "Save as template" checkbox
        console.log('✅ [Lead Mode] Reached template creation section')
        try {
          const user = getUserLocalData()
          const userId = user?.user?.id
          console.log('✅ [Lead Mode] Got user data, userId:', userId)

          // Get the actual message body - use state directly to ensure we have the value
          const actualMessageBody = selectedMode === 'sms' ? smsMessageBody : emailMessageBody

          // Generate template name from subject or use first 15 chars of body for SMS
          const templateName = selectedMode === 'email'
            ? (emailSubject?.trim() || 'Email Template')
            : (actualMessageBody?.trim() ? actualMessageBody.trim().substring(0, 15) : 'SMS Template')

          // Ensure saveAsTemplate is explicitly a boolean
          // Only set to 'user' if checkbox is explicitly checked (true)
          // Default to 'auto' if checkbox is false, undefined, null, or any other value
          const isUserTemplate = saveAsTemplate === true
          const templateTypeValue = isUserTemplate ? 'user' : 'auto'

          console.log('📝 [Lead Mode] Creating template - Debug:', {
            saveAsTemplate,
            saveAsTemplateType: typeof saveAsTemplate,
            saveAsTemplateValue: saveAsTemplate,
            isUserTemplate,
            templateTypeValue,
            communicationType: selectedMode,
            messageBody: messageBody,
            actualMessageBody: actualMessageBody,
            smsMessageBody: smsMessageBody,
            emailMessageBody: emailMessageBody,
            templateName: templateName,
            templateNameLength: templateName?.length
          })

          let templateData = {
            communicationType: selectedMode,
            templateName: templateName,
            content: actualMessageBody || messageBody, // Use actualMessageBody first, fallback to messageBody
            templateType: templateTypeValue, // Explicitly set to 'auto' unless checkbox is checked
          }

          // Add email-specific fields
          if (selectedMode === 'email') {
            templateData.subject = emailSubject
            templateData.ccEmails = ccEmails
            templateData.bccEmails = bccEmails
            templateData.attachments = attachments
            templateData.emailAccountId = selectedEmailAccount
          }

          // Add SMS-specific fields
          if (selectedMode === 'sms') {
            templateData.smsPhoneNumberId = selectedPhoneNumber
          }

          // Add userId if provided
          if (userId) {
            templateData.userId = userId
          }

          console.log('📤 [Lead Mode] About to call createTemplete API with:', {
            templateData: JSON.stringify(templateData, null, 2),
            saveAsTemplate,
            templateType: templateData.templateType
          })

          console.log("Api trigering for createTemplete API Lead mode")

          const response = await createTemplete(templateData)

          console.log('📥 [Lead Mode] createTemplete API response:', {
            status: response?.data?.status,
            message: response?.data?.message,
            templateId: response?.data?.data?.id,
            templateType: response?.data?.data?.templateType
          })

          if (response?.data?.status === true && saveAsTemplate) {
            toast.success('Template created successfully')
          }
        } catch (error) {
          console.error('Error creating template:', error)
          // Don't show error toast as message was already sent
        }

        // Note: Modal closing is handled by sendEmailToLead/sendSMSToLead functions
      } catch (error) {
        console.error('Error preparing message data:', error)
        toast.error('An error occurred while preparing the message')
      } finally {
        setSending(false)
      }
      return
    }

    // Normal send mode (original functionality)
    if (selectedLeads.length === 0 || !messageBody.trim()) return
    if (selectedMode === 'email' && !emailSubject.trim()) return
    if (selectedMode === 'sms' && !selectedPhoneNumber) {
      toast.error('Please select a From number to send SMS')
      return
    }

    setSending(true)
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      // Use phone record id (backend requires A2P verified From number)
      const smsFromId = selectedPhoneNumberObj?.id ?? selectedPhoneNumber

      // Send to each lead individually
      const sendPromises = selectedLeads.map(async (lead) => {
        if (selectedMode === 'sms') {
          // Send SMS
          const response = await axios.post(
            Apis.sendSMSToLead,
            {
              leadId: lead.id,
              content: messageBody,
              smsPhoneNumberId: smsFromId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )
          return response.data
        } else {
          // Send Email
          if (!selectedEmailAccount) {
            return {
              status: false,
              message: 'Please select an email account',
            }
          }

          // Use CC and BCC email arrays directly

          // Use FormData to match the API expectations (even without attachments)
          const formData = new FormData()
          formData.append('leadId', lead.id)
          formData.append('subject', emailSubject)
          formData.append('body', messageMarkdownToHtml(messageBody))
          formData.append('emailAccountId', selectedEmailAccount)

          if (ccEmails.length > 0) {
            formData.append('cc', ccEmails.join(','))
          }

          if (bccEmails.length > 0) {
            formData.append('bcc', bccEmails.join(','))
          }

          // Add attachments if any
          if (attachments && attachments.length > 0) {
            attachments.forEach((file) => {
              formData.append('attachments', file)
            })
          }

          const response = await axios.post(Apis.sendEmailToLead, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          })

          return response.data
        }
      })

      const results = await Promise.all(sendPromises)
      const successCount = results.filter((r) => r?.status).length
      const failedCount = selectedLeads.length - successCount

      // Show success/error toast
      if (successCount === selectedLeads.length) {
        // All messages sent successfully
        toast.success(
          `Message${selectedLeads.length > 1 ? 's' : ''} sent successfully to ${successCount} lead${successCount > 1 ? 's' : ''}`
        )
      } else if (successCount > 0) {
        // Partial success
        toast.warning(
          `Sent to ${successCount} of ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''}${failedCount > 0 ? `. ${failedCount} failed.` : ''}`
        )
      } else {
        // All failed
        toast.error('Failed to send messages. Please try again.')
      }

      if (onSend) {
        onSend({
          success: successCount === selectedLeads.length,
          sent: successCount,
          total: selectedLeads.length,
        })
      }

      // Always create template - type depends on "Save as template" checkbox
      if (successCount > 0) {
        console.log('✅ [Normal Send Mode] Reached template creation section')
        console.log('📋 [Normal Send Mode] About to create template:', {
          successCount,
          saveAsTemplate,
          saveAsTemplateType: typeof saveAsTemplate,
          selectedMode
        })

        try {
          const user = getUserLocalData()
          const userId = user?.user?.id
          console.log('✅ [Normal Send Mode] Got user data, userId:', userId)

          // Generate template name from subject or use first 15 chars of body for SMS
          // Get the actual message body - use state directly to ensure we have the value
          const actualMessageBody = selectedMode === 'sms' ? smsMessageBody : emailMessageBody

          // Generate template name from subject or use first 15 chars of body for SMS
          const templateName = selectedMode === 'email'
            ? (emailSubject?.trim() || 'Email Template')
            : (actualMessageBody?.trim() ? actualMessageBody.trim().substring(0, 15) : 'SMS Template')

          // Ensure saveAsTemplate is explicitly a boolean
          // Only set to 'user' if checkbox is explicitly checked (true)
          // Default to 'auto' if checkbox is false, undefined, null, or any other value
          const isUserTemplate = saveAsTemplate === true
          const templateTypeValue = isUserTemplate ? 'user' : 'auto'

          console.log('📝 [Normal Send Mode] Creating template - Debug:', {
            saveAsTemplate,
            saveAsTemplateType: typeof saveAsTemplate,
            saveAsTemplateValue: saveAsTemplate,
            isUserTemplate,
            templateTypeValue,
            communicationType: selectedMode,
            messageBody: messageBody,
            actualMessageBody: actualMessageBody,
            smsMessageBody: smsMessageBody,
            emailMessageBody: emailMessageBody,
            templateName: templateName,
            templateNameLength: templateName?.length
          })

          let templateData = {
            communicationType: selectedMode,
            templateName: templateName,
            content: actualMessageBody || messageBody, // Use actualMessageBody first, fallback to messageBody
            templateType: templateTypeValue, // Explicitly set to 'auto' unless checkbox is checked
            content: actualMessageBody || messageBody, // Use actualMessageBody first, fallback to messageBody
            templateType: templateTypeValue, // Explicitly set to 'auto' unless checkbox is checked
          }

          // Add email-specific fields
          if (selectedMode === 'email') {
            templateData.subject = emailSubject
            templateData.ccEmails = ccEmails
            templateData.bccEmails = bccEmails
            templateData.attachments = attachments
            templateData.emailAccountId = selectedEmailAccount
          }

          // Add SMS-specific fields
          if (selectedMode === 'sms') {
            templateData.smsPhoneNumberId = selectedPhoneNumber
          }

          // Add userId if provided
          if (userId) {
            templateData.userId = userId
          }

          console.log('📤 [Normal Send Mode] About to call createTemplete API with:', {
            templateData: JSON.stringify(templateData, null, 2),
            saveAsTemplate,
            templateType: templateData.templateType
          })

          console.log("Api trigering for createTemplete API Normal template mode")

          const response = await createTemplete(templateData)

          console.log('📥 [Normal Send Mode] createTemplete API response:', {
            status: response?.data?.status,
            message: response?.data?.message,
            templateId: response?.data?.data?.id,
            templateType: response?.data?.data?.templateType,
            fullResponse: response?.data
          })

          if (response?.data?.status === true && saveAsTemplate) {
            // toast.success('Template created successfully')
          }
        } catch (error) {
          console.error('❌ [Normal Send Mode] Error creating template:', error)
          // Don't show error toast as message was already sent
        }
      }

      // Close modal after a brief delay to show success (only if at least one succeeded)
      if (successCount > 0) {
        setTimeout(() => {
          onClose()
        }, 500)
      }
    } catch (error) {
      console.error('Error sending messages:', error)
      toast.error('An error occurred while sending messages. Please try again.')
    } finally {
      setSending(false)
    }
  }


  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="new-message-modal"
        aria-describedby="new-message-description"
        slotProps={{
          root: {
            style: { zIndex: modalZIndex },
          },
        }}
        sx={{
          zIndex: modalZIndex,
        }}
        BackdropProps={{
          sx: {
            zIndex: modalZIndex,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '600px', lg: '700px' },
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: 24,
            zIndex: modalZIndex + 1,
            p: 0,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="w-full p-4 border-b flex flex-row items-center justify-between h-[65px]" style={{ borderBottom: '1px solid #eaeaea' }}>
            <h2 className="text-xl font-semibold">{isPipelineMode && isEditing ? 'Update Message ' : 'New Message'}</h2>
            <CloseBtn onClick={onClose} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-visible w-full px-3 py-3 flex flex-col gap-1" style={{ position: 'relative' }}>
            {/* Mode Tabs */}
            <div className="flex items-center justify-between border-b m-0 gap-1 py-1">
              <ToggleGroupCN
                options={[
                  { label: 'Text', value: 'sms', icon: MessageSquareDot },
                  { label: 'Email', value: 'email', icon: Mail },
                ]}
                value={selectedMode}
                onChange={(value) => {
                  setSelectedMode(value)
                  if (value === 'sms' && canSendSMS) {
                    fetchPhoneNumbers()
                  } else if (value === 'email') {
                    fetchEmailAccounts()
                  }
                }}
              />
              {/* CC and BCC buttons for Email mode - on top right */}
              {selectedMode === 'email' && hasEmailAccess && (
                <SplitButtonCN
                  buttons={[
                    {
                      label: 'Cc',
                      isSelected: showCC,
                      onClick: () => setShowCC(!showCC),
                    },
                    {
                      label: 'Bcc',
                      isSelected: showBCC,
                      onClick: () => setShowBCC(!showBCC),
                    },
                  ]}
                />
              )}
            </div>

            {
              (!hasSmsAccess && selectedMode === 'sms') || (!hasEmailAccess && selectedMode === 'email')

                ? (
                  <>
                    <UpgardView title={selectedMode === 'sms' ? "Unlock Text Messages" : "Unlock Email Messages"}
                      subTitle={selectedMode === 'sms' ? "Upgrade to unlock this feature and start sending SMS messages to your leads." : "Upgrade to unlock this feature and start sending emails to your leads."}
                      userData={reduxUser} onUpgradeSuccess={(updatedUserData) => {
                        if (updatedUserData) {
                          setReduxUser({ user: updatedUserData })
                        }
                      }}

                    />
                  </>

                ) : (
                  <>

                    <React.Fragment>
                      {/* From and To Fields - Same Line */}
                      <div className={`flex items-center gap-4 ${isPipelineMode ? '' : ''}`} ref={leadSearchRef}>
                        {/* From Field */}
                        <div className={isPipelineMode ? "w-full flex-1 relative" : "flex-1 relative w-full"} style={{ flexBasis: 0 }}>
                          {selectedMode === 'sms' ? (
                            <>
                              <button
                                ref={phoneAnchorRef}
                                type="button"
                                onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                                className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary bg-white text-left flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-sm text-gray-500 flex-shrink-0">From:</span>
                                  <span className="text-sm text-gray-700 truncate">
                                    {selectedPhoneNumber
                                      ? phoneNumbers.find((p) => p.id === parseInt(selectedPhoneNumber))?.phone || 'Select number'
                                      : 'Select number'}
                                  </span>
                                </div>
                                <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </button>
                              <Popover
                                open={phoneDropdownOpen}
                                onClose={() => setPhoneDropdownOpen(false)}
                                anchorEl={phoneAnchorRef.current}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                slotProps={{
                                  root: {
                                    style: { zIndex: modalZIndex + 100 },
                                  },
                                }}
                                sx={{ zIndex: modalZIndex + 100 }}
                                disableScrollLock
                                PaperProps={{
                                  style: {
                                    minWidth: 240,
                                    width: phoneAnchorRef.current?.offsetWidth ?? 280,
                                    maxHeight: 320,
                                    marginTop: 4,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    zIndex: modalZIndex + 100,
                                  },
                                }}
                              >
                                {phoneNumbers.length === 0 ? (
                                  <div className="p-3 flex flex-row gap-2 items-center justify-center">
                                    <button
                                      onClick={() => {
                                        router.push('/dashboard/myAccount?tab=5')
                                        setPhoneDropdownOpen(false)
                                      }}
                                      className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                      Select Phone Number
                                    </button>
                                    {phoneNumbers.length === 0 && (
                                      <Tooltip
                                        title="You need to complete A2P to text"
                                        placement="top"
                                        arrow
                                        componentsProps={{
                                          tooltip: {
                                            sx: {
                                              backgroundColor: '#ffffff',
                                              color: '#333',
                                              fontSize: '14px',
                                              padding: '10px 15px',
                                              borderRadius: '8px',
                                              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                            },
                                          },
                                          arrow: { sx: { color: '#ffffff' } },
                                        }}
                                      >
                                        <div className="flex items-center justify-center">
                                          <Image src="/otherAssets/redInfoIcon.png" height={16} width={16} alt="*" />
                                        </div>
                                      </Tooltip>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 240 }}>
                                      {phoneNumbers.map((phone) => (
                                        <button
                                          key={phone.id}
                                          type="button"
                                          onClick={() => {
                                            const phoneObj = phoneNumbers.find((p) => p.id === phone.id)
                                            setSelectedPhoneNumber(phone.id.toString())
                                            setSelectedPhoneNumberObj(phoneObj)
                                            setPhoneDropdownOpen(false)
                                          }}
                                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${selectedPhoneNumber === phone.id.toString() ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'}`}
                                        >
                                          {phone.phone}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="border-t border-gray-200 p-2 flex-shrink-0">
                                      <button
                                        onClick={() => {
                                          router.push('/dashboard/myAccount?tab=7')
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
                              </Popover>
                            </>
                          ) : (
                            <div className="flex-1 relative min-w-0" style={{ flexBasis: 0 }}>
                              {emailAccounts.length === 0 ? (

                                <div className="flex flex-row gap-2 items-center justify-center">
                                  <button
                                    onClick={() => setShowAuthSelectionPopup(true)}
                                    className="w-full whitespace-nowrap px-3 py-2 h-[42px] border rounded-[8px] text-brand-primary hover:bg-brand-primary/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                    style={{ borderColor: '#E2E8F0', borderWidth: '1px', height: '42px' }}

                                  >
                                    Connect Email
                                  </button>
                                  {
                                    (!reduxUser?.planCapabilities?.allowEmails
                                    ) && (
                                      <UpgradeTagWithModal
                                        reduxUser={reduxUser}
                                        setReduxUser={setReduxUser}
                                      />
                                    )
                                  }
                                </div>
                              ) : (
                                <>
                                  <button
                                    ref={emailAnchorRef}
                                    type="button"
                                    onClick={() => setEmailDropdownOpen(!emailDropdownOpen)}
                                    className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary bg-white text-left flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="text-sm text-gray-500 flex-shrink-0">From:</span>
                                      <span className="text-sm truncate">
                                        {selectedEmailAccount
                                          ? (() => {
                                            const account = emailAccounts.find((a) => a.id === parseInt(selectedEmailAccount))
                                            if (!account) return <span className="text-gray-500">Select email account</span>
                                            const providerLabel = account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider || ''
                                            return <span className="text-gray-700">{account.email || account.name || account.displayName}{providerLabel ? ` (${providerLabel})` : ''}</span>
                                          })()
                                          : <span className="text-gray-500">Select email account</span>}
                                      </span>
                                    </div>
                                    <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  </button>
                                  <Popover
                                    open={emailDropdownOpen}
                                    onClose={() => setEmailDropdownOpen(false)}
                                    anchorEl={emailAnchorRef.current}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    slotProps={{
                                      root: {
                                        style: { zIndex: modalZIndex + 100 },
                                      },
                                    }}
                                    sx={{ zIndex: modalZIndex + 100 }}
                                    disableScrollLock
                                    PaperProps={{
                                      style: {
                                        minWidth: 240,
                                        width: emailAnchorRef.current?.offsetWidth ?? 280,
                                        maxHeight: 320,
                                        marginTop: 4,
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        zIndex: modalZIndex + 100,
                                      },
                                    }}
                                  >
                                    <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 240 }}>
                                      {emailAccounts.map((account) => {
                                        const gmailError = getGmailWatchErrorInfo(account)
                                        return (
                                        <div key={account.id} className="group relative w-full">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const accountObj = emailAccounts.find((a) => a.id === account.id)
                                              setSelectedEmailAccount(account.id.toString())
                                              setSelectedEmailAccountObj(accountObj)
                                              setEmailDropdownOpen(false)
                                            }}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${selectedEmailAccount === account.id.toString() ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'}`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span>{account.email || account.name || account.displayName}</span>
                                              <div className="flex items-center gap-2">
                                                {account.provider && (
                                                  <span className="text-xs text-gray-500">
                                                    {account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider}
                                                  </span>
                                                )}
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
                                          {gmailError && (
                                            <div className="px-3 pb-1.5 text-xs text-amber-700 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-2 flex-wrap" title={gmailError.actionHint}>
                                              <span>{gmailError.shortLabel} —</span>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setShowAuthSelectionPopup(true)
                                                  setEmailDropdownOpen(false)
                                                }}
                                                className="font-semibold text-amber-800 hover:text-amber-900 underline focus:outline-none focus:ring-0"
                                              >
                                                Reconnect
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        )
                                      })}
                                    </div>
                                    <div className="border-t border-gray-200 p-2 flex-shrink-0">
                                      <button
                                        onClick={() => {
                                          setShowAuthSelectionPopup(true)
                                          setEmailDropdownOpen(false)
                                        }}
                                        className="w-full px-3 whitespace-nowrap py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Plus className="w-4 h-4" />
                                        Connect Email
                                      </button>
                                    </div>
                                  </Popover>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* To Field - Hidden in pipeline mode and lead mode */}
                        {!isPipelineMode && !isLeadMode && (
                          <div className="relative flex-1 min-w-0" style={{ flexBasis: 0 }}>
                            {/* Tag Input Container */}
                            <div
                              className="flex items-center gap-2 px-3 h-[42px] border rounded-[8px] focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary cursor-text overflow-hidden bg-white"
                              style={{ borderColor: '#E2E8F0', borderWidth: '1px', height: '42px', minHeight: '42px', maxWidth: '100%' }}

                              onClick={() => {
                                setShowLeadList(true)
                              }}
                            >
                              <span className="text-sm text-gray-500 flex-shrink-0">To:</span>
                              {/* Display first selected lead and badge if multiple */}
                              {selectedLeads.length > 0 ? (
                                <>
                                  {/* Search Input - Always visible for adding more */}
                                  <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      setSearchQuery(value)
                                      setShowLeadList(true)
                                    }}
                                    onFocus={() => {
                                      setShowLeadList(true)
                                    }}
                                    placeholder=""
                                    className="flex-1 min-w-[80px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                                    style={{
                                      height: '100%',
                                      lineHeight: '42px',
                                      padding: 0,
                                      verticalAlign: 'middle',
                                      maxWidth: '100%'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        setShowLeadList(false)
                                      }
                                    }}
                                  />
                                  <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                                    <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                      {selectedMode === 'email'
                                        ? (selectedLeads[0].email || `${selectedLeads[0].firstName || ''} ${selectedLeads[0].lastName || ''}`.trim() || 'Lead')
                                        : (selectedLeads[0].phone || `${selectedLeads[0].firstName || ''} ${selectedLeads[0].lastName || ''}`.trim() || 'Lead')
                                      }
                                    </span>
                                    {selectedLeads.length > 1 && (
                                      <span className="px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full flex-shrink-0">
                                        +{selectedLeads.length - 1}
                                      </span>
                                    )}
                                  </div>

                                </>
                              ) : (
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setSearchQuery(value)
                                    setShowLeadList(true)
                                  }}
                                  onFocus={() => {
                                    setShowLeadList(true)
                                  }}
                                  placeholder="Search leads"
                                  className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                                  style={{
                                    height: '100%',
                                    lineHeight: '42px',
                                    padding: 0,
                                    verticalAlign: 'middle',
                                    maxWidth: '100%'
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setShowLeadList(false)
                                    }
                                  }}
                                />
                              )}
                              <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" />
                            </div>

                            {/* Leads List Dropdown - Show when searching or when clicking on field */}
                            {showLeadList && (
                              <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto overflow-x-hidden" style={{ zIndex: 1900 }}>
                                {loading ? (
                                  <div className="p-4 text-center">
                                    <CircularProgress size={24} />
                                  </div>
                                ) : !searchQuery.trim() ? (
                                  <div className="p-4 text-center text-gray-500 text-sm">
                                    Start typing to search leads...
                                  </div>
                                ) : filteredLeads.length === 0 ? (
                                  <div className="p-4 text-center text-gray-500 text-sm">
                                    No leads found
                                  </div>
                                ) : (
                                  filteredLeads.map((lead) => {
                                    const isSelected = selectedLeads.find((l) => l.id === lead.id)
                                    return (
                                      <div
                                        key={lead.id}
                                        onClick={() => toggleLeadSelection(lead)}
                                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-gray-100' : ''
                                          }`}
                                      >
                                        <div className="flex items-center justify-between gap-2 min-w-0">
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 truncate">
                                              {lead.firstName || lead.name || 'Unknown'} {lead.lastName || ''}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                              {selectedMode === 'email'
                                                ? lead.email || 'No email'
                                                : lead.phone || 'No phone'}
                                            </div>
                                          </div>
                                          {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                                              <Check size={14} className="text-white" />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </React.Fragment>

                    {/* Email Fields */}
                    {selectedMode === 'email' && (
                      <>
                        {/* CC and BCC on same line when both are shown */}
                        {(showCC || showBCC) && (
                          <div className="flex items-center gap-4">
                            {showCC && (
                              <div className="relative flex-1 min-w-0">
                                {/* Tag Input Container */}
                                <div
                                  className="flex items-center gap-2 px-3 h-[42px] border rounded-[8px] focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary cursor-text overflow-hidden bg-white"
                                  style={{ borderColor: '#E2E8F0', borderWidth: '1px', height: '42px', minHeight: '42px', maxWidth: '100%' }}

                                  onClick={() => {
                                    // Focus the input when clicking the container
                                    const input = document.querySelector('#cc-input')
                                    if (input) input.focus()
                                  }}
                                >
                                  <span className="text-sm text-gray-500 flex-shrink-0">Cc:</span>
                                  {/* Display CC Email Tags */}
                                  {ccEmails.length > 0 ? (
                                    <>
                                      {/* Search Input - Always visible for adding more */}
                                      <input
                                        id="cc-input"
                                        type="text"
                                        value={ccInput}
                                        onChange={handleCcInputChange}
                                        onKeyDown={handleCcInputKeyDown}
                                        onPaste={handleCcInputPaste}
                                        onBlur={handleCcInputBlur}
                                        placeholder=""
                                        className="flex-1 min-w-[80px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                                        style={{
                                          height: '100%',
                                          lineHeight: '42px',
                                          padding: 0,
                                          verticalAlign: 'middle',
                                          maxWidth: '100%'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                          {ccEmails[0]}
                                        </span>
                                        {ccEmails.length > 1 && (
                                          <span
                                            className="px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full flex-shrink-0 cursor-pointer hover:bg-opacity-90 transition-colors"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setEmailListPopoverAnchor(e.currentTarget)
                                              setEmailListPopoverType('cc')
                                            }}
                                          >
                                            +{ccEmails.length - 1}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <input
                                      id="cc-input"
                                      type="text"
                                      value={ccInput}
                                      onChange={handleCcInputChange}
                                      onKeyDown={handleCcInputKeyDown}
                                      onPaste={handleCcInputPaste}
                                      onBlur={handleCcInputBlur}
                                      placeholder="Add CC recipients"
                                      className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                                      style={{
                                        height: '100%',
                                        lineHeight: '42px',
                                        padding: 0,
                                        verticalAlign: 'middle',
                                        maxWidth: '100%'
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                  <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" />
                                </div>
                              </div>
                            )}
                            {showBCC && (
                              <div className="relative flex-1 min-w-0">
                                {/* Tag Input Container */}
                                <div
                                  className="flex items-center gap-2 px-3 h-[42px] border rounded-[8px] focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary cursor-text overflow-hidden bg-white"
                                  style={{ borderColor: '#E2E8F0', borderWidth: '1px', height: '42px', minHeight: '42px', maxWidth: '100%' }}

                                  onClick={() => {
                                    // Focus the input when clicking the container
                                    const input = document.querySelector('#bcc-input')
                                    if (input) input.focus()
                                  }}
                                >
                                  <span className="text-sm text-gray-500 flex-shrink-0">Bcc:</span>
                                  {/* Display BCC Email Tags */}
                                  {bccEmails.length > 0 ? (
                                    <>
                                      {/* Search Input - Always visible for adding more */}
                                      <input
                                        id="bcc-input"
                                        type="text"
                                        value={bccInput}
                                        onChange={handleBccInputChange}
                                        onKeyDown={handleBccInputKeyDown}
                                        onPaste={handleBccInputPaste}
                                        onBlur={handleBccInputBlur}
                                        placeholder=""
                                        className="flex-1 min-w-[80px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                                        style={{
                                          height: '100%',
                                          lineHeight: '42px',
                                          padding: 0,
                                          verticalAlign: 'middle',
                                          maxWidth: '100%'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                          {bccEmails[0]}
                                        </span>
                                        {bccEmails.length > 1 && (
                                          <span
                                            className="px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full flex-shrink-0 cursor-pointer hover:bg-opacity-90 transition-colors"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setEmailListPopoverAnchor(e.currentTarget)
                                              setEmailListPopoverType('bcc')
                                            }}
                                          >
                                            +{bccEmails.length - 1}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <input
                                      id="bcc-input"
                                      type="text"
                                      value={bccInput}
                                      onChange={handleBccInputChange}
                                      onKeyDown={handleBccInputKeyDown}
                                      onPaste={handleBccInputPaste}
                                      onBlur={handleBccInputBlur}
                                      placeholder="Add BCC recipients"
                                      className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                                      style={{
                                        height: '100%',
                                        lineHeight: '42px',
                                        padding: 0,
                                        verticalAlign: 'middle',
                                        maxWidth: '100%'
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                  <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          {/* Subject Field */}
                          <div
                            className="flex items-center border border-brand-primary/20 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary bg-white transition-colors overflow-hidden group/subject-field"
                            id="subject-field-group"
                          >
                            {/* Subject Input Section */}
                            <div className="flex-1 flex items-center gap-2 px-3 h-[42px]">
                              <span className="text-sm text-gray-500 flex-shrink-0">Subject:</span>
                              <input
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Enter subject"
                                className="flex-1 outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-gray-700"
                                style={{
                                  height: '100%',
                                  lineHeight: '42px',
                                  padding: 0,
                                }}
                              />
                            </div>
                            {/* Divider */}
                            {uniqueColumns && uniqueColumns.length > 0 && (
                              <div className="w-[2px] h-[42px] bg-gray-200 group-focus-within/subject-field:bg-brand-primary has-focus:bg-brand-primary transition-colors flex-shrink-0"></div>
                            )}
                            {/* Variables dropdown for subject */}
                            {uniqueColumns && uniqueColumns.length > 0 && (
                              <FormControl size="small" sx={{ minWidth: 150, height: '42px' }}>
                                <Select
                                  value={selectedSubjectVariable}
                                  onOpen={() => setSubjectVariableSearchQuery('')}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setSelectedSubjectVariable('')
                                    if (value) {
                                      const variableText = value.startsWith('{') && value.endsWith('}')
                                        ? value
                                        : `{${value}}`
                                      setEmailSubject((prev) => prev + variableText)
                                    }
                                  }}
                                  displayEmpty
                                  MenuProps={{
                                    disablePortal: false,
                                    container: typeof document !== 'undefined' ? document.body : null,
                                    PaperProps: {
                                      style: {
                                        zIndex: 1800, // Higher than NewMessageModal (1501) to appear on top
                                        position: 'fixed', // Ensure it's positioned correctly when portaled
                                        maxHeight: '300px', // Fixed height for scrolling
                                        overflow: 'auto', // Enable scrolling
                                      },
                                    },
                                    MenuListProps: {
                                      component: SlidingPillMenuList,
                                      style: {
                                        zIndex: 1800,
                                      },
                                      autoFocus: false,
                                    },
                                    style: {
                                      zIndex: 1800,
                                    },
                                  }}
                                  IconComponent={(props) => (
                                    <span
                                      {...props}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '42px',  // match Select height so icon is centered in both states
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <ChevronDown size={24} className="text-gray-400 mr-2" />
                                    </span>
                                  )}
                                  sx={{
                                    fontSize: '0.875rem',
                                    height: '42px',
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '& .MuiSelect-select': {
                                      padding: '8px 12px',
                                      height: '42px',
                                      display: 'flex',
                                      alignItems: 'center',
                                    },
                                    '& .MuiSelect-icon': {
                                      display: 'flex',
                                      alignItems: 'center',
                                      height: '42px',
                                      top: 0,
                                    },
                                    '&.Mui-focused .MuiSelect-icon': {
                                      display: 'flex',
                                      alignItems: 'center',
                                      height: '42px',
                                    },
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    <em>Variables</em>
                                  </MenuItem>
                                  <ListSubheader className="sticky top-0 bg-white z-10 pb-2 pt-1">
                                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                      <Input
                                        ref={subjectVariableSearchInputRef}
                                        placeholder="Search variables..."
                                        value={subjectVariableSearchQuery}
                                        onChange={(e) => setSubjectVariableSearchQuery(e.target.value)}
                                        className="h-9 text-sm border border-gray-200 rounded-md px-2 w-full focus-visible:ring-2 focus-visible:ring-brand-primary"
                                        style={{ borderColor: '#E2E8F0', borderWidth: '1px' }}
                                      />
                                    </div>
                                  </ListSubheader>
                                  {(() => {
                                    const filtered = uniqueColumns.filter((variable) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return displayText.toLowerCase().includes(subjectVariableSearchQuery.trim().toLowerCase())
                                    })
                                    if (subjectVariableSearchQuery.trim() && filtered.length === 0) {
                                      return (
                                        <MenuItem disabled>
                                          <span className="text-muted-foreground">No variables match</span>
                                        </MenuItem>
                                      )
                                    }
                                    return filtered.map((variable, index) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return (
                                        <MenuItem key={index} value={variable}>
                                          {displayText}
                                        </MenuItem>
                                      )
                                    })
                                  })()}
                                </Select>
                              </FormControl>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Message Body */}
                    <div className={selectedMode === 'email' ? 'border border-brand-primary/20 rounded-lg bg-white overflow-hidden' : ''}>

                      {selectedMode === 'email' ? (
                        <RichTextEditor
                          ref={richTextEditorRef}
                          value={emailMessageBody}
                          onChange={setEmailMessageBody}
                          placeholder="Type your message here"
                          availableVariables={uniqueColumns}
                          toolbarPosition="bottom"
                          attachmentButton={
                            <div
                              className="relative"
                              ref={attachmentDropdownRef}
                              onMouseEnter={() => {
                                // Clear any pending timeout
                                if (attachmentDropdownTimeoutRef.current) {
                                  clearTimeout(attachmentDropdownTimeoutRef.current)
                                  attachmentDropdownTimeoutRef.current = null
                                }
                                if (attachments.length > 0) {
                                  setShowAttachmentDropdown(true)
                                }
                              }}
                              onMouseLeave={() => {
                                // Set timeout to hide dropdown after delay
                                attachmentDropdownTimeoutRef.current = setTimeout(() => {
                                  setShowAttachmentDropdown(false)
                                  attachmentDropdownTimeoutRef.current = null
                                }, 300) // 300ms delay
                              }}
                            >
                              <label className="cursor-pointer">
                                <button
                                  type="button"
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center justify-center relative"
                                  onClick={() => document.getElementById('new-message-attachment-input')?.click()}
                                >
                                  <Paperclip size={18} className="text-gray-600 hover:text-brand-primary" />
                                  {attachments.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                      {attachments.length}
                                    </span>
                                  )}
                                </button>
                                <input
                                  id="new-message-attachment-input"
                                  type="file"
                                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                  multiple
                                  className="hidden"
                                  onChange={handleFileChange}
                                />
                              </label>

                              {/* Attachments Dropdown */}
                              {showAttachmentDropdown && attachments.length > 0 && (
                                <div
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[20vw] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-[2000]"
                                  onMouseEnter={() => {
                                    // Clear any pending timeout when entering dropdown
                                    if (attachmentDropdownTimeoutRef.current) {
                                      clearTimeout(attachmentDropdownTimeoutRef.current)
                                      attachmentDropdownTimeoutRef.current = null
                                    }
                                    setShowAttachmentDropdown(true)
                                  }}
                                  onMouseLeave={() => {
                                    // Set timeout to hide dropdown after delay
                                    attachmentDropdownTimeoutRef.current = setTimeout(() => {
                                      setShowAttachmentDropdown(false)
                                      attachmentDropdownTimeoutRef.current = null
                                    }, 300) // 300ms delay
                                  }}
                                >
                                  <div className="p-2">
                                    <div className="text-xs font-semibold text-gray-700 mb-2 px-2">
                                      Attachments ({attachments.length})
                                    </div>
                                    <div className="space-y-1">
                                      {attachments.map((file, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded transition-colors group"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-900 truncate">
                                              {file.name || file.originalName || `File ${index + 1}`}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}
                                            </div>
                                          </div>
                                          <CloseBtn
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              removeAttachment(index)
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          }
                          customToolbarElement={
                            uniqueColumns && uniqueColumns.length > 0 ? (
                              <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select
                                  value={selectedVariable}
                                  onOpen={() => setVariableSearchQuery('')}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setSelectedVariable('')
                                    if (value && richTextEditorRef.current) {
                                      richTextEditorRef.current.insertVariable(value)
                                    }
                                  }}
                                  displayEmpty
                                  MenuProps={{
                                    disablePortal: false,
                                    container: typeof document !== 'undefined' ? document.body : null,
                                    PaperProps: {
                                      style: {
                                        zIndex: 1800, // Higher than NewMessageModal (1501) to appear on top
                                        position: 'fixed', // Ensure it's positioned correctly when portaled
                                        maxHeight: '300px', // Fixed height for scrolling
                                        overflow: 'auto', // Enable scrolling
                                      },
                                    },
                                    MenuListProps: {
                                      component: SlidingPillMenuList,
                                      style: {
                                        zIndex: 1800,
                                      },
                                      autoFocus: false,
                                    },
                                    style: {
                                      zIndex: 1800,
                                    },
                                  }}
                                  IconComponent={(props) => (
                                    <span
                                      {...props}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '42px',  // match Select height so icon is centered in both states
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <ChevronDown size={24} className="text-gray-400 mr-2" />
                                    </span>
                                  )}
                                  sx={{
                                    fontSize: '0.875rem',
                                    height: '42px',
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '& .MuiSelect-select': {
                                      padding: '8px 12px',
                                      height: '42px',
                                      display: 'flex',
                                      alignItems: 'center',
                                    },
                                    '& .MuiSelect-icon': {
                                      display: 'flex',
                                      alignItems: 'center',
                                      height: '42px',
                                      top: 0,
                                    },
                                    '&.Mui-focused .MuiSelect-icon': {
                                      display: 'flex',
                                      alignItems: 'center',
                                      height: '42px',
                                    },
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    <em>Variables</em>
                                  </MenuItem>
                                  <ListSubheader className="sticky top-0 bg-white z-10 pb-2 pt-1">
                                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                      <Input
                                        ref={variableSearchInputRef}
                                        placeholder="Search variables..."
                                        value={variableSearchQuery}
                                        onChange={(e) => setVariableSearchQuery(e.target.value)}
                                        className="h-9 text-sm border border-gray-200 rounded-md px-2 w-full focus-visible:ring-2 focus-visible:ring-brand-primary"
                                        style={{ borderColor: '#E2E8F0', borderWidth: '1px' }}
                                      />
                                    </div>
                                  </ListSubheader>
                                  {(() => {
                                    const filtered = uniqueColumns.filter((variable) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return displayText.toLowerCase().includes(variableSearchQuery.trim().toLowerCase())
                                    })
                                    if (variableSearchQuery.trim() && filtered.length === 0) {
                                      return (
                                        <MenuItem disabled>
                                          <span className="text-muted-foreground">No variables match</span>
                                        </MenuItem>
                                      )
                                    }
                                    return filtered.map((variable, index) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return (
                                        <MenuItem key={index} value={variable}>
                                          {displayText}
                                        </MenuItem>
                                      )
                                    })
                                  })()}
                                </Select>
                              </FormControl>
                            ) : null
                          }
                        />
                      ) : (
                        <div className="relative">
                          <textarea
                            ref={smsTextareaRef}
                            value={smsMessageBody}
                            onChange={(e) => {
                              // Enforce max 300 characters for text (Twilio multi-segment; we count 1 credit per message)
                              if (e.target.value.length <= SMS_CHAR_LIMIT) {
                                setSmsMessageBody(e.target.value)
                              }
                            }}
                            placeholder="Type your message here"
                            maxLength={SMS_CHAR_LIMIT}
                            className="w-full px-3 py-2 border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary min-h-[120px] pr-24"
                          />
                          {/* Variables dropdown for SMS */}
                          {uniqueColumns && uniqueColumns.length > 0 && (
                            <div className="absolute bottom-2 right-2">
                              <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select
                                  value={selectedSmsVariable}
                                  onOpen={() => setSmsVariableSearchQuery('')}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setSelectedSmsVariable('')
                                    if (value && smsTextareaRef.current) {
                                      const textarea = smsTextareaRef.current
                                      const start = textarea.selectionStart
                                      const end = textarea.selectionEnd
                                      const variableText = value.startsWith('{') && value.endsWith('}')
                                        ? value
                                        : `{${value}}`

                                      // Check if adding variable would exceed limit
                                      const newText = smsMessageBody.substring(0, start) + variableText + smsMessageBody.substring(end)
                                      if (newText.length <= SMS_CHAR_LIMIT) {
                                        setSmsMessageBody(newText)
                                        // Set cursor position after inserted variable
                                        setTimeout(() => {
                                          textarea.focus()
                                          textarea.setSelectionRange(start + variableText.length, start + variableText.length)
                                        }, 0)
                                      } else {
                                        toast.error(`Adding this variable would exceed the ${SMS_CHAR_LIMIT} character limit`)
                                      }
                                    }
                                  }}
                                  displayEmpty
                                  MenuProps={{
                                    disablePortal: false,
                                    container: typeof document !== 'undefined' ? document.body : null,
                                    PaperProps: {
                                      style: {
                                        zIndex: 1800, // Higher than NewMessageModal (1501) to appear on top
                                        position: 'fixed', // Ensure it's positioned correctly when portaled
                                        maxHeight: '300px', // Fixed height for scrolling
                                        overflow: 'auto', // Enable scrolling
                                      },
                                    },
                                    MenuListProps: {
                                      component: SlidingPillMenuList,
                                      style: {
                                        zIndex: 1800,
                                      },
                                      autoFocus: false,
                                    },
                                    style: {
                                      zIndex: 1800,
                                    },
                                  }}
                                  IconComponent={(props) => (
                                    <span
                                      {...props}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '42px',  // match Select height so icon is centered in both states
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <ChevronDown size={24} className="text-gray-400 mr-2" />
                                    </span>
                                  )}
                                  sx={{
                                    fontSize: '0.875rem',
                                    height: '42px',
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '& .MuiSelect-select': {
                                      padding: '8px 12px',
                                      height: '42px',
                                      display: 'flex',
                                      alignItems: 'center',
                                    },
                                    '& .MuiSelect-icon': {
                                      display: 'flex',
                                      alignItems: 'center',
                                      height: '42px',
                                      top: 0,
                                    },
                                    '&.Mui-focused .MuiSelect-icon': {
                                      display: 'flex',
                                      alignItems: 'center',
                                      height: '42px',
                                    },
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    <em>Variables</em>
                                  </MenuItem>
                                  <ListSubheader className="sticky top-0 bg-white z-10 pb-2 pt-1">
                                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                      <Input
                                        ref={smsVariableSearchInputRef}
                                        placeholder="Search variables..."
                                        value={smsVariableSearchQuery}
                                        onChange={(e) => setSmsVariableSearchQuery(e.target.value)}
                                        className="h-9 text-sm border border-gray-200 rounded-md px-2 w-full focus-visible:ring-2 focus-visible:ring-brand-primary"
                                        style={{ borderColor: '#E2E8F0', borderWidth: '1px' }}
                                      />
                                    </div>
                                  </ListSubheader>
                                  {(() => {
                                    const filtered = uniqueColumns.filter((variable) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return displayText.toLowerCase().includes(smsVariableSearchQuery.trim().toLowerCase())
                                    })
                                    if (smsVariableSearchQuery.trim() && filtered.length === 0) {
                                      return (
                                        <MenuItem disabled>
                                          <span className="text-muted-foreground">No variables match</span>
                                        </MenuItem>
                                      )
                                    }
                                    return filtered.map((variable, index) => {
                                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                                        ? variable
                                        : `{${variable}}`
                                      return (
                                        <MenuItem key={index} value={variable}>
                                          {displayText}
                                        </MenuItem>
                                      )
                                    })
                                  })()}
                                </Select>
                              </FormControl>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
          </div>

          {/* Footer with template dropdown, char count, credits, and send button */}

          <div className="flex items-center justify-between gap-4 p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
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
                          title={selectedMode === 'sms' ? template.content : template.subject}
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
                          <div
                            key={template.id || template.templateId}
                            className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 group"
                          >
                            <button
                              onClick={() => handleTemplateSelect(template)}
                              className="flex-1 text-left text-sm min-w-0"
                            >
                              <div className="font-medium text-gray-900 truncate">
                                {template.templateName || 'Untitled Template'}
                              </div>
                            </button>
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
                          </div>
                        </Tooltip>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Save as template checkbox - only in lead mode */}
              {(
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={saveAsTemplate === true}
                    onCheckedChange={(checked) => {
                      // Radix UI can return true, false, or "indeterminate"
                      // Explicitly convert to boolean: only true if checked is exactly true
                      const isChecked = checked === true
                      console.log('🔘 Checkbox changed:', { checked, type: typeof checked, isChecked })
                      setSaveAsTemplate(isChecked)
                    }}
                    className="h-5 w-5"
                  />
                  <label className="text-sm text-gray-700 cursor-pointer select-none">
                    {selectedTemplate ? "Update template" : "Save as template"}
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {selectedMode === 'sms' && (
                <TypographyCaption>
                  {smsMessageBody.length} / {SMS_CHAR_LIMIT} char
                </TypographyCaption>
              )}

              <button
                onClick={handleSend}
                disabled={
                  sending ||
                  (!isPipelineMode && !isLeadMode && selectedLeads.length === 0) ||
                  (selectedMode === 'sms' && !smsMessageBody.trim()) ||
                  (selectedMode === 'email' && !emailMessageBody.trim()) ||
                  (selectedMode === 'email' && !emailSubject.trim()) ||
                  (selectedMode === 'sms' && !selectedPhoneNumber) ||
                  (selectedMode === 'email' && !selectedEmailAccount)
                }
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {sending ? (
                  <>
                    <CircularProgress size={16} className="text-white" />
                    {isPipelineMode ? (isEditing ? 'Updating...' : 'Saving...') : 'Sending...'}
                  </>
                ) : (
                  <>
                    {isPipelineMode ? (isEditing ? 'Update' : 'Save') : selectedTemplate ? (selectedMode === 'sms' ? "Update" : "Send Email") : selectedMode === 'sms' ? 'Send' : 'Send Email'}
                    {!isPipelineMode && <PaperPlaneTilt size={16} />}
                  </>
                )}
              </button>
            </div>
          </div>

        </Box>
      </Modal>



      {/* Auth Selection Popup for Gmail Connection - Outside main Modal */}
      <AuthSelectionPopup
        selectedUser={selectedUser}
        open={showAuthSelectionPopup}
        onClose={() => setShowAuthSelectionPopup(false)}
        onSuccess={() => {
          fetchEmailAccounts()
          setShowAuthSelectionPopup(false)
        }}
        setShowEmailTempPopup={() => { }}
        showEmailTempPopup={false}
        setSelectedGoogleAccount={(account) => {
          if (account) {
            setSelectedEmailAccount(account.id)
            setSelectedEmailAccountObj(account)
            setEmailAccounts((prev) => {
              const exists = prev.find((a) => a.id === account.id)
              if (exists) return prev
              return [...prev, account]
            })
          }
        }}
        elevatedZIndex={elevatedZIndex}
      // selectedUser={getSelectedUser()}
      />

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
              zIndex: 99991,
            },
          },
        }}
        sx={{
          zIndex: 99991,
        }}
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
            zIndex: 99991,
          },
        }}
      >
        <Box
          className="lg:w-3/12 sm:w-4/12 w-6/12"
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '13px',
            zIndex: 99992,
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
              <div className="font-bold text-xl">
                Are you sure you want to delete {accountToDelete?.email || accountToDelete?.name || accountToDelete?.displayName || 'this email account'}?
              </div>
              <div className="flex flex-row items-center gap-4 w-full mt-6">
                <button
                  className="w-1/2 font-bold text-xl text-[#6b7280] h-[50px]"
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
                    className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
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

      {/* Email List Popover for CC/BCC */}
      <Popover
        open={Boolean(emailListPopoverAnchor)}
        anchorEl={emailListPopoverAnchor}
        onClose={() => {
          setEmailListPopoverAnchor(null)
          setEmailListPopoverType(null)
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disablePortal={false}
        container={typeof document !== 'undefined' ? document.body : null}
        slotProps={{
          root: {
            style: {
              zIndex: 1800,
            },
          },
        }}
        sx={{
          zIndex: 1800, // Higher than NewMessageModal (1501) to appear on top
        }}
        PaperProps={{
          style: {
            padding: '8px',
            minWidth: '250px',
            maxWidth: '350px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1800, // Higher than NewMessageModal (1501) to appear on top
            position: 'fixed', // Ensure it's positioned correctly when portaled
          },
        }}
      >
        <div className="py-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
            {emailListPopoverType === 'cc' ? 'CC Recipients' : 'BCC Recipients'}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {(emailListPopoverType === 'cc' ? ccEmails : bccEmails).map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700 flex-1 truncate">{email}</span>
                <button
                  onClick={() => {
                    // Calculate remaining emails before removal
                    const remainingEmails = emailListPopoverType === 'cc'
                      ? ccEmails.filter(e => e !== email)
                      : bccEmails.filter(e => e !== email)

                    // Remove the email
                    if (emailListPopoverType === 'cc') {
                      removeCcEmail(email)
                    } else {
                      removeBccEmail(email)
                    }

                    // Close popover if 1 or fewer emails remain (badge disappears when length <= 1)
                    if (remainingEmails.length <= 1) {
                      setEmailListPopoverAnchor(null)
                      setEmailListPopoverType(null)
                    }
                  }}
                  className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                  title="Remove email"
                >
                  <Trash2 size={16} className="text-brand-primary" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Popover>
    </>
  )
}

export default NewMessageModal

