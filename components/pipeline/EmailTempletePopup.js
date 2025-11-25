import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Menu,
  MenuItem,
  Modal,
  Select,
} from '@mui/material'
import { ArrowDropDownIcon } from '@mui/x-date-pickers'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import RichTextEditor from '@/components/common/RichTextEditor'
import ChipInput from '@/constants/ChipsInput'
import { PersistanceKeys } from '@/constants/Constants'

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
import { GreetingTagInput } from './tagInputs/GreetingTagInput'
import { PromptTagInput } from './tagInputs/PromptTagInput'

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
  const [attachments, setAttachments] = useState([])
  const [subjectChanged, setSubjectChanged] = useState(false)
  const [bodyChanged, setBodyChanged] = useState(false)
  const [ccEmailsChanged, setccEmailsChanged] = useState(false)
  const [attachmentsChanged, setAttachmentsChanged] = useState(false)
  const [accountChanged, setAccountChanged] = useState(false)
  const [tempNameChanged, setTempNameChanged] = useState(false)

  const [selectedTemp, setSelectedTemp] = useState(null)
  const [saveEmailLoader, setSaveEmailLoader] = useState(false)

  const [detailsLoader, setDetailsLoader] = useState(null)

  const [delTempLoader, setDelTempLoader] = useState(null)
  const [templetes, setTempletes] = useState([])
  const [loginLoader, setLoginLoader] = useState(false)

  const [scrollOffset, setScrollOffset] = useState({
    scrollTop: 0,
    scrollLeft: 0,
  })

  // above return
  // disable save if any field is missing or while saving

  const [showSnackBar, setShowSnackBar] = useState({
    message: '',
    type: SnackbarTypes.Error,
  })
  const [tempName, setTempName] = useState(null)

  const [showChangeManu, setShowChangeManu] = useState(null)

  const [googleAccounts, setGoogleAccounts] = useState([])
  const [googleAccountLoader, setGoogleAccountLoader] = useState([])
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
  }, [open])

  const templatesForSelectedType = async () => {
    let temp = await getTempletes('email')
    setTempletes(temp)
  }

  const getColumns = async () => {
    let res = await getUniquesColumn()
    console.log('uniqueColumns', res)
    if (res) {
      setUniqueColumns(res)
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
      getAccounts() // Always load accounts regardless of existing emailAccountId
    } else if (!isEditing) {
      // Reset form when not editing
      setTempName('')
      setSubject('')
      setBody('')
      setccEmails([])
      setAttachments([])
      setSelectedTemp(null)
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
        setAttachments(details.attachments || [])
      }
    } catch (error) {
      console.error('Error loading template details:', error)
    } finally {
      setDetailsLoader(null)
    }
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  const invalidEmails = ccEmails.filter(
    (e) => !emailRegex.test(String(e).trim()),
  )

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

  useEffect(() => {
    if (showChangeManu) getAccounts()
  }, [showChangeManu])

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
    setAttachments(t.attachments || [])

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

  const getAccounts = async () => {
    setGoogleAccountLoader(true)
    let acc = await getGmailAccounts()
    setGoogleAccounts(acc)
    setGoogleAccountLoader(false)
  }

  const addNewAccount = async () => {
    let response = await GoogleOAuth({
      setLoginLoader,
      setShowSnackBar,
    })

    if (response) {
      console.log('response', response)
      await getAccounts()
      setShowChangeManu(null)
      setSelectedGoogleAccount(response)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="w-full h-[100vh] py-4 flex flex-col items-center justify-center"
        sx={{ ...styles.modalsStyle }}
      >
        <div className="flex flex-col justify-between w-5/12  px-8 py-6 bg-white max-h-[80svh] rounded-2xl gap-2 overflow-y-hidden">
          <div
            className="flex flex-col w-full h-[80%] gap-2 overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            <AgentSelectSnackMessage
              isVisible={showSnackBar.message}
              message={showSnackBar.message}
              type={showSnackBar.type}
              hide={() => {
                setShowSnackBar({
                  message: '',
                })
              }}
            />
            <div className="flex flex-row items-center justify-between ">
              <div className="text-xl font-semibold color-black">
                {isLeadEmail
                  ? `Send Email to ${leadEmail}`
                  : (isEditing && !IsdefaultCadence) || selectedTemp
                    ? 'Edit Email'
                    : 'Email'}
              </div>

              <FormControl>
                <Select
                  Select
                  value={selectedTemp || ''}
                  onChange={(e) => handleSelect(e.target.value)}
                  displayEmpty
                  renderValue={(selected) =>
                    selected?.templateName || (
                      <div style={{ color: '#aaa' }}>Select Template</div>
                    )
                  }
                  sx={{
                    border: 'none', // Default border
                    '&:hover': {
                      border: 'none', // Same border on hover
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none', // Remove the default outline
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: 'none', // Remove outline on focus
                    },
                    '&.MuiSelect-select': {
                      py: 0, // Optional padding adjustments
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: '30vh', // Limit dropdown height
                        overflow: 'auto', // Enable scrolling in dropdown
                        scrollbarWidth: 'none',
                        // borderRadius: "10px"
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
                          // className="hover:bg-[#402FFF10]"
                          value={item}
                        >
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-[15] font-[500] w-64">
                              {item.templateName}
                            </div>
                            {delTempLoader?.id === item.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDelete(e, item)
                                }}
                              >
                                <Image
                                  src={'/otherAssets/delIcon.png'}
                                  alt="*"
                                  height={16}
                                  width={16}
                                />
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

            <div className="flex flex-row items-center justify-between ">
              <div className="text-[15px] font-[400] text-[#00000080] mt-4">
                From:{' '}
                <span className="text-[#00000050] ml-2">
                  {selectedGoogleAccount?.email}
                </span>
              </div>

              {/*{isLeadEmail && leadEmail && (
                                <div className="text-[15px] font-[400] text-[#00000080] mt-4">
                                    To: <span className="text-[#00000050] ml-2">
                                        {leadEmail}
                                    </span>
                                </div>
                            )}*/}

              <button
                onClick={(event) => setShowChangeManu(event.currentTarget)}
              >
                <div className="text-15 font-[700] underline text-brand-primary">
                  Change Account
                </div>
              </button>
              <Menu
                anchorEl={showChangeManu}
                open={Boolean(showChangeManu)}
                onClose={() => setShowChangeManu(null)}
              >
                {googleAccountLoader ? (
                  <div className="w-[10vw] ml-2">
                    <CircularProgress size={20} />
                  </div>
                ) : (
                  googleAccounts.map((a) => (
                    <MenuItem
                      key={a.id}
                      sx={{
                        '&:hover .action-icon': {
                          display: 'none',
                        },
                        '&:hover .action-icon-hover': {
                          display: 'block',
                        },
                      }}
                      onClick={() => {
                        setAccountChanged(true)
                        setSelectedGoogleAccount(a)
                        setShowChangeManu(null)
                      }}
                    >
                      <div className="text-[15] font-[500]">{a.email}</div>
                    </MenuItem>
                  ))
                )}

                <MenuItem
                  onClick={addNewAccount}
                  // key={a.id}
                  sx={{
                    '&:hover .action-icon': {
                      display: 'none',
                    },
                    '&:hover .action-icon-hover': {
                      display: 'block',
                    },
                  }}
                >
                  <div className="flex flex-row gap-2 text-brand-primary">
                    <Plus weight="bold" size={22} className="text-brand-primary" />
                    Add Account
                  </div>
                </MenuItem>
              </Menu>
            </div>

            <div className="h-12 mt-2 rounded-xl px-[10px] py-7 border rounded-lg border-[#00000020] flex flex-row items-center">
              <div className="text-[#00000070] text-[15px] font-normal">
                CC:
              </div>
              <ChipInput
                ccEmails={ccEmails}
                setccEmails={(text) => {
                  setccEmails(text)
                  setccEmailsChanged(true)
                }}
              />
            </div>

            {invalidEmails.length > 0 && (
              <div className="mt-1 text-red text-xs">
                Invalid email{' '}
                {/* {invalidEmails.length > 1 ? 's' : ''}: {invalidEmails.join(', ')}*/}
              </div>
            )}

            {!isLeadEmail && (
              <>
                <div className="text-[15px] font-[400] text-[#00000080] mt-4">
                  Template Name
                </div>

                <input
                  className="w-full h-12 px-[10px] py-7 mt-2 border-1 rounded-xl border-[#00000020]  outline-none focus:outline-none focus:border-[#00000010] focus:ring-0  "
                  placeholder="Template Name"
                  value={tempName}
                  onChange={(event) => {
                    setTempName(event.target.value)
                    setTempNameChanged(true)
                  }}
                />
              </>
            )}

            <div className="text-[15px] font-[400] text-[#00000080] mt-4">
              Subject
            </div>

            <div className=" mt-2">
              <GreetingTagInput
                // promptTag={subject}
                // isSubject={true}
                // placeholder="Subject"
                // // kycsList={kycsData}
                // uniqueColumns={uniqueColumns}
                // tagValue={setSubject}
                // showSaveChangesBtn={subject}
                // // from={"Template"}
                // saveUpdates={async () => {

                // }}
                // limit={343}
                greetTag={subject}
                // kycsList={kycsData}
                uniqueColumns={uniqueColumns}
                tagValue={(text) => {
                  setSubject(text)
                  setSubjectChanged(true)
                }}
                scrollOffset={scrollOffset}
                placeholder="Subject"
              />
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex flex-row items-center justify-between">
                <label className="text-[15px] font-[400] text-[#00000080]">
                  Body
                </label>
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
                      {uniqueColumns.map((variable, index) => (
                        <MenuItem key={index} value={variable}>
                          {variable}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
              <RichTextEditor
                ref={richTextEditorRef}
                value={body}
                onChange={(html) => {
                  setBody(html)
                  setBodyChanged(true)
                }}
                placeholder="Type here..."
                availableVariables={uniqueColumns || []}
              />
            </div>

            <div className="mt-3 flex flex-row items-center justify-between">
              <label className="flex flex-row items-center gap-2 cursor-pointer">
                <div className="text-[15px] font-[500] text-brand-primary underline">
                  Add Attachments
                </div>
                <Image
                  src={'/otherAssets/blueAttechmentIcon.png'}
                  alt="*"
                  height={24}
                  width={24}
                />
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
                  <button onClick={() => removeAttachment(idx)}>
                    <Image
                      src={'/assets/cross.png'}
                      height={14}
                      width={14}
                      alt="remove"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full flex flex-row items-center w-full gap-6 mt-4 h-[20%]">
            <button
              className="w-1/2 h-[53px] text-[15px] font-[700]"
              onClick={onClose}
            >
              Cancel
            </button>
            {saveEmailLoader ? (
              <CircularProgress size={30} />
            ) : (
              <button
                className={`w-1/2 h-[53px] text-[15px] font-[700] 
                                    ${isSaveDisabled ? 'bg-black/50' : 'bg-brand-primary'} rounded-lg text-white`}
                disabled={isSaveDisabled}
                onClick={saveEmail}
              >
                {isLeadEmail
                  ? 'Send Email'
                  : isEditing && !IsdefaultCadence
                    ? 'Update'
                    : 'Save Email'}
              </button>
            )}
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
  },
}

export default EmailTempletePopup
