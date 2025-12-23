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
import { Plus, PaperPlaneTilt } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import ChipInput from '@/constants/ChipsInput'
import { PersistanceKeys } from '@/constants/Constants'

import { getUserLocalData } from '../constants/constants'
import { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'
import AgentSelectSnackMessage from '../dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '../globalExtras/CloseBtn'
import { getUniquesColumn } from '../globalExtras/GetUniqueColumns'
import {
  createTemplete,
  getTempleteDetails,
  updateTemplete,
} from './TempleteServices'
import { PromptTagInput } from './tagInputs/PromptTagInput'

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
}) {
  const [body, setBody] = useState('')
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [saveSmsLoader, setSaveSmsLoader] = useState(false)
  const [showSnackBar, setShowSnackBar] = useState({
    message: '',
    type: SnackbarTypes.Error,
  })
  const [showUniqueDropdown, setShowUniqueDropdown] = useState(false)
  const [showManu, setShowMenu] = useState(null)

  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false)
  const [user, setUser] = useState(null)
  const [IsDefaultCadence, setIsDefaultCadence] = useState(null)
  useEffect(() => {
    let data = getUserLocalData()
    setUser(data.user)
    getColumns()
    let isDefault = localStorage.getItem(
      PersistanceKeys.isDefaultCadenceEditing,
    )
    console.log('isDefault', isDefault)
    setIsDefaultCadence(isDefault)
  }, [open])

  // Check if save button should be disabled
  const isSaveDisabled = isLeadSMS
    ? // For lead SMS, only require body content
    !body?.trim() || saveSmsLoader
    : // Original validation for pipeline cadence
    !body?.trim() || saveSmsLoader || !selectedPhone

  // Auto-fill form when editing
  useEffect(() => {
    if (isEditing && editingRow && open) {
      // Load template details if templateId exists
      if (editingRow.templateId) {
        loadTemplateDetails(editingRow)
      }
    } else if (!isEditing) {
      // Reset form when not editing
      setBody('')
      setSelectedPhone(null)
    }
  }, [isEditing, editingRow, open])

  const loadTemplateDetails = async (template) => {
    try {
      // setDetailsLoader(template.id);
      const details = await getTempleteDetails(template)
      console.log('details', details)
      if (details) {
        setBody(details.content || '')
        setSelectedPhone(details.phone)
      }
    } catch (error) {
      console.error('Error loading template details:', error)
    } finally {
      // setDetailsLoader(null);
    }
  }

  const handleSave = async () => {
    if (isSaveDisabled) return

    setSaveSmsLoader(true)
    try {
      // Handle lead SMS sending
      if (isLeadSMS && onSendSMS) {
        console.log('Sending SMS to lead:', leadPhone)

        const smsData = {
          content: body,
          phone: leadPhone,
          smsPhoneNumberId: selectedPhone?.id,
          leadId: leadId,
        }
        console.log('smsData', smsData)

        // Wait for onSendSMS to complete if it's async, otherwise call it
        if (typeof onSendSMS === 'function') {
          const result = onSendSMS(smsData)
          if (result && typeof result.then === 'function') {
            // If it returns a promise, wait for it
            try {
              await result
            } catch (error) {
              console.error('Error in onSendSMS:', error)
            } finally {
              // Reset loader after SMS is sent (with a small delay to ensure it shows)
              setTimeout(() => {
                setSaveSmsLoader(false)
              }, 300)
            }
          } else {
            // If not async, reset loader after a short delay to ensure it's visible
            setTimeout(() => {
              setSaveSmsLoader(false)
            }, 500)
          }
        }
        // Don't close modal - let the parent component handle it
        return
      }

      // Add your save logic here
      let data = {
        communicationType: communicationType,
        templateName: 'Sms temp',
        content: body,
        phone: selectedPhone.phone,
      }
      let response = null
      if (isEditing && !IsDefaultCadence) {
        response = await updateTemplete(data, editingRow.templateId)
      } else {
        response = await createTemplete(data)
      }

      if (response.data.status === true) {
        // setShowSnackBar({
        //     message: response.data.message,
        //     type: SnackbarTypes.Success,
        // })
        const createdTemplate = response?.data?.data

        if (isEditing && onUpdateRow && editingRow) {
          // Update existing row with new template data
          onUpdateRow(editingRow.id, {
            templateId: createdTemplate.id,
            content: body,
            communicationType: 'sms',
          })
        } else {
          addRow({
            templateId: createdTemplate.id,
            communicationType: 'sms',
            phone: selectedPhone,
          })
        }

        // if (addRow && createdTemplate) {
        //     addRow({
        //         templateId: createdTemplate.id,
        //         communicationType: 'sms',
        //     });
        // }
      }
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (error) {
      console.log('error', error)
      // setShowSnackBar({
      //     message: "Failed to save SMS template",
      //     type: SnackbarTypes.Error,
      // })
    } finally {
      // Reset loader for non-lead SMS flows
      // For lead SMS, loader is reset in the try block after onSendSMS completes
      if (!isLeadSMS) {
        setSaveSmsLoader(false)
      }
    }
  }

  const getColumns = async () => {
    let res = await getUniquesColumn()
    // console.log('res', res)
    if (res) {
      setUniqueColumns(res)
    }
  }

  const handleSelect = (t) => {
    console.log('t', t)
    setSelectedPhone(t)
    // onClose();
  }

  //code for showing more unique columns
  const handleShowUniqueCols = () => {
    setShowMoreUniqueColumns(!showMoreUniqueColumns)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: '#00000020',
          // //backdropFilter: "blur(20px)",
          padding: 0,
          margin: 0,
        },
      }}
    >
      <Box
        className="w-full h-full py-4 flex items-center justify-center"
        sx={{ ...styles.modalsStyle }}
      >
        <div className="flex flex-col w-full max-w-2xl px-8 py-6 bg-white max-h-[85vh] rounded-2xl justify-between">
          <div
            className="flex flex-col w-full h-[80%] overflow-auto"
            style={{ scrollbarWidth: 'none' }}
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

            <div className="w-full flex flex-row items-center justify-between mb-8">
              <div className="text-[15px] font-[700]">
                {isLeadSMS
                  ? 'Send Text Message'
                  : isEditing && !IsDefaultCadence
                    ? 'Update Text'
                    : 'New Text Message'}
              </div>

              <CloseBtn onClick={onClose} />
            </div>

            <div className="w-full flex flex-col items-ceter  p-2 rounded-lg mb-4"
              style={{
                backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
              }}
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div className="text-brand-primary text-[14] font-[700]">Note</div>
              </div>

              <div className="text-[13px] font-[400] text-black flex flex-row flex-wrap">
                You can add variables like{' '}
                <span className="text-brand-primary">{`{First Name}, {Address}.`}</span>
                {uniqueColumns.length > 0 && showMoreUniqueColumns ? (
                  <div className="flex flex-row flex-wrap gap-2">
                    {uniqueColumns.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-row items-center gap-2 text-brand-primary"
                      >
                        {`{${item}}`},
                      </div>
                    ))}
                    <button
                      className="text-brand-primary outline-none"
                      onClick={handleShowUniqueCols}
                    >
                      show less
                    </button>
                  </div>
                ) : (
                  <div>
                    {uniqueColumns.length > 0 && (
                      <button
                        className="text-brand-primary flex flex-row items-center font-bold outline-none"
                        onClick={() => {
                          handleShowUniqueCols()
                        }}
                      >
                        <Plus
                          weight="bold"
                          size={15}
                          style={{
                            strokeWidth: 40, // Adjust as needed
                          }}
                        />
                        {uniqueColumns.length}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* From field */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From:
              </label>
              {phoneLoading ? (
                <div className="flex items-center justify-center h-[50px]">
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
                        },
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

            {/* Message field */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message:
              </label>
              <div className="relative">
                <PromptTagInput
                  promptTag={body}
                  uniqueColumns={uniqueColumns}
                  tagValue={setBody}
                  showSaveChangesBtn={body}
                  from={'sms'}
                  isEdit={isEditing}
                  editTitle={
                    isEditing && !IsDefaultCadence ? 'Edit Text' : 'Create Text'
                  }
                  saveUpdates={async () => { }}
                  limit={160}
                  placeholder="Type your message..."
                />
                
                {/* Character count and balance at bottom of message area */}
                <div className="flex flex-row items-center justify-between w-full mt-2 pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {body.length}/160 char
                  </div>
                  <div className="flex flex-row items-center gap-2 text-sm text-gray-600">
                    <span>|</span>
                    <div className="flex flex-row items-center gap-1">
                      <span>{((user?.totalSecondsAvailable || 0) / 60).toFixed(2)} credits left</span>
                      <Tooltip 
                        title="10 text messages equal 1 credit"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: '#ffffff',
                              color: '#333',
                            },
                          },
                        }}
                      >
                        <Image src="/agencyIcons/InfoIcon.jpg" alt="info" width={10} height={10} />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row items-center justify-end mt-4">
            {saveSmsLoader ? (
              <CircularProgress size={30} />
            ) : (
              <button
                className={`flex flex-row items-center gap-2 px-6 py-3 h-[48px] text-[15px] font-[600] rounded-lg text-white transition-colors ${
                  isSaveDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-brand-primary hover:bg-brand-primary/90'
                }`}
                disabled={isSaveDisabled}
                onClick={handleSave}
              >
                {isLeadSMS
                  ? 'Send'
                  : isEditing && !IsDefaultCadence
                    ? 'Update'
                    : 'Create'}{' '}
                Text
                <PaperPlaneTilt size={18} weight="regular" />
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
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

export default SMSTempletePopup
