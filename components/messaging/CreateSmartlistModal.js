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

  const styles = {
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
    paragraph: {
      fontSize: 15,
      fontWeight: '500',
    },
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
        sx: {
          zIndex: 9999,
          backgroundColor: '#00000020',
          pointerEvents: 'auto',
        },
        onClick: (e) => {
          // Only close modal on backdrop click
          if (e.target === e.currentTarget) {
            onClose()
          }
        },
      }}
    >
      <Box
        ref={modalRef}
        className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-auto overflow-hidden rounded-3xl"
        data-modal-content="create-smartlist"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          height: 'auto',
          bgcolor: 'white',
          borderRadius: 2,
          border: 'none',
          outline: 'none',
          scrollbarWidth: 'none',
          zIndex: 10000, // Higher than backdrop (9999) to appear on top
          maxHeight: '90vh',
          pointerEvents: 'auto',
          isolation: 'isolate', // Create new stacking context
          '& input': {
            cursor: 'text',
            WebkitUserSelect: 'text',
            userSelect: 'text',
          },
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <div
          className="w-full flex flex-col items-center h-full justify-between"
          style={{
            backgroundColor: 'white',
          }}
        >
          <div className="w-full">
            <div className="flex flex-row items-center justify-between w-full mt-4 px-2">
              <div style={{ fontWeight: '500', fontSize: 15 }}>{ isEditSmartList ? "Edit SmartList" : "New SmartList" }</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <Image
                  src={'/assets/crossIcon.png'}
                  height={40}
                  width={40}
                  alt="*"
                />
              </button>
            </div>

            <div className="px-4 w-full">
              <div className="flex flex-row items-end justify-between mt-6 gap-2">
                <span style={styles.paragraph}>List Name</span>

                <div className="flex flex-col items-end ">
                  {
                    showInbound && (

                      <div className="">
                        <span>Inbound?</span>
                        <Switch
                          checked={isInbound}
                          onChange={(event) => {
                            setIsInbound(event.target.checked)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
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
                    )
                  }
                </div>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  value={newSheetName}
                  onChange={(e) => {
                    setNewSheetName(e.target.value)
                  }}
                  onFocus={(e) => {
                    // Ensure input can receive focus
                    e.target.focus()
                  }}
                  placeholder="Enter list name"
                  className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px] px-3"
                  style={{
                    ...styles.paragraph,
                    border: '1px solid #00000020',
                  }}
                  autoFocus={false}
                />
              </div>
              <div className="mt-8" style={styles.paragraph}>
                Create Columns
              </div>
              <div
                className="max-h-[29vh] overflow-auto mt-2"
                style={{
                  scrollbarWidth: 'none',
                }}
              >
                {inputs.map((input, index) => (
                  <div
                    key={input.id}
                    className="w-full flex flex-row items-center gap-4 mt-4"
                  >
                    <input
                      type="text"
                      className="border p-2 rounded-lg px-3 outline-none focus:outline-none focus:ring-0 h-[53px]"
                      style={{
                        ...styles.paragraph,
                        width: '95%',
                        borderColor: '#00000020',
                      }}
                      placeholder={`Column Name`}
                      value={input.value}
                      readOnly={index < 3}
                      disabled={index < 3}
                      tabIndex={index < 3 ? -1 : 0}
                      onChange={(e) => {
                        if (index > 2) {
                          handleInputChange(input.id, e.target.value)
                        }
                      }}
                      onFocus={(e) => {
                        // Ensure input can receive focus
                        if (index > 2) {
                          e.target.focus()
                        }
                      }}
                    />
                    <div style={{ width: '5%' }}>
                      {index > 2 && (
                        <button
                          className="outline-none border-none"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(input.id)
                          }}
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Image
                            src={'/assets/blackBgCross.png'}
                            height={20}
                            width={20}
                            alt="*"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {/* Dummy element for scrolling */}
                <div ref={bottomRef}></div>
              </div>
              <div style={{ height: '50px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddInput()
                  }}
                  className="mt-4 p-2 outline-none border-none text-brand-primary rounded-lg underline"
                  style={{
                    ...styles.paragraph,
                    pointerEvents: 'auto',
                  }}
                >
                  New Column
                </button>
              </div>
            </div>
          </div>

          <div className="w-full pb-8">
            {showaddCreateListLoader ? (
              <div className="flex flex-row items-center justify-center w-full h-[50px]">
                <CircularProgress size={25} />
              </div>
            ) : (
              <button
                className={`h-[50px] rounded-xl w-full ${newSheetName && newSheetName.length > 0
                  ? 'bg-brand-primary text-white'
                  : 'bg-btngray text-gray-600 cursor-not-allowed'
                  }`}
                style={{
                  fontWeight: '600',
                  fontSize: 16.8,
                  pointerEvents: 'auto',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isEditSmartList) {
                    handleEditSmartList()
                  } else {
                    handleAddSheetNewList()
                  }
                  // handleAddSheetNewList()
                }}
                disabled={newSheetName == null || newSheetName === ''}
              >
                {isEditSmartList ? 'Update List' : 'Create List'}
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default CreateSmartlistModal
