import {
  Box,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Typography,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

import { getAgencySelectMenuProps } from '@/components/agency/agencySelectMenuConfig'
import RichTextEditor from '@/components/common/RichTextEditor'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { PromptTagInput } from '@/components/pipeline/tagInputs/PromptTagInput'
import { Input } from '@/components/ui/input'

const EditEmailNotification = ({
  isOpen,
  onClose,
  notificationData,
  onSave,
}) => {
  const richTextEditorRef = useRef(null)
  const [selectedVariable, setSelectedVariable] = useState('')
  const [formData, setFormData] = useState({
    emailSubject: '',
    emailBody: '',
    cta: '',
  })

  // Update form data when notificationData changes
  useEffect(() => {
    if (notificationData) {
      setFormData({
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    onSave({
      emailSubject: formData.emailSubject,
      emailBody: formData.emailBody,
      cta: formData.cta,
    })
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="edit-email-notification-modal"
      aria-describedby="edit-email-notification-description"
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
              id="edit-email-notification-modal"
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              Email Notification
            </Typography>
            <CloseBtn onClick={onClose} />
          </div>

          {/* Section Title */}
          {/* <div className="mt-4">
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#7902DF", marginBottom: "16px" }}>
                            Email Notification
                        </h3>
                    </div> */}

          {/* Email Subject Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Subject</label>
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
            <div className="flex flex-row items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Body</label>
              {notificationData?.availableVariables &&
                notificationData.availableVariables.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 180, height: 48 }}>
                    <Select
                      value={selectedVariable}
                      onChange={(e) => {
                        const value = e.target.value
                        setSelectedVariable('')
                        if (value && richTextEditorRef.current) {
                          richTextEditorRef.current.insertVariable(value)
                        }
                      }}
                      displayEmpty
                      MenuProps={getAgencySelectMenuProps()}
                      sx={{
                        height: '48px',
                        borderRadius: '13px',
                        border: '1px solid #00000020',
                        fontSize: 14,
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&.MuiSelect-select': { py: 0 },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Variables</em>
                      </MenuItem>
                      {notificationData.availableVariables.map(
                        (variable, index) => {
                          // Display with curly braces, but keep original value for insertion
                          const displayText = variable.startsWith('{') && variable.endsWith('}')
                            ? variable
                            : `{${variable}}`
                          return (
                            <MenuItem key={index} value={variable}>
                              {displayText}
                            </MenuItem>
                          )
                        },
                      )}
                    </Select>
                  </FormControl>
                )}
            </div>
            <RichTextEditor
              ref={richTextEditorRef}
              value={formData.emailBody}
              onChange={(html) => handleInputChange('emailBody', html)}
              placeholder="Type here..."
              availableVariables={[]}
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
            onClick={onClose}
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

export default EditEmailNotification

const styles = {
  semiBoldHeading: { fontSize: 16, fontWeight: '600' },
  mediumRegular: { fontSize: 16, fontWeight: '400' },
  smallRegular: { fontSize: 12, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
