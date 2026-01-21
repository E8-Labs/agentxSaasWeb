import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowUpRight, X } from '@phosphor-icons/react'
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

      let apiUrl = `${Apis.getSheets}?type=manual`
      if (selectedUser?.id) {
        apiUrl += `&userId=${selectedUser.id}`
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
      //   width: "45vw",
      bgcolor: 'transparent',
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
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
      BackdropProps={{
        timeout: 1000,
        // sx: {
        //   backgroundColor: '#00000020',
        // },
      }}
    >
      <Box
        className="xl:w-6/12 lg:w-7/12 sm:w-10/12 w-8/12"
        sx={styles.modalsStyle}
      >
        <div className="flex flex-row justify-center w-full">
          <div
            className="w-full px-[24px] pt-[24px] pb-[10px]"
            style={{
              backgroundColor: '#ffffff',

              borderRadius: '13px',
              display: 'flex',
              maxHeight: '90vh',
            }}
          >
            {/* Left Side - Configuration */}
            <div style={{ flex: 1, paddingRight: 24 }}>
              {/* Header */}
              {/* <div className="flex flex-row justify-between items-center mb-3">
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                {agentName?.charAt(0).toUpperCase() + agentName?.slice(1)} | Embed Agent
              </Typography>
              <button onClick={onClose}>
                <Image
                  src={"/assets/cross.png"}
                  height={14}
                  width={14}
                  alt="*"
                />
              </button>
            </div> */}

              {/* Logo Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundImage: logoPreview
                        ? `url(${logoPreview})`
                        : 'url(/thumbOrbSmall.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      marginRight: 12,
                      border: logoPreview ? 'none' : '1px solid #e0e0e0',
                    }}
                  />
                  <button
                    className="text-black px-3 py-1 border-lg border text-transform-none font-medium flex items-center hover:text-white hover:bg-brand-primary transition-all duration-300 rounded-lg p-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image
                      className="transition-all duration-200 hover:hidden"
                      src={'/otherAssets/uploadIcon.png'}
                      height={24}
                      width={24}
                      alt="Upload"
                    />
                    <Image
                      className="transition-all duration-200 hidden hover:inline"
                      src={'/otherAssets/uploadIconPurple.png'}
                      height={24}
                      width={24}
                      alt="Upload Hover"
                    />
                    <span className="ml-1">Change Logo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'none' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 40, marginRight: 12 }}></div>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '12px',
                      marginLeft: -6,
                      flexDirection: 'row',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    {renderBrandedIcon('/assets/infoIcon.png', 12, 12)}
                    Ensure Image is a 1:1 dimension for better quality
                  </Typography>
                </Box>
              </Box>

              {/* Button Label */}
              <Box sx={{ mb: 3 }}>
                <div className="flex flex-row justify-between items-center mb-1">
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Button Label
                  </Typography>
                  <div
                    style={{
                      marginLeft: '16px',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    {buttonLabel ? buttonLabel.length : 0}/10
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    ref={textInputRef}
                    type="text"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    placeholder="Get Help"
                    maxLength={10}
                    className="outline-none focus:outline-none focus:ring-0 border rounded-lg p-3"
                    style={{
                      fontSize: '14px',
                      width: '100%',
                      border: '1px solid #00000020',
                    }}
                  />
                </div>
              </Box>

              {/* Require Form Section */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e9ecef',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Require users to complete a form?
                  </Typography>
                  <Switch
                    checked={requireForm}
                    onChange={handleToggleChange}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'hsl(var(--brand-primary))',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                        {
                          backgroundColor: 'hsl(var(--brand-primary))',
                        },
                      margin: 0,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  This prompts users to fill out a form before they engage in a
                  conversation with your AI.
                </Typography>
              </Box>

              {/* Smart List Selection */}
              {requireForm && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 'medium', color: 'rgba(0, 0, 0, 0.5)' }}
                    >
                      Select Smartlist
                    </Typography>
                    <button
                      className="text-brand-primary underline text-transform-none font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        onShowSmartList()
                      }}
                    >
                      New Smartlist
                    </button>
                  </Box>

                  {loading ? (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : smartLists.length > 0 ? (
                    <FormControl className="w-full h-[50px]">
                      <Select
                        value={selectedSmartList || ''}
                        onChange={(e) => {
                          e.stopPropagation()
                          setSelectedSmartList(e.target.value)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        displayEmpty
                        sx={{
                          height: '48px',
                          borderRadius: '13px',
                          border: '1px solid #00000020', // Default border
                          '&:hover': {
                            border: '1px solid #00000020', // Same border on hover
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
                        {smartLists.map((list, index) => (
                          <MenuItem key={index} value={list.id}>
                            {list.sheetName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2 }}
                    >
                      No smart lists available. Create a new one to get started.
                    </Typography>
                  )}
                </Box>
              )}

              {/* Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  mt: 3,
                }}
              >
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
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
              </Box>
            </div>

            {/* Right Side - Preview */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                marginRight: -24,
                marginTop: -24,
                marginBottom: -10,
              }}
            >
              <div className="bg-gradient-to-b from-brand-primary to-brand-primary/10"
                style={{
                  borderRadius: '0 8px 8px 0',
                  height: '100%',
                  minHeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Close button for preview */}
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <CloseBtn
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose()
                    }}
                  />
                </div>

                {/* Preview Button */}
                <button
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: 25,
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundImage: logoPreview
                        ? `url(${logoPreview})`
                        : 'url(/thumbOrbSmall.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      marginRight: 8,
                      border: logoPreview ? 'none' : '1px solid #e0e0e0',
                    }}
                  />
                  <span style={{ color: '#333', fontWeight: '500' }}>
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
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default EmbedModal
