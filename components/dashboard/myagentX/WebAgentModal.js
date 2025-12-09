import {
  Box,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Switch,
} from '@mui/material'
import { ArrowUpRight, X } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

import Apis from '../../apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'

const WebAgentModal = ({
  open,
  onClose,
  agentName,
  modelId,
  agentId,
  onOpenAgent,
  onShowNewSmartList,
  agentSmartRefill,
  fetureType,
  onCopyUrl,
  selectedSmartList,
  setSelectedSmartList,
  agent, // Add agent prop to access web-specific fields
}) => {
  const [agentSmartRefillId, setAgentSmartRefillId] = useState(agentSmartRefill)
  const [requireForm, setRequireForm] = useState(false)
  const [smartLists, setSmartLists] = useState([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    console.log('agent name is', agentName)
    // if(agentSmartRefill){
    //   setRequireForm(true);
    //   setSelectedSmartList(agentSmartRefill);
    // }
    //  else {
    //   setRequireForm(false);
    //   setSelectedSmartList('');
    // }
  }, [agentSmartRefillId])

  useEffect(() => {
    if (open) {
      // Initialize with existing agent data when modal opens
      if (agent) {
        // Check web/webhook-specific smartlist settings
        const agentType = fetureType === 'webhook' ? 'webhook' : 'web'
        const webSmartListEnabled =
          agentType === 'webhook'
            ? agent.smartListEnabledForWebhook !== undefined
              ? agent.smartListEnabledForWebhook
              : agent.smartListEnabled ?? false // Fallback to legacy field
            : agent.smartListEnabledForWeb !== undefined
              ? agent.smartListEnabledForWeb
              : agent.smartListEnabled ?? false // Fallback to legacy field
        const webSmartListId =
          agentType === 'webhook'
            ? agent.smartListIdForWebhook !== undefined
              ? agent.smartListIdForWebhook
              : agent.smartListId // Fallback to legacy field
            : agent.smartListIdForWeb !== undefined
              ? agent.smartListIdForWeb
              : agent.smartListId // Fallback to legacy field

        console.log('🔍 WebAgentModal - Initializing with agent data:', {
          agentType,
          webSmartListEnabled,
          webSmartListId,
          hasNewFields: {
            smartListEnabledForWeb: agent.smartListEnabledForWeb !== undefined,
            smartListIdForWeb: agent.smartListIdForWeb !== undefined,
            smartListEnabledForEmbed: agent.smartListEnabledForEmbed !== undefined,
            smartListIdForEmbed: agent.smartListIdForEmbed !== undefined,
          },
          fieldValues: {
            smartListEnabledForWeb: agent.smartListEnabledForWeb,
            smartListIdForWeb: agent.smartListIdForWeb,
            smartListEnabledForEmbed: agent.smartListEnabledForEmbed,
            smartListIdForEmbed: agent.smartListIdForEmbed,
            smartListEnabled: agent.smartListEnabled, // Legacy
            smartListId: agent.smartListId, // Legacy
          },
          agent,
        })

        // IMPORTANT: Only use legacy fields if new fields don't exist
        // If new fields exist (even if false/null), use them
        const hasNewFields = 
          agent.smartListEnabledForWeb !== undefined || 
          agent.smartListIdForWeb !== undefined ||
          agent.smartListEnabledForEmbed !== undefined ||
          agent.smartListIdForEmbed !== undefined

        if (hasNewFields) {
          // New fields exist - use them exclusively (ignore legacy fields)
          setRequireForm(webSmartListEnabled)
        } else {
          // No new fields - fallback to legacy (for backward compatibility before migration)
          console.warn('⚠️ WebAgentModal - Using legacy fields, migration may not have run')
          setRequireForm(agent.smartListEnabled ?? false)
        }
        if (webSmartListId) {
          setSelectedSmartList(webSmartListId)
        } else {
          setSelectedSmartList('')
        }
      } else if (agentSmartRefill) {
        // Fallback to legacy behavior if agent prop not provided
        setRequireForm(true)
        setSelectedSmartList(agentSmartRefill)
      } else {
        // No agent data and no refill - reset to defaults
        setRequireForm(false)
        setSelectedSmartList('')
      }
      
      // Fetch smart lists after initializing state
      fetchSmartLists()
    }
  }, [open, agent, fetureType, agentSmartRefill])

  const fetchSmartLists = async () => {
    try {
      setLoading(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const response = await axios.get(`${Apis.getSheets}?type=manual`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
      })

      console.log('get sheets response is', response)
      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setSmartLists(response.data.data)
        console.log('agentSmartRefillId', agentSmartRefillId)
        console.log('agentSmartRefill', agentSmartRefill)

        // Don't override requireForm here - it's set in the useEffect based on agent prop
        // Only set selectedSmartList if we have a valid ID and requireForm is true
        // But don't override if it's already set from agent prop
        if (requireForm && !selectedSmartList) {
          const agentType = fetureType === 'webhook' ? 'webhook' : 'web'
          const webSmartListId =
            agentType === 'webhook'
              ? agent?.smartListIdForWebhook
              : agent?.smartListIdForWeb
          const fallbackId = agentSmartRefillId || agentSmartRefill
          
          if (webSmartListId || fallbackId) {
            setSelectedSmartList(webSmartListId || fallbackId)
          } else if (response.data.data.length > 0) {
            setSelectedSmartList(response.data.data[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching smart lists:', error)
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

  const handleToggleChange = async (event) => {
    console.log('handleToggleChange', event.target.checked)
    const newValue = event.target.checked
    
    // Optimistically update UI
    setRequireForm(newValue)
    
    if (!newValue) {
      // Disabling: detach smart list from the agent
      try {
        let AuthToken = null
        const localData = localStorage.getItem('User')
        if (localData) {
          const UserDetails = JSON.parse(localData)
          AuthToken = UserDetails.token
        }

        const response = await axios.post(
          `${Apis.attachSmartList}`,
          {
            agentId: agentId,
            smartListId: null,
            agentType: fetureType === 'webhook' ? 'webhook' : 'web', // Specify agent type
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${AuthToken}`,
            },
          },
        )

        if (response.data && response.data.status) {
          setSelectedSmartList('')
          showSnackbar('', 'Smart list disabled', SnackbarTypes.Success)
          // Update agent object if it exists
          if (agent) {
            const agentType = fetureType === 'webhook' ? 'webhook' : 'web'
            if (agentType === 'webhook') {
              agent.smartListEnabledForWebhook = false
              agent.smartListIdForWebhook = null
            } else {
              agent.smartListEnabledForWeb = false
              agent.smartListIdForWeb = null
            }
          }
        } else {
          // Revert on error
          setRequireForm(!newValue)
          showSnackbar(
            '',
            response.data?.message || 'Error disabling smart list. Please try again.',
            SnackbarTypes.Error,
          )
        }
      } catch (error) {
        console.error('Error detaching smart list:', error)
        // Revert on error
        setRequireForm(!newValue)
        showSnackbar(
          '',
          'Error disabling smart list. Please try again.',
          SnackbarTypes.Error,
        )
      }
    } else {
      // Enabling: just update local state, smartlist will be attached when opening agent
      if (!selectedSmartList && smartLists.length > 0) {
        setSelectedSmartList(smartLists[0].id)
      }
    }
  }

  const handleOpenAgent = async () => {
    console.log('handleOpenAgent called')
    if (requireForm && !selectedSmartList) {
      return // Don't open if form is required but no smart list selected
    }

    // If form is required and a smart list is selected, attach it to the agent first
    if (requireForm && selectedSmartList) {
      try {
        let AuthToken = null
        const localData = localStorage.getItem('User')
        if (localData) {
          const UserDetails = JSON.parse(localData)
          AuthToken = UserDetails.token
        }

        // Note: This API endpoint might need to be added to Apis.js
        const response = await axios.post(
          `${Apis.attachSmartList}`, // Using a placeholder - update Apis.js if needed
          {
            agentId: agentId,
            smartListId: selectedSmartList,
            agentType: fetureType === 'webhook' ? 'webhook' : 'web', // Specify agent type
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${AuthToken}`,
            },
          },
        )

        if (response.data) {
          console.log('feature type is', fetureType)
          // return;
          // Success - now open the agent
          if (fetureType === 'webhook') {
            onCopyUrl()
          } else {
            onOpenAgent()
            showSnackbar(
              '',
              'Smart list attached successfully!',
              SnackbarTypes.Success,
            )
          }
        }
      } catch (error) {
        console.error('Error attaching smart list:', error)
        showSnackbar(
          '',
          'Error attaching smart list. Please try again.',
          SnackbarTypes.Error,
        )
        return
      }
    } else {
      console.log(
        'no form required or no smart list selected, just open the agent',
      )
      if (fetureType === 'webhook') {
        onCopyUrl()
      } else {
        onOpenAgent()
      }
    }
  }

  const handleNewSmartList = () => {
    onShowNewSmartList()
  }

  const styles = {
    modalsStyle: {
      height: '100vh',
      bgcolor: 'transparent',
      mx: 'auto',
      // my: "50vh",
      // transform: "translateY(-50%)",
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
        sx: {
          backgroundColor: '#00000020',
        },
      }}
    >
      <Box
        className="xl:w-4/12 lg:w-6/12 sm:w-10/12 w-6/12 flex flex-col items-center justify-center"
        sx={styles.modalsStyle}
      >
        <div className="flex flex-col justify-center items-center bg-white rounded-lg px-4 py-6 w-full">
          {/* Header */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <h2
              className="capitalize"
              style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}
            >
              {agentName.slice(0, 20)} {agentName.length > 20 ? '...' : ''} |{' '}
              {`${fetureType === 'webhook' ? 'Webhook Agent' : 'Browser Agent'}`}
            </h2>
            <CloseBtn
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            />
          </div>

          {/* Require Form Section */}
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
              border: '1px solid #e9ecef',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                Require users to complete a form?
              </div>
              <Switch
                checked={requireForm}
                onChange={handleToggleChange}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'hsl(var(--brand-primary))',
                    '& + .MuiSwitch-track': {
                      backgroundColor: 'hsl(var(--brand-primary))',
                    },
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: '#ccc',
                  },
                }}
              />
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              This prompts users to fill out a form before they engage in a
              conversation with your AI.
            </div>
          </div>

          {/* Smart List Selection */}
          {requireForm && (
            <div style={{ marginBottom: 24, width: '90%' }}>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontWeight: 'medium',
                    color: 'rgba(0, 0, 0, 0.5)',
                    fontSize: '16px',
                  }}
                >
                  Select Smart List
                </div>
                <button
                  className="text-brand-primary underline text-transform-none font-medium"
                  onClick={(e) => {
                    console.log('New Smartlist button clicked')
                    e.stopPropagation()
                    handleNewSmartList()
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    position: 'relative',
                    zIndex: 10,
                  }}
                >
                  New Smartlist
                </button>
              </div>

              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '16px 0',
                  }}
                >
                  <div>Loading...</div>
                </div>
              ) : smartLists.length > 0 ? (
                <FormControl className="w-full h-[50px]">
                  <Select
                    value={selectedSmartList}
                    onChange={(e) => setSelectedSmartList(e.target.value)}
                    style={{
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      padding: '12px',
                      backgroundColor: '#fff',
                      width: '100%',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
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
                      <MenuItem key={list.id || index} value={list.id}>
                        {list.sheetName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <div
                  style={{ padding: '16px 0', fontSize: '14px', color: '#666' }}
                >
                  No smart lists available. Create a new one to get started.
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              width: '90%',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              marginTop: 24,
            }}
          >
            <button
              onClick={(e) => {
                console.log('Cancel button clicked')
                e.stopPropagation()
                onClose()
              }}
              style={{
                padding: '8px 16px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                position: 'relative',
                zIndex: 10,
              }}
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                console.log('Open agent button clicked')
                e.stopPropagation()
                handleOpenAgent()
              }}
              disabled={requireForm && !selectedSmartList}
              style={{
                padding: '8px 24px',
                backgroundColor:
                  requireForm && !selectedSmartList ? '#d1d5db' : '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor:
                  requireForm && !selectedSmartList ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10,
              }}
            >
              {fetureType === 'webhook'
                ? 'Copy Webhook Url'
                : 'Open agent in new tab'}
              <ArrowUpRight size={16} style={{ marginLeft: 8 }} />
            </button>
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
      </Box>
    </Modal>
  )
}

export default WebAgentModal
