'use client'

import { Box, CircularProgress, Modal, Switch } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from '@/utils/toast'
import Apis from '@/components/apis/Apis'
import CloseBtn from '@/components/globalExtras/CloseBtn'

const CreateSmartlistModal = ({ open, onClose, onSuccess, selectedUser = null, showInbound = true, isEditSmartList, selectedSmartList = null }) => {

  const defaultColumns = [
    { id: 1, value: 'First Name' },
    { id: 2, value: 'Last Name' },
    { id: 3, value: 'Phone Number' },
    { id: 4, value: '' },
    { id: 5, value: '' },
    { id: 6, value: '' },
  ]

  const modalRef = useRef(null)
  const [newSheetName, setNewSheetName] = useState('')
  const [isInbound, setIsInbound] = useState(false)
  const [inputs, setInputs] = useState([])
  const [showaddCreateListLoader, setShowaddCreateListLoader] = useState(false)
  const bottomRef = useRef(null)

  //set default columns state
  useEffect(() => {
    if (!isEditSmartList) {
      setInputs(defaultColumns)
    } else if (selectedSmartList?.columns && Array.isArray(selectedSmartList.columns)) {
      setInputs(
        selectedSmartList.columns.map((col, index) => ({
          id: index + 1,
          value: col.columnName ?? '',
        }))
      )
      setNewSheetName(selectedSmartList?.sheetName ?? '')
      if (selectedSmartList?.type !== undefined && selectedSmartList?.type === "inbound") {
        setIsInbound(true)
      } else {
        setIsInbound(false)
      }
    }
  }, [selectedSmartList, isEditSmartList])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setNewSheetName('')
      setIsInbound(false)
      setInputs([
        { id: 1, value: 'First Name' },
        { id: 2, value: 'Last Name' },
        { id: 3, value: 'Phone Number' },
        { id: 4, value: '' },
        { id: 5, value: '' },
        { id: 6, value: '' },
      ])
    }
  }, [open])

  // Scroll to bottom when inputs change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [inputs])

  // Handle change in input field
  const handleInputChange = (id, value) => {
    setInputs(inputs.map((input) => (input.id === id ? { ...input, value } : input)))
  }

  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id))
  }

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1
    setInputs([...inputs, { id: newId, value: '' }])
  }

  // Handle creating the smartlist
  const handleAddSheetNewList = async () => {
    try {
      setShowaddCreateListLoader(true)

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const ApiData = {
        sheetName: newSheetName,
        columns: inputs.map((columns) => columns.value),
        inbound: isInbound,
        enrich: false,
      }

      // Add userId if selectedUser is provided (for agency creating smartlist for subaccount)
      const userId = selectedUser?.id || selectedUser?.userId || selectedUser?.user?.id
      if (userId) {
        ApiData.userId = userId
      }

      const ApiPath = Apis.addSmartList
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          toast.success('Smartlist created successfully')
          onSuccess?.(response.data.data)
          onClose()
        } else {
          toast.error(response.data.message || 'Failed to create smartlist')
        }
      }
    } catch (error) {
      console.error('Error creating smartlist:', error)
      toast.error(error.response?.data?.message || 'Failed to create smartlist')
    } finally {
      setShowaddCreateListLoader(false)
    }
  }

  // Handle creating the smartlist
  const handleEditSmartList = async () => {
    try {
      setShowaddCreateListLoader(true)

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const ApiData = {
        sheetName: newSheetName,
        columns: inputs.map((columns) => columns.value),
        inbound: isInbound,
        enrich: false,
        smartListId: selectedSmartList?.id,
      }

      // Add userId if selectedUser is provided (for agency creating smartlist for subaccount)
      const userId = selectedUser?.id || selectedUser?.userId || selectedUser?.user?.id
      if (userId) {
        ApiData.userId = userId
      }

      const ApiPath = Apis.updateSmartList
      console.log("api path for update samrtlist", ApiPath);
      console.log("api data for update samrtlist", ApiData);
      const response = await axios.put(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          toast.success('Smartlist created successfully')
          onSuccess?.(response.data.data)
          onClose()
        } else {
          toast.error(response.data.message || 'Failed to create smartlist')
        }
      }
    } catch (error) {
      console.error('Error creating smartlist:', error)
      toast.error(error.response?.data?.message || 'Failed to create smartlist')
    } finally {
      setShowaddCreateListLoader(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      disablePortal={false}
      disableEnforceFocus={false}
      disableAutoFocus={false}
      disableRestoreFocus={true}
      hideBackdrop={false}
      sx={{
        zIndex: 9999, // Very high z-index to ensure it's above everything
        position: 'fixed',
        '& .MuiBackdrop-root': {
          zIndex: 9999,
          pointerEvents: 'auto',
        },
        '& .MuiModal-root': {
          zIndex: 9999,
          pointerEvents: 'auto',
        },
      }}
      slotProps={{
        root: {
          sx: {
            zIndex: 9999,
            pointerEvents: 'auto',
          },
        },
      }}
      BackdropProps={{
        timeout: 250,
        sx: {
          zIndex: 9999,
          backgroundColor: '#00000099',
          pointerEvents: 'auto',
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        },
      }}
    >
      <Box
        ref={modalRef}
        className="w-full max-w-[440px] flex flex-col bg-white overflow-hidden rounded-[12px]"
        data-modal-content="create-smartlist"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
          border: '1px solid #eaeaea',
          zIndex: 10000,
          maxHeight: '90vh',
          pointerEvents: 'auto',
          isolation: 'isolate',
          '& input': {
            cursor: 'text',
            WebkitUserSelect: 'text',
            userSelect: 'text',
          },
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex flex-row items-center justify-between w-full"
          style={{ padding: 16, borderBottom: '1px solid #eaeaea', minHeight: 66 }}
        >
          <div
            className="start-campaign-label"
            style={{ fontSize: 18, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}
          >
            {isEditSmartList ? 'Edit SmartList' : 'New SmartList'}
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-4" style={{ paddingLeft: 16, paddingRight: 16 }}>
          {/* List Name row: label left, Inbound toggle right */}
          <div className="flex flex-row items-center justify-between gap-4 mb-2 py-0 bg-white">
            <label className="start-campaign-label block">List Name</label>
            {showInbound && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="start-campaign-label text-[14px]">Inbound?</span>
                <Switch
                  checked={isInbound}
                  onChange={(event) => setIsInbound(event.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    pointerEvents: 'auto',
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'hsl(var(--brand-primary))',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'hsl(var(--brand-primary))',
                    },
                  }}
                />
              </div>
            )}
          </div>
          <input
            type="text"
            value={newSheetName}
            onChange={(e) => setNewSheetName(e.target.value)}
            placeholder="Enter list name"
            className="start-campaign-input w-full h-[42px] rounded-lg"
            autoFocus={false}
          />

          {/* Create Columns */}
          <div className="mt-6">
            <div className="start-campaign-label mb-3">Create Columns</div>
            <div className="max-h-[29vh] overflow-auto space-y-3" style={{ scrollbarWidth: 'none' }}>
              {inputs.map((input, index) => (
                <div key={input.id} className="flex flex-row items-center gap-2 w-full">
                  <input
                    type="text"
                    className="start-campaign-input flex-1 min-w-0 h-[42px] rounded-lg"
                    placeholder="Column Name"
                    value={input.value}
                    readOnly={!isEditSmartList && index < 3}
                    disabled={!isEditSmartList && index < 3}
                    tabIndex={isEditSmartList || index > 2 ? 0 : -1}
                    onChange={(e) => {
                      if (isEditSmartList || index > 2) {
                        handleInputChange(input.id, e.target.value)
                      }
                    }}
                  />
                  {(isEditSmartList || index > 2) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(input.id)
                      }}
                      className="flex-shrink-0 rounded-lg p-2 hover:bg-black/5 transition-colors duration-150 outline-none border-none"
                      style={{ pointerEvents: 'auto' }}
                      aria-label="Remove column"
                    >
                      <Image
                        src="/assets/blackBgCross.png"
                        height={20}
                        width={20}
                        alt=""
                      />
                    </button>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleAddInput()
              }}
              className="mt-3 text-[14px] font-medium text-brand-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 rounded-lg py-1"
              style={{ pointerEvents: 'auto' }}
            >
              New Column
            </button>
          </div>
        </div>

        {/* Footer: Create List */}
        <div className="w-full px-4 pb-4 pt-2 border-t border-black/[0.06]">
          {showaddCreateListLoader ? (
            <div className="flex flex-row items-center justify-center w-full h-12">
              <CircularProgress size={24} sx={{ color: 'hsl(var(--brand-primary))' }} />
            </div>
          ) : (
            <button
              type="button"
              className={`h-12 rounded-lg w-full text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 active:scale-[0.98] ${
                newSheetName?.trim()
                  ? 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:shadow-[0_2px_8px_hsl(var(--brand-primary)/0.3)]'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              style={{ pointerEvents: 'auto', textTransform: 'none' }}
              onClick={(e) => {
                e.stopPropagation()
                if (isEditSmartList) {
                  handleEditSmartList()
                } else {
                  handleAddSheetNewList()
                }
              }}
              disabled={!newSheetName?.trim()}
            >
              {isEditSmartList ? 'Update List' : 'Create List'}
            </button>
          )}
        </div>
      </Box>
    </Modal>
  )
}

export default CreateSmartlistModal
