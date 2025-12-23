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
  selectedUser,
  bodyHeight = null, // Optional prop for custom body text field height
}) {
  const richTextEditorRef = useRef(null)
  const [selectedVariable, setSelectedVariable] = useState('')

  console.log('EmailTempletePopup: addRow called with:', {
    communicationType,
    addRow,
    isEditing,
    editingRow,
    selectedGoogleAccount,
    addRow,
  })

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [ccEmails, setccEmails] = useState([])
  const [bccEmails, setBccEmails] = useState([])
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
    let temp = await getTempletes('email')
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
      // Load template details if templateId exists
      if (editingRow.templateId) {
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
      setAttachments([])
      setSelectedTemp(null)
      setShowCC(false)
      setShowBCC(false)
      // setSelectedGoogleAccount(null); // Reset selected account too
    }
  }, [isEditing, editingRow, open])

  const loadTemplateDetails = async (template) => {
    try {
      setDetailsLoader(template.id)
      const details = await getTempleteDetails(template)
      console.log('details', details)
      if (details) {
        setTempName(details.templateName || '')
        setSubject(details.subject || '')
        setBody(details.content || '')
        setccEmails(details.ccEmails || [])
        setBccEmails(details.bccEmails || [])
        setAttachments(details.attachments || [])
        // Show CC/BCC fields if they have values
        if (details.ccEmails && details.ccEmails.length > 0) {
          setShowCC(true)
        }
        if (details.bccEmails && details.bccEmails.length > 0) {
          setShowBCC(true)
        }
      }
    } catch (error) {
      console.error('Error loading template details:', error)
    } finally {
      setDetailsLoader(null)
    }
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

  const invalidEmails = [
    ...ccEmails.filter((e) => !emailRegex.test(String(e).trim())),
    ...bccEmails.filter((e) => !emailRegex.test(String(e).trim())),
  ]

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

  console.log('ccEmails', ccEmails)


  // Restore selected account when editing and accounts are loaded
  useEffect(() => {
    console.log('Account restoration check:', {
      isEditing,
      editingRowEmailAccountId: editingRow?.emailAccountId,
      googleAccountsLength: googleAccounts.length,
      currentSelectedAccountId: selectedGoogleAccount?.id,
    })

    if (isEditing && googleAccounts.length > 0 && !selectedGoogleAccount?.id) {
      if (editingRow?.emailAccountId) {
        // Try to restore the existing account
        const matchingAccount = googleAccounts.find(
          (account) => account.id === editingRow.emailAccountId,
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
            editingRow.emailAccountId,
          )
          console.warn(
            'Available accounts:',
            googleAccounts.map((acc) => ({ id: acc.id, email: acc.email })),
          )
          // Fallback to first account if existing account not found
          setSelectedGoogleAccount(googleAccounts[0])
        }
      } else {
        // No existing emailAccountId, use the first available account
        console.log(
          'No existing emailAccountId, selecting first available account:',
          googleAccounts[0],
        )
        setSelectedGoogleAccount(googleAccounts[0])
      }
    }
  }, [
    isEditing,
    editingRow?.emailAccountId,
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

  const handleSelect = (t) => {
    console.log('t', t)
    setSelectedTemp(t)
    setTempName(t.templateName || '')
    setSubject(t.subject || '')
    setBody(t.content || '')
    setccEmails(t.ccEmails || [])
    setBccEmails(t.bccEmails || [])
    setAttachments(t.attachments || [])
    // Show CC/BCC fields if they have values
    if (t.ccEmails && t.ccEmails.length > 0) {
      setShowCC(true)
    }
    if (t.bccEmails && t.bccEmails.length > 0) {
      setShowBCC(true)
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

  return (
    <Modal open={open} onClose={onClose}>
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
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible',
          zIndex: 1300,
        }}
      >
        <div className={`flex flex-col w-full h-full p-0 bg-white rounded-lg overflow-visible`}>
          {/* Header - Unified design for both cases */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">
              {!isLeadEmail && (addRow || isEditing) ? 'Email Template' : 'New Message'}
            </h2>
            <CloseBtn onClick={onClose} />
          </div>
          
          <div
            className="flex flex-col w-full flex-1 overflow-y-auto overflow-x-visible p-4 space-y-4"
            style={{ scrollbarWidth: 'none', position: 'relative' }}
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



            {/* Select Template and CC/BCC toggle buttons - Unified design */}
            <div className="flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <FormControl size="small" sx={{ minWidth: 180 }}>
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
                      height: '36px',
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
                        },
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

            {/* From and To Fields - Unified layout */}
            <div className="flex items-center gap-4">
              {/* From Field */}
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">From:</label>
                <div className="flex-1 relative">
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

            {/* CC and BCC fields - shown when toggled - Unified design */}
            {(showCC || showBCC) && (
              <div className="flex items-center gap-4">
                {showCC && (
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <label className="text-sm font-medium whitespace-nowrap">Cc:</label>
                    <Input
                      value={Array.isArray(ccEmails) ? ccEmails.join(', ') : (ccEmails || '')}
                      onChange={(e) => {
                        const emailString = e.target.value
                        if (!emailString.trim()) {
                          setccEmails([])
                        } else {
                          const emails = emailString.split(',').map(email => email.trim()).filter(email => email)
                          setccEmails(emails)
                        }
                        setccEmailsChanged(true)
                      }}
                      placeholder="Add CC recipients"
                      className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                      style={{ height: '42px', minHeight: '42px' }}
                    />
                  </div>
                )}
                {showBCC && (
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <label className="text-sm font-medium whitespace-nowrap">Bcc:</label>
                    <Input
                      value={Array.isArray(bccEmails) ? bccEmails.join(', ') : (bccEmails || '')}
                      onChange={(e) => {
                        const emailString = e.target.value
                        if (!emailString.trim()) {
                          setBccEmails([])
                        } else {
                          const emails = emailString.split(',').map(email => email.trim()).filter(email => email)
                          setBccEmails(emails)
                        }
                        setBccEmailsChanged(true)
                      }}
                      placeholder="Add BCC recipients"
                      className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                      style={{ height: '42px', minHeight: '42px' }}
                    />
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
              <>
                <div className="text-[15px] font-[400] text-[#00000080] mt-3">
                  Template Name
                </div>

                <div className="w-full px-[0.5%] mt-1">
                  <Input
                    placeholder="Template Name"
                    value={tempName || ''}
                    onChange={(event) => {
                      setTempName(event.target.value)
                      setTempNameChanged(true)
                    }}
                    className="w-full h-[42px] border rounded-lg focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                    style={{ height: '42px' }}
                  />
                </div>
              </>
            )}

            {/* Subject Field - Unified design */}
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
                style={{ height: '42px' }}
              />
            </div>

            {/* Message Body - Unified design */}
            <div>
              <label className="text-sm font-medium mb-2 block">Message:</label>
              <div 
                style={bodyHeight ? { 
                  height: bodyHeight,
                  display: 'flex',
                  flexDirection: 'column'
                } : {}}
                className={bodyHeight ? 'overflow-hidden' : ''}
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
                />
              </div>
            </div>

            {/* Attachments - Only show in body for pipeline emails */}
            {!isLeadEmail && (
              <>
                <div className="mt-3 flex flex-row items-center justify-between">
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
          {/* Footer - Unified design */}
          <div className="flex items-center justify-between gap-4 p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              {/* Insert Variable dropdown */}
              {uniqueColumns && uniqueColumns.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 180 }}>
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
                      height: '36px',
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
                      <em>Insert Variable...</em>
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
              {/* Cancel button - Only show for pipeline email */}
              {!isLeadEmail && (
                <button 
                  className="text-[#6b7280] outline-none h-[50px]"
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}
              
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
