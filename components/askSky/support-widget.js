import 'react-phone-input-2/lib/style.css'

import { Alert, Box, CircularProgress, Modal, Snackbar } from '@mui/material'
import Vapi from '@vapi-ai/web'
import axios from 'axios'
import classNames from 'classnames'
import { Headset, Sparkles, X } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import { GetHelpBtn } from '../animations/DashboardSlider'
import Apis from '../apis/Apis'
import { ChatInterface } from './askskycomponents/chat-interface'
import { API_KEY, DEFAULT_ASSISTANT_ID } from './constants'
import { VoiceInterface } from './voice-interface'

export function SupportWidget({
  assistantId = DEFAULT_ASSISTANT_ID,
  setShowAskSkyModal,
  shouldStart,
  setShouldStartCall,
  isEmbed = false,
}) {
  const [vapi, setVapi] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setloadingMessage] = useState('')
  const [transcript, setTranscript] = useState([])
  const [menuOpen, setMenuOpen] = useState(false) // Opens the support menu
  const [voiceOpen, setVoiceOpen] = useState(false) // Sets up the Voice AI interface
  const [chatOpen, setChatOpen] = useState(false) // Sets up the chat interface
  const [open, setOpen] = useState(false)
  const [isCallRunning, setIsCallRunning] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('error')

  const [agentUserDetails, setAgentUserDetails] = useState(null)
  const [smartListData, setSmartListData] = useState(null)
  const [initialAgentLoading, setInitialAgentLoading] = useState(!!isEmbed)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [smartListFields, setSmartListFields] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone) => {
    // Phone number should be at least 10 digits (without country code prefix)
    const phoneDigits = phone.replace(/\D/g, '')
    return phoneDigits.length >= 10
  }

  const isFormValid = () => {
    return (
      formData.firstName?.trim() &&
      formData.lastName?.trim() &&
      formData.email?.trim() &&
      isValidEmail(formData.email) &&
      formData.phone?.trim() &&
      isValidPhone(formData.phone)
    )
  }

  // User loading messages to fake feedback...

  useEffect(() => {
    if (!assistantId) return
    if (isEmbed) setInitialAgentLoading(true)
    getAgentByVapiId()
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        if (isEmbed) setInitialAgentLoading(false)
      })
  }, [assistantId])

  useEffect(() => {
    // setLoadingMsg()
  }, [loading])
  useEffect(() => {}, [loading, isEmbed])

  // 1) Safer loading message
  const setLoadingMsg = async () => {
    try {
      const agent = await getAgentByVapiId()
      let displayName = agent?.name || 'Sky'
      if (displayName.length > 10) {
        displayName = displayName.slice(0, 10) + '...'
      }
      setloadingMessage(`${displayName} is booting up...`)

      // follow-up beat after 3s
      setTimeout(() => {
        setloadingMessage('...getting coffee...')
      }, 3000)
    } catch (e) {
      setloadingMessage('Sky is booting up...')
      setTimeout(() => {
        setloadingMessage('...getting coffee...')
      }, 3000)
    }
  }

  const getAgentByVapiId = async () => {
    try {
      let path = `${Apis.getUserByAgentVapiId}/${assistantId}`
      // Add agentType query parameter for embed agents
      if (isEmbed) {
        path += '?agentType=embed'
      }

      const response = await axios.get(path)

      if (response) {
        setAgentUserDetails(response?.data?.data ?? null)
        setSmartListData(response?.data?.data?.smartList)
        return response?.data?.data?.agent ?? null
      }
    } catch (e) {}
  }

  useEffect(() => {
    const vapiInstance = new Vapi(API_KEY)
    setVapi(vapiInstance)
    vapiInstance.on('call-start', () => {
      setLoading(false)
      setOpen(true)
      setIsCallRunning(true)
    })
    vapiInstance.on('call-end', () => {
      setIsSpeaking(false)
      setOpen(false)
      setShowAskSkyModal(false)
      setIsCallRunning(false)
    })
    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true)
    })
    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false)
    })
    vapiInstance.on('message', (message) => {
      const mag = message?.transcript?.length
        ? message.transcript.length / 100
        : 100

      setTranscript((prev) => [...prev, message])
    })
    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error)
    })

    return () => {
      vapiInstance?.stop()
    }
  }, [])

  // // NOTE: Provides the context to the LLM about where they are in the page.
  // useEffect(() => {
  //   const pathname = window?.location.pathname;
  //   if (pathname && vapi) {
  //     vapi.send({
  //       type: "add-message",
  //       message: {
  //         role: "system",
  //         content: `The user is currently on the "${pathname}" page`,
  //       },
  //     });
  //   }
  // }, [vapi]);

  function muteAssistantAudio(mute) {
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach((audio) => {
      audio.muted = mute
    })
  }

  // useEffect(()=>{
  //   handleStartCall(true)
  // },[shouldStart,])

  useEffect(() => {
    if (!isEmbed) {
      handleStartCall(true)
    }
  }, [vapi])

  // Form handling functions
  const handleFormDataChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value,
    }
    setFormData(newFormData)
  }

  const handleSmartListFieldChange = (field, value) => {
    const newSmartListFields = {
      ...smartListFields,
      [field]: value,
    }
    setSmartListFields(newSmartListFields)
  }

  // Handle modal actions
  const handleModalOpen = () => {
    setShowLeadModal(true)
  }

  const handleModalClose = () => {
    setShowLeadModal(false)
  }

  // Handle form submission and call initiation with overrides
  const handleFormSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Prepare extraColumns from smart list fields
      const extraColumns = {}
      Object.entries(smartListFields).forEach(([key, value]) => {
        if (value && value.trim()) {
          extraColumns[key] = value
        }
      })

      // Prepare lead_details object (matching web-agent format)
      const leadDetails = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        extraColumns: extraColumns,
      }

      // Call POST API to get assistant overrides (matching web-agent format)
      const response = await axios.post(
        `${Apis.getUserByAgentVapiIdWithLeadDetails}/${assistantId}?agentType=embed`,
        {
          lead_details: leadDetails,
        },
      )

      if (response?.data?.status === true) {
        // Check if user has sufficient balance
        const { totalSecondsAvailable } = response.data.data.user

        if (totalSecondsAvailable < 120) {
          setSnackbarMessage('Insufficient Balance')
          setSnackbarSeverity('error')
          setSnackbarOpen(true)
          setIsSubmitting(false)
          return
        }

        const newOverrides = response?.data?.data?.assistantOverrides

        setShowLeadModal(false)
        setOpen(true)
        setVoiceOpen(true)
        setLoading(true)
        setloadingMessage('Connecting...')

        // Start call with the new overrides directly
        await startCall(newOverrides)
      } else {
        throw new Error(response?.data?.message || 'Form submission failed')
      }
    } catch (error) {
      console.error('🔍 SUPPORT-WIDGET - Error submitting form:', error)
      setSnackbarMessage('Error submitting form. Please try again.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Get Help button click - check for smart list
  const handleGetHelpClick = () => {
    // Check if agent has smartList attached
    if (smartListData && smartListData.id) {
      handleModalOpen()
    } else {
      handleStartCall(true)
    }
  }

  async function startCall(overrides = null) {
    // Check if user has sufficient minutes before starting call
    let path = `${Apis.getUserByAgentVapiId}/${assistantId}`

    const response = await axios.get(path)

    if (response.data.status && response.data.data.user) {
      const { totalSecondsAvailable } = response.data.data.user

      if (totalSecondsAvailable < 120) {
        setSnackbarMessage('Insufficient Balance')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
        return
      }
    }

    if (vapi) {
      // Use overrides passed as parameter (from form submission) or get default profile data
      let assistantOverrides

      if (overrides) {
        assistantOverrides = overrides
      } else {
        const { pipelines = [], ...userProfile } =
          (await getProfileSupportDetails()) || {}

        assistantOverrides = {
          recordingEnabled: false,
          variableValues: {
            customer_details: JSON.stringify(userProfile),
            // pipeline_details: JSON.stringify(pipelines)
          },
        }
      }

      // Remove variableValues field before passing to VAPI (matching web-agent)
      let cleanedOverrides = assistantOverrides
      if (
        assistantOverrides &&
        assistantOverrides.variableValues !== undefined
      ) {
        cleanedOverrides = { ...assistantOverrides }
        delete cleanedOverrides.variableValues
      }

      const payloadSize = new Blob([JSON.stringify(cleanedOverrides)]).size

      // Check if agent has smart list to determine which assistant ID to use
      if (smartListData?.id) {
        vapi.start(assistantId, cleanedOverrides)
      } else {
        vapi.start(assistantId)
      }
    } else {
      console.error('Vapi instance not initialized')
    }
  }

  async function handleCloseCall() {
    await vapi?.stop()
    setOpen(false)
    if (voiceOpen) {
      setVoiceOpen(false)
      if (setShowAskSkyModal) {
        setShowAskSkyModal(false)
      }
    }

    if (chatOpen) {
      setChatOpen(false)
      muteAssistantAudio(false)
    }
  }

  async function handleStartCall(voice) {
    setOpen(true)
    setLoading(true)
    await setLoadingMsg()
    if (voice) {
      setVoiceOpen(true)
    } else {
      setChatOpen(true)
    }

    await startCall()

    if (!voice) {
      muteAssistantAudio(true)
    }
  }

  async function getProfileSupportDetails() {
    let user = null
    try {
      const data = localStorage.getItem('User')

      if (data) {
        user = JSON.parse(data)

        let path = Apis.profileSupportDetails

        const response = await axios.get(path, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            let data = response.data.data
            let pipelineData = data.pipelines

            delete data.pipelines
            delete data.sheets
            delete data.activity

            return {
              profile: user.user,
              additionalData: data,
              pipelines: pipelineData,
            }
          } else {
            return user.user
          }
        }
      }
    } catch (e) {
      return user.user
    }
  }

  function handleCloseMenu() {
    handleCloseCall()

    setMenuOpen(false)
  }

  async function handleMessage(message) {
    if (!vapi) return

    await vapi.sendMessage({
      role: 'user',
      message,
    })
  }

  return (
    <div className="fixed bottom-0 right-0 z-modal flex flex-col items-end justify-end max-w-full max-h-full">
      <div
        className={classNames(
          'relative w-72 h-80 rounded-lg overflow-hidden object-center object-cover shadow-lg border bg-white border-black/10 mb-4 translate-x-0 transition-all duration-300 ease-in-out translate-x-0 ',
          voiceOpen ? 'p-6' : 'p-2',
          !open ? 'opacity-0 z-10' : 'opacity-100 z-10',
        )}
        style={{
          marginRight: '16px',
        }}
      >
        {/* Snackbar for error messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <div className="h-full w-full flex flex-col gap-0 items-center justify-between">
          {voiceOpen ? (
            <VoiceInterface
              loading={loading}
              loadingMessage={loadingMessage}
              isSpeaking={isSpeaking}
            />
          ) : chatOpen ? (
            <ChatInterface
              loading={loading}
              loadingMessage={loadingMessage}
              isSpeaking={isSpeaking}
              messages={transcript}
              sendMessage={handleMessage}
            />
          ) : (
            ''
          )}
        </div>
      </div>
      {isEmbed && !open && (
        initialAgentLoading ? (
          <div
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white shadow-lg border border-black/10 min-w-[200px] min-h-[80px]"
            style={{ marginRight: '16px', marginBottom: '16px' }}
          >
            <CircularProgress size={28} sx={{ color: 'var(--color-primary, #9333ea)' }} />
            <span className="text-sm text-gray-600">Loading agent...</span>
          </div>
        ) : (
          <GetHelpBtn
            titleColor="#000"
            text={agentUserDetails?.agent?.supportButtonText || 'Get Help'}
            avatar={
              agentUserDetails?.agent?.supportButtonAvatar ||
              agentUserDetails?.agent?.profile_image
            }
            handleReopen={handleGetHelpClick}
          />
        )
      )}
      <div className="relative z-0 h-11 mb-4 mr-4">
        {voiceOpen && isCallRunning && (
          <button
            onClick={handleCloseMenu}
            className={classNames(
              'size-11 absolute top-0 right-0 border-black/5 shadow-lg border bg-white flex items-center justify-center cursor-pointer rounded-full font-bold font-sans translate-y-0 hover:-translate-y-1 transition-all duration-300 opacity-100 z-10',
            )}
          >
            <X />
          </button>
        )}
      </div>

      {/* Smart List Modal */}
      <Modal
        open={showLeadModal}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '600px' },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: '12px',
            boxShadow: 24,
            p: 3,
          }}
        >
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-row items-center justify-between">
              <div>
                <div className="text-2xl font-bold">Contact Details</div>
                <div className="text-sm text-gray-600 mt-1">
                  Please provide your information to get personalized help
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Basic Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleFormDataChange('firstName', e.target.value)
                  }
                  placeholder="Enter your first name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleFormDataChange('lastName', e.target.value)
                  }
                  placeholder="Enter your last name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormDataChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <PhoneInput
                country={'us'}
                value={formData.phone}
                onChange={(phone) => handleFormDataChange('phone', phone)}
                inputStyle={{
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                }}
                containerStyle={{
                  width: '100%',
                }}
              />
            </div>

            {/* Smart List Fields */}
            {smartListData &&
              smartListData.columns &&
              smartListData.columns.length > 0 && (
                <>
                  <div className="mt-4">
                    <div className="text-lg font-medium mb-4">
                      Additional Information
                    </div>
                    <div className="space-y-4">
                      {smartListData.columns.map((column, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium mb-2">
                            {column.columnName.charAt(0).toUpperCase() +
                              column.columnName.slice(1)}
                          </label>
                          <input
                            type="text"
                            value={smartListFields[column.columnName] || ''}
                            onChange={(e) =>
                              handleSmartListFieldChange(
                                column.columnName,
                                e.target.value,
                              )
                            }
                            placeholder={`Enter ${column.columnName}`}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            {/* Submit Button */}
            <div className="flex flex-row items-center justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={handleModalClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitting || !isFormValid()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSubmitting && <CircularProgress size={16} color="inherit" />}
                {isSubmitting ? 'Starting Call...' : 'Start Call'}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}
