import { Box, CircularProgress, Fade, Modal, Typography } from '@mui/material'
import { Plus, X } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useState } from 'react'

import Apis from '@/components/apis/Apis'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import TagsInput from '../leads/TagsInput'

const NewSmartListModal = ({ open, onClose, agentId, onSuccess }) => {
  const [sheetName, setSheetName] = useState('')
  const [customFields, setCustomFields] = useState(['', ''])
  const [tagsValue, setTagsValue] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: SnackbarTypes.Error,
  })

  const predefinedFields = ['First Name', 'Last Name', 'Phone']

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

  const handleAddCustomField = () => {
    setCustomFields([...customFields, ''])
  }

  const handleRemoveCustomField = (index) => {
    if (customFields.length > 1) {
      const newFields = customFields.filter((_, i) => i !== index)
      setCustomFields(newFields)
    }
  }

  const handleCustomFieldChange = (index, value) => {
    const newFields = [...customFields]
    newFields[index] = value
    setCustomFields(newFields)
  }

  const handleSave = async () => {
    if (!sheetName.trim()) {
      showSnackbar(
        'Error',
        'Please enter a smart list name',
        SnackbarTypes.Error,
      )
      return
    }

    try {
      setLoading(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // Only include custom fields, excluding default columns
      const allFields = []
      customFields.forEach((field) => {
        if (field.trim()) {
          allFields.push(field.trim())
        }
      })

      // Use tags from TagsInput component
      const filteredTags = tagsValue || []

      const payload = {
        sheetName: sheetName.trim(),
        columns: allFields,
        tags: filteredTags,
        agentId: agentId,
      }

      console.log('payload', payload)
      let path = Apis.addSmartList
      const response = await axios.post(path, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
      })

      if (response.data) {
        onSuccess(response.data.data)
        handleClose()
      }
    } catch (error) {
      console.error('Error creating smart list:', error)
      showSnackbar(
        'Error',
        'Error creating smart list. Please try again.',
        SnackbarTypes.Error,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSheetName('')
    setCustomFields(['', ''])
    setTagsValue([])
    onClose()
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
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 1000,
        sx: {
          backgroundColor: '#00000020',
        },
      }}
    >
      <Box
        className="xl:w-5/12 lg:w-6/12 sm:w-10/12 w-8/12"
        sx={styles.modalsStyle}
      >
        <div className="flex flex-row justify-center w-full">
          <div
            className="w-full"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '13px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {/* Scrollable Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 24,
                paddingBottom: 0,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: 'bold' }}
                >
                  New Smart List
                </Typography>
                <button onClick={handleClose}>
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </Box>

              {/* Smart List Name */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Smart List Name
                </Typography>
                <input
                  className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                  style={{ border: '1px solid #00000020' }}
                  placeholder="Type name here"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </Box>

              {/* Create Fields */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Create Fields
                </Typography>

                {/* Predefined Fields */}
                {predefinedFields.map((field, index) => (
                  <input
                    key={`predefined-${index}`}
                    className="outline-none bg-white w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px] mb-3"
                    style={{
                      border: '1px solid #00000020',
                      color: '#000',
                    }}
                    value={field}
                    disabled
                  />
                ))}

                {/* Custom Fields */}
                {customFields.map((field, index) => (
                  <Box
                    key={`custom-${index}`}
                    sx={{ display: 'flex', alignItems: 'center', mb: 3 }}
                  >
                    <input
                      className="outline-none bg-white border-none focus:outline-none focus:ring-0 rounded-lg h-[50px] mr-1"
                      style={{
                        border: '1px solid #00000020',
                        width: '95%',
                      }}
                      placeholder="Custom Field"
                      value={field}
                      onChange={(e) =>
                        handleCustomFieldChange(index, e.target.value)
                      }
                    />
                    <div style={{ width: '5%' }}>
                      <button
                        className="outline-none border-none"
                        onClick={() => handleRemoveCustomField(index)}
                      >
                        <Image
                          src={'/assets/blackBgCross.png'}
                          height={20}
                          width={20}
                          alt="*"
                        />
                      </button>
                    </div>
                  </Box>
                ))}

                <button
                  className="text-purple underline text-transform-none font-medium hover:bg-purple hover:bg-opacity-10 p-2 rounded"
                  onClick={handleAddCustomField}
                >
                  <Plus size={16} className="inline mr-1" />
                  New Field
                </button>
              </Box>

              {/* Tags */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Tags
                </Typography>

                <TagsInput setTags={setTagsValue} tags={tagsValue} />
              </Box>
            </div>

            {/* Fixed Save Button */}
            <div
              style={{
                padding: 24,
                paddingTop: 16,
                borderTop: '1px solid #00000010',
              }}
            >
              <button
                className="w-full py-3 px-4 bg-purple text-white rounded-lg font-medium hover:bg-purple hover:opacity-90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={loading || !sheetName.trim()}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Save Changes'
                )}
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
        </div>
      </Box>
    </Modal>
  )
}

export default NewSmartListModal
