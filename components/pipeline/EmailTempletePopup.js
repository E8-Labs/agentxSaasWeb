import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
} from '@mui/material'
import { ArrowDropDownIcon } from '@mui/x-date-pickers'
import { Plus, Trash2, Paperclip, X, Send } from 'lucide-react'
import { CaretDown } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import RichTextEditor from '@/components/common/RichTextEditor'
import ChipInput from '@/constants/ChipsInput'
import { PersistanceKeys } from '@/constants/Constants'
import { Input } from '@/components/ui/input'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import SplitButtonCN from '@/components/ui/SplitButtonCN'

import { formatDecimalValue } from '../agency/agencyServices/CheckAgencyData'
import { GoogleOAuth } from '../auth/socialllogins/AuthServices'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import { getUniquesColumn } from '../globalExtras/GetUniqueColumns'
import {
  createTemplete,
  deleteTemplete,
  getGmailAccounts,
  getTempleteDetails,
  getTempletes,
  updateTemplete,
} from './TempleteServices'

function EmailTempletePopup({
  open,
  onClose,
  // templetes,
  // setTempletes,
  communicationType,
  addRow,
  isEditing = false,
  editingRow = null,
  onUpdateRow = null,
  selectedGoogleAccount,
  setSelectedGoogleAccount,
  onSendEmail = null,
  isLeadEmail = false,
  leadEmail = null,
  leadId = null,
  selectedUser,
  bodyHeight = null, // Optional prop for custom body text field height
}) {
  const richTextEditorRef = useRef(null)
  const emailDropdownRef = useRef(null)
  const attachmentInputRef = useRef(null)
  const subjectVariablesDropdownRef = useRef(null)
  const subjectVariablesButtonRef = useRef(null)
  const variablesDropdownRef = useRef(null)
  const [subjectVariablesDropdownOpen, setSubjectVariablesDropdownOpen] = useState(false)
  const [variablesDropdownOpen, setVariablesDropdownOpen] = useState(false)
  const [subjectDropdownPosition, setSubjectDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  // Removed console.logs that were causing re-renders on every click

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [ccEmails, setccEmails] = useState([])
  const [bccEmails, setBccEmails] = useState([])
  const [ccEmailInput, setCcEmailInput] = useState('')
  const [bccEmailInput, setBccEmailInput] = useState('')
  const [attachments, setAttachments] = useState([])
  const [subjectChanged, setSubjectChanged] = useState(false)
  const [bodyChanged, setBodyChanged] = useState(false)
  const [ccEmailsChanged, setccEmailsChanged] = useState(false)
  const [bccEmailsChanged, setBccEmailsChanged] = useState(false)
  const [attachmentsChanged, setAttachmentsChanged] = useState(false)
  const [accountChanged, setAccountChanged] = useState(false)
  const [tempNameChanged, setTempNameChanged] = useState(false)
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false)

  const [selectedTemp, setSelectedTemp] = useState(null)
  const [saveEmailLoader, setSaveEmailLoader] = useState(false)
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  const [detailsLoader, setDetailsLoader] = useState(null)

  const [delTempLoader, setDelTempLoader] = useState(null)
  const [templetes, setTempletes] = useState([])
  const [loginLoader, setLoginLoader] = useState(false)
  const [saveAsTemplate, setSaveAsTemplate] = useState(true) // Default to true for cadence templates

  // above return
  // disable save if any field is missing or while saving

  const [showSnackBar, setShowSnackBar] = useState({
    message: '',
    type: SnackbarTypes.Error,
  })
  const [tempName, setTempName] = useState(null)
  const [templateEmailAccountId, setTemplateEmailAccountId] = useState(null)

  const [googleAccounts, setGoogleAccounts] = useState([])
  const [googleAccountLoader, setGoogleAccountLoader] = useState(false)
  const [uniqueColumns, setUniqueColumns] = useState([])

  const [shouldUpdate, setShouldUpdate] = useState(false)

  const [IsdefaultCadence, setIsdefaultCadence] = useState(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        setEmailDropdownOpen(false)
      }
      if (subjectVariablesDropdownOpen) {
        const isClickInsideButton = subjectVariablesButtonRef.current?.contains(event.target)
        // Check if click is inside the portal dropdown (it's rendered in document.body)
        const portalDropdown = document.querySelector('.subject-variables-dropdown')
        const isClickInsideDropdown = portalDropdown?.contains(event.target)
        if (!isClickInsideButton && !isClickInsideDropdown) {
          setSubjectVariablesDropdownOpen(false)
        }
      }
      if (variablesDropdownRef.current && !variablesDropdownRef.current.contains(event.target)) {
        setVariablesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [subjectVariablesDropdownOpen])

  useEffect(() => {
    getColumns()
    templatesForSelectedType()
    let isDefault = localStorage.getItem(
      PersistanceKeys.isDefaultCadenceEditing,
    )
    setIsdefaultCadence(isDefault)
    // Load accounts when modal opens
    if (open) {
      getAccounts(selectedUser?.id)
      // Reset checkbox to default (true) when modal opens
      setSaveAsTemplate(true)
    }
  }, [open])

  const templatesForSelectedType = async () => {
    let temp = await getTempletes('email', selectedUser?.id)
    setTempletes(temp)
  }

  const getColumns = async () => {
    // Default columns that should always be available
    const defaultColumns = [
      '{First Name}',
      '{Last Name}',
      '{Email}',
      '{Phone}',
      '{Address}',
    ]

    let res = await getUniquesColumn(selectedUser?.id)

    // Merge default columns with API response, removing duplicates
    if (res && Array.isArray(res)) {
      const mergedColumns = [
        ...defaultColumns,
        ...res.filter((col) => !defaultColumns.includes(col)),
      ]
      setUniqueColumns(mergedColumns)
    } else {
      // If API fails or returns null, use default columns
      setUniqueColumns(defaultColumns)
    }
  }

  // Auto-fill form when editing
  useEffect(() => {
    if (isEditing && editingRow && open) {
      // Load template details if templateId or id exists
      if (editingRow.templateId || editingRow.id) {
        loadTemplateDetails(editingRow)
      }

      getAccounts(selectedUser?.id) // Always load accounts regardless of existing emailAccountId
    } else if (!isEditing) {
      // Reset form when not editing
      setTempName('')
      setSubject('')
      setBody('')
      setccEmails([])
      setBccEmails([])
      setCcEmailInput('')
      setBccEmailInput('')
      setAttachments([])
      setSelectedTemp(null)
      setShowCC(false)
      setShowBCC(false)
      setTemplateEmailAccountId(null)
      // setSelectedGoogleAccount(null); // Reset selected account too
    }
  }, [isEditing, editingRow, open])

  // Set selectedTemp when templates are loaded and we're editing
  // This ensures the dropdown shows the correct template even if templates load after details
  useEffect(() => {
    const templateId = editingRow?.templateId || editingRow?.id
    if (isEditing && templateId && templetes.length > 0) {
      const matchingTemplate = templetes.find(
        (t) => t.id === templateId || t.templateId === templateId
      )
      // Set selectedTemp if we found a match and either:
      // 1. selectedTemp is not set yet, OR
      // 2. selectedTemp is set but doesn't match the current templateId
      if (matchingTemplate && (!selectedTemp || selectedTemp.id !== templateId)) {
        setSelectedTemp(matchingTemplate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templetes, isEditing, editingRow?.templateId, editingRow?.id])

  const loadTemplateDetails = async (template) => {
    try {
      setDetailsLoader(template.id || template.templateId)
      const details = await getTempleteDetails(template)
      if (details) {
        setTempName(details.templateName || '')
        setSubject(details.subject || '')
        setBody(details.content || '')

        // Parse ccEmails if it's a string (JSON string)
        let parsedCcEmails = []
        if (details.ccEmails) {
          if (typeof details.ccEmails === 'string') {
            try {
              parsedCcEmails = JSON.parse(details.ccEmails)
            } catch (e) {
              console.error('Error parsing ccEmails:', e)
              parsedCcEmails = []
            }
          } else if (Array.isArray(details.ccEmails)) {
            parsedCcEmails = details.ccEmails
          }
        }

        // Parse bccEmails if it's a string (JSON string)
        let parsedBccEmails = []
        if (details.bccEmails) {
          if (typeof details.bccEmails === 'string') {
            try {
              parsedBccEmails = JSON.parse(details.bccEmails)
            } catch (e) {
              console.error('Error parsing bccEmails:', e)
              parsedBccEmails = []
            }
          } else if (Array.isArray(details.bccEmails)) {
            parsedBccEmails = details.bccEmails
          }
        }

        setccEmails(Array.isArray(parsedCcEmails) ? parsedCcEmails : [])
        setBccEmails(Array.isArray(parsedBccEmails) ? parsedBccEmails : [])
        setAttachments(details.attachments || [])

        // Show CC/BCC fields if they have values
        if (parsedCcEmails && Array.isArray(parsedCcEmails) && parsedCcEmails.length > 0) {
          setShowCC(true)
        }
        if (parsedBccEmails && Array.isArray(parsedBccEmails) && parsedBccEmails.length > 0) {
          setShowBCC(true)
        }

        // Store emailAccountId from template details if available
        // Note: Templates don't typically store emailAccountId, but check just in case
        if (details.emailAccountId) {
          setTemplateEmailAccountId(details.emailAccountId)
        }

        // Set selectedTemp to the matching template from templetes array
        // This ensures the dropdown shows the selected template when editing
        const templateId = template.templateId || template.id || details.id
        if (templateId && templetes.length > 0) {
          const matchingTemplate = templetes.find(
            (t) => t.id === templateId || t.templateId === templateId
          )
          if (matchingTemplate) {
            setSelectedTemp(matchingTemplate)
          } else {
            setSelectedTemp({
              id: templateId,
              templateId: templateId,
              templateName: details.templateName,
              subject: details.subject,
              content: details.content,
            })
          }
        }
      }
    } catch (error) {
      console.error('Error loading template details:', error)
    } finally {
      setDetailsLoader(null)
    }
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

  // Ensure ccEmails and bccEmails are always arrays before filtering
  const safeCcEmails = Array.isArray(ccEmails) ? ccEmails : []
  const safeBccEmails = Array.isArray(bccEmails) ? bccEmails : []

  const invalidEmails = [
    ...safeCcEmails.filter((e) => !emailRegex.test(String(e).trim())),
    ...safeBccEmails.filter((e) => !emailRegex.test(String(e).trim())),
  ]

  // Helper function to add email to CC array
  const addCcEmail = (email) => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && emailRegex.test(trimmedEmail)) {
      const currentCcEmails = Array.isArray(ccEmails) ? ccEmails : []
      if (!currentCcEmails.includes(trimmedEmail)) {
        setccEmails([...currentCcEmails, trimmedEmail])
        setccEmailsChanged(true)
      }
      setCcEmailInput('')
    }
  }

  // Helper function to add email to BCC array
  const addBccEmail = (email) => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && emailRegex.test(trimmedEmail)) {
      const currentBccEmails = Array.isArray(bccEmails) ? bccEmails : []
      if (!currentBccEmails.includes(trimmedEmail)) {
        setBccEmails([...currentBccEmails, trimmedEmail])
        setBccEmailsChanged(true)
      }
      setBccEmailInput('')
    }
  }

  // Helper function to remove email from CC array
  const removeCcEmail = (emailToRemove) => {
    const currentCcEmails = Array.isArray(ccEmails) ? ccEmails : []
    setccEmails(currentCcEmails.filter((email) => email !== emailToRemove))
    setccEmailsChanged(true)
  }

  // Helper function to remove email from BCC array
  const removeBccEmail = (emailToRemove) => {
    const currentBccEmails = Array.isArray(bccEmails) ? bccEmails : []
    setBccEmails(currentBccEmails.filter((email) => email !== emailToRemove))
    setBccEmailsChanged(true)
  }

  // Handle CC input change - support pasting multiple emails
  const handleCcInputChange = (e) => {
    const value = e.target.value
    // Check if input contains comma (likely pasted multiple emails)
    if (value.includes(',')) {
      const emails = value.split(',').map(email => email.trim()).filter(email => email)
      const currentCcEmails = Array.isArray(ccEmails) ? ccEmails : []
      emails.forEach(email => {
        if (emailRegex.test(email) && !currentCcEmails.includes(email)) {
          setccEmails(prev => {
            const prevArray = Array.isArray(prev) ? prev : []
            return [...prevArray, email]
          })
          setccEmailsChanged(true)
        }
      })
      setCcEmailInput('')
    } else {
      setCcEmailInput(value)
    }
  }

  // Handle BCC input change - support pasting multiple emails
  const handleBccInputChange = (e) => {
    const value = e.target.value
    // Check if input contains comma (likely pasted multiple emails)
    if (value.includes(',')) {
      const emails = value.split(',').map(email => email.trim()).filter(email => email)
      const currentBccEmails = Array.isArray(bccEmails) ? bccEmails : []
      emails.forEach(email => {
        if (emailRegex.test(email) && !currentBccEmails.includes(email)) {
          setBccEmails(prev => {
            const prevArray = Array.isArray(prev) ? prev : []
            return [...prevArray, email]
          })
          setBccEmailsChanged(true)
        }
      })
      setBccEmailInput('')
    } else {
      setBccEmailInput(value)
    }
  }

  // Handle CC input key events
  const handleCcInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || (e.key === ' ' && ccEmailInput.trim())) {
      e.preventDefault()
      const email = ccEmailInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && emailRegex.test(email)) {
        if (!ccEmails.includes(email)) {
          setccEmails([...ccEmails, email])
          setccEmailsChanged(true)
        }
        setCcEmailInput('')
      }
    } else if (e.key === 'Backspace' && !ccEmailInput && ccEmails.length > 0) {
      // Remove last email on backspace when input is empty
      removeCcEmail(ccEmails[ccEmails.length - 1])
    }
  }

  const handleCcInputPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const emails = pastedText.split(/[,\s]+/).filter(email => email.trim() && emailRegex.test(email.trim()))
    const newEmails = emails.filter(email => !ccEmails.includes(email.trim()))
    if (newEmails.length > 0) {
      setccEmails([...ccEmails, ...newEmails.map(e => e.trim())])
      setccEmailsChanged(true)
    }
    // Set remaining text as input if there's invalid content
    const remaining = pastedText.split(/[,\s]+/).filter(email => email.trim() && !emailRegex.test(email.trim())).join(' ')
    if (remaining.trim()) {
      setCcEmailInput(remaining)
    } else {
      setCcEmailInput('')
    }
  }

  const handleCcInputBlur = () => {
    if (ccEmailInput.trim()) {
      const email = ccEmailInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && emailRegex.test(email) && !ccEmails.includes(email)) {
        setccEmails([...ccEmails, email])
        setccEmailsChanged(true)
      }
      setCcEmailInput('')
    }
  }

  // Handle BCC input key events
  const handleBccInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || (e.key === ' ' && bccEmailInput.trim())) {
      e.preventDefault()
      const email = bccEmailInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && emailRegex.test(email)) {
        if (!bccEmails.includes(email)) {
          setBccEmails([...bccEmails, email])
          setBccEmailsChanged(true)
        }
        setBccEmailInput('')
      }
    } else if (e.key === 'Backspace' && !bccEmailInput && bccEmails.length > 0) {
      // Remove last email on backspace when input is empty
      removeBccEmail(bccEmails[bccEmails.length - 1])
    }
  }

  const handleBccInputPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const emails = pastedText.split(/[,\s]+/).filter(email => email.trim() && emailRegex.test(email.trim()))
    const newEmails = emails.filter(email => !bccEmails.includes(email.trim()))
    if (newEmails.length > 0) {
      setBccEmails([...bccEmails, ...newEmails.map(e => e.trim())])
      setBccEmailsChanged(true)
    }
    // Set remaining text as input if there's invalid content
    const remaining = pastedText.split(/[,\s]+/).filter(email => email.trim() && !emailRegex.test(email.trim())).join(' ')
    if (remaining.trim()) {
      setBccEmailInput(remaining)
    } else {
      setBccEmailInput('')
    }
  }

  const handleBccInputBlur = () => {
    if (bccEmailInput.trim()) {
      const email = bccEmailInput.trim().replace(/[, ]+$/, '') // Remove trailing comma/space
      if (email && emailRegex.test(email) && !bccEmails.includes(email)) {
        setBccEmails([...bccEmails, email])
        setBccEmailsChanged(true)
      }
      setBccEmailInput('')
    }
  }

  // console.log("template",templetes)

  const isSaveDisabled = isLeadEmail
    ? // For lead emails, only require subject and content if no template is selected
    (!selectedTemp && (!subject?.trim() || !body?.trim())) ||
    saveEmailLoader ||
    invalidEmails.length > 0
    : // Original validation for pipeline cadence
    // Template name is optional - will be auto-generated from subject or use default if not provided
    !subject?.trim() ||
    !body?.trim() ||
    //    (!ccEmails || ccEmails.length === 0) ||
    saveEmailLoader ||
    invalidEmails.length > 0 ||
    !selectedGoogleAccount?.id

  // Removed console.log for ccEmails


  // Restore selected account when editing and accounts are loaded
  useEffect(() => {
    const emailAccountId = editingRow?.emailAccountId || templateEmailAccountId

    // Only restore account if we're editing, have accounts loaded, and no account is currently selected
    // IMPORTANT: Only auto-select account if editingRow has emailAccountId (i.e., editing from cadence)
    // When editing templates directly (from dialer), editingRow won't have emailAccountId, so don't auto-select
    if (isEditing && googleAccounts.length > 0 && !selectedGoogleAccount?.id) {
      if (emailAccountId) {
        // Try to restore the existing account from either editingRow or template details
        const matchingAccount = googleAccounts.find(
          (account) => account.id === emailAccountId,
        )
        if (matchingAccount) {
          setSelectedGoogleAccount(matchingAccount)
        } else {
          console.warn(
            'Could not find matching account for emailAccountId:',
            emailAccountId,
          )
          console.warn(
            'Available accounts:',
            googleAccounts.map((acc) => ({ id: acc.id, email: acc.email })),
          )
          // Don't auto-select if account not found - let user choose
        }
      }
      // Removed: Auto-selecting first account when no emailAccountId
      // When editing templates directly (not from cadence), let user choose the account
    }
  }, [
    isEditing,
    editingRow?.emailAccountId,
    templateEmailAccountId,
    googleAccounts,
    selectedGoogleAccount?.id,
  ])

  const handleDeleteTemplate = async (template) => {
    setDelTempLoader(template)
    await deleteTemplete(template)
    setDelTempLoader(null)
    setTempletes((prev) => prev.filter((x) => x.id !== template.id))
  }

  const handleDelete = (e, t) => {
    e.stopPropagation() // don't trigger select / close
    handleDeleteTemplate(t)
    // setTempletes((prev) => prev.filter((x) => x.id !== t.id));
  }

  const handleSelect = async (t) => {
    setSelectedTemp(t)

    // If template has an id, fetch full details to ensure we have all fields including ccEmails and bccEmails
    if (t && (t.id || t.templateId)) {
      try {
        const templateId = t.id || t.templateId
        setDetailsLoader(templateId)
        // Create a template object with templateId for getTempleteDetails
        const templateForDetails = { templateId: templateId, id: t.id }
        const details = await getTempleteDetails(templateForDetails)
        if (details) {
          setTempName(details.templateName || '')
          setSubject(details.subject || '')
          setBody(details.content || '')

          // Parse ccEmails if it's a string (JSON string)
          let parsedCcEmails = []
          if (details.ccEmails) {
            if (typeof details.ccEmails === 'string') {
              try {
                parsedCcEmails = JSON.parse(details.ccEmails)
              } catch (e) {
                console.error('Error parsing ccEmails:', e)
                parsedCcEmails = []
              }
            } else if (Array.isArray(details.ccEmails)) {
              parsedCcEmails = details.ccEmails
            }
          }

          // Parse bccEmails if it's a string (JSON string)
          let parsedBccEmails = []
          if (details.bccEmails) {
            if (typeof details.bccEmails === 'string') {
              try {
                parsedBccEmails = JSON.parse(details.bccEmails)
              } catch (e) {
                console.error('Error parsing bccEmails:', e)
                parsedBccEmails = []
              }
            } else if (Array.isArray(details.bccEmails)) {
              parsedBccEmails = details.bccEmails
            }
          }

          setccEmails(Array.isArray(parsedCcEmails) ? parsedCcEmails : [])
          setBccEmails(Array.isArray(parsedBccEmails) ? parsedBccEmails : [])
          setAttachments(Array.isArray(details.attachments) ? details.attachments : [])

          // Show CC/BCC fields if they have values
          if (parsedCcEmails && Array.isArray(parsedCcEmails) && parsedCcEmails.length > 0) {
            setShowCC(true)
          }
          if (parsedBccEmails && Array.isArray(parsedBccEmails) && parsedBccEmails.length > 0) {
            setShowBCC(true)
          }
        } else {
          // Fallback to template object if details fetch fails
          setTempName(t.templateName || '')
          setSubject(t.subject || '')
          setBody(t.content || '')

          // Parse ccEmails if it's a string (JSON string)
          let parsedCcEmails = []
          if (t.ccEmails) {
            if (typeof t.ccEmails === 'string') {
              try {
                parsedCcEmails = JSON.parse(t.ccEmails)
              } catch (e) {
                parsedCcEmails = []
              }
            } else if (Array.isArray(t.ccEmails)) {
              parsedCcEmails = t.ccEmails
            }
          }

          // Parse bccEmails if it's a string (JSON string)
          let parsedBccEmails = []
          if (t.bccEmails) {
            if (typeof t.bccEmails === 'string') {
              try {
                parsedBccEmails = JSON.parse(t.bccEmails)
              } catch (e) {
                parsedBccEmails = []
              }
            } else if (Array.isArray(t.bccEmails)) {
              parsedBccEmails = t.bccEmails
            }
          }

          setccEmails(Array.isArray(parsedCcEmails) ? parsedCcEmails : [])
          setBccEmails(Array.isArray(parsedBccEmails) ? parsedBccEmails : [])
          setAttachments(Array.isArray(t.attachments) ? t.attachments : [])
        }
      } catch (error) {
        console.error('Error loading template details:', error)
        // Fallback to template object if details fetch fails
        setTempName(t.templateName || '')
        setSubject(t.subject || '')
        setBody(t.content || '')

        // Parse ccEmails if it's a string (JSON string)
        let parsedCcEmails = []
        if (t.ccEmails) {
          if (typeof t.ccEmails === 'string') {
            try {
              parsedCcEmails = JSON.parse(t.ccEmails)
            } catch (e) {
              parsedCcEmails = []
            }
          } else if (Array.isArray(t.ccEmails)) {
            parsedCcEmails = t.ccEmails
          }
        }

        // Parse bccEmails if it's a string (JSON string)
        let parsedBccEmails = []
        if (t.bccEmails) {
          if (typeof t.bccEmails === 'string') {
            try {
              parsedBccEmails = JSON.parse(t.bccEmails)
            } catch (e) {
              parsedBccEmails = []
            }
          } else if (Array.isArray(t.bccEmails)) {
            parsedBccEmails = t.bccEmails
          }
        }

        setccEmails(Array.isArray(parsedCcEmails) ? parsedCcEmails : [])
        setBccEmails(Array.isArray(parsedBccEmails) ? parsedBccEmails : [])
        setAttachments(Array.isArray(t.attachments) ? t.attachments : [])
      } finally {
        setDetailsLoader(null)
      }
    } else {
      // If no id, use template object directly
      setTempName(t.templateName || '')
      setSubject(t.subject || '')
      setBody(t.content || '')

      // Parse ccEmails if it's a string (JSON string)
      let parsedCcEmails = []
      if (t.ccEmails) {
        if (typeof t.ccEmails === 'string') {
          try {
            parsedCcEmails = JSON.parse(t.ccEmails)
          } catch (e) {
            parsedCcEmails = []
          }
        } else if (Array.isArray(t.ccEmails)) {
          parsedCcEmails = t.ccEmails
        }
      }

      // Parse bccEmails if it's a string (JSON string)
      let parsedBccEmails = []
      if (t.bccEmails) {
        if (typeof t.bccEmails === 'string') {
          try {
            parsedBccEmails = JSON.parse(t.bccEmails)
          } catch (e) {
            parsedBccEmails = []
          }
        } else if (Array.isArray(t.bccEmails)) {
          parsedBccEmails = t.bccEmails
        }
      }

      setccEmails(Array.isArray(parsedCcEmails) ? parsedCcEmails : [])
      setBccEmails(Array.isArray(parsedBccEmails) ? parsedBccEmails : [])
      setAttachments(Array.isArray(t.attachments) ? t.attachments : [])

      // Show CC/BCC fields if they have values
      if (parsedCcEmails && Array.isArray(parsedCcEmails) && parsedCcEmails.length > 0) {
        setShowCC(true)
      }
      if (parsedBccEmails && Array.isArray(parsedBccEmails) && parsedBccEmails.length > 0) {
        setShowBCC(true)
      }
    }

    // if (!isEditing && addRow) {
    //     addRow({
    //         templateId: t.id,
    //         emailAccountId: selectedGoogleAccount?.id,
    //         communicationType: 'email',
    //     });
    // } else {
    //     onUpdateRow(editingRow.id, {
    //         templateId: t.id,
    //         emailAccountId: selectedGoogleAccount?.id,
    //         communicationType: 'email',
    //     })
    // }
    // onClose();
    // getTempDetailsHandler(t)
    // onClose();
  }

  const applyFormat = (format) => {
    if (format === 'bold') document.execCommand('bold', false, null)
    if (format === 'italic') document.execCommand('italic', false, null)
    if (format === 'underline') document.execCommand('underline', false, null)
  }

  const [selectedFormats, setSelectedFormats] = React.useState({
    bold: false,
    italic: false,
    underline: false,
  })

  // Helper to check if a format is currently active in the selection
  const isFormatActive = (format) => {
    if (typeof window === 'undefined') return false
    try {
      return document.queryCommandState(format)
    } catch {
      return false
    }
  }

  // Handler to apply format and update selected state
  const handleFormatClick = (format) => {
    applyFormat(format)
    setSelectedFormats((prev) => ({
      ...prev,
      [format]: isFormatActive(format),
    }))
  }

  // On mount and on selection change, update selectedFormats
  useEffect(() => {
    const updateFormats = () => {
      setSelectedFormats({
        bold: isFormatActive('bold'),
        italic: isFormatActive('italic'),
        underline: isFormatActive('underline'),
      })
    }
    document.addEventListener('selectionchange', updateFormats)
    // Initial update
    updateFormats()
    return () => {
      document.removeEventListener('selectionchange', updateFormats)
    }
  }, [])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const maxSizeInBytes = 10 * 1024 * 1024 // 10MB in bytes
    const maxAttachments = 5 // Maximum number of attachments

    // Check if adding new files would exceed the attachment count limit
    if (attachments.length + files.length > maxAttachments) {
      setShowSnackBar({
        message: `Maximum ${maxAttachments} attachments allowed`,
        type: SnackbarTypes.Error,
      })
      return
    }

    // Calculate current total size of existing attachments
    const currentTotalSize = attachments.reduce(
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
      setShowSnackBar({
        message: "File size can't be more than 10MB",
        type: SnackbarTypes.Error,
      })
      return
    }

    setAttachments((prev) => [...prev, ...files])
    setAttachmentsChanged(true)
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
    setAttachmentsChanged(true)
  }

  useEffect(() => {
    if (selectedTemp) {
      setShouldUpdate(true)
    }
  }, [
    tempNameChanged,
    subjectChanged,
    bodyChanged,
    ccEmailsChanged,
    bccEmailsChanged,
    attachmentsChanged,
    accountChanged,
  ])

  const saveEmail = async () => {
    setSaveEmailLoader(true)
    // Use tempName, newTemplateName, or generate a default name
    const finalTemplateName = tempName?.trim() || newTemplateName?.trim() || subject?.trim() || 'Email Template'
    // templateType: when updating existing template keep 'user'; when creating new use checkbox
    const templateTypeForNew = saveAsTemplate ? 'user' : 'auto'
    const templateTypeForUpdate = 'user'

    let data = {
      communicationType: communicationType,
      subject: subject,
      content: body,
      ccEmails: ccEmails,
      bccEmails: bccEmails,
      attachments: attachments,
      templateName: finalTemplateName,
      templateType: templateTypeForNew,
    }

    // Add userId if selectedUser is provided (for agency/admin creating templates for subaccounts)
    if (selectedUser?.id) {
      data.userId = selectedUser.id
    }

    // Check if template content has been modified from the selected template
    const hasTemplateChanges =
      selectedTemp &&
      (selectedTemp.templateName !== tempName ||
        selectedTemp.subject !== subject ||
        selectedTemp.content !== body ||
        JSON.stringify(selectedTemp.ccEmails || []) !==
        JSON.stringify(ccEmails) ||
        JSON.stringify(selectedTemp.bccEmails || []) !==
        JSON.stringify(bccEmails) ||
        JSON.stringify(selectedTemp.attachments || []) !==
        JSON.stringify(attachments))

    let response = null

    // Handle lead email sending
    if (isLeadEmail && onSendEmail) {
      const emailData = {
        subject: subject,
        content: body,
        ccEmails: ccEmails,
        bccEmails: bccEmails,
        attachments: attachments,
      }
      onSendEmail(emailData)
      return // Don't close modal yet, let the send function handle it
    }

    // 1) Selected existing template, no changes, not editing → attach only (no API call)
    if (selectedTemp && !hasTemplateChanges && !isEditing) {
      response = {
        data: {
          status: true,
          data: selectedTemp, // Use the existing template
        },
      }
    }
    // 2) Selected existing template while editing row
    else if (selectedTemp && isEditing) {
      if (saveAsTemplate) {
        data.templateType = templateTypeForUpdate
        response = await updateTemplete(data, selectedTemp.id)
      } else if (!hasTemplateChanges) {
        response = { data: { status: true, data: selectedTemp } }
      } else {
        data.templateType = 'auto'
        response = await createTemplete(data)
      }
    }
    // 3) Editing existing row's template (no template selected from list)
    else if (isEditing && !IsdefaultCadence) {
      const id = selectedTemp?.id ?? editingRow?.templateId
      if (saveAsTemplate && id) {
        data.templateType = templateTypeForUpdate
        response = await updateTemplete(data, id)
      } else {
        data.templateType = 'auto'
        response = await createTemplete(data)
      }
    }
    // 4) New template
    else {
      response = await createTemplete(data)
    }

    if (response?.data?.status === true) {
      const createdTemplate = response?.data?.data

      // Handle template list updates based on the operation performed
      if (createdTemplate) {
        if (selectedTemp && !hasTemplateChanges && !isEditing) { } else {
          // Either created new template or updated existing one
          setTempletes((prev) => {
            const existingIndex = prev.findIndex(
              (t) => t.id === createdTemplate.id,
            )
            if (existingIndex >= 0) {
              const updated = [...prev]
              updated[existingIndex] = createdTemplate
              return updated
            } else {
              return Array.isArray(prev)
                ? [...prev, createdTemplate]
                : [createdTemplate]
            }
          })

          // Update selectedTemp to the newly created/updated template
          // This ensures it shows as selected in the dropdown
          // Update if we have a temporary template (no id) or if template names match
          if (selectedTemp && (!selectedTemp.id || selectedTemp.templateName === createdTemplate.templateName)) {
            setSelectedTemp(createdTemplate)
          }
        }
      }

      if (isEditing && onUpdateRow && editingRow) {
        // Ensure we have a selected account, use first available if none selected
        let accountId = selectedGoogleAccount?.id
        if (!accountId && googleAccounts.length > 0) {
          accountId = googleAccounts[0].id
          setSelectedGoogleAccount(googleAccounts[0])
        }

        // Update existing row with new template data
        const updateData = {
          templateId: createdTemplate.id,
          templateName: tempName,
          subject: subject,
          content: body,
          ccEmails: ccEmails,
          bccEmails: bccEmails,
          attachments: attachments,
          communicationType: 'email',
          emailAccountId: accountId,
        }

        // Validate that emailAccountId exists
        if (!accountId) {
          console.error(
            'CRITICAL: emailAccountId is still missing during update!',
          )
          console.error('Available accounts:', googleAccounts)
        }

        onUpdateRow(editingRow.id, updateData)
      } else {
        // Add new row

        // Ensure we have a selected account, use first available if none selected
        let accountId = selectedGoogleAccount?.id
        if (!accountId && googleAccounts.length > 0) {
          accountId = googleAccounts[0].id
          setSelectedGoogleAccount(googleAccounts[0])
        }

        if (addRow) {
          const templateDataForNewRow = {
            templateId: createdTemplate.id,
            emailAccountId: accountId || googleAccounts[0]?.id,
            communicationType: 'email',
          }
          addRow(templateDataForNewRow)
        }
      }

      // Pass the created template ID to onClose for auto-selection
      // Only pass ID if it's a new template (not editing) or if it's a new template being created
      const shouldAutoSelect = !isEditing || (createdTemplate && !selectedTemp?.id)
      onClose(shouldAutoSelect ? createdTemplate?.id : undefined)
    } else {
      setShowSnackBar({
        message: response?.data?.message,
        type: SnackbarTypes.Error,
      })
    }
    setSaveEmailLoader(false)
  }

  const getAccounts = async (id) => {
    setGoogleAccountLoader(true)
    try {
      let acc = await getGmailAccounts(id)
      setGoogleAccounts(acc || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setGoogleAccounts([])
    } finally {
      setGoogleAccountLoader(false)
    }
  }

  const addNewAccount = async () => {
    let response = await GoogleOAuth({
      setLoginLoader,
      setShowSnackBar,
      selectedUser,
    })

    if (response) {
      await getAccounts(selectedUser?.id)
      setSelectedGoogleAccount(response)
    }
  }

  // Don't render anything if not open to prevent backdrop from blocking interactions
  if (!open) return null

  const handleNewTemplateNameConfirm = () => {
    if (newTemplateName.trim()) {
      const trimmedName = newTemplateName.trim()
      setTempName(trimmedName)
      setTempNameChanged(true)
      // Create a temporary template object to show in dropdown
      const newTemplate = {
        id: null, // Will be set when saved
        templateId: null,
        templateName: trimmedName,
        subject: '',
        content: '',
      }
      setSelectedTemp(newTemplate) // Set as selected so it shows in dropdown
      setNewTemplateName('')
      setShowNewTemplateModal(false)
    }
  }

  const handleNewTemplateNameCancel = () => {
    setNewTemplateName('')
    setShowNewTemplateModal(false)
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        disableEnforceFocus={true}
        disableAutoFocus={true}
        disableRestoreFocus={true}
        BackdropProps={{
          style: {
            zIndex: 1500,
            // Ensure backdrop doesn't block dropdowns
            pointerEvents: 'auto',
          },
          onClick: (e) => {
            // Allow backdrop clicks to close modal, but don't block dropdown clicks
            if (e.target === e.currentTarget) {
              onClose()
            }
          },
        }}
        sx={{
          zIndex: 1500,
          // Ensure modal content doesn't block dropdowns
          '& .MuiBackdrop-root': {
            zIndex: 1500,
          },
        }}
      >
        <Box
          className="w-full h-[100vh] py-4 flex flex-col items-center justify-center"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '600px', lg: '700px' },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            maxHeight: '80vh',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            zIndex: 1500,
          }}
        >
          <div className={`flex flex-col w-full h-full p-0 bg-white rounded-lg overflow-hidden`}>
            {/* Header - Unified design for both cases */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h2 className="text-xl font-semibold">
                {!isLeadEmail && (addRow || isEditing) ? 'Email Template' : 'New Message'}
              </h2>
              <CloseBtn onClick={onClose} />
            </div>

            <div
              className="flex flex-col w-full overflow-y-auto overflow-x-visible p-4 space-y-4"
              style={{ scrollbarWidth: 'none', position: 'relative', minHeight: 0, maxHeight: '100%' }}
            >
              <AgentSelectSnackMessage
                isVisible={true}
                message={showSnackBar.message}
                type={showSnackBar.type}
                hide={() => {
                  setShowSnackBar({
                    message: '',
                  })
                }}
              />



              {/* From Field and CC/BCC on same line */}
              <React.Fragment>
                <div className="flex flex-col w-full items-center gap-4">
                  {/* From, CC & BCC Fields */}
                  <div className="flex-1 relative w-full">
                    {googleAccountLoader ? (
                      <div className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg flex items-center justify-center">
                        <CircularProgress size={20} />
                      </div>
                    ) : googleAccounts.length === 0 ? (
                      <div className="flex flex-row gap-2 items-center justify-center">
                        <button
                          onClick={addNewAccount}
                          className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                          style={{ height: '42px' }}
                        >
                          Connect Email
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-row gap-2 relative" ref={emailDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setEmailDropdownOpen(!emailDropdownOpen)}
                          className="w-full px-3 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-left flex items-center justify-between"
                          style={{ height: '42px' }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm text-gray-500 flex-shrink-0">From:</span>
                            <span className="text-sm truncate">
                              {selectedGoogleAccount
                                ? (() => {
                                  const account = googleAccounts.find((a) => a.id === selectedGoogleAccount.id)
                                  if (!account) return <span className="text-gray-500">Select email account</span>
                                  const providerLabel = account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider || ''
                                  return <span className="text-gray-700">{account.email || account.name || account.displayName}{providerLabel ? ` (${providerLabel})` : ''}</span>
                                })()
                                : <span className="text-gray-500">Select email account</span>}
                            </span>
                          </div>
                          <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </button>
                        {emailDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {googleAccounts.map((account) => (
                              <button
                                key={account.id}
                                type="button"
                                onClick={() => {
                                  setAccountChanged(true)
                                  setSelectedGoogleAccount(account)
                                  setEmailDropdownOpen(false)
                                }}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${selectedGoogleAccount?.id === account.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{account.email || account.name || account.displayName}</span>
                                  {account.provider && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      {account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                            <div className="border-t border-gray-200 p-2">
                              <button
                                onClick={() => {
                                  addNewAccount()
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
                        {/* CC and BCC buttons for Email mode - on top right */}
                        <div className="flex items-center justify-between">
                          <div></div>
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
                        </div>
                      </div>
                    )}
                  </div>

                  {showCC || showBCC && (
                    <div className='flex flex-row w-full gap-2 items-center'>
                      {/* CC and BCC on same line when both are shown */}
                      {showCC && (
                        <>
                          <div className="relative flex-1 min-w-0">
                            {/* Tag Input Container */}
                            <div
                              className="flex items-center gap-2 px-3 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary cursor-text overflow-hidden bg-white"
                              style={{ height: '42px', minHeight: '42px', maxWidth: '100%' }}
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
                                    value={ccEmailInput}
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
                                      <span className="px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full flex-shrink-0">
                                        +{ccEmails.length - 1}
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <input
                                  id="cc-input"
                                  type="text"
                                  value={ccEmailInput}
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
                          {/* Separator between CC and BCC */}
                          {showBCC && (
                            <div className="w-px h-[42px] bg-gray-300 flex-shrink-0"></div>
                          )}
                        </>
                      )}
                      {showBCC && (
                        <div className="relative flex-1 min-w-0">
                          {/* Tag Input Container */}
                          <div
                            className="flex items-center gap-2 px-3 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary cursor-text overflow-hidden bg-white"
                            style={{ height: '42px', minHeight: '42px', maxWidth: '100%' }}
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
                                  value={bccEmailInput}
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
                                    <span className="px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full flex-shrink-0">
                                      +{bccEmails.length - 1}
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <input
                                id="bcc-input"
                                type="text"
                                value={bccEmailInput}
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
                </div>
              </React.Fragment>

              {invalidEmails.length > 0 && (
                <div className="mt-1 text-red text-xs">
                  Invalid email{' '}
                  {/* {invalidEmails.length > 1 ? 's' : ''}: {invalidEmails.join(', ')}*/}
                </div>
              )}

              {/* Subject Field */}
              <div className="space-y-2">
                <div
                  className="flex items-center border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary bg-white transition-colors overflow-visible group/subject-field"
                  id="subject-field-group"
                >
                  {/* Subject Input Section */}
                  <div className="flex-1 flex items-center gap-2 px-3 h-[42px]">
                    <span className="text-sm text-gray-500 flex-shrink-0">Subject:</span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value)
                        setSubjectChanged(true)
                      }}
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
                    <div className="relative flex-shrink-0" ref={subjectVariablesDropdownRef}>
                      <button
                        ref={subjectVariablesButtonRef}
                        type="button"
                        onClick={() => {
                          if (subjectVariablesButtonRef.current) {
                            const rect = subjectVariablesButtonRef.current.getBoundingClientRect()
                            setSubjectDropdownPosition({
                              top: rect.bottom + window.scrollY + 4,
                              left: rect.right + window.scrollX - 200, // 200px is min-w-[200px]
                              width: 200,
                            })
                          }
                          setSubjectVariablesDropdownOpen(!subjectVariablesDropdownOpen)
                        }}
                        className="px-3 w-32 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors h-[42px]"
                      >
                        <span>Variables</span>
                        <CaretDown size={16} className={`text-gray-400 transition-transform ${subjectVariablesDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {subjectVariablesDropdownOpen && typeof window !== 'undefined' && createPortal(
                        <div
                          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px] subject-variables-dropdown"
                          style={{
                            zIndex: 1700,
                            top: `${subjectDropdownPosition.top}px`,
                            left: `${subjectDropdownPosition.left}px`,
                            width: `${subjectDropdownPosition.width}px`,
                          }}
                        >
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
                                  setSubject((prev) => prev + variableText)
                                  setSubjectChanged(true)
                                  setSubjectVariablesDropdownOpen(false)
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-gray-700"
                              >
                                {displayText}
                              </button>
                            )
                          })}
                        </div>,
                        document.body
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Body - Unified design */}
              <div>
                <label className="text-sm font-medium mb-2 block">Message:</label>
                {(() => {
                  // Calculate editor height: subtract toolbar height (~42px) from container height
                  // Use a reasonable default that fits within the modal
                  const containerHeight = bodyHeight || '300px'
                  const toolbarHeight = 42
                  let editorHeight = '250px'

                  if (bodyHeight) {
                    // Extract numeric value from bodyHeight (could be '400px' or 400)
                    const numericValue = typeof bodyHeight === 'string'
                      ? parseInt(bodyHeight.replace('px', ''))
                      : bodyHeight
                    if (!isNaN(numericValue)) {
                      editorHeight = `${numericValue - toolbarHeight}px`
                    }
                  }

                  return (
                    <div
                      style={{
                        height: containerHeight,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0
                      }}
                      className="overflow-hidden"
                    >
                      <RichTextEditor
                        ref={richTextEditorRef}
                        value={body}
                        onChange={(html) => {
                          setBody(html)
                          setBodyChanged(true)
                        }}
                        placeholder="Type your message..."
                        availableVariables={[]}
                        toolbarPosition="bottom"
                        editorHeight={editorHeight}
                        attachmentButton={
                          <>
                            <button
                              type="button"
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                attachmentInputRef.current?.click()
                              }}
                            >
                              <Paperclip size={18} className="text-gray-600 hover:text-brand-primary" />
                            </button>
                            <input
                              ref={attachmentInputRef}
                              type="file"
                              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              multiple
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </>
                        }
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
                                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px]" style={{ zIndex: 1700 }}>
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
                  )
                })()}
              </div>

              {/* Attachments list - Only show in body for pipeline emails */}
              {!isLeadEmail && attachments && attachments.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {attachments?.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex flex-row gap-4 items-center p-2 text-sm"
                    >
                      <div className="flex flex-col min-w-4/12 max-w-/12 truncate">
                        <span>{file.name || file.originalName}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDecimalValue(file.size / 1024)} KB
                      </span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer - Sticky at bottom */}
            <div className="flex items-center justify-between gap-4 p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                {!isLeadEmail && (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="saveAsTemplate"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                      className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                    />
                    <label htmlFor="saveAsTemplate" className="text-sm text-gray-700 cursor-pointer select-none">
                      Save as template
                    </label>
                  </div>
                )}


                {/* Attachment button - Only show for lead email */}
                {isLeadEmail && (
                  <>
                    {/* <label className="cursor-pointer">
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 flex items-center justify-center"
                        onClick={() => document.getElementById('lead-email-attachment-input')?.click()}
                      >
                        <Paperclip size={20} className="text-gray-600 hover:text-brand-primary" />
                      </button>
                      <input
                        id="lead-email-attachment-input"
                        type="file"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label> */}

                    {/* Show attachment count if any */}
                    {attachments && attachments.length > 0 && (
                      <span className="text-sm text-gray-600">
                        {attachments.length} file{attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={saveEmail}
                  disabled={isSaveDisabled || saveEmailLoader}
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {saveEmailLoader ? (
                    <>
                      <CircularProgress size={16} className="text-white" />
                      {isLeadEmail ? 'Sending...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {isLeadEmail
                        ? 'Send'
                        : (isEditing && !IsdefaultCadence ? 'Update' : 'Save Email')
                      }
                      {isLeadEmail && <Send size={16} />}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
      {/* New Template Name Modal */}
      <Modal
        open={showNewTemplateModal}
        onClose={handleNewTemplateNameCancel}
        BackdropProps={{
          style: {
            zIndex: 1600,
          },
        }}
        sx={{
          zIndex: 1600,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '400px' },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            zIndex: 1601,
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Template</h3>
              <CloseBtn onClick={handleNewTemplateNameCancel} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="Enter template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTemplateName.trim()) {
                    handleNewTemplateNameConfirm()
                  }
                }}
                className="h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                style={{ height: '42px' }}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleNewTemplateNameConfirm}
                disabled={!newTemplateName.trim()}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  )
}

const styles = {
  labelStyle: {
    backgroundColor: 'white',
    fontWeight: '400',
    fontSize: 10,
  },
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
    width: '40%',
  },
}

export default EmailTempletePopup
