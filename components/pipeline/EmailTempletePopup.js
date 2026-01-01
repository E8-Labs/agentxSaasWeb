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
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import RichTextEditor from '@/components/common/RichTextEditor'
import ChipInput from '@/constants/ChipsInput'
import { PersistanceKeys } from '@/constants/Constants'
import { Input } from '@/components/ui/input'
import CloseBtn from '@/components/globalExtras/CloseBtn'

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
  const [selectedVariable, setSelectedVariable] = useState('')
  const [selectedSubjectVariable, setSelectedSubjectVariable] = useState('')

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

  const [selectedTemp, setSelectedTemp] = useState(null)
  const [saveEmailLoader, setSaveEmailLoader] = useState(false)

  const [detailsLoader, setDetailsLoader] = useState(null)

  const [delTempLoader, setDelTempLoader] = useState(null)
  const [templetes, setTempletes] = useState([])
  const [loginLoader, setLoginLoader] = useState(false)

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

  useEffect(() => {
    getColumns()
    templatesForSelectedType()
    let isDefault = localStorage.getItem(
      PersistanceKeys.isDefaultCadenceEditing,
    )
    console.log('isDefault', isDefault)
    setIsdefaultCadence(isDefault)
    // Load accounts when modal opens
    if (open) {
      getAccounts(selectedUser?.id)
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
    console.log('uniqueColumns', res)

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
    console.log('trying to edit', isEditing, editingRow)
    if (isEditing && editingRow && open) {
      // Load template details if templateId or id exists
      if (editingRow.templateId || editingRow.id) {
        loadTemplateDetails(editingRow)
      }

      // Always load accounts when editing email templates
      console.log(
        'Loading accounts for editing. editingRow emailAccountId:',
        editingRow.emailAccountId,
      )
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
        console.log('Setting selectedTemp from templates array:', matchingTemplate)
        setSelectedTemp(matchingTemplate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templetes, isEditing, editingRow?.templateId, editingRow?.id])

  const loadTemplateDetails = async (template) => {
    try {
      setDetailsLoader(template.id || template.templateId)
      const details = await getTempleteDetails(template)
      console.log('details', details)
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
            console.log('Setting selectedTemp to matching template:', matchingTemplate)
            setSelectedTemp(matchingTemplate)
          } else {
            // If template not found in list, create a temporary template object from details
            console.log('Template not found in list, creating from details')
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
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (ccEmailInput.trim()) {
        addCcEmail(ccEmailInput)
      }
    } else if (e.key === 'Backspace' && !ccEmailInput && ccEmails.length > 0) {
      // Remove last email on backspace when input is empty
      removeCcEmail(ccEmails[ccEmails.length - 1])
    }
  }

  // Handle BCC input key events
  const handleBccInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (bccEmailInput.trim()) {
        addBccEmail(bccEmailInput)
      }
    } else if (e.key === 'Backspace' && !bccEmailInput && bccEmails.length > 0) {
      // Remove last email on backspace when input is empty
      removeBccEmail(bccEmails[bccEmails.length - 1])
    }
  }

  // console.log("template",templetes)

  const isSaveDisabled = isLeadEmail
    ? // For lead emails, only require subject and content if no template is selected
    (!selectedTemp && (!subject?.trim() || !body?.trim())) ||
    saveEmailLoader ||
    invalidEmails.length > 0
    : // Original validation for pipeline cadence
    !tempName?.trim() ||
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
    console.log('Account restoration check:', {
      isEditing,
      editingRowEmailAccountId: editingRow?.emailAccountId,
      templateEmailAccountId: templateEmailAccountId,
      finalEmailAccountId: emailAccountId,
      googleAccountsLength: googleAccounts.length,
      currentSelectedAccountId: selectedGoogleAccount?.id,
    })

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
          console.log(
            'Restoring selected account for editing:',
            matchingAccount,
          )
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
    console.log('template to delete', template)
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
    console.log('t', t)
    setSelectedTemp(t)
    
    // If template has an id, fetch full details to ensure we have all fields including ccEmails and bccEmails
    if (t && (t.id || t.templateId)) {
      try {
        const templateId = t.id || t.templateId
        setDetailsLoader(templateId)
        // Create a template object with templateId for getTempleteDetails
        const templateForDetails = { templateId: templateId, id: t.id }
        const details = await getTempleteDetails(templateForDetails)
        console.log('Template details loaded:', details)
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
    let data = {
      communicationType: communicationType,
      subject: subject,
      content: body,
      ccEmails: ccEmails,
      bccEmails: bccEmails,
      attachments: attachments,
      templateName: tempName,
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

    console.log('Template selection state:', {
      selectedTemp: selectedTemp?.id,
      isEditing,
      hasTemplateChanges,
      selectedTempName: selectedTemp?.templateName,
      currentTempName: tempName,
    })

    let response = null

    console.log('IsdefaultCadence', IsdefaultCadence)
    // Handle lead email sending
    if (isLeadEmail && onSendEmail) {
      console.log('Sending email to lead:', leadEmail)
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

    console.log('selectedTemp', selectedTemp)
    console.log('hasTemplateChanges', hasTemplateChanges)
    console.log('isEditing', isEditing)
    console.log('IsdefaultCadence', IsdefaultCadence)

    if (selectedTemp && !hasTemplateChanges && !isEditing) {
      // Use existing template without modification - no API call needed
      console.log('Using existing template without changes:', selectedTemp)
      response = {
        data: {
          status: true,
          data: selectedTemp, // Use the existing template
        },
      }
    } else if (selectedTemp && isEditing) {
      // Selected existing template but made changes - UPDATE the existing template
      console.log(
        'Updating selected template with changes. Template ID:',
        selectedTemp.id,
      )
      response = await updateTemplete(data, selectedTemp.id)
    } else if (isEditing && !IsdefaultCadence) {
      // Editing existing row's template
      let id
      if (selectedTemp) {
        id = selectedTemp.id
      } else {
        id = editingRow.templateId
      }

      console.log('Updating existing template from editing row with id:', id)
      response = await updateTemplete(data, id)
    } else {
      // Create new template (no template selected and creating new)
      console.log('Creating new template')
      response = await createTemplete(data)
    }

    if (response?.data?.status === true) {
      const createdTemplate = response?.data?.data

      // Handle template list updates based on the operation performed
      if (createdTemplate) {
        if (selectedTemp && !hasTemplateChanges && !isEditing) {
          // Just using existing template - no list update needed
          console.log(
            'No template list update needed - using existing template',
          )
        } else {
          // Either created new template or updated existing one
          setTempletes((prev) => {
            const existingIndex = prev.findIndex(
              (t) => t.id === createdTemplate.id,
            )
            if (existingIndex >= 0) {
              // Update existing template in the list
              console.log(
                'Updating existing template in list:',
                createdTemplate.id,
              )
              const updated = [...prev]
              updated[existingIndex] = createdTemplate
              return updated
            } else {
              // Add new template to the list
              console.log('Adding new template to list:', createdTemplate.id)
              return Array.isArray(prev)
                ? [...prev, createdTemplate]
                : [createdTemplate]
            }
          })
        }
      }

      if (isEditing && onUpdateRow && editingRow) {
        // Ensure we have a selected account, use first available if none selected
        let accountId = selectedGoogleAccount?.id
        if (!accountId && googleAccounts.length > 0) {
          console.log('No selected account, using first available account')
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
        console.log('Updating row with data:', updateData)
        console.log('Selected Google Account:', selectedGoogleAccount)
        console.log('Using Account ID:', accountId)
        console.log('Editing Row:', editingRow)

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
          console.log(
            'No selected account for new row, using first available account',
          )
          accountId = googleAccounts[0].id
          setSelectedGoogleAccount(googleAccounts[0])
        }

        if (addRow) {
          const templateDataForNewRow = {
            templateId: createdTemplate.id,
            emailAccountId: accountId || googleAccounts[0]?.id,
            communicationType: 'email',
          }
          console.log(
            'Adding new row with templateData:',
            templateDataForNewRow,
          )
          console.log('addRow function type:', typeof addRow)
          addRow(templateDataForNewRow)
        }
      }

      onClose()
    } else {
      setShowSnackBar({
        message: response?.data?.message,
        type: SnackbarTypes.Error,
      })
    }
    setSaveEmailLoader(false)
  }

  const getAccounts = async (id) => {
    console.log('getAccounts called with id:', id)
    setGoogleAccountLoader(true)
    try {
      let acc = await getGmailAccounts(id)
      console.log('acc', acc)
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
      console.log('response', response)
      await getAccounts(selectedUser?.id)
      setSelectedGoogleAccount(response)
    }
  }

  // Don't render anything if not open to prevent backdrop from blocking interactions
  if (!open) return null

  return (
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




            {/* From and To Fields - Unified layout */}
            <div className="flex items-center gap-4">
              {/* From Field - Full width with CC/BCC buttons next to it */}
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">From:</label>
                <div className="relative flex-1">
                  {googleAccountLoader ? (
                    <div className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg flex items-center justify-center">
                      <CircularProgress size={20} />
                    </div>
                  ) : googleAccounts.length === 0 ? (
                    <button
                      onClick={addNewAccount}
                      className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      style={{ height: '42px' }}
                    >
                      Connect Gmail
                    </button>
                  ) : (
                    <FormControl fullWidth>
                      <Select
                        value={selectedGoogleAccount?.id || ''}
                        onChange={(e) => {
                          const account = googleAccounts.find((a) => a.id === parseInt(e.target.value))
                          if (account) {
                            setAccountChanged(true)
                            setSelectedGoogleAccount(account)
                          } else if (e.target.value === 'add-account') {
                            addNewAccount()
                          }
                        }}
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) {
                            return <span style={{ color: '#9ca3af' }}>Select email account</span>
                          }
                          const account = googleAccounts.find((a) => a.id === parseInt(selected))
                          return account?.email || 'Select email account'
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: '30vh',
                              overflow: 'auto',
                              scrollbarWidth: 'none',
                              zIndex: 1700, // Higher than modal (1500) and backdrop
                            },
                          },
                          disablePortal: false,
                          container: typeof document !== 'undefined' ? document.body : null,
                          style: {
                            zIndex: 1700,
                          },
                        }}
                        sx={{
                          fontSize: '0.875rem',
                          height: '42px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e5e7eb',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'hsl(var(--brand-primary))',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'hsl(var(--brand-primary))',
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select email account</em>
                        </MenuItem>
                        {googleAccounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.email || account.name}
                          </MenuItem>
                        ))}
                        <MenuItem
                          value="add-account"
                          sx={{
                            color: 'hsl(var(--brand-primary))',
                            fontWeight: 500,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Account
                          </div>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </div>
                {/* CC/BCC buttons next to From field */}
                <div className="flex items-center gap-2 flex-shrink-0">
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

              {/* To Field - Only show for lead email */}
              {isLeadEmail && (
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium whitespace-nowrap">To:</label>
                  <Input
                    value={leadEmail || ''}
                    readOnly
                    className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary bg-gray-50"
                    style={{ height: '42px' }}
                  />
                </div>
              )}
            </div>

            {/* CC and BCC fields - shown when toggled - Tag-based design */}
            {(showCC || showBCC) && (
              <div className="flex items-start gap-4">
                {showCC && (
                  <div className="flex items-start gap-2 flex-1 w-full">
                    <label className="text-sm font-medium whitespace-nowrap pt-2">Cc:</label>
                    <div className="relative flex-1 min-w-0">
                      {/* Tag Input Container */}
                      <div 
                        className="flex flex-wrap items-center gap-2 px-3 py-2 min-h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary"
                        style={{ minHeight: '42px' }}
                      >
                        {/* CC Email Tags */}
                        {ccEmails.map((email, index) => (
                          <div
                            key={`cc-${index}-${email}`}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
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
                          value={ccEmailInput}
                          onChange={handleCcInputChange}
                          onKeyDown={handleCcInputKeyDown}
                          onBlur={() => {
                            if (ccEmailInput.trim()) {
                              addCcEmail(ccEmailInput)
                            }
                          }}
                          placeholder={ccEmails.length === 0 ? "Add CC recipients" : ""}
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
                )}
                {showBCC && (
                  <div className="flex items-start gap-2 flex-1 w-full">
                    <label className="text-sm font-medium whitespace-nowrap pt-2">Bcc:</label>
                    <div className="relative flex-1 min-w-0">
                      {/* Tag Input Container */}
                      <div 
                        className="flex flex-wrap items-center gap-2 px-3 py-2 min-h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary"
                        style={{ minHeight: '42px' }}
                      >
                        {/* BCC Email Tags */}
                        {bccEmails.map((email, index) => (
                          <div
                            key={`bcc-${index}-${email}`}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
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
                          value={bccEmailInput}
                          onChange={handleBccInputChange}
                          onKeyDown={handleBccInputKeyDown}
                          onBlur={() => {
                            if (bccEmailInput.trim()) {
                              addBccEmail(bccEmailInput)
                            }
                          }}
                          placeholder={bccEmails.length === 0 ? "Add BCC recipients" : ""}
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
                )}
              </div>
            )}

            {invalidEmails.length > 0 && (
              <div className="mt-1 text-red text-xs">
                Invalid email{' '}
                {/* {invalidEmails.length > 1 ? 's' : ''}: {invalidEmails.join(', ')}*/}
              </div>
            )}

            {!isLeadEmail && (
              <div className="flex items-center gap-2 flex-1">
                <label className="text-[15px] font-[400] text-black whitespace-nowrap">
                  Template Name
                </label>
                <Input
                  placeholder="Template Name"
                  value={tempName || ''}
                  onChange={(event) => {
                    setTempName(event.target.value)
                    setTempNameChanged(true)
                  }}
                  className="flex-1 h-[42px] border rounded-lg focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                  style={{ height: '42px' }}
                />
                {/* Select Template dropdown next to Template Name field */}
                <div className="flex-1">
                  <FormControl size="small" fullWidth sx={{ minWidth: 180 }}>
                  <Select
                    value={selectedTemp || ''}
                    onChange={(e) => handleSelect(e.target.value)}
                    displayEmpty
                    renderValue={(selected) =>
                      selected?.templateName || (
                        <div style={{ color: '#aaa' }}>Select Template</div>
                      )
                    }
                    sx={{
                      fontSize: '0.875rem',
                      height: '42px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: '30vh',
                          overflow: 'auto',
                          scrollbarWidth: 'none',
                          zIndex: 1700, // Higher than modal (1500) and backdrop
                        },
                      },
                      disablePortal: false,
                      container: typeof document !== 'undefined' ? document.body : null,
                      style: {
                        zIndex: 1700,
                      },
                    }}
                  >
                    {templetes?.length > 0 ? (
                      templetes?.map((item, index) =>
                        detailsLoader?.id === item.id ? (
                          <CircularProgress key={item.id} size={20} />
                        ) : (
                          <MenuItem
                            key={index}
                            value={item}
                          >
                            <div className="flex flex-row items-center gap-2 w-full">
                              <div className="text-[15] font-[500] flex-1 truncate min-w-0">
                                {item.templateName}
                              </div>
                              {delTempLoader?.id === item.id ? (
                                <CircularProgress size={20} className="flex-shrink-0" />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleDelete(e, item)
                                  }}
                                  className="text-brand-primary hover:text-brand-primary/80 transition-colors flex-shrink-0 ml-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </MenuItem>
                        ),
                      )
                    ) : (
                      <div className="ml-2">No template found</div>
                    )}
                  </Select>
                  </FormControl>
                </div>
              </div>
            )}

            {/* Subject Field - Unified design with Variables dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium w-16">Subject:</label>
              <Input
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value)
                  setSubjectChanged(true)
                }}
                placeholder="Email subject"
                className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                style={{ height: '42px', maxWidth: 'calc(100% - 200px)' }}
              />
              {/* Variables dropdown for subject */}
              {uniqueColumns && uniqueColumns.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={selectedSubjectVariable}
                    onChange={(e) => {
                      const value = e.target.value
                      setSelectedSubjectVariable('')
                      if (value) {
                        const variableText = value.startsWith('{') && value.endsWith('}')
                          ? value
                          : `{${value}}`
                        setSubject((prev) => prev + variableText)
                        setSubjectChanged(true)
                      }
                    }}
                    displayEmpty
                    sx={{
                      fontSize: '0.875rem',
                      height: '42px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Variables</em>
                    </MenuItem>
                    {uniqueColumns.map((variable, index) => {
                      const displayText = variable.startsWith('{') && variable.endsWith('}')
                        ? variable
                        : `{${variable}}`
                      return (
                        <MenuItem key={index} value={variable}>
                          {displayText}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              )}
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
                      customToolbarElement={
                    uniqueColumns && uniqueColumns.length > 0 ? (
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={selectedVariable}
                          onChange={(e) => {
                            const value = e.target.value
                            setSelectedVariable('')
                            if (value && richTextEditorRef.current) {
                              richTextEditorRef.current.insertVariable(value)
                            }
                          }}
                          displayEmpty
                          sx={{
                            fontSize: '0.875rem',
                            height: '32px',
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d1d5db',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'hsl(var(--brand-primary))',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'hsl(var(--brand-primary))',
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            <em>Variables</em>
                          </MenuItem>
                          {uniqueColumns.map((variable, index) => {
                            const displayText = variable.startsWith('{') && variable.endsWith('}')
                              ? variable
                              : `{${variable}}`
                            return (
                              <MenuItem key={index} value={variable}>
                                {displayText}
                              </MenuItem>
                            )
                          })}
                        </Select>
                      </FormControl>
                    ) : null
                  }
                    />
                  </div>
                )
              })()}
            </div>

            {/* Attachments - Only show in body for pipeline emails */}
            {!isLeadEmail && (
              <>
                <div className="mt-2 flex flex-row items-center justify-between">
                  <label className="flex flex-row items-center gap-2 cursor-pointer">
                    <div className="text-[15px] font-[500] text-brand-primary underline">
                      Add Attachments
                    </div>
                    <Paperclip className="text-brand-primary" size={24} />
                    <input
                      type="file"
                      accept="
                                image/*,
                                application/pdf,
                                application/msword,
                                application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                                text/csv,
                                text/plain,
                                image/webp,
                                application/vnd.ms-excel,
                                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                              "
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <div className="text-[12px] font-[400] text-[#00000060]">
                    Max 5 files, 10 MB total
                  </div>
                </div>

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
              </>
            )}
          </div>
          {/* Footer - Sticky at bottom */}
          <div className="flex items-center justify-between gap-4 p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Cancel button - Only show for pipeline email, positioned on left */}
              {!isLeadEmail && (
                <button 
                  className="text-[#6b7280] outline-none h-[50px] px-4"
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}
              
              {/* Attachment button - Only show for lead email */}
              {isLeadEmail && (
                <>
                  <label className="cursor-pointer">
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
                  </label>
                  
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
