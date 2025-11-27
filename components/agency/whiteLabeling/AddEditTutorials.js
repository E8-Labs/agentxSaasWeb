import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'

const AddEditTutorials = ({
  showModal,
  handleClose,
  handleSave,
  tutorialData = null, // Pass existing tutorial data for editing
  isLoading = false,
  isEditMode = false, // New prop to determine if we're editing or adding
}) => {
  const [title, setTitle] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [isDisabled, setIsDisabled] = useState(true)
  const fileInputRef = useRef(null)

  // Show success/error snack
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  // Initialize form with existing data when editing
  useEffect(() => {
    if (isEditMode && tutorialData) {
      setTitle(tutorialData.title || '')
      setSelectedVideo(null)
      setVideoPreview(tutorialData.videoUrl || null)
    } else {
      setTitle('')
      setSelectedVideo(null)
      setVideoPreview(null)
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [tutorialData, showModal, isEditMode])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (videoPreview && videoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [videoPreview])

  // Check if the values are entered
  // In edit mode, allow saving if title is provided (video is optional)
  // In add mode, require both title and video
  useEffect(() => {
    if (!title.trim()) {
      setIsDisabled(true)
    } else if (isEditMode) {
      // In edit mode, only title is required
      setIsDisabled(false)
    } else {
      // In add mode, both title and video are required
      setIsDisabled(!selectedVideo && !videoPreview)
    }
  }, [title, selectedVideo, videoPreview, isEditMode])

  const processFile = (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setShowSnack({
        type: SnackbarTypes.Error,
        message: 'Please select a valid video file',
        isVisible: true,
      })
      return
    }

    // Validate file size (e.g., max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      setShowSnack({
        type: SnackbarTypes.Error,
        message: 'Video file size must be less than 500MB',
        isVisible: true,
      })
      return
    }

    setSelectedVideo(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    console.log('previewUrl is of processFile', previewUrl)
    setVideoPreview(previewUrl)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDragLeave = () => {
    // Optional: Add visual feedback
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const file = event.dataTransfer.files[0]
    processFile(file)
  }

  const handleButtonClick = (event) => {
    event.preventDefault()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveVideo = () => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview)
    }
    setSelectedVideo(null)
    setVideoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSaveClick = async () => {
    if (!isDisabled && !isLoading) {
      const tutorialInfo = {
        title: title.trim(),
        media: selectedVideo,
      }
      await handleSave(tutorialInfo)
    }
  }

  const handleCancelClick = () => {
    if (!isLoading) {
      handleClose()
    }
  }

  const styles = {
    regularFont: {
      fontSize: 15,
      fontWeight: 500,
    },
  }

  return (
    <Modal
      open={showModal}
      onClose={isLoading ? undefined : handleCancelClick}
      BackdropProps={{
        timeout: 200,
        sx: {
          backgroundColor: '#00000020',
          backdropFilter: 'blur(20px)',
        },
      }}
      sx={{
        zIndex: 1300,
      }}
    >
      <Box className="rounded-xl max-w-md w-full shadow-lg bg-white border-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-6">
        <AgentSelectSnackMessage
          type={showSnack.type}
          message={showSnack.message}
          isVisible={showSnack.isVisible}
          hide={() => {
            setShowSnack({
              message: '',
              isVisible: false,
              type: SnackbarTypes.Success,
            })
          }}
        />

        <div className="w-full h-[100%] flex flex-col items-center">
          <div className="overflow-auto w-full">
            {/* Header */}
            <div className="w-full flex flex-row items-center justify-between mb-6">
              <div
                style={{
                  fontWeight: '700',
                  fontSize: 22,
                }}
              >
                {isEditMode ? 'Edit Video' : 'Getting started'}
              </div>
              <CloseBtn
                onClick={isLoading ? undefined : handleCancelClick}
                disabled={isLoading}
              />
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <div className="mb-2" style={styles.regularFont}>
                Title
              </div>
              <div className="h-[50px] ps-3 pe-3 border rounded-lg flex items-center">
                <input
                  className="border-none outline-none focus:outline-transparent w-full focus:ring-0 focus:border-0"
                  placeholder="Type here..."
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                  }}
                />
              </div>
            </div>

            {/* Video Upload */}
            <div className="mb-6">
              <div className="mb-2" style={styles.regularFont}>
                Video File
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedVideo ||
              (isEditMode && videoPreview && !selectedVideo) ? (
                <div
                  className="flex items-center text-gray-700 p-4 rounded gap-3"
                  style={{
                    fontSize: 13,
                    fontFamily: 'inter',
                    border: '1px dashed #7902DF',
                    borderRadius: '10px',
                    boxShadow: '0px 0px 10px 10px rgba(64, 47, 255, 0.05)',
                    backgroundColor: '#FBFCFF',
                  }}
                >
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-20 h-16 object-cover rounded"
                      controls={false}
                      muted
                    />
                  ) : (
                    <Image
                      src="/assets/youtubeplay.png"
                      alt="video placeholder"
                      width={80}
                      height={64}
                      className="rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">
                      {selectedVideo?.name || 'Current Video'}
                    </div>
                    {selectedVideo && (
                      <div className="text-xs text-gray-500">
                        {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="text-purple hover:text-purple-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-row w-full justify-center rounded items-center"
                  style={{
                    height: '100px',
                    border: '1px dashed #7902DF',
                    borderRadius: '10px',
                    boxShadow: '0px 0px 10px 10px rgba(64, 47, 255, 0.05)',
                    backgroundColor: '#FBFCFF',
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="px-4 py-2 h-full"
                    style={{
                      fontWeight: '500',
                      fontSize: 16,
                      fontFamily: 'inter',
                    }}
                  >
                    Drop file or <br />{' '}
                    <span className="text-purple"> Browse</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="w-full flex flex-row items-center justify-between">
            <button
              className="text-gray-500 px-4 py-2 rounded-lg outline-none border-none hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCancelClick}
              disabled={isLoading}
            >
              Cancel
            </button>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                <span className="text-sm text-gray-600">Saving...</span>
              </div>
            ) : (
              <button
                className={`${isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple text-white hover:bg-purple-700'} px-6 py-2 rounded-lg outline-none border-none transition-colors disabled:opacity-50`}
                onClick={handleSaveClick}
                disabled={isDisabled || isLoading}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default AddEditTutorials
