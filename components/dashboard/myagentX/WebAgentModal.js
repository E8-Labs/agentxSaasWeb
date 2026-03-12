import {
  Box,
  Fade,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Switch,
} from '@mui/material'
import { ArrowUpRight, X } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { cn } from '@/lib/utils'

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
  onAgentUpdate, // Callback to update parent's agent state
  selectedUser, // Add selectedUser prop for agency/admin scenarios
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
  const formControlRef = useRef(null)
  const [selectMenuWidth, setSelectMenuWidth] = useState(null)

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

  useEffect(() => {}, [agentSmartRefillId])

  // Measure FormControl width when smart list section is visible so dropdown matches it
  useEffect(() => {
    if (!open || !requireForm || smartLists.length === 0) return
    const measure = () => {
      if (formControlRef.current) {
        setSelectMenuWidth(formControlRef.current.offsetWidth)
      }
    }
    measure()
    const resizeObserver = new ResizeObserver(measure)
    if (formControlRef.current) resizeObserver.observe(formControlRef.current)
    return () => resizeObserver.disconnect()
  }, [open, requireForm, smartLists.length])

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

      // Include userId parameter for agency/admin scenarios (like EmbedModal does)
      let apiUrl = `${Apis.getSheets}`   //?type=manual
      if (selectedUser?.id) {
        apiUrl += `?userId=${selectedUser.id}`
      }

      console.log("ApiUrl for smart lists is", apiUrl);

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
        console.log("Smart lists are", response.data.data);
        setSmartLists(response.data.data)

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
            const updatedAgent = {
              ...agent,
            }
            if (agentType === 'webhook') {
              updatedAgent.smartListEnabledForWebhook = false
              updatedAgent.smartListIdForWebhook = null
            } else {
              updatedAgent.smartListEnabledForWeb = false
              updatedAgent.smartListIdForWeb = null
            }
            // Notify parent to update agent state
            if (onAgentUpdate) {
              onAgentUpdate(updatedAgent)
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
          // Update local agent state if agent prop is provided
          if (agent && selectedSmartList) {
            const agentType = fetureType === 'webhook' ? 'webhook' : 'web'
            const updatedAgent = {
              ...agent,
            }
            if (agentType === 'webhook') {
              updatedAgent.smartListIdForWebhook = selectedSmartList
              updatedAgent.smartListEnabledForWebhook = true
            } else {
              updatedAgent.smartListIdForWeb = selectedSmartList
              updatedAgent.smartListEnabledForWeb = true
            }
            // Notify parent to update agent state
            if (onAgentUpdate) {
              onAgentUpdate(updatedAgent)
            }
          }
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

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 250,
        sx: {
          backgroundColor: '#00000099',
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={open} timeout={250}>
        <Box
          className="flex flex-col w-[400px] max-w-[90vw] overflow-hidden rounded-[12px] bg-white"
          sx={{
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            outline: 'none',
            '@keyframes modalEnter': {
              '0%': { transform: 'scale(0.95)' },
              '100%': { transform: 'scale(1)' },
            },
            animation: 'modalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Header */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #eaeaea' }}
          >
            <span
              className="capitalize font-semibold"
              style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)' }}
            >
              {agentName.slice(0, 20)} {agentName.length > 20 ? '...' : ''} |{' '}
              {`${fetureType === 'webhook' ? 'Webhook Agent' : 'Browser Agent'}`}
            </span>
            <CloseBtn
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            />
          </div>

          {/* Body */}
          <div className="flex-1 px-4 py-4" style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}>
          {/* Require Form Section */}
          <div
            className="mb-4 rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(0,0,0,0.02)',
              border: '1px solid #eaeaea',
            }}
          >
            <div className="mb-2 flex flex-row items-center justify-between">
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {fetureType === 'webhook'
                  ? 'Add your leads to a smartlist'
                  : 'Require users to complete a form?'}
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
            <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}>
              {fetureType === 'webhook'
                ? 'Organize the leads your AI talks to by adding them to a dedicated smartlist'
                : 'This prompts users to fill out a form before they engage in a conversation with your AI.'}
            </div>
          </div>

          {/* Smart List Selection */}
          {requireForm && (
            <div className="mb-4 w-full">
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
                <div ref={formControlRef} className="w-full">
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
                        onOpen: () => {
                          if (formControlRef.current) {
                            setSelectMenuWidth(formControlRef.current.offsetWidth)
                          }
                        },
                        PaperProps: {
                          style: {
                            maxHeight: '30vh',
                            overflow: 'auto',
                            scrollbarWidth: 'none',
                            width: selectMenuWidth != null ? `${selectMenuWidth}px` : undefined,
                            minWidth: selectMenuWidth != null ? `${selectMenuWidth}px` : undefined,
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
                </div>
              ) : (
                <div
                  style={{ padding: '16px 0', fontSize: '14px', color: '#666' }}
                >
                  No smart lists available. Create a new one to get started.
                </div>
              )}
            </div>
          )}

          </div>

          {/* Footer (action bar) */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className={cn(
                'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium',
                'bg-muted text-foreground hover:bg-muted/80',
                'transition-colors duration-150 active:scale-[0.98]',
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              className={cn(
                'flex h-[40px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold',
                'bg-brand-primary text-white hover:opacity-90',
                'transition-all duration-150 active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50',
              )}
              onClick={(e) => {
                e.stopPropagation()
                handleOpenAgent()
              }}
              disabled={requireForm && !selectedSmartList}
            >
              {fetureType === 'webhook'
                ? 'Copy Webhook Url'
                : 'Open agent in new tab'}
              <ArrowUpRight size={16} />
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
        </Box>
      </Fade>
    </Modal>
  );
}

export default WebAgentModal
