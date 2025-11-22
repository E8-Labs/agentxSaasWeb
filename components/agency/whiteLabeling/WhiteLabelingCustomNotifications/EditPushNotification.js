import { Box, Modal, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { Input } from '@/components/ui/input'

const EditPushNotification = ({
  isOpen,
  onClose,
  notificationData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    pushTitle: '',
    pushBody: '',
    cta: '',
  })

  const titleInputRef = useRef(null)

  // Update form data when notificationData changes
  useEffect(() => {
    if (notificationData) {
      setFormData({
        pushTitle: notificationData.appNotficationTitle || '',
        pushBody: notificationData.appNotficationBody || '',
        cta: notificationData.appNotficationCTA || notificationData.CTA || '',
      })
    }
  }, [notificationData])

  // Prevent auto-selection when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        const input = titleInputRef.current
        const length = input.value.length
        input.setSelectionRange(length, length)
        input.blur()
      }, 100)
    }
  }, [isOpen])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    onSave({
      pushTitle: formData.pushTitle,
      pushBody: formData.pushBody,
      cta: formData.cta,
    })
    onClose()
  }

  const handleTitleFocus = (e) => {
    setTimeout(() => {
      const input = e.target
      const length = input.value.length
      input.setSelectionRange(length, length)
    }, 0)
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="edit-push-notification-modal"
      aria-describedby="edit-push-notification-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: {
            xs: '80%',
            sm: '70%',
            md: '600px',
            lg: '680px',
          },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
          height: '80vh',
        }}
      >
        <div
          className="scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-scrollBarPurple pb-12 px-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            height: '90%',
            overflow: 'auto',
          }}
        >
          {/* Modal Header */}
          <div className="w-full flex flex-row items-center justify-between mt-4">
            <Typography
              id="edit-push-notification-modal"
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              App Notification
            </Typography>
            <CloseBtn onClick={onClose} />
          </div>

          {/* Section Title */}
          {/* <div className="mt-4">
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#7902DF", marginBottom: "16px" }}>
                            App Notification
                        </h3>
                    </div> */}

          {/* Push Notification Title Field */}
          <div className="space-y-1 mt-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              ref={titleInputRef}
              placeholder="Push notification title"
              value={formData.pushTitle}
              onChange={(e) => handleInputChange('pushTitle', e.target.value)}
              onFocus={handleTitleFocus}
              className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
              style={{
                border: '1px solid #00000020',
              }}
              autoFocus={false}
            />
          </div>

          {/* Push Notification Body Field */}
          <div className="space-y-1 mt-2">
            <label className="text-sm font-medium text-gray-700">Body</label>
            <Input
              placeholder="Push notification body"
              value={formData.pushBody}
              onChange={(e) => handleInputChange('pushBody', e.target.value)}
              className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
              style={{
                border: '1px solid #00000020',
              }}
              autoFocus={false}
            />
          </div>

          {/* CTA Field - Only show if notification supports CTA */}
          {notificationData?.supportsCTA && formData?.cta !== undefined && (
            <div className="flex flex-col space-y-1 mt-2">
              <label className="text-sm font-medium text-gray-700">CTA</label>
              <Input
                placeholder="Call to action button"
                value={formData.cta}
                onChange={(e) => handleInputChange('cta', e.target.value)}
                className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-6/12 transition-colors"
                style={{
                  border: '1px solid #00000020',
                }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-row items-center justify-between h-[10%] px-4">
          <button
            onClick={onClose}
            className="px-6 border-none outline-none text-gray-500"
            style={styles.mediumRegular}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 bg-purple-600 hover:bg-purple-700 text-white h-[50px] w-[100px] text-center rounded-lg"
          >
            Save
          </button>
        </div>
      </Box>
    </Modal>
  )
}

export default EditPushNotification

const styles = {
  semiBoldHeading: { fontSize: 16, fontWeight: '600' },
  mediumRegular: { fontSize: 16, fontWeight: '400' },
  smallRegular: { fontSize: 12, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
