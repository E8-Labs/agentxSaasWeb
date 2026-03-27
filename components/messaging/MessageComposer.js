import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Paperclip, X, CaretDown, CaretUp, Plus, PaperPlaneTilt, CalendarBlank, Sparkle, WhatsappLogo } from '@phosphor-icons/react'
import { MessageCircleMore, Mail, MessageSquare, Bold, Underline, ListBullets, ListNumbers, FileText, Trash2, MessageSquareDot, Check, Link2, Loader2, MessageCircle } from 'lucide-react'
import { Box, CircularProgress, FormControl, MenuItem, Modal, Select, Tooltip } from '@mui/material'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { getGmailWatchErrorInfo } from '@/utils/gmailWatchError'
import Image from 'next/image'
import ToggleGroupCN from '@/components/ui/ToggleGroupCN'
import SplitButtonCN from '../ui/SplitButtonCN'
import PlatformIcon from '@/components/messaging/PlatformIcon'

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

const WhatsAppTabIcon = ({ size = 40, style }) => (
  <WhatsappLogo
    size={size}
    weight="fill"
    className="text-[#25D366]"
    aria-label="WhatsApp"
  />
)
import { renderBrandedIcon } from '@/utilities/iconMasking'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import MessageSettingsModal from '@/components/messaging/MessageSettingsModal'
import SocialCommentSmartReplyModal from '@/components/messaging/SocialCommentSmartReplyModal'
import { format } from 'date-fns'
import { CalendarIcon, Clock, ChevronDown } from 'lucide-react'

// Schedule modal: time picker helpers (value: "HH:mm" 24h) - same as TaskForm.js
function parseTime24(value) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return { hour12: 12, minute: 0, ampm: 'PM' }
  const [h, m] = value.split(':').map(Number)
  const hour24 = Math.min(23, Math.max(0, h))
  const minute = Math.min(59, Math.max(0, m))
  return { hour12: hour24 % 12 || 12, minute, ampm: hour24 >= 12 ? 'PM' : 'AM' }
}
function toTime24(hour12, minute, ampm) {
  let h = ampm === 'PM' && hour12 !== 12 ? hour12 + 12 : hour12
  if (ampm === 'AM' && hour12 === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
function formatTime12(value) {
  if (!value) return ''
  const { hour12, minute, ampm } = parseTime24(value)
  return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`
}

function CustomTimePicker({ value, onChange, onCancel }) {
  const p = parseTime24(value || '12:00')
  const [hour12, setHour12] = useState(p.hour12)
  const [minute, setMinute] = useState(p.minute)
  const [ampm, setAmpm] = useState(p.ampm)
  useEffect(() => {
    const next = parseTime24(value || '12:00')
    setHour12(next.hour12)
    setMinute(next.minute)
    setAmpm(next.ampm)
  }, [value])
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const selectedClass = 'bg-brand-primary text-white'
  const unselectedClass = 'text-foreground hover:bg-black/[0.06]'
  const colClass = 'flex flex-col overflow-y-auto max-h-[200px] min-w-[52px] rounded-md border border-black/[0.08] bg-muted/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
  return (
    <div className="p-3">
      <div className="flex gap-2 mb-3">
        <div className={colClass}>
          {hours.map((h) => (
            <button key={h} type="button" onClick={() => setHour12(h)} className={cn('flex items-center justify-center py-2 text-sm font-medium cursor-pointer transition-colors', hour12 === h ? selectedClass : unselectedClass)} aria-pressed={hour12 === h}>{h}</button>
          ))}
        </div>
        <div className={colClass}>
          {minutes.map((m) => (
            <button key={m} type="button" onClick={() => setMinute(m)} className={cn('flex items-center justify-center py-2 text-sm font-medium cursor-pointer transition-colors', minute === m ? selectedClass : unselectedClass)} aria-pressed={minute === m}>{String(m).padStart(2, '0')}</button>
          ))}
        </div>
        <div className={colClass}>
          {['AM', 'PM'].map((a) => (
            <button key={a} type="button" onClick={() => setAmpm(a)} className={cn('flex items-center justify-center py-2 text-sm font-medium cursor-pointer transition-colors', ampm === a ? selectedClass : unselectedClass)} aria-pressed={ampm === a}>{a}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90" onClick={() => { onChange(toTime24(hour12, minute, ampm)); }}>OK</Button>
      </div>
    </div>
  )
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
  onScheduleMessage,
  sendingMessage,
  onSendSocialMessage,
  hasFacebookConnection = false,
  hasInstagramConnection = false,
  hasWhatsAppConnection = false,
  socialConnections = [],
  currentPage = null,
  onConnectionSuccess,
  onOpenAuthPopup,
  onCommentAdded,
  customDomain = null,
}) => {


  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')
  const isProductionEnvironment = process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
  const showWhatsAppTab = !isProductionEnvironment
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
  const previousContentHeightRef = useRef(null)
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
  const [socialSettingsModalOpen, setSocialSettingsModalOpen] = useState(false)
  const [smartReplyModalOpen, setSmartReplyModalOpen] = useState(false)
  const [socialAccountPopoverOpen, setSocialAccountPopoverOpen] = useState(false)

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
  const templatesPortalRef = useRef(null)
  const [templatesDropdownPosition, setTemplatesDropdownPosition] = useState({ left: 0, bottom: 0 })
  const [templatesFetched, setTemplatesFetched] = useState(false) // Track if templates have been fetched for current mode
  const [templateHoveredKey, setTemplateHoveredKey] = useState(null)
  const [templatePillStyle, setTemplatePillStyle] = useState({ top: 0, height: 0 })
  const templateListRef = useRef(null)
  const templateOptionRefs = useRef(Object.create(null))
  const [subjectVarHoveredKey, setSubjectVarHoveredKey] = useState(null)
  const [subjectVarPillStyle, setSubjectVarPillStyle] = useState({ top: 0, height: 0 })
  const subjectVarListRef = useRef(null)
  const subjectVarOptionRefs = useRef(Object.create(null))
  const [bodyVarHoveredKey, setBodyVarHoveredKey] = useState(null)
  const [bodyVarPillStyle, setBodyVarPillStyle] = useState({ top: 0, height: 0 })
  const bodyVarListRef = useRef(null)
  const bodyVarOptionRefs = useRef(Object.create(null))

  // Schedule modal: date + time for "Schedule" option (same pickers as TaskForm)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(null)
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleDatePickerOpen, setScheduleDatePickerOpen] = useState(false)
  const [scheduleTimePickerOpen, setScheduleTimePickerOpen] = useState(false)
  const scheduleDropdownAnchorRef = useRef(null)
  const [sendDropdownOpen, setSendDropdownOpen] = useState(false)
  const [sendDropdownRect, setSendDropdownRect] = useState(null)

  useLayoutEffect(() => {
    if (!sendDropdownOpen || !scheduleDropdownAnchorRef.current) return
    const el = scheduleDropdownAnchorRef.current
    const rect = el.getBoundingClientRect()
    setSendDropdownRect({ top: rect.top, right: rect.right, bottom: rect.bottom })
  }, [sendDropdownOpen])

  // Email attachment dropdown (same pattern as NewMessageModal)
  const attachmentDropdownRef = useRef(null)
  const attachmentDropdownTimeoutRef = useRef(null)
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false)
  const emailAttachmentInputRef = useRef(null)
  const smsAttachmentInputRef = useRef(null)

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
      if (templatesDropdownRef.current && !templatesDropdownRef.current.contains(event.target) && !templatesPortalRef.current?.contains(event.target)) {
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

  const socialConnectPollIntervalRef = useRef(null)
  const popupRef = useRef(null)

  const applySocialConnectResult = useCallback(
    (success, errorMessage) => {
      if (socialConnectPollIntervalRef.current) {
        clearInterval(socialConnectPollIntervalRef.current)
        socialConnectPollIntervalRef.current = null
      }
      setConnectingOAuth(false)
      if (success) {
        toast.success('Facebook/Instagram connected')
        onConnectionSuccess?.()
      } else {
        toast.error(errorMessage || 'Connection failed')
      }
    },
    [onConnectionSuccess]
  )

  // Listen for Facebook (social) connect popup result: postMessage (when opener is preserved)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type !== 'social_connect_done') return
      if (event.origin !== window.location.origin) return
      applySocialConnectResult(event.data.success, event.data.error)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [applySocialConnectResult])

  // Fallback when opener was lost: storage event (callback page wrote to localStorage)
  useEffect(() => {
    const SOCIAL_RESULT_KEY = 'social_connect_result'
    const MAX_AGE_MS = 2 * 60 * 1000

    const handleStorage = (event) => {
      if (event.key !== SOCIAL_RESULT_KEY || !event.newValue) return
      try {
        const data = JSON.parse(event.newValue)
        if (data && typeof data.ts === 'number' && Date.now() - data.ts < MAX_AGE_MS) {
          applySocialConnectResult(!!data.success, data.error || null)
          localStorage.removeItem(SOCIAL_RESULT_KEY)
        }
      } catch (_) { }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [applySocialConnectResult])

  // Clear popup poll interval on unmount
  useEffect(() => {
    return () => {
      if (socialConnectPollIntervalRef.current) {
        clearInterval(socialConnectPollIntervalRef.current)
        socialConnectPollIntervalRef.current = null
      }
    }
  }, [])

  // When selecting a Messenger/Instagram thread (or linked lead with social PSID), switch to the corresponding tab
  useEffect(() => {
    const isInstagram = selectedThread?.threadType === 'instagram' || !!selectedThread?.lead?.instagramPsid
    const isMessenger = selectedThread?.threadType === 'messenger' || !!selectedThread?.lead?.messengerPsid
    const isWhatsApp = selectedThread?.threadType === 'whatsapp' || !!selectedThread?.lead?.whatsappWaId
    if (isInstagram) setComposerMode('instagram')
    else if (isMessenger) setComposerMode('facebook')
    else if (isWhatsApp && showWhatsAppTab) setComposerMode('whatsapp')
  }, [
    selectedThread?.id,
    selectedThread?.threadType,
    selectedThread?.lead?.instagramPsid,
    selectedThread?.lead?.messengerPsid,
    selectedThread?.lead?.whatsappWaId,
    showWhatsAppTab,
  ])

  // Smooth height transition when switching tabs: use previous content height as "from", then animate to new height.
  useLayoutEffect(() => {
    if (!isExpanded || !composerContentRef.current) {
      setContentHeight('auto')
      setIsTransitioning(false)
      return
    }

    const element = composerContentRef.current
    let timeoutId = null
    let rafId = null

    // Use stored previous height as "from" (so we animate from old content height). Fallback to current scrollHeight if none.
    const fromHeight = previousContentHeightRef.current != null && previousContentHeightRef.current > 0
      ? previousContentHeightRef.current
      : element.scrollHeight

    setContentHeight(`${fromHeight}px`)
    setIsTransitioning(true)

    rafId = requestAnimationFrame(() => {
      const newHeight = composerContentRef.current ? composerContentRef.current.scrollHeight : fromHeight
      setContentHeight(`${newHeight}px`)

      timeoutId = setTimeout(() => {
        if (composerContentRef.current) {
          setContentHeight('auto')
        }
        setIsTransitioning(false)
      }, 350)
    })

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [composerMode, isExpanded])

  // Persist current content height when not transitioning, so the transition effect can use it as "from" on next mode change.
  useLayoutEffect(() => {
    if (!isTransitioning && composerContentRef.current) {
      previousContentHeightRef.current = composerContentRef.current.scrollHeight
    }
  }, [composerMode, isExpanded, isTransitioning])

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
        '{Assigned Team Member}',
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
        '{Assigned Team Member}',
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

  // Position templates dropdown portal above the Templates button (fixed, so not clipped by overflow)
  useEffect(() => {
    if (!showTemplatesDropdown || typeof document === 'undefined') return
    const el = templatesDropdownRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      setTemplatesDropdownPosition({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 8,
      })
    }
    update()
    requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [showTemplatesDropdown])

  // Update sliding pill position when hovered template row changes
  useEffect(() => {
    if (templateHoveredKey == null || !templateListRef.current) {
      setTemplatePillStyle({ top: 0, height: 0 })
      return
    }
    const el = templateOptionRefs.current[templateHoveredKey]
    const list = templateListRef.current
    if (!el || !list) return
    const listRect = list.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - listRect.top + list.scrollTop
    const height = elRect.height
    setTemplatePillStyle({ top, height })
  }, [templateHoveredKey])

  useEffect(() => {
    if (subjectVarHoveredKey == null || !subjectVarListRef.current) {
      setSubjectVarPillStyle({ top: 0, height: 0 })
      return
    }
    const el = subjectVarOptionRefs.current[subjectVarHoveredKey]
    const list = subjectVarListRef.current
    if (!el || !list) return
    const listRect = list.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - listRect.top + list.scrollTop
    const height = elRect.height
    setSubjectVarPillStyle({ top, height })
  }, [subjectVarHoveredKey])

  useEffect(() => {
    if (bodyVarHoveredKey == null || !bodyVarListRef.current) {
      setBodyVarPillStyle({ top: 0, height: 0 })
      return
    }
    const el = bodyVarOptionRefs.current[bodyVarHoveredKey]
    const list = bodyVarListRef.current
    if (!el || !list) return
    const listRect = list.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - listRect.top + list.scrollTop
    const height = elRect.height
    setBodyVarPillStyle({ top, height })
  }, [bodyVarHoveredKey])

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

  const isSocialThread =
    selectedThread?.threadType === 'messenger' ||
    selectedThread?.threadType === 'instagram' ||
    selectedThread?.threadType === 'whatsapp'
  const isFacebookMode = composerMode === 'facebook'
  const isInstagramMode = composerMode === 'instagram'
  const isWhatsAppMode = composerMode === 'whatsapp'
  // Thread is replyable via Messenger if it's a messenger thread or has receiverMessengerPsid (e.g. merged SMS thread)
  const canReplyMessenger = (selectedThread?.threadType === 'messenger' || !!selectedThread?.receiverMessengerPsid) && hasFacebookConnection
  const canReplyInstagram = (selectedThread?.threadType === 'instagram' || !!selectedThread?.receiverInstagramPsid) && hasInstagramConnection
  const canReplyWhatsApp =
    (selectedThread?.threadType === 'whatsapp' || !!selectedThread?.receiverWhatsAppWaId) && hasWhatsAppConnection
  // When thread is linked to a lead (has leadId), enable FB/IG/WA if thread is social or lead has that channel id
  const linkedSocialSendable =
    !!selectedThread?.leadId &&
    ((isFacebookMode && (selectedThread?.threadType === 'messenger' || !!selectedThread?.lead?.messengerPsid) && hasFacebookConnection) ||
      (isInstagramMode && (selectedThread?.threadType === 'instagram' || !!selectedThread?.lead?.instagramPsid) && hasInstagramConnection) ||
      (isWhatsAppMode && (selectedThread?.threadType === 'whatsapp' || !!selectedThread?.lead?.whatsappWaId) && hasWhatsAppConnection))
  const hasConnectionForCurrentSocialTab = isWhatsAppMode
    ? hasWhatsAppConnection
    : (hasFacebookConnection || hasInstagramConnection)
  const sendableSocial =
    (isFacebookMode && canReplyMessenger) ||
    (isInstagramMode && canReplyInstagram) ||
    (isWhatsAppMode && canReplyWhatsApp) ||
    linkedSocialSendable
  const isMessengerReply = selectedThread?.threadType === 'messenger' || !!selectedThread?.receiverMessengerPsid
  const socialDmPlaceholder = isWhatsAppMode
    ? 'Reply in WhatsApp...'
    : isInstagramMode
      ? 'Reply in Instagram...'
      : isMessengerReply
        ? 'Reply in Messenger...'
        : 'Reply in Instagram...'
  const showSocialComposer = false
  const composerTabOptions = [
    { label: 'Text', value: 'sms', icon: MessageSquareDot },
    { label: 'Email', value: 'email', icon: Mail },
    { label: 'Comment', value: 'comment', icon: MessageSquare },
    { label: 'FB/IG DM', value: 'facebook', icon: MessengerTabIcon },
    ...(showWhatsAppTab ? [{ label: 'WhatsApp', value: 'whatsapp', icon: WhatsAppTabIcon }] : []),
  ]

  const fbIgConnections = useMemo(
    () =>
      (socialConnections || []).filter(
        (c) => c.platform === 'facebook' || c.platform === 'instagram',
      ),
    [socialConnections],
  )
  const whatsAppConnections = useMemo(
    () => (socialConnections || []).filter((c) => c.platform === 'whatsapp'),
    [socialConnections],
  )
  const currentSocialConnections = isWhatsAppMode ? whatsAppConnections : fbIgConnections

  const selectedSocialRow = useMemo(() => {
    const threadMeta = isWhatsAppMode
      ? selectedThread?.metadata?.whatsappPhoneNumberId
      : selectedThread?.metadata?.instagramAccountId || selectedThread?.metadata?.facebookPageId
    if (threadMeta && currentSocialConnections.length) {
      const m = currentSocialConnections.find((c) => String(c.externalId) === String(threadMeta))
      if (m) return m
    }
    return currentSocialConnections[0] || null
  }, [selectedThread, currentSocialConnections, isWhatsAppMode])

  console.log("!HAS Facebook", hasFacebookConnection, "!has insta", hasInstagramConnection, "!has wa", hasWhatsAppConnection, "social sendable", sendableSocial, "isexpeded status", isExpanded, "can reply insta gran", canReplyInstagram, "linked social sendable", linkedSocialSendable)

  const handleSendSocial = async (e) => {
    e?.preventDefault()
    const raw = (composerData.socialBody ?? socialContent ?? '').trim()
    const hasText = stripHTML(raw).trim().length > 0
    if (!hasText || !selectedThread?.id || !onSendSocialMessage) return
    if (sendingSocialMessage) return
    setSendingSocialMessage(true)
    try {
      // Send raw content (HTML or plain) so backend can store it for bubble rendering; backend strips to plain text for Meta API
      await onSendSocialMessage(selectedThread.id, raw)
      setComposerData((prev) => ({ ...prev, socialBody: '' }))
      setSocialContent('')
      toast.success('Message sent')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send')
    } finally {
      setSendingSocialMessage(false)
    }
  }

  const openScheduleOptions = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    const rect = scheduleDropdownAnchorRef.current?.getBoundingClientRect()
    if (rect) setSendDropdownRect(rect)
    setSendDropdownOpen((o) => !o)
  }

  const openConnectModal = (platform) => {
    setConnectPlatform(platform)
    setConnectForm({ externalId: '', accessToken: '', displayName: '' })
    setConnectModalOpen(true)
  }

  const handleConnectClick = async () => {
    const localData = localStorage.getItem('User')
    if (!localData) {
      toast.error('Please sign in to connect')
      return
    }
    const userData = JSON.parse(localData)
    const token = userData.token
    let apiUrl = `${Apis.BasePath}api/mail/settings`
    if (selectedUser?.id) apiUrl += `?userId=${selectedUser.id}`
    try {
      const res = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const settings = res.data?.status && res.data?.data ? res.data.data : null
      const socialSettingsConfigured = settings && (isWhatsAppMode
        ? (
          settings.whatsappReplyDelayEnabled === true ||
          settings.whatsappSaveAsDraftEnabled === true ||
          (settings.whatsappSelectedAgentId != null && settings.whatsappSelectedAgentId !== '')
        )
        : (
          settings.socialReplyDelayEnabled === true ||
          settings.socialSaveAsDraftEnabled === true ||
          (settings.socialSelectedAgentId != null && settings.socialSelectedAgentId !== '')
        ))
      if (socialSettingsConfigured) {
        if (isWhatsAppMode) {
          connectWithWhatsAppOAuth()
        } else {
          connectWithFacebookOAuth()
        }
      } else {
        setSocialSettingsModalOpen(true)
      }
    } catch (err) {
      console.error('Error fetching message settings:', err)
      toast.error('Could not load settings. Try again.')
    }
  }

  const connectWithFacebookOAuth = async () => {
    const localData = localStorage.getItem('User')
    if (!localData) {
      toast.error('Please sign in to connect')
      return
    }
    const userData = JSON.parse(localData)
    const token = userData.token
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const callbackPath = '/social-connect/callback'
    const redirectUrl = origin ? `${origin}${callbackPath}` : ''
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
        const popup = window.open(res.data.url, 'facebook-oauth', 'width=500,height=600,scrollbars=yes,resizable=yes')
        if (!popup) {
          toast.error('Please allow popups for this site to connect Facebook')
          setConnectingOAuth(false)
          return
        }
        popupRef.current = popup
        const SOCIAL_RESULT_KEY = 'social_connect_result'
        const MAX_AGE_MS = 2 * 60 * 1000
        const startedAt = Date.now()
        socialConnectPollIntervalRef.current = setInterval(() => {
          if (!popupRef.current || !popupRef.current.closed) {
            if (Date.now() - startedAt > MAX_AGE_MS) {
              clearInterval(socialConnectPollIntervalRef.current)
              socialConnectPollIntervalRef.current = null
              setConnectingOAuth(false)
            }
            return
          }
          popupRef.current = null
          clearInterval(socialConnectPollIntervalRef.current)
          socialConnectPollIntervalRef.current = null
          try {
            const raw = localStorage.getItem(SOCIAL_RESULT_KEY)
            if (raw) {
              const data = JSON.parse(raw)
              if (data && typeof data.ts === 'number' && Date.now() - data.ts < MAX_AGE_MS) {
                applySocialConnectResult(!!data.success, data.error || null)
              } else {
                setConnectingOAuth(false)
              }
              localStorage.removeItem(SOCIAL_RESULT_KEY)
            } else {
              setConnectingOAuth(false)
            }
          } catch (_) {
            setConnectingOAuth(false)
          }
        }, 500)
      } else {
        toast.error(res.data?.message || 'Could not start Facebook connect')
        setConnectingOAuth(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not start Facebook connect')
      setConnectingOAuth(false)
    }
  }

  const connectWithWhatsAppOAuth = async () => {
    const localData = localStorage.getItem('User')
    if (!localData) {
      toast.error('Please sign in to connect')
      return
    }
    const userData = JSON.parse(localData)
    const token = userData.token
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const callbackPath = '/social-connect/callback'
    const redirectUrl = origin ? `${origin}${callbackPath}` : ''
    try {
      setConnectingOAuth(true)
      let url = Apis.socialWhatsAppAuthorize
      const params = new URLSearchParams()
      if (redirectUrl) params.set('redirectUrl', redirectUrl)
      if (selectedUser?.id) params.set('userId', String(selectedUser.id))
      if (params.toString()) url += `?${params.toString()}`
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data?.url) {
        const popup = window.open(
          res.data.url,
          'whatsapp-oauth',
          'width=520,height=700,scrollbars=yes,resizable=yes',
        )
        if (!popup) {
          toast.error('Please allow popups for this site to connect WhatsApp')
          setConnectingOAuth(false)
          return
        }
        popupRef.current = popup
        const SOCIAL_RESULT_KEY = 'social_connect_result'
        const MAX_AGE_MS = 3 * 60 * 1000
        const startedAt = Date.now()
        socialConnectPollIntervalRef.current = setInterval(() => {
          if (!popupRef.current || !popupRef.current.closed) {
            if (Date.now() - startedAt > MAX_AGE_MS) {
              clearInterval(socialConnectPollIntervalRef.current)
              socialConnectPollIntervalRef.current = null
              setConnectingOAuth(false)
            }
            return
          }
          popupRef.current = null
          clearInterval(socialConnectPollIntervalRef.current)
          socialConnectPollIntervalRef.current = null
          try {
            const raw = localStorage.getItem(SOCIAL_RESULT_KEY)
            if (raw) {
              const data = JSON.parse(raw)
              if (data && typeof data.ts === 'number' && Date.now() - data.ts < MAX_AGE_MS) {
                applySocialConnectResult(!!data.success, data.error || null)
              } else {
                setConnectingOAuth(false)
              }
              localStorage.removeItem(SOCIAL_RESULT_KEY)
            } else {
              setConnectingOAuth(false)
            }
          } catch (_) {
            setConnectingOAuth(false)
          }
        }, 500)
      } else {
        toast.error(res.data?.message || 'Could not start WhatsApp connect')
        setConnectingOAuth(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not start WhatsApp connect')
      // Fallback: if OAuth setup is missing, allow manual connect.
      openConnectModal('whatsapp')
      setConnectingOAuth(false)
    }
  }

  const disconnectSocialConnectionById = async (connectionId) => {
    if (connectionId == null) return
    const localData = localStorage.getItem('User')
    if (!localData) {
      toast.error('Please sign in to disconnect')
      return
    }
    const userData = JSON.parse(localData)
    const token = userData.token
    const connRow = (socialConnections || []).find((c) => String(c.id) === String(connectionId))
    const platform = connRow?.platform || null
    try {
      setConnectingOAuth(true)
      let url = Apis.socialConnectionById(connectionId)
      if (selectedUser?.id) url += `?userId=${encodeURIComponent(String(selectedUser.id))}`
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const disconnectedLabel =
        platform === 'facebook'
          ? 'Facebook'
          : platform === 'instagram'
            ? 'Instagram'
            : platform === 'whatsapp'
              ? 'WhatsApp'
              : 'Social account'
      toast.success(`${disconnectedLabel} disconnected`)
      onConnectionSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not disconnect')
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
      toast.success(
        connectPlatform === 'facebook'
          ? 'Facebook Page connected'
          : connectPlatform === 'whatsapp'
            ? 'WhatsApp connected'
            : 'Instagram account connected',
      )
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
            placeholder={socialDmPlaceholder}
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
    <div className="m-0 px-0.5 w-full rounded-lg bg-white overflow-hidden border-t border-[#eaeaea] transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <div className="w-full px-3 py-3 flex flex-col gap-1">
        <div className="flex items-center justify-between border-b border-black/[0.06] m-0 gap-1 py-1">
          <div className="flex items-center gap-2 pb-1">
            <ToggleGroupCN
              height="h-[40px] py-1"
              roundedness="rounded-lg"
              options={composerTabOptions}
              value={
                composerMode === 'instagram'
                  ? 'facebook'
                  : composerMode === 'whatsapp'
                    ? (showWhatsAppTab ? 'whatsapp' : 'facebook')
                    : composerMode
              }
              onChange={(value) => {
                if (value === 'sms') {
                  if (composerMode === 'email' && !composerData.smsBody && composerData.emailBody) {
                    const plainText = stripHTML(composerData.emailBody)
                    setComposerData((prev) => ({
                      ...prev,
                      to: selectedThread?.receiverPhoneNumber || selectedThread?.lead?.phone || '',
                      smsBody: plainText.substring(0, SMS_CHAR_LIMIT)
                    }))
                  } else {
                    setComposerData((prev) => ({
                      ...prev,
                      to: selectedThread?.receiverPhoneNumber || selectedThread?.lead?.phone || ''
                    }))
                  }
                  setComposerMode('sms')
                  fetchPhoneNumbers()
                } else if (value === 'email') {
                  if (composerMode === 'sms' && !composerData.emailBody && composerData.smsBody) {
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
                  if (emailAccounts.length === 0) fetchEmailAccounts()
                } else if (value === 'comment') {
                  setComposerMode('comment')
                } else if (value === 'facebook') {
                  const useInstagram = selectedThread?.threadType === 'instagram' || !!selectedThread?.lead?.instagramPsid
                  setComposerMode(useInstagram ? 'instagram' : 'facebook')
                } else if (value === 'whatsapp') {
                  setComposerMode('whatsapp')
                }
                setIsExpanded(true)
              }}
            />
          </div>

          <div className="flex items-center gap-2">

            {composerMode === 'email' && (

              <div className="flex items-center border border-black/[0.06] rounded-lg">
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

        {(isFacebookMode || isInstagramMode || isWhatsAppMode) && !sendableSocial ? (
          <div className="mx-0 mb-4 mt-2 rounded-lg bg-muted/50 border border-muted px-4 py-3 space-y-4">
            {!hasConnectionForCurrentSocialTab ? (
              <div className="flex flex-col items-center gap-2">
                {isWhatsAppMode ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10">
                    <WhatsappLogo size={25} className="text-[#25D366]" weight="fill" aria-hidden />
                  </div>
                ) : (
                  <Image
                    src="/fbInsta.png"
                    width={42}
                    height={24}
                    alt="Facebook and Instagram"
                    className="object-contain"
                  />
                )}
                <div style={{ fontWeight: '600', fontSize: '16px' }}>
                  Connect Account
                </div>
                <p className="text-sm text-muted-foreground">
                  {isWhatsAppMode
                    ? 'Connect WhatsApp (Cloud API) to send messages'
                    : 'Connect Facebook or Instagram to send messages'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" className="w-fit h-[36px] rounded-lg bg-transparent text-black hover:bg-transparent" onClick={handleConnectClick} disabled={connectingOAuth}>
                    {connectingOAuth && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    Connect
                  </Button>
                  {/* <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => openConnectModal('whatsapp')} disabled={connectingOAuth}>
                    Connect WhatsApp (manual)
                  </Button> */}
                  {/*
                  <Button type="button" className="w-fit h-[36px] rounded-lg" onClick={connectWithFacebookOAuth} disabled={connectingOAuth}>
                    {connectingOAuth && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    Connect Instagram
                  </Button>
                  <span className="text-xs text-muted-foreground">or</span>
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => openConnectModal('facebook')} disabled={connectingOAuth}>
                    Connect manually
                  </Button>*/}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Select a Messenger, Instagram, or WhatsApp conversation from the list to reply here.
                </p>
                <Button
                  type="button"
                  className="w-fit h-[36px] rounded-lg bg-transparent text-black hover:bg-transparent flex flex-row items-center gap-2"
                  onClick={() => {
                    const targetConnectionId = selectedSocialRow?.id || currentSocialConnections?.[0]?.id
                    if (targetConnectionId) disconnectSocialConnectionById(targetConnectionId)
                  }}
                  disabled={connectingOAuth}
                >
                  {connectingOAuth && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Logout
                </Button>
              </div>
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
                placeholder={socialDmPlaceholder}
                className="flex-1"
              />
              <div className="flex items-stretch h-10 rounded-lg overflow-visible border border-transparent relative z-10">
                <button
                  onClick={handleSendSocial}
                  disabled={!(composerData.socialBody ?? '').trim() || sendingSocialMessage}
                  className="px-4 py-2 bg-brand-primary text-white rounded-l-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ height: '40px' }}
                >
                  {sendingSocialMessage ? <CircularProgress size={20} color="inherit" sx={{ display: 'block' }} /> : <PaperPlaneTilt size={20} weight="fill" />}
                </button>
                <div className="relative flex-shrink-0 h-full rounded-r-lg overflow-hidden" ref={scheduleDropdownAnchorRef}>
                  <button
                    type="button"
                    onClick={openScheduleOptions}
                    disabled={!(composerData.socialBody ?? '').trim() || sendingSocialMessage || !onScheduleMessage}
                    className="h-full min-w-[36px] px-3 bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-white/30 flex items-center justify-center"
                    aria-label="Send options"
                    aria-expanded={sendDropdownOpen}
                    aria-haspopup="menu"
                  >
                    <CaretDown size={16} weight="bold" />
                  </button>
                </div>
              </div>
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
                className="flex-1"
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
                style={{ height: '40px' }}
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </button>
            </div>
          )
        ) : (
          <div
            ref={composerContentRef}
            className="flex flex-col gap-1 transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              height: contentHeight,
              maxHeight: '50vh',
              overflow: 'hidden',
              overflowY: 'auto',
              overflowX: 'hidden',
              transition: isTransitioning ? 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              willChange: isTransitioning ? 'height' : 'auto',
            }}
          >
            {/* Messenger/Instagram expanded: RichTextEditor with formatting toolbar (no From/Subject/CC/BCC/Templates) */}
            {sendableSocial ? (
              <div className="mt-2">
                <div className="mb-2 w-full flex flex-row flex-wrap items-center gap-y-2 gap-x-1 min-h-[40px]">
                  <div className="flex min-w-[88px] flex-1 items-center">
                    <span className="text-sm font-semibold text-foreground">{isWhatsAppMode ? "Send a messsage" : "Social DMs"}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-center px-1">
                    {currentSocialConnections.length > 0 ? (
                      <Popover open={socialAccountPopoverOpen} onOpenChange={setSocialAccountPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex max-w-full items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-sm hover:bg-black/[0.02]"
                          >
                            {selectedSocialRow?.profileImageUrl ? (
                              <img
                                src={selectedSocialRow.profileImageUrl}
                                width={24}
                                height={24}
                                alt=""
                                className="shrink-0 rounded-full"
                              />
                            ) : selectedSocialRow?.platform === 'whatsapp' ? (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10">
                                <WhatsappLogo size={25} className="text-[#25D366]" weight="fill" aria-hidden />
                              </span>
                            ) : (
                              <img
                                src={selectedSocialRow?.platform === 'instagram' ? '/instagram.png' : '/facebook.png'}
                                width={24}
                                height={24}
                                alt=""
                                className="shrink-0 rounded-full"
                              />
                            )}
                            <span className="truncate">
                              {selectedSocialRow?.displayName || currentPage?.displayName || 'Account'}
                            </span>
                            <CaretDown className="h-4 w-4 shrink-0 opacity-60" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[min(100vw-2rem,220px)] p-1" align="center">
                          <div className="flex flex-col gap-0.5">
                            {currentSocialConnections.map((conn) => (
                              <div
                                key={conn.id}
                                className="group flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted/80"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2 cursor-default">
                                  <div className="relative shrink-0">
                                    {conn.profileImageUrl ? (
                                      <img
                                        src={conn.profileImageUrl}
                                        width={28}
                                        height={28}
                                        alt=""
                                        className="rounded-full"
                                      />
                                    ) : conn.platform === 'whatsapp' ? (
                                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366]/10">
                                        <WhatsappLogo size={25} className="text-[#25D366]" weight="fill" aria-hidden />
                                      </span>
                                    ) : (
                                      <img
                                        src={conn.platform === 'instagram' ? '/instagram.png' : '/facebook.png'}
                                        width={28}
                                        height={28}
                                        alt=""
                                        className="rounded-full"
                                      />
                                    )}
                                    {(conn.platform === 'instagram' || conn.platform === 'whatsapp' || conn.platform === 'facebook') ? (
                                      <PlatformIcon
                                        type={conn.platform === 'facebook' ? 'messenger' : conn.platform}
                                        size={8}
                                        showInBadge
                                        className="pointer-events-none"
                                      />
                                    ) : null}
                                  </div>
                                  <span className="truncate text-sm">{conn.displayName || conn.externalId}</span>
                                </div>
                                <button
                                  type="button"
                                  className="shrink-0 rounded border border-transparent px-2 py-1 text-xs text-[hsl(var(--brand-primary))] opacity-0 transition-opacity group-hover:opacity-100 hover:border-[hsl(var(--brand-primary))]/30"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    disconnectSocialConnectionById(conn.id)
                                  }}
                                  disabled={connectingOAuth}
                                >
                                  Logout
                                </button>
                              </div>
                            ))}
                          </div>
                          <div>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-start gap-2"
                              disabled={connectingOAuth}
                              onClick={() => {
                                // setConnectModalOpen(true)
                                handleConnectClick()
                              }}
                            >
                              {connectingOAuth ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                              ADD ACCOUNT
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : null}
                  </div>
                  <div className="flex min-w-[120px] flex-1 justify-end">
                    {!isProductionEnvironment && !isWhatsAppMode && currentSocialConnections.length > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 rounded-lg border-0 shadow-none bg-[#F9F9F9] hover:bg-[#F3F3F3]"
                        onClick={() => setSmartReplyModalOpen(true)}
                      >
                        <Sparkle className="h-4 w-4 text-[hsl(var(--brand-primary))]" weight="fill" />
                        <span>Smart Reply</span>
                        <CaretDown className="h-3.5 w-3.5 opacity-50" />
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="border border-black/[0.06] rounded-lg bg-white overflow-hidden">
                  <Textarea
                    value={stripHTML(composerData.socialBody ?? '')}
                    onChange={(e) => setComposerData((prev) => ({ ...prev, socialBody: e.target.value }))}
                    placeholder={isWhatsAppMode ? 'Write your message here...' : 'Write your DM here...'}
                    className="min-h-[130px] resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:border-transparent"
                  />
                  <div className="flex justify-end p-2 border-t border-gray-100">
                    <div className="flex items-stretch h-10 rounded-lg overflow-visible border border-transparent relative z-10">
                      <button
                        onClick={handleSendSocial}
                        disabled={!hasTextContent(composerData.socialBody ?? '') || sendingSocialMessage}
                        className="px-4 py-2 bg-brand-primary text-white rounded-l-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      <div className="relative flex-shrink-0 h-full rounded-r-lg overflow-hidden" ref={scheduleDropdownAnchorRef}>
                        <button
                          type="button"
                          onClick={openScheduleOptions}
                          disabled={!hasTextContent(composerData.socialBody ?? '') || sendingSocialMessage || !onScheduleMessage}
                          className="h-full min-w-[36px] px-3 bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-white/30 flex items-center justify-center"
                          aria-label="Send options"
                          aria-expanded={sendDropdownOpen}
                          aria-haspopup="menu"
                        >
                          <CaretDown size={16} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : composerMode === 'comment' ? (
              <div className="mt-2">
                <div className="mb-2">
                  <label className="text-sm font-semibold text-foreground">Comment</label>
                </div>
                <div className="relative border border-black/[0.06] rounded-lg bg-white overflow-hidden">
                  <Textarea
                    value={stripHTML(commentBody)}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write your comment here..."
                    className="min-h-[130px] resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:border-transparent"
                  />
                  <div className="flex items-center justify-end gap-2 p-2 border-t border-gray-100">
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

                  {/* Mention Dropdown */}
                  {showMentionDropdown && filteredTeamMembers.length > 0 && (
                    <div
                      ref={mentionDropdownRef}
                      className="fixed z-50 bg-white border border-black/[0.06] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-h-60 overflow-auto min-w-[200px]"
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
                <div className="flex items-center gap-2 m-0 px-1">
                  <div className="flex border border-black/[0.06] rounded-lg focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary items-center gap-2 flex-1 h-[40px] px-3 bg-white transition-all duration-150">
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
                          <div className="absolute z-50 w-full mt-1 bg-white border border-black/[0.06] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-h-60 overflow-auto animate-dropdown-below-enter">
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
                                {phoneNumbers.map((phone) => {
                                  const isSelected = selectedPhoneNumber === phone.id.toString()
                                  return (
                                    <button
                                      key={phone.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedPhoneNumber(phone.id.toString())
                                        setPhoneDropdownOpen(false)
                                      }}
                                      className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-transparent text-brand-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                      <span>{phone.phone}</span>
                                      {isSelected && <Check size={16} className="text-brand-primary flex-shrink-0" />}
                                    </button>
                                  )
                                })}
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
                            className="w-full px-3 py-2 h-[40px] border border-black/[0.06] rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-white"
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
                              <div className="absolute z-50 w-full mt-1 bg-white border border-black/[0.06] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-h-60 animate-dropdown-below-enter">
                                <div className="max-h-44 overflow-y-auto">
                                  {emailAccounts.map((account) => {
                                    const gmailError = getGmailWatchErrorInfo(account)
                                    return (
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
                                        {gmailError && (
                                          <div className="px-3 pb-1.5 text-xs text-amber-700 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-2 flex-wrap" title={gmailError.actionHint}>
                                            <span>{gmailError.shortLabel}</span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                if (onOpenAuthPopup) onOpenAuthPopup()
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
                      <div className="flex items-start gap-4 m-0 px-1">
                        {showCC && (
                          <div className="flex items-start gap-2 flex-1 w-full">
                            <div className="flex border border-black/[0.06] rounded-lg focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary items-center gap-2 flex-1 min-h-[40px] px-3 bg-white transition-all duration-150">
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
                            <div className="flex border border-black/[0.06] rounded-lg focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary items-center gap-2 flex-1 min-h-[40px] px-3 bg-white transition-all duration-150">
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

                    <div className="flex items-center gap-2 m-0 px-1">
                      <div className={cn("flex rounded-lg focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary items-center flex-1 bg-white transition-all duration-150", subjectVariablesDropdownOpen ? "border-0" : "border border-black/[0.06]")}>
                        <div className="flex items-center gap-2 flex-1 px-3 h-[40px]">
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
                          <div className="w-[0.5px] h-[40px] bg-black/[0.08] flex-shrink-0"></div>
                        )}
                        {/* Variables dropdown */}
                        {uniqueColumns && uniqueColumns.length > 0 && (
                          <div className="relative flex-shrink-0" ref={subjectVariablesDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setSubjectVariablesDropdownOpen(!subjectVariablesDropdownOpen)}
                              className={cn(
                                "px-3 py-2 w-32 flex items-center justify-between text-sm text-gray-700 transition-colors rounded-[12px]",
                                subjectVariablesDropdownOpen ? "bg-black/[0.02] border-0" : "hover:bg-gray-50"
                              )}
                            >
                              <span>Variables</span>
                              <CaretDown size={16} className="text-gray-400" />
                            </button>
                            {subjectVariablesDropdownOpen && (
                              <div className="absolute z-50 right-0 mt-1 px-2 py-0 bg-white rounded-lg border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.08)] animate-dropdown-below-enter max-h-60 overflow-hidden min-w-[200px]">
                                <div
                                  ref={subjectVarListRef}
                                  className="relative flex flex-col py-0 max-h-[312px] overflow-auto"
                                  onMouseLeave={() => setSubjectVarHoveredKey(null)}
                                >
                                  {subjectVarPillStyle.height > 0 && (
                                    <div
                                      className="absolute left-2 right-2 rounded-lg bg-black/[0.02] pointer-events-none transition-[top,height] duration-150 ease-out z-0"
                                      style={{ top: subjectVarPillStyle.top, height: subjectVarPillStyle.height }}
                                      aria-hidden
                                    />
                                  )}
                                  {uniqueColumns.map((variable, index) => {
                                    const displayText = variable.startsWith('{') && variable.endsWith('}')
                                      ? variable
                                      : `{${variable}}`
                                    return (
                                      <button
                                        key={index}
                                        ref={(el) => { if (el) subjectVarOptionRefs.current[index] = el }}
                                        onMouseEnter={() => setSubjectVarHoveredKey(index)}
                                        type="button"
                                        onClick={() => {
                                          const variableText = variable.startsWith('{') && variable.endsWith('}')
                                            ? variable
                                            : `{${variable}}`
                                          setComposerData((prev) => ({ ...prev, subject: (prev.subject || '') + variableText }))
                                          setSubjectVariablesDropdownOpen(false)
                                        }}
                                        className="w-full px-2 py-2 text-left text-sm transition-colors text-gray-700 relative z-[1]"
                                      >
                                        {displayText}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Message Body and Send Button */}
                <div className="m-0 px-1">
                  {(composerMode === 'email' || composerMode === 'sms') && composerData.attachments?.length > 0 ? (
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
                  ) : null}

                  {composerMode === 'email' ? (
                    <>
                      {/* Relative container for RichTextEditor and overlapping buttons */}
                      <div className="relative">
                        <RichTextEditor
                          ref={richTextEditorRef}
                          value={composerData.emailBody}
                          onChange={(html) => setComposerData((prev) => ({ ...prev, emailBody: html }))}
                          placeholder="Type your message..."
                          availableVariables={uniqueColumns}
                          toolbarPosition="bottom"
                          toolbarDropdownOpen={variablesDropdownOpen}
                          attachmentButton={
                            <div
                              className="relative"
                              ref={attachmentDropdownRef}
                              onMouseEnter={() => {
                                if (attachmentDropdownTimeoutRef.current) {
                                  clearTimeout(attachmentDropdownTimeoutRef.current)
                                  attachmentDropdownTimeoutRef.current = null
                                }
                                if (composerData.attachments?.length > 0) {
                                  setShowAttachmentDropdown(true)
                                }
                              }}
                              onMouseLeave={() => {
                                attachmentDropdownTimeoutRef.current = setTimeout(() => {
                                  setShowAttachmentDropdown(false)
                                  attachmentDropdownTimeoutRef.current = null
                                }, 300)
                              }}
                            >
                              <>
                                <button
                                  type="button"
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center justify-center relative cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    emailAttachmentInputRef.current?.click()
                                  }}
                                  title="Add attachment"
                                >
                                  <Paperclip size={18} className="text-gray-600 hover:text-brand-primary" />
                                  {composerData.attachments?.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                      {composerData.attachments.length}
                                    </span>
                                  )}
                                </button>
                                <input
                                  ref={emailAttachmentInputRef}
                                  id="message-composer-email-attachment-input"
                                  type="file"
                                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                  multiple
                                  className="hidden"
                                  onChange={handleFileChange}
                                />
                              </>
                              {showAttachmentDropdown && composerData.attachments?.length > 0 && (
                                <div
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[20vw] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-[2000]"
                                  onMouseEnter={() => {
                                    if (attachmentDropdownTimeoutRef.current) {
                                      clearTimeout(attachmentDropdownTimeoutRef.current)
                                      attachmentDropdownTimeoutRef.current = null
                                    }
                                    setShowAttachmentDropdown(true)
                                  }}
                                  onMouseLeave={() => {
                                    attachmentDropdownTimeoutRef.current = setTimeout(() => {
                                      setShowAttachmentDropdown(false)
                                      attachmentDropdownTimeoutRef.current = null
                                    }, 300)
                                  }}
                                >
                                  <div className="p-2">
                                    <div className="text-xs font-semibold text-gray-700 mb-2 px-2">
                                      Attachments ({composerData.attachments.length})
                                    </div>
                                    <div className="space-y-1">
                                      {composerData.attachments.map((file, index) => (
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
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              removeAttachment(index)
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            aria-label="Remove attachment"
                                          >
                                            <X size={16} />
                                          </button>
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
                              <div className="relative" ref={variablesDropdownRef}>
                                <button
                                  type="button"
                                  onClick={() => setVariablesDropdownOpen(!variablesDropdownOpen)}
                                  className={cn(
                                    "px-3 py-2 w-32 border-l-[0.5px] flex items-center justify-between gap-2 text-sm text-gray-700 transition-colors rounded-[12px]",
                                    variablesDropdownOpen ? "bg-black/[0.02] border-0" : "border-black/[0.06] hover:bg-black/[0.02] focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary"
                                  )}
                                >
                                  <span>Variables</span>
                                  <CaretDown size={16} className={`text-gray-400 transition-transform ${variablesDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {variablesDropdownOpen && (
                                  <div className="absolute bottom-full left-0 mb-2 px-2 py-0 bg-white rounded-lg border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.08)] animate-dropdown-below-enter max-h-60 overflow-hidden min-w-[200px] z-50">
                                    <div
                                      ref={bodyVarListRef}
                                      className="relative flex flex-col py-0"
                                      onMouseLeave={() => setBodyVarHoveredKey(null)}
                                    >
                                      {bodyVarPillStyle.height > 0 && (
                                        <div
                                          className="absolute left-2 right-2 rounded-lg bg-black/[0.02] pointer-events-none transition-[top,height] duration-150 ease-out z-0"
                                          style={{ top: bodyVarPillStyle.top, height: bodyVarPillStyle.height }}
                                          aria-hidden
                                        />
                                      )}
                                      {uniqueColumns.map((variable, index) => {
                                        const displayText = variable.startsWith('{') && variable.endsWith('}')
                                          ? variable
                                          : `{${variable}}`
                                        return (
                                          <button
                                            key={index}
                                            ref={(el) => { if (el) bodyVarOptionRefs.current[index] = el }}
                                            onMouseEnter={() => setBodyVarHoveredKey(index)}
                                            type="button"
                                            onClick={() => {
                                              if (richTextEditorRef.current) {
                                                richTextEditorRef.current.insertVariable(variable)
                                              }
                                              setVariablesDropdownOpen(false)
                                            }}
                                            className="w-full px-2 py-2 text-left text-sm transition-colors text-gray-700 relative z-[1]"
                                          >
                                            {displayText}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null
                          }
                        />

                      </div>

                      {/* Footer with Template, Character Count, and Send Button */}
                      {(composerMode === 'email' || composerMode === 'sms') && (
                        <div className="flex items-center justify-between gap-3 mt-0 pt-0 border-gray-200">
                          {/* My Templates Button with Dropdown */}
                          <div className="relative" ref={templatesDropdownRef}>
                            <button
                              onClick={() => {
                                if (!showTemplatesDropdown && !templatesFetched && !templatesLoading) {
                                  fetchTemplates()
                                }
                                setShowTemplatesDropdown(!showTemplatesDropdown)
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-black/[0.02] rounded-[12px] transition-colors"
                            >
                              {renderBrandedIcon("/messaging/templateIcon.svg", 18, 18)}
                              <span>Templates</span>
                              <CaretDown size={16} className={`transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Templates Dropdown */}
                            {showTemplatesDropdown && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 px-2 py-0 bg-white rounded-lg border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.08)] animate-dropdown-below-enter max-h-[312px] overflow-hidden z-[100]">
                                {templatesLoading ? (
                                  <div className="p-4 text-center">
                                    <CircularProgress size={20} />
                                  </div>
                                ) : templates.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-gray-500">
                                    No templates found
                                  </div>
                                ) : (
                                  <div
                                    ref={templateListRef}
                                    className="relative flex flex-col py-0 max-h-[312px] overflow-auto"
                                    onMouseLeave={() => setTemplateHoveredKey(null)}
                                  >
                                    {templatePillStyle.height > 0 && (
                                      <div
                                        className="absolute left-2 right-2 rounded-lg bg-black/[0.02] pointer-events-none transition-[top,height] duration-150 ease-out z-0"
                                        style={{ top: templatePillStyle.top, height: templatePillStyle.height }}
                                        aria-hidden
                                      />
                                    )}
                                    {templates.map((template, idx) => {
                                      const key = template.id || template.templateId || idx
                                      return (
                                        <Tooltip
                                          key={key}
                                          title={template.subject}
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
                                              sx: { color: '#ffffff' },
                                            },
                                          }}
                                        >
                                          <button
                                            ref={(el) => { if (el) templateOptionRefs.current[key] = el }}
                                            onMouseEnter={() => setTemplateHoveredKey(key)}
                                            onClick={() => handleTemplateSelect(template)}
                                            className="group w-full flex flex-row items-center justify-between px-2 py-2 text-left text-sm transition-transform duration-150 ease-out active:scale-[0.98] relative z-[1]"
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
                                                className="flex-shrink-0 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete template"
                                              >
                                                <Trash2 size={16} className="text-black/80" />
                                              </button>
                                            )}
                                          </button>
                                        </Tooltip>
                                      )
                                    })}
                                  </div>
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

                            {/* Send: primary = Send Now, dropdown = Schedule (portal so not clipped by overflow) */}
                            <div className="flex items-stretch h-10 mt-1 rounded-lg overflow-visible border border-transparent relative z-10">
                              <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={
                                  sendingMessage ||
                                  (composerMode === 'email'
                                    ? (!hasTextContent(composerData.emailBody) || !selectedEmailAccount || !composerData.to)
                                    : (!hasTextContent(composerData.smsBody) || !selectedPhoneNumber || !composerData.to)
                                  )
                                }
                                className="h-full px-5 bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-l-lg"
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
                              <div className="relative flex-shrink-0 h-full rounded-r-lg overflow-hidden" ref={scheduleDropdownAnchorRef}>
                                <button
                                  type="button"
                                  onClick={openScheduleOptions}
                                  disabled={
                                    sendingMessage ||
                                    (composerMode === 'email'
                                      ? (!hasTextContent(composerData.emailBody) || !selectedEmailAccount || !composerData.to)
                                      : (!hasTextContent(composerData.smsBody) || !selectedPhoneNumber || !composerData.to)
                                    )
                                  }
                                  className="h-full min-w-[36px] px-3 bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-white/30 flex items-center justify-center"
                                  aria-label="Send options"
                                  aria-expanded={sendDropdownOpen}
                                  aria-haspopup="menu"
                                >
                                  <CaretDown size={16} weight="bold" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* SMS/Text: same RichTextEditor as email with formatting toolbar, attachment, and character limit */}
                      <div className="relative">
                        <RichTextEditor
                          ref={richTextEditorRef}
                          value={smsBodyToEditorValue(composerData.smsBody)}
                          onChange={(html) => setComposerData((prev) => ({ ...prev, smsBody: html }))}
                          placeholder="Type your message..."
                          availableVariables={uniqueColumns}
                          toolbarPosition="bottom"
                          maxCharLimit={SMS_CHAR_LIMIT}
                          attachmentButton={
                            <div
                              className="relative"
                              ref={attachmentDropdownRef}
                              onMouseEnter={() => {
                                if (attachmentDropdownTimeoutRef.current) {
                                  clearTimeout(attachmentDropdownTimeoutRef.current)
                                  attachmentDropdownTimeoutRef.current = null
                                }
                                if (composerData.attachments?.length > 0) {
                                  setShowAttachmentDropdown(true)
                                }
                              }}
                              onMouseLeave={() => {
                                attachmentDropdownTimeoutRef.current = setTimeout(() => {
                                  setShowAttachmentDropdown(false)
                                  attachmentDropdownTimeoutRef.current = null
                                }, 300)
                              }}
                            >
                              <>
                                <button
                                  type="button"
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center justify-center relative cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    smsAttachmentInputRef.current?.click()
                                  }}
                                  title="Add attachment"
                                >
                                  <Paperclip size={18} className="text-gray-600 hover:text-brand-primary" />
                                  {composerData.attachments?.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                      {composerData.attachments.length}
                                    </span>
                                  )}
                                </button>
                                <input
                                  ref={smsAttachmentInputRef}
                                  id="message-composer-sms-attachment-input"
                                  type="file"
                                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                  multiple
                                  className="hidden"
                                  onChange={handleFileChange}
                                />
                              </>
                              {showAttachmentDropdown && composerData.attachments?.length > 0 && (
                                <div
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[20vw] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-[2000]"
                                  onMouseEnter={() => {
                                    if (attachmentDropdownTimeoutRef.current) {
                                      clearTimeout(attachmentDropdownTimeoutRef.current)
                                      attachmentDropdownTimeoutRef.current = null
                                    }
                                    setShowAttachmentDropdown(true)
                                  }}
                                  onMouseLeave={() => {
                                    attachmentDropdownTimeoutRef.current = setTimeout(() => {
                                      setShowAttachmentDropdown(false)
                                      attachmentDropdownTimeoutRef.current = null
                                    }, 300)
                                  }}
                                >
                                  <div className="p-2">
                                    <div className="text-xs font-semibold text-gray-700 mb-2 px-2">
                                      Attachments ({composerData.attachments.length})
                                    </div>
                                    <div className="space-y-1">
                                      {composerData.attachments.map((file, index) => (
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
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              removeAttachment(index)
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            aria-label="Remove attachment"
                                          >
                                            <X size={16} />
                                          </button>
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
                              <div className="relative" ref={variablesDropdownRef}>
                                <button
                                  type="button"
                                  onClick={() => setVariablesDropdownOpen(!variablesDropdownOpen)}
                                  className="px-3 py-2 w-32 border-l border-black/[0.06] focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary flex items-center justify-between gap-2 text-sm text-gray-700 hover:bg-black/[0.02] transition-colors"
                                >
                                  <span>Variables</span>
                                  <CaretDown size={16} className={`text-gray-400 transition-transform ${variablesDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {variablesDropdownOpen && (
                                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-black/[0.06] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-h-60 overflow-auto min-w-[200px] z-50 animate-dropdown-below-enter">
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
                      <div className="flex items-center justify-between gap-3 mt-0 pt-0 border-gray-200">
                        {/* My Templates Button with Dropdown */}
                        <div className="relative" ref={templatesDropdownRef}>
                          <button
                            onClick={() => {
                              if (!showTemplatesDropdown) {
                                fetchTemplates()
                              }
                              setShowTemplatesDropdown(!showTemplatesDropdown)
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-black/[0.02] rounded-[12px] transition-colors"
                          >
                            {renderBrandedIcon("/messaging/templateIcon.svg", 18, 18)}
                            <span>Templates</span>
                            <CaretDown size={16} className={`transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Templates Dropdown */}
                          {showTemplatesDropdown && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 px-2 py-0 bg-white rounded-lg border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.08)] animate-dropdown-below-enter max-h-[312px] overflow-hidden z-[100]">
                              {templatesLoading ? (
                                <div className="p-4 text-center">
                                  <CircularProgress size={20} />
                                </div>
                              ) : templates.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  No templates found
                                </div>
                              ) : (
                                <div
                                  ref={templateListRef}
                                  className="relative flex flex-col py-0 max-h-[312px] overflow-auto"
                                  onMouseLeave={() => setTemplateHoveredKey(null)}
                                >
                                  {templatePillStyle.height > 0 && (
                                    <div
                                      className="absolute left-2 right-2 rounded-lg bg-black/[0.02] pointer-events-none transition-[top,height] duration-150 ease-out z-0"
                                      style={{ top: templatePillStyle.top, height: templatePillStyle.height }}
                                      aria-hidden
                                    />
                                  )}
                                  {templates.map((template, idx) => {
                                    const key = template.id || template.templateId || idx
                                    return (
                                      <Tooltip
                                        key={key}
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
                                            sx: { color: '#ffffff' },
                                          },
                                        }}
                                      >
                                        <button
                                          ref={(el) => { if (el) templateOptionRefs.current[key] = el }}
                                          onMouseEnter={() => setTemplateHoveredKey(key)}
                                          onClick={() => handleTemplateSelect(template)}
                                          className="group flex items-center justify-between gap-2 w-full px-2 py-2 text-left text-sm transition-transform duration-150 ease-out active:scale-[0.98] relative z-[1]"
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
                                              className="flex-shrink-0 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                              title="Delete template"
                                            >
                                              <Trash2 size={16} className="text-black/80" />
                                            </button>
                                          )}
                                        </button>
                                      </Tooltip>
                                    )
                                  })}
                                </div>
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

                          {/* Send: primary = Send Now, dropdown = Schedule (portal; ref shared with email) */}
                          <div className="flex items-stretch h-10 mt-1 rounded-lg overflow-visible border border-transparent relative z-10">
                            <button
                              type="button"
                              onClick={handleSendMessage}
                              disabled={
                                sendingMessage ||
                                !hasTextContent(composerData.smsBody) ||
                                (composerMode === 'sms' && (!selectedPhoneNumber || !composerData.to))
                              }
                              className="h-full px-5 bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-l-lg"
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
                            <div className="relative flex-shrink-0 h-full rounded-r-lg overflow-hidden" ref={scheduleDropdownAnchorRef}>
                              <button
                                type="button"
                                onClick={openScheduleOptions}
                                disabled={
                                  sendingMessage ||
                                  !hasTextContent(composerData.smsBody) ||
                                  (composerMode === 'sms' && (!selectedPhoneNumber || !composerData.to))
                                }
                                className="h-full min-w-[36px] px-3 bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-white/30 flex items-center justify-center"
                                aria-label="Send options"
                                aria-expanded={sendDropdownOpen}
                                aria-haspopup="menu"
                              >
                                <CaretDown size={16} weight="bold" />
                              </button>
                            </div>
                          </div>
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

      {/* Send dropdown (portal so not clipped by overflow-hidden); position above trigger */}
      {sendDropdownOpen &&
        typeof document !== 'undefined' &&
        document.body &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              aria-hidden
              onClick={() => {
                setSendDropdownOpen(false)
                setSendDropdownRect(null)
              }}
            />
            {sendDropdownRect && (
              <div
                className="fixed z-[9999] min-w-[160px] py-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                role="menu"
                style={{
                  right: typeof window !== 'undefined' ? window.innerWidth - sendDropdownRect.right : 0,
                  bottom: typeof window !== 'undefined' ? window.innerHeight - sendDropdownRect.top + 8 : 0,
                }}
              >
                {/*<button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    setSendDropdownOpen(false)
                    setSendDropdownRect(null)
                    handleSendMessage()
                  }}
                >
                  <PaperPlaneTilt size={16} weight="fill" />
                  Send now
                </button>*/}
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    setSendDropdownOpen(false)
                    setSendDropdownRect(null)
                    const in5 = new Date(Date.now() + 5 * 60 * 1000)
                    setScheduleDate(in5.toISOString().slice(0, 10))
                    setScheduleTime(`${String(in5.getHours()).padStart(2, '0')}:${String(in5.getMinutes()).padStart(2, '0')}`)
                    setScheduleModalOpen(true)
                  }}
                >
                  <CalendarBlank size={16} />
                  Schedule
                </button>
              </div>
            )}
          </>,
          document.body
        )}

      {/* Schedule message modal - same date/time pickers as TaskForm */}
      <Dialog open={scheduleModalOpen} onOpenChange={(open) => !open && setScheduleModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule message</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <Popover open={scheduleDatePickerOpen} onOpenChange={setScheduleDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 h-[40px] text-left text-sm"
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {scheduleDate ? format(scheduleDate, 'MM/dd/yy') : 'Pick a date'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" style={{ zIndex: 1600 }}>
                  <div className="p-3 space-y-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={scheduleDate && format(scheduleDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          setScheduleDate(today)
                        }}
                      >
                        Today
                      </Button>
                      <Button
                        type="button"
                        variant={scheduleDate && format(scheduleDate, 'yyyy-MM-dd') === format(new Date(Date.now() + 86400000), 'yyyy-MM-dd') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const tomorrow = new Date()
                          tomorrow.setDate(tomorrow.getDate() + 1)
                          tomorrow.setHours(0, 0, 0, 0)
                          setScheduleDate(tomorrow)
                        }}
                      >
                        Tomorrow
                      </Button>
                      <Button
                        type="button"
                        variant={scheduleDate ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => setScheduleDate(null)}
                      >
                        Custom
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Time</label>
              <Popover open={scheduleTimePickerOpen} onOpenChange={setScheduleTimePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex h-[40px] w-full items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-left text-[14px]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:border-brand-primary cursor-pointer hover:border-black/10'
                    )}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {scheduleTime ? formatTime12(scheduleTime) : 'Due time (optional)'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={4} style={{ zIndex: 1600 }} onOpenAutoFocus={(e) => e.preventDefault()}>
                  <CustomTimePicker
                    value={scheduleTime}
                    onChange={(next) => { setScheduleTime(next); setScheduleTimePickerOpen(false); }}
                    onCancel={() => setScheduleTimePickerOpen(false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!scheduleDate || !scheduleTime || !onScheduleMessage) return
                  const at = new Date(`${format(scheduleDate, 'yyyy-MM-dd')}T${scheduleTime}`)
                  if (isNaN(at.getTime()) || at.getTime() <= Date.now()) {
                    toast.error('Please pick a future date and time')
                    return
                  }
                  onScheduleMessage(at)
                  setScheduleModalOpen(false)
                }}
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Social-only message settings modal (before first-time Connect OAuth) */}
      <MessageSettingsModal
        open={socialSettingsModalOpen}
        onClose={() => setSocialSettingsModalOpen(false)}
        selectedUser={selectedUser}
        socialOnly
        onSaved={() => {
          setSocialSettingsModalOpen(false)
          if (isWhatsAppMode) {
            connectWithWhatsAppOAuth()
          } else {
            connectWithFacebookOAuth()
          }
        }}
      />

      {/* Connect Facebook / Instagram modal */}
      <Dialog open={connectModalOpen} onOpenChange={(open) => !connectSubmitting && setConnectModalOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connectPlatform === 'facebook'
                ? 'Connect Facebook Page'
                : connectPlatform === 'whatsapp'
                  ? 'Connect WhatsApp (Cloud API)'
                  : 'Connect Instagram Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConnectSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {connectPlatform === 'facebook'
                  ? 'Page ID'
                  : connectPlatform === 'whatsapp'
                    ? 'Phone number ID'
                    : 'Instagram Business Account ID'}
              </label>
              <Input
                value={connectForm.externalId}
                onChange={(e) => setConnectForm((f) => ({ ...f, externalId: e.target.value }))}
                placeholder={
                  connectPlatform === 'facebook'
                    ? 'Page ID from Meta Developer Console'
                    : connectPlatform === 'whatsapp'
                      ? 'WhatsApp Phone number ID from Meta'
                      : 'IG Business Account ID'
                }
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

      {!isProductionEnvironment && (
        <SocialCommentSmartReplyModal
          open={smartReplyModalOpen}
          onClose={() => setSmartReplyModalOpen(false)}
          selectedUser={selectedUser}
          socialConnections={socialConnections}
          onSaved={onConnectionSuccess}
        />
      )}

      {/* Templates dropdown rendered in portal so it is not clipped by overflow and does not affect layout */}
      {typeof document !== 'undefined' && document.body && showTemplatesDropdown && createPortal(
        <div
          ref={templatesPortalRef}
          className="w-64 px-2 py-0 bg-white rounded-2xl border border-[#eaeaea] shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-2 duration-200 ease-out max-h-[312px] overflow-hidden z-[100]"
          style={{
            position: 'fixed',
            left: templatesDropdownPosition.left,
            bottom: templatesDropdownPosition.bottom,
          }}
        >
          {templatesLoading ? (
            <div className="p-4 text-center">
              <CircularProgress size={20} />
            </div>
          ) : templates.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No templates found
            </div>
          ) : (
            <div
              ref={templateListRef}
              className="relative flex flex-col py-0 max-h-[312px] overflow-auto"
              onMouseLeave={() => setTemplateHoveredKey(null)}
            >
              {templatePillStyle.height > 0 && (
                <div
                  className="absolute left-2 right-2 rounded-lg bg-black/[0.02] pointer-events-none transition-[top,height] duration-150 ease-out z-0"
                  style={{ top: templatePillStyle.top, height: templatePillStyle.height }}
                  aria-hidden
                />
              )}
              {templates.map((template, idx) => {
                const key = template.id || template.templateId || idx
                const tooltipTitle = composerMode === 'email' ? template.subject : template.content
                const plain = stripHTML(tooltipTitle || '')
                return (
                  <Tooltip
                    key={key}
                    title={plain}
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
                        sx: { color: '#ffffff' },
                      },
                    }}
                  >
                    <button
                      ref={(el) => { if (el) templateOptionRefs.current[key] = el }}
                      onMouseEnter={() => setTemplateHoveredKey(key)}
                      onClick={() => handleTemplateSelect(template)}
                      className="group w-full flex flex-row items-center justify-between px-2 py-2 text-left text-sm transition-transform duration-150 ease-out active:scale-[0.98] relative z-[1]"
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
                          className="flex-shrink-0 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete template"
                        >
                          <Trash2 size={16} className="text-black/80" />
                        </button>
                      )}
                    </button>
                  </Tooltip>
                )
              })}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export default MessageComposer
