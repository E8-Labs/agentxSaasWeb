import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Switch,
} from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import { renderBrandedIcon } from '@/utilities/iconMasking'

const EmbedModal = ({
  open,
  onClose,
  agentName,
  agentId,
  onShowSmartList,
  onShowAllSet,
  agentSmartRefill,
  selectedUser,
  agent,
  onAgentUpdate, // Callback to update parent's agent state
}) => {
  const [buttonLabel, setButtonLabel] = useState('Get Help')
  const [requireForm, setRequireForm] = useState(false)
  const [smartLists, setSmartLists] = useState([])
  const [selectedSmartList, setSelectedSmartList] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const fileInputRef = useRef(null)
  const textInputRef = useRef(null)
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: SnackbarTypes.Error,
  })

  const showSnackbar = (title, message, type = SnackbarTypes.Error) => {
    setSnackbar({
      isVisible: true,
      title,
      message,
      type,
    })
  }

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, isVisible: false }))
  }

  const fetchSmartLists = async () => {
    try {
      setLoading(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      let apiUrl = `${Apis.getSheets}`   //?type=manual
      if (selectedUser?.id) {
        apiUrl += `?userId=${selectedUser.id}`
      }

      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
      })

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setSmartLists(response.data.data)
        
        // Always try to set the selected smartlist from agent data after fetching
        // This ensures it's set even if the list was just created
        const smartListIdToSet =
          agent?.smartListIdForEmbed || // NEW: Check embed-specific field first
          agent?.smartListId || // Legacy fallback
          agentSmartRefill || 
          null
        
        if (smartListIdToSet) {
          // Convert to number for comparison (list IDs are numbers)
          const smartListIdNum = Number(smartListIdToSet)
          
          // Verify the smartlist exists in the fetched list
          const smartListExists = response.data.data.some(
            (list) => Number(list.id) === smartListIdNum
          )
          
          if (smartListExists) {
            // Use the actual ID from the list to ensure type consistency
            const matchingList = response.data.data.find(
              (list) => Number(list.id) === smartListIdNum
            )
            setSelectedSmartList(matchingList.id)
          } else {
            console.warn('🔧 EMBED-MODAL - Smartlist ID not found in fetched list:', {
              requestedId: smartListIdToSet,
              requestedIdType: typeof smartListIdToSet,
              availableIds: response.data.data.map(s => ({ id: s.id, type: typeof s.id, name: s.sheetName })),
            })
            // Still set it in case it's a timing issue - convert to number
            setSelectedSmartList(smartListIdNum)
          }
        } else if (requireForm && response.data.data.length > 0) {
          // If form is required but no smartlist ID, select first one
          setSelectedSmartList(response.data.data[0].id)
        }
      } else {
        console.warn('🔧 EMBED-MODAL - No smartlists found in response')
      }
    } catch (error) {
      console.error('🔧 EMBED-MODAL - Error fetching smart lists:', error)
      showSnackbar(
        '',
        error.response?.data?.message ||
          'Failed to fetch smart lists. Please try again.',
        SnackbarTypes.Error,
      )
    } finally {
      setLoading(false)
    }
  }

  // Initialize with existing agent data when modal opens
  useEffect(() => {
    if (open && agent) {
      if (agent.supportButtonText) {
        setButtonLabel(agent.supportButtonText)
      }
      if (agent.supportButtonAvatar) {
        setLogoPreview(agent.supportButtonAvatar)
      }
      // Check embed-specific smartlist settings
      // IMPORTANT: Prioritize new fields, only use legacy if new fields don't exist
      const hasNewFields = 
        agent.smartListEnabledForEmbed !== undefined || 
        agent.smartListIdForEmbed !== undefined

      let embedSmartListEnabled = false
      let embedSmartListId = null

      if (hasNewFields) {
        // New fields exist - use them exclusively (ignore legacy fields)
        embedSmartListEnabled = agent.smartListEnabledForEmbed ?? false
        embedSmartListId = agent.smartListIdForEmbed || null
      } else {
        // No new fields - fallback to legacy (for backward compatibility before migration)
        embedSmartListEnabled = agent.smartListEnabled ?? false
        embedSmartListId = agent.smartListId || null
        console.warn('⚠️ EmbedModal - Using LEGACY fields (migration may not have run):', {
          smartListEnabled: embedSmartListEnabled,
          smartListId: embedSmartListId,
        })
      }

      if (embedSmartListEnabled) {
        setRequireForm(true)
        // Always fetch smart lists when form is required - this ensures we have the latest list
        // The fetchSmartLists function will set the selectedSmartList after fetching
        fetchSmartLists()
      } else if (embedSmartListId) {
        // Has smartlist ID but not enabled - fetch lists and set the ID but don't enable form
        fetchSmartLists()
        setSelectedSmartList(embedSmartListId)
        setRequireForm(false)
      } else {
        // No smartlist configured
        setRequireForm(false)
        setSelectedSmartList('')
        // Still fetch lists so they're available if user enables the toggle
        fetchSmartLists()
      }
    } else if (open && !agent) {
      // Reset to defaults when modal opens without agent data
      setButtonLabel('Get Help')
      setLogoPreview(null)
      setRequireForm(false)
      setSelectedSmartList('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agent, agent?.smartListIdForEmbed, agent?.smartListEnabledForEmbed])

  const handleToggleChange = (event) => {
    setRequireForm(event.target.checked)
    if (event.target.checked) {
      fetchSmartLists()
    } else {
      setSelectedSmartList('')
    }
  }

  const handleLogoChange = (event) => {
    try {
      const file = event.target.files[0]
      if (file) {
        setLogoFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setLogoPreview(e.target.result)
        }
        reader.onerror = (error) => {
          console.error('Error reading file:', error)
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Error handling logo change:', error)
    }
  }

  const updateSupportButton = async () => {
    try {
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const formData = new FormData()
      formData.append('agentId', agentId)
      if (selectedUser?.id) {
        formData.append('userId', selectedUser.id)
      }
      if (logoFile) {
        formData.append('media', logoFile)
      }
      formData.append('supportButtonText', buttonLabel)
      formData.append('smartListEnabled', requireForm.toString())
      formData.append('agentType', 'embed') // Specify agent type for embed agents
      // Also pass smartListId if available, so updateSupportButton can set it
      if (selectedSmartList) {
        formData.append('smartListId', selectedSmartList)
      }

      const response = await axios.post(
        // 'https://apimyagentx.com/agentxtest/api/agent/updateAgentSupportButton',
        Apis.updateAgentSupportButton,
        formData,
        {
          headers: {
            Authorization: `Bearer ${AuthToken}`,
          },
        },
      )

      if (response.data?.status === true) {
        return true
      } else {
        throw new Error(
          response.data?.message || 'Failed to update support button',
        )
      }
    } catch (error) {
      console.error('🔧 EMBED-MODAL - Error updating support button:', error)
      throw error
    }
  }

  const attachSmartList = async () => {
    try {
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const payload = {
        agentId: agentId,
        smartListId: selectedSmartList,
        agentType: 'embed', // Specify agent type for embed agents
      }

      if (selectedUser?.id) {
        payload.userId = selectedUser.id
      }

      const response = await axios.post(
        // 'https://apimyagentx.com/agentxtest/api/agent/attachSmartList',
        Apis.attachSmartList,payload,
        {
          headers: {
            Authorization: `Bearer ${AuthToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.data?.status === true) {
        // Update local agent state if agent prop is provided
        if (agent && selectedSmartList) {
          const updatedAgent = {
            ...agent,
            smartListIdForEmbed: selectedSmartList,
            smartListEnabledForEmbed: true,
          }
          // Notify parent to update agent state
          if (onAgentUpdate) {
            onAgentUpdate(updatedAgent)
          }
        }
        return true
      } else {
        throw new Error(response.data?.message || 'Failed to attach smart list')
      }
    } catch (error) {
      console.error('🔧 EMBED-MODAL - Error attaching smart list:', error)
      throw error
    }
  }

  const handleCopyEmbed = async () => {
    try {
      setLoading(true)

      // Step 1: Always update support button settings first
      await updateSupportButton()

      // Step 2: If form is required and smart list is selected, attach the smart list
      if (requireForm && selectedSmartList) {
        await attachSmartList()
        onShowAllSet() // Go directly to "all set" modal after attaching existing smart list
      } else {
        onShowAllSet()
      }
    } catch (error) {
      console.error('🔧 EMBED-MODAL - Error in embed process:', error)
      showSnackbar(
        'Error',
        error.message || 'Error processing embed settings. Please try again.',
        SnackbarTypes.Error,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleNewSmartList = () => {
    onShowSmartList()
  }

  const styles = {
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 0,
      border: 'none',
      outline: 'none',
    },
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{ timeout: 1000 }}
    >
      <Box
        className="flex flex-row justify-center w-full max-w-[900px] mx-auto"
        sx={styles.modalsStyle}
      >
        <div
          className="flex flex-row w-full overflow-hidden rounded-[12px] bg-white"
          style={{
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            maxHeight: '90vh',
          }}
        >
          {/* Left Side - Configuration */}
          <div className="flex flex-col w-[450px] shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3">
              <p className="text-[18px] font-semibold leading-[1.2] text-black tracking-[-0.36px]">
                {agentName ? `${agentName.charAt(0).toUpperCase() + agentName.slice(1)} | ` : ''}Embed Agent
              </p>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 px-4 pb-4">
              {/* Logo Section */}
              <div className="flex flex-col gap-1 items-center">
                <div className="flex flex-col gap-2.5 items-center">
                  <div
                    className="w-[54px] h-[54px] rounded-full shrink-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: logoPreview
                        ? `url(${logoPreview})`
                        : 'url(/thumbOrbSmall.png)',
                      border: logoPreview ? 'none' : '1px solid #e0e0e0',
                    }}
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center gap-1.5 min-h-[32px] px-3 py-[5.5px] rounded-lg bg-[#efefef] text-[#0f172a] text-sm font-normal hover:opacity-90 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image
                      src="/otherAssets/uploadIcon.png"
                      height={20}
                      width={20}
                      alt="Upload"
                    />
                    <span>Change Logo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden"
                  />
                </div>
                <div className="flex items-center justify-center gap-1">
                  {renderBrandedIcon('/assets/infoIcon.png', 16, 16)}
                  <p className="text-sm font-normal leading-[1.4] text-black opacity-60 tracking-[-0.14px]">
                    Ensure Image is a 1:1 dimension for better quality
                  </p>
                </div>
              </div>

              {/* Button Label */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 w-full">
                  <p className="flex-1 text-sm font-normal text-black/50">Button Label</p>
                  <p className="text-sm font-normal text-black/50 shrink-0">
                    {buttonLabel ? buttonLabel.length : 0}/10
                  </p>
                </div>
                <div className="search-input-wrapper w-full h-[40px] flex flex-row items-center rounded-lg overflow-hidden px-3">
                  <input
                    ref={textInputRef}
                    type="text"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    placeholder="Get Help"
                    maxLength={10}
                    className="flex-1 min-w-0 outline-none border-none bg-transparent text-sm font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Require Form Section */}
              <div className="flex flex-col rounded-xl px-4 py-2 bg-black/[0.08]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2 flex-1 min-w-0 py-2">
                    <p className="text-sm font-normal text-black">
                      Require users to complete a form?
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      This prompts users to fill out a form before they engage in a conversation with your AI.
                    </p>
                  </div>
                  <Switch
                    checked={requireForm}
                    onChange={handleToggleChange}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'hsl(var(--brand-primary))',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'hsl(var(--brand-primary))',
                      },
                      margin: 0,
                      flexShrink: 0,
                    }}
                  />
                </div>
              </div>

              {/* Smart List Selection */}
              {requireForm && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-black/50">Select Smartlist</p>
                    <button
                      type="button"
                      className="text-brand-primary underline text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        onShowSmartList()
                      }}
                    >
                      New Smartlist
                    </button>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-2">
                      <CircularProgress size={24} />
                    </div>
                  ) : smartLists.length > 0 ? (
                    <FormControl className="w-full">
                      <Select
                        value={selectedSmartList || ''}
                        onChange={(e) => {
                          e.stopPropagation()
                          setSelectedSmartList(e.target.value)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        displayEmpty
                        sx={{
                          height: 40,
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
                          '&.Mui-focused': {
                            borderColor: 'hsl(var(--brand-primary))',
                            boxShadow: '0 0 0 2px hsl(var(--brand-primary) / 0.2)',
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
                        {smartLists.map((list, index) => (
                          <MenuItem key={index} value={list.id}>
                            {list.sheetName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      No smart lists available. Create a new one to get started.
                    </p>
                  )}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-between px-4 py-2 mt-1">
                <button
                  type="button"
                  className="flex items-center justify-center min-h-[40px] px-3 py-2 rounded-lg bg-[#efefef] text-[#0f172a] text-sm font-normal hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center min-h-[40px] px-6 py-2.5 rounded-lg bg-brand-primary text-primary-foreground text-sm font-normal hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyEmbed()
                  }}
                  disabled={loading || (requireForm && !selectedSmartList)}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Copy Embed'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="flex-1 min-w-0 relative flex flex-col items-center justify-center p-4 bg-brand-primary overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <CloseBtn
                showWhiteCross
                className="rounded-[20px] p-2 bg-black/[0.02] hover:bg-black/5 transition-colors"
                iconSize={16}
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-4 rounded-[130px] bg-white shadow-[0px_19.462px_23.224px_0px_rgba(0,0,0,0.09)] cursor-default pointer-events-none"
            >
              <div
                className="w-8 h-8 rounded-full shrink-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: logoPreview
                    ? `url(${logoPreview})`
                    : 'url(/thumbOrbSmall.png)',
                  border: logoPreview ? 'none' : '1px solid #e0e0e0',
                }}
              />
              <span className="text-[24px] font-normal leading-[1.2] text-black tracking-[-1.2px]">
                {buttonLabel}
              </span>
            </button>
          </div>
        </div>

        {/* Snackbar */}
        <AgentSelectSnackMessage
          isVisible={snackbar.isVisible}
          title={snackbar.title}
          message={snackbar.message}
          type={snackbar.type}
          hide={hideSnackbar}
        />
      </Box>
    </Modal>
  );
}

export default EmbedModal
