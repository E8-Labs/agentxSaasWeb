import { Box, Modal, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { PromptTagInput } from '@/components/pipeline/tagInputs/PromptTagInput'
import { Input } from '@/components/ui/input'

const EditNotifications = ({ isOpen, onClose, notificationData, onSave }) => {
  const [formData, setFormData] = useState({
    pushTitle: '',
    pushBody: '',
    emailSubject: '',
    emailBody: '',
    cta: '',
  })

  const titleInputRef = useRef(null)

  // Update form data when notificationData changes
  useEffect(() => {
    if (notificationData) {
      setFormData({
        pushTitle: notificationData.appNotficationTitle || '',
        pushBody: notificationData.appNotficationBody || '',
        emailSubject:
          notificationData.emailNotficationTitle ||
          notificationData.subject ||
          '',
        emailBody:
          notificationData.emailNotficationBody ||
          notificationData.subjectDescription ||
          '',
        cta: notificationData.emailNotficationCTA || notificationData.CTA || '',
      })
    }
  }, [notificationData])

  // Prevent auto-selection when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      // Small delay to ensure the modal is fully rendered
      setTimeout(() => {
        // Move cursor to end instead of selecting all text
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
    onSave(formData)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const handleTitleFocus = (e) => {
    // Prevent auto-selection on focus
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
      aria-labelledby="edit-notification-modal"
      aria-describedby="edit-notification-description"
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
          className="scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary pb-12 px-4"
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
              id="edit-notification-modal"
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              Edit Notification
            </Typography>
            <CloseBtn onClick={onClose} />
          </div>

          {/* Modal Body */}
          {/* Push Title Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Push Title
            </label>
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

          {/* Push Body Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Push Body
            </label>
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

          {/* Email Subject Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email Subject
            </label>
            <Input
              placeholder="Email subject line"
              value={formData.emailSubject}
              onChange={(e) =>
                handleInputChange('emailSubject', e.target.value)
              }
              className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
              style={{
                border: '1px solid #00000020',
              }}
              autoFocus={false}
            />
          </div>

          {/* Email Body / Description Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email Body
            </label>
            <PromptTagInput
              promptTag={formData.emailBody}
              tagValue={(text) => handleInputChange('emailBody', text)}
              uniqueColumns={notificationData?.availableVariables || []}
              kycsList={[]}
              placeholder="Enter email body..."
              from="EditNotification"
              isEdit={true}
            />
          </div>

          {/* CTA Field - Only show if notification supports CTA */}
          {notificationData?.supportsCTA && formData?.cta !== undefined && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CTA</label>
              <Input
                placeholder="Call to action button"
                value={formData.cta}
                onChange={(e) => handleInputChange('cta', e.target.value)}
                className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
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
            onClick={handleCancel}
            className="px-6 border-none outline-none text-gray-500"
            style={styles.mediumRegular}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 bg-brand-primary hover:bg-brand-primary/90 text-white h-[50px] w-[100px] text-center rounded-lg"
          >
            Save
          </button>
        </div>
      </Box>
    </Modal>
  )
}

export default EditNotifications

const styles = {
  semiBoldHeading: { fontSize: 16, fontWeight: '600' },
  mediumRegular: { fontSize: 16, fontWeight: '400' },
  smallRegular: { fontSize: 12, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
