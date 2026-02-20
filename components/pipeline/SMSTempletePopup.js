import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Menu,
  MenuItem,
  Modal,
  Select,
  Tooltip,
} from '@mui/material'
import { ArrowDropDownIcon } from '@mui/x-date-pickers'
import { Plus, PaperPlaneTilt, Trash, CaretDown } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'

import ChipInput from '@/constants/ChipsInput'
import { PersistanceKeys } from '@/constants/Constants'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { renderBrandedIcon } from '@/utilities/iconMasking'

import { getUserLocalData } from '../constants/constants'
import { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'
import AgentSelectSnackMessage from '../dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '../globalExtras/CloseBtn'
import { getUniquesColumn } from '../globalExtras/GetUniqueColumns'
import {
  createTemplete,
  deleteTemplete,
  getTempleteDetails,
  getTempletes,
  updateTemplete,
} from './TempleteServices'
import axios from 'axios'
import Apis from '../apis/Apis'
import { AuthToken } from '../agency/plan/AuthDetails'

function SMSTempletePopup({
  open,
  onClose,
  phoneNumbers = [],
  phoneLoading,
  communicationType,
  addRow,
  isEditing = false,
  editingRow = null,
  onUpdateRow = null,
  onSendSMS = null,
  isLeadSMS = false,
  leadPhone = null,
  leadId = null,
  selectedUser,
}) {
  const [body, setBody] = useState('')
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [selectedVariable, setSelectedVariable] = useState('')
  const textareaRef = useRef(null)
  const [saveSmsLoader, setSaveSmsLoader] = useState(false)
  const [sendOnlyLoader, setSendOnlyLoader] = useState(false)
  const [showSnackBar, setShowSnackBar] = useState({
    message: '',
    type: SnackbarTypes.Error,
  })
  const [showUniqueDropdown, setShowUniqueDropdown] = useState(false)
  const [showManu, setShowMenu] = useState(null)

  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false)
  const [user, setUser] = useState(null)
  const [IsDefaultCadence, setIsDefaultCadence] = useState(null)
  const [smsTemplates, setSmsTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [delTempLoader, setDelTempLoader] = useState(null)
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [saveAsTemplate, setSaveAsTemplate] = useState(true) // Default to true for cadence templates
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false)
  const templatesDropdownRef = useRef(null)

  // Close templates dropdown when clicking outside (use capture so we run before any child stopPropagation)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showTemplatesDropdown) return
      if (templatesDropdownRef.current && !templatesDropdownRef.current.contains(event.target)) {
        setShowTemplatesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [showTemplatesDropdown])

  useEffect(() => {
    let data = getUserLocalData()
    setUser(data.user)
    getColumns()
    let isDefault = localStorage.getItem(
      PersistanceKeys.isDefaultCadenceEditing,
    )
    setIsDefaultCadence(isDefault)

    // Fetch SMS templates when modal opens
    if (open) {
      fetchSmsTemplates()
      // Reset checkbox to default (true) when modal opens
      setSaveAsTemplate(true)
    }
  }, [open])

  // Check if save button should be disabled
  const isSaveDisabled = isLeadSMS
    ? // For lead SMS, only require body content
    !body?.trim() || saveSmsLoader
    : // Original validation for pipeline cadence
    !body?.trim() || saveSmsLoader || !selectedPhone

  // Auto-fill form when editing
  useEffect(() => {
    // #region agent log
    //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SMSTempletePopup.js:81', message: 'Auto-fill useEffect triggered', data: { isEditing, hasEditingRow: !!editingRow, editingRowId: editingRow?.id, editingRowTemplateId: editingRow?.templateId, open, phoneNumbersLength: phoneNumbers.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    if (isEditing && editingRow && open) {
      // Set phone from editingRow.smsPhoneNumberId if available
      if (editingRow.smsPhoneNumberId && phoneNumbers.length > 0) {
        const matchedPhone = phoneNumbers.find(
          (p) => p.id === editingRow.smsPhoneNumberId
        )
        if (matchedPhone) {
          setSelectedPhone(matchedPhone)
        }
      }

      // Load template details if templateId or id exists
      if (editingRow.templateId || editingRow.id) {
        // #region agent log
        //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SMSTempletePopup.js:95', message: 'Calling loadTemplateDetails', data: { templateId: editingRow.templateId, id: editingRow.id, templateObject: { id: editingRow.id, templateId: editingRow.templateId } }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        loadTemplateDetails(editingRow)
      } else {
        // #region agent log
        //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SMSTempletePopup.js:99', message: 'No templateId or id found in editingRow', data: { editingRowKeys: Object.keys(editingRow || {}) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
      }
    } else if (!isEditing) {
      // Reset form when not editing
      setBody('')
      setSelectedPhone(null)
      setSelectedTemplate(null)
      setNewTemplateName('')
      setShowNewTemplateModal(false)
    }
  }, [isEditing, editingRow, open, phoneNumbers])

  // Set selected template when templates are loaded and we're editing
  useEffect(() => {
    if (isEditing && editingRow && smsTemplates.length > 0) {
      const templateId = editingRow.templateId || editingRow.id
      if (templateId) {
        const foundTemplate = smsTemplates.find(
          (t) => t.id === templateId || t.templateId === templateId
        )
        if (foundTemplate && !selectedTemplate) {
          setSelectedTemplate(foundTemplate)
        }
      }
    }
  }, [smsTemplates, isEditing, editingRow])

  const loadTemplateDetails = async (template) => {
    // #region agent log
    //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SMSTempletePopup.js:104', message: 'loadTemplateDetails called', data: { templateId: template?.templateId, id: template?.id, templateObject: { id: template?.id, templateId: template?.templateId }, selectedUserId: selectedUser?.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    try {
      // First, try to get phone from editingRow.smsPhoneNumberId (cadence row data)
      if (editingRow?.smsPhoneNumberId && phoneNumbers.length > 0) {
        // Find the phone object that matches the smsPhoneNumberId
        const matchedPhone = phoneNumbers.find(
          (p) => p.id === editingRow.smsPhoneNumberId
        )
        if (matchedPhone) {
          setSelectedPhone(matchedPhone)
        } else {
          console.warn('Phone number not found in phoneNumbers array for smsPhoneNumberId:', editingRow.smsPhoneNumberId)
        }
      }

      // Load template details for content (phone is not stored in template)
      // Ensure template has both id and templateId for compatibility
      const normalizedTemplate = {
        ...template,
        id: template.id || template.templateId,
        templateId: template.templateId || template.id,
      }
      // #region agent log
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SMSTempletePopup.js:125', message: 'Calling getTempleteDetails with normalized template', data: { normalizedTemplateId: normalizedTemplate.id, normalizedTemplateTemplateId: normalizedTemplate.templateId, selectedUserId: selectedUser?.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      const details = await getTempleteDetails(normalizedTemplate, selectedUser?.id)
      // #region agent log
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SMSTempletePopup.js:128', message: 'getTempleteDetails response', data: { hasDetails: !!details, hasContent: !!details?.content, contentLength: details?.content?.length || 0, detailsKeys: Object.keys(details || {}) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      if (details && details.content != null && details.content !== '') {
        setBody(details.content)
        // Don't set phone from details - it doesn't exist there
      } else if (template.content != null && template.content !== '') {
        // Fallback: use content from template object (e.g. from list) when API returns no content
        setBody(template.content)
      } else if (details) {
        setBody(details.content || '')
      }
    } catch (error) {
      // #region agent log
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SMSTempletePopup.js:139', message: 'Error loading template details', data: { errorMessage: error?.message, errorStack: error?.stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      console.error('Error loading template details:', error)
    } finally {
      // setDetailsLoader(null);
    }
  }

  // Handle sending SMS only (without saving template)
  const handleSendOnly = async () => {
    // Validate required fields for sending
    if (!body?.trim()) {
      setShowSnackBar({
        message: 'Please enter a message',
        type: SnackbarTypes.Error,
      })
      return
    }

    if (isLeadSMS) {
      // For lead SMS, phone is already provided via leadPhone prop
      if (!leadPhone) {
        setShowSnackBar({
          message: 'Phone number is required',
          type: SnackbarTypes.Error,
        })
        return
      }
    } else {
      // For cadence, phone selection is required
      if (!selectedPhone) {
        setShowSnackBar({
          message: 'Please select a phone number',
          type: SnackbarTypes.Error,
        })
        return
      }
    }

    setSendOnlyLoader(true)
    let createdTemplateId = null
    try {
      // Handle lead SMS sending

      if (saveAsTemplate) {

        const templateName = body.slice(0, 20)

        let templateData = {
          communicationType: 'sms',
          templateName: templateName || "Sms Template",
          content: body,
          phone: selectedPhone?.phone || leadPhone,
          templateType: 'user', // User chose "Save as template" so save as user template
        }

        // Add userId if selectedUser is provided
        if (selectedUser?.id) {
          templateData.userId = selectedUser.id
        }

        console.log("templare data is ", templateData)

        // Save template first
        let templateResponse = null

        try {
          if (isEditing && !IsDefaultCadence && selectedTemplate) {
            templateResponse = await updateTemplete(templateData, selectedTemplate?.id)
          } else {
            templateResponse = await createTemplete(templateData)
          }
          if (templateResponse?.data?.status === true) {
            console.log("response of create or update temp ", templateResponse)
            // Capture created template id when creating a new template (not updating)
            if (!isEditing || IsDefaultCadence || !selectedTemplate) {
              const created = templateResponse?.data?.data
              createdTemplateId = created?.id ?? created?.templateId ?? null
            }
          }
        } catch (templateError) {
          console.error('Error saving template:', templateError)
          // Continue with sending even if template save fails
        }
      }

      const smsData = {
        content: body,
        phone: leadPhone,
        smsPhoneNumberId: selectedPhone?.id,
        leadId: leadId,
      }
      // When admin/agency sends for a subaccount, pass userId so backend checks/deducts subaccount credits
      if (selectedUser?.id) smsData.userId = selectedUser.id

      let token = AuthToken()


      const result = await axios.post(Apis.sendSMSToLead, smsData, {
        headers: {
          "Contant-Type": 'application/json',
          "Authorization": "Bearer " + token
        }
      })

      console.log("response of send sms api is", result)
      if (result.data.status) {

        try {
          result
          setShowSnackBar({
            message: 'Text sent successfully',
            type: SnackbarTypes.Success,
          })
        } catch (error) {
          console.error('Error in onSendSMS:', error)
          setShowSnackBar({
            message: 'Failed to send SMS',
            type: SnackbarTypes.Error,
          })
        } finally {
          // Reset loader after SMS is sent (with a small delay to ensure it shows)
          setTimeout(() => {
            setSendOnlyLoader(false)
            onClose(createdTemplateId ?? undefined)
          }, 300)
        }
      } else {
        // If not async, reset loader after a short delay to ensure it's visible
        setTimeout(() => {
          setSendOnlyLoader(false)
        }, 500)
      }


    } catch (error) {
      console.error('Error sending SMS:', error)
      setShowSnackBar({
        message: 'Failed to send SMS',
        type: SnackbarTypes.Error,
      })
    } finally {
      setSendOnlyLoader(false)
    }
  }

  const getColumns = async () => {
    let res = await getUniquesColumn()
    // console.log('res', res)
    if (res) {
      setUniqueColumns(res)
    }
  }

  const fetchSmsTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const templates = await getTempletes('sms', selectedUser?.id)
      if (templates && Array.isArray(templates)) {
        setSmsTemplates(templates)
      } else {
        setSmsTemplates([])
      }
    } catch (error) {
      console.error('Error fetching SMS templates:', error)
      setSmsTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleTemplateSelect = async (template) => {
    if (!template) {
      setSelectedTemplate(null)
      setBody('')
      return
    }

    setSelectedTemplate(template)

    // Load template details to get the full content
    try {
      const details = await getTempleteDetails(template, selectedUser?.id)
      if (details && details.content) {
        setBody(details.content)
        // Focus the textarea after setting content
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
          }
        }, 0)
      }
    } catch (error) {
      console.error('Error loading template details:', error)
      // Fallback to template name if details fail
      if (template.templateName) {
        setBody(template.templateName)
      }
    }
  }

  const handleDeleteTemplate = async (template) => {
    setDelTempLoader(template)
    await deleteTemplete(template)
    setDelTempLoader(null)
    setSmsTemplates((prev) => prev.filter((x) => x.id !== template.id))
    // If the deleted template was selected, clear the selection
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null)
      setBody('')
    }
  }

  const handleDelete = (e, t) => {
    e.stopPropagation() // don't trigger select / close
    handleDeleteTemplate(t)
  }

  const handleNewTemplateNameConfirm = () => {
    if (newTemplateName.trim()) {
      const trimmedName = newTemplateName.trim()
      // Create a temporary template object to show in dropdown
      const newTemplate = {
        id: null, // Will be set when saved
        templateId: null,
        templateName: trimmedName,
        content: '',
      }
      setSelectedTemplate(newTemplate) // Set as selected so it shows in dropdown
      setNewTemplateName('')
      setShowNewTemplateModal(false)
    }
  }

  const handleNewTemplateNameCancel = () => {
    setNewTemplateName('')
    setShowNewTemplateModal(false)
  }

  const handleSelect = (t) => {
    setSelectedPhone(t)
    // onClose();
  }

  //code for showing more unique columns
  const handleShowUniqueCols = () => {
    setShowMoreUniqueColumns(!showMoreUniqueColumns)
  }

  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            onClose()
          }
        }}
        disableEnforceFocus={true}
        disableAutoFocus={true}
        disableRestoreFocus={true}
        disableBackdropClick={false}
        aria-labelledby="sms-template-modal"
        aria-describedby="sms-template-description"
        sx={{ zIndex: 1500, '& .MuiBackdrop-root': { zIndex: 1500 } }}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: '#00000020', zIndex: 1500, pointerEvents: 'auto' },
          onClick: (e) => {
            const backdropRoot = e.currentTarget
            const clickTarget = e.target
            const isDirectBackdropClick = clickTarget === backdropRoot ||
              (clickTarget.classList && clickTarget.classList.contains('MuiBackdrop-root'))
            const modalContent = backdropRoot?.parentElement?.querySelector('.MuiBox-root')
            const isClickOutsideContent = modalContent && !modalContent.contains(clickTarget)
            if (isDirectBackdropClick && isClickOutsideContent) {
              onClose()
            } else {
              e.stopPropagation()
            }
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
            borderRadius: 2,
            boxShadow: 24,
            zIndex: 1501,
            p: 0,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold" id="sms-template-modal">
              {isLeadSMS
                ? 'Send Text Message'
                : isEditing && !IsDefaultCadence
                  ? 'Update Text'
                  : 'New Text Message'}
            </h2>
            <CloseBtn onClick={onClose} />
          </div>

          {/* Content - close templates dropdown when user clicks anywhere here (e.g. inputs, textarea) */}
          <div
            className="flex-1 overflow-y-auto overflow-x-visible p-4 space-y-4"
            style={{ position: 'relative' }}
            id="sms-template-description"
            onMouseDown={() => {
              if (showTemplatesDropdown) setShowTemplatesDropdown(false)
            }}
          >
            <AgentSelectSnackMessage
              type={showSnackBar.type}
              message={showSnackBar.message}
              isVisible={showSnackBar.message !== ''}
              hide={() => {
                setShowSnackBar({
                  message: '',
                  type: SnackbarTypes.Success,
                })
              }}
            />

            <div
              className="w-full flex flex-col items-center p-3 rounded-[8px] mb-4 sms-note-container border"
              style={{ backgroundColor: 'rgb(248 250 252)', borderColor: '#E2E8F0' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex flex-row w-full mb-1">
                <div className="text-[13px] font-[400] text-black flex flex-row flex-wrap">
                  <span className="font-bold me-1">Note: </span> You can add variables like{' '}
                  <span className="text-brand-primary ms-1">{`{First Name}, {Address}.`}</span>
                  {uniqueColumns.length > 0 && showMoreUniqueColumns ? (
                    <div className="flex flex-row flex-wrap gap-2">
                      {uniqueColumns.map((item, index) => (
                        <div key={index} className="flex flex-row items-center gap-2 text-brand-primary">
                          {`{${item}}`},
                        </div>
                      ))}
                      <button className="text-brand-primary outline-none" onClick={handleShowUniqueCols}>
                        show less
                      </button>
                    </div>
                  ) : (
                    <div>
                      {uniqueColumns.length > 0 && (
                        <button
                          className="text-brand-primary flex flex-row items-center font-bold outline-none"
                          onClick={() => handleShowUniqueCols()}
                        >
                          <Plus weight="bold" size={15} style={{ strokeWidth: 40 }} />
                          {uniqueColumns.length}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* From field */}
            <div
              className="w-full mb-4"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From:
              </label>
              {phoneLoading ? (
                <div className="flex items-center justify-center h-[44px]">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <FormControl sx={{ height: '50px', width: '100%' }}>
                  <Select
                    value={selectedPhone || ''}
                    onChange={(event) => handleSelect(event.target.value)}
                    displayEmpty
                    renderValue={(selected) =>
                      selected?.phone || (
                        <div style={{ color: '#aaa' }}>Select phone number</div>
                      )
                    }
                    sx={{
                      ...styles.dropdownMenu,
                      backgroundColor: '#FFFFFF',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
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
                    {phoneNumbers?.length > 0 ? (
                      phoneNumbers?.map((item, index) => (
                        <MenuItem key={index} value={item}>
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-[15] font-[500] w-48">
                              {item.phone}
                            </div>
                          </div>
                        </MenuItem>
                      ))
                    ) : (
                      <div className="p-2">No number found</div>
                    )}
                  </Select>
                </FormControl>
              )}
            </div>

            {/* Message field - variables dropdown inside textarea like NewMessageModal */}
            <div
              className="w-full mb-4"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message:
              </label>
              <div className="relative" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => {
                    const newValue = e.target.value
                    if (newValue.length <= 300) {
                      setBody(newValue)
                    }
                  }}
                  placeholder="Type your message here"
                  className="w-full px-3 py-2 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none min-h-[120px] pr-24"
                  style={{
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    borderColor: '#E2E8F0',
                    borderWidth: '1px',
                  }}
                  rows={6}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {/* Variables dropdown inside textarea - bottom right like NewMessageModal */}
                {uniqueColumns && uniqueColumns.length > 0 && (
                  <div className="absolute bottom-2 right-2">
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={selectedVariable}
                        onChange={(e) => {
                          const value = e.target.value
                          setSelectedVariable('')
                          if (value && textareaRef.current) {
                            const textarea = textareaRef.current
                            const start = textarea.selectionStart || 0
                            const end = textarea.selectionEnd || 0
                            const variableText = value.startsWith('{') && value.endsWith('}')
                              ? value
                              : `{${value}}`
                            const newBody = body.substring(0, start) + variableText + body.substring(end)
                            if (newBody.length <= 300) {
                              setBody(newBody)
                              setTimeout(() => {
                                textarea.focus()
                                textarea.setSelectionRange(start + variableText.length, start + variableText.length)
                              }, 0)
                            }
                          }
                        }}
                        displayEmpty
                        sx={{
                          fontSize: '0.875rem',
                          height: '36px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--brand-primary))' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--brand-primary))', borderWidth: '2px' },
                        }}
                        MenuProps={{
                          PaperProps: { style: { maxHeight: '30vh', overflow: 'auto', zIndex: 1700, borderRadius: 8 } },
                          disablePortal: false,
                          container: typeof document !== 'undefined' ? document.body : null,
                          style: { zIndex: 1700 },
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
                  </div>
                )}
              </div>
              {/* Credits below textarea */}
              <div className="flex flex-row items-center justify-end w-full mt-2 pt-2 border-t border-gray-200">
                <div className="flex flex-row items-center gap-2 text-sm text-gray-600">
                  <div className="flex flex-row items-center gap-1">
                    <span>{((user?.totalSecondsAvailable || 0) / 60).toFixed(2)} credits left</span>
                    <Tooltip
                      title="10 text messages equal 1 credit"
                      placement="top"
                      arrow
                      componentsProps={{
                        tooltip: { sx: { backgroundColor: '#ffffff', color: '#333' } },
                      }}
                    >
                      <Image src="/agencyIcons/InfoIcon.jpg" alt="info" width={14} height={14} className="cursor-pointer" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with template dropdown, save-as-template checkbox, char count, and dual button - same as NewMessageModal */}
          <div className="flex items-center justify-between gap-4 p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              {/* Templates button + dropdown - only when not lead SMS */}
              {!isLeadSMS && (
                <div className="relative" ref={templatesDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showTemplatesDropdown) {
                        fetchSmsTemplates()
                      }
                      setShowTemplatesDropdown(!showTemplatesDropdown)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    {renderBrandedIcon('/messaging/templateIcon.svg', 18, 18)}
                    <span>Templates</span>
                    <CaretDown size={16} className={`transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showTemplatesDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
                      {templatesLoading ? (
                        <div className="p-4 text-center">
                          <CircularProgress size={20} />
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(null)
                              setBody('')
                              setShowTemplatesDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                          >
                            None (Start from scratch)
                          </button>
                          {smsTemplates?.length > 0 ? (
                            smsTemplates.map((template, index) => (
                              <div
                                key={template.id || index}
                                className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleTemplateSelect(template)
                                    setShowTemplatesDropdown(false)
                                  }}
                                  className="flex-1 text-left text-sm min-w-0"
                                >
                                  <div className="font-medium text-gray-900 truncate">
                                    {template.templateName || 'Untitled Template'}
                                  </div>
                                </button>
                                {delTempLoader?.id === template.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(e, template)
                                      setShowTemplatesDropdown(false)
                                    }}
                                    className="flex-shrink-0 p-1 rounded transition-colors text-brand-primary hover:bg-brand-primary/10"
                                  >
                                    <Trash size={16} />
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No templates found</div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewTemplateModal(true)
                              setShowTemplatesDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-medium text-brand-primary hover:bg-brand-primary/10 border-t border-gray-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            New Template
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Save as template checkbox - in footer like NewMessageModal */}
              {!isLeadSMS && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="saveAsTemplateSMS"
                    checked={saveAsTemplate}
                    onCheckedChange={(checked) => setSaveAsTemplate(checked === true)}
                    className="h-5 w-5"
                  />
                  <label htmlFor="saveAsTemplateSMS" className="text-sm text-gray-700 cursor-pointer select-none">
                    {selectedTemplate ? 'Update template' : 'Save as template'}
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {body.length}/300 char
              </div>
              <button
                type="button"
                onClick={handleSendOnly}
                disabled={!body?.trim() || (isLeadSMS ? !leadPhone : !selectedPhone) || sendOnlyLoader}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {sendOnlyLoader ? (
                  <>
                    <CircularProgress size={16} className="text-white" />
                    {isEditing && !IsDefaultCadence ? 'Updating...' : isLeadSMS ? 'Sending...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    {isEditing && !IsDefaultCadence ? 'Update' : isLeadSMS ? 'Send' : 'Save'}
                    <PaperPlaneTilt size={16} weight="regular" />
                  </>
                )}
              </button>
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
                className="px-4 py-2 bg-brand-primary text-white rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  dropdownMenu: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  labelStyle: {
    backgroundColor: 'white',
    fontWeight: '400',
    fontSize: 10,
  },
}

export default SMSTempletePopup
