'use client'

import 'react-phone-input-2/lib/style.css'

import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  Fade,
  Modal,
  Slide,
  Snackbar,
} from '@mui/material'
import {
  FacebookLogo,
  Globe,
  InstagramLogo,
  TwitterLogo,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react'
import Vapi from '@vapi-ai/web'
import axios from 'axios'
// useRef added
import { AnimatePresence, motion } from 'framer-motion'
import parsePhoneNumberFromString from 'libphonenumber-js'
import Image from 'next/image'
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Shadcn UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { agentImage } from '@/utilities/agentUtilities'

import Apis from '../apis/Apis'
import { AudioWaveActivity } from '../askSky/askskycomponents/AudioWaveActivity'
import { VoiceWavesComponent } from '../askSky/askskycomponents/voice-waves'
import CloseBtn from '../globalExtras/CloseBtn'
import AgentXOrb from '../common/AgentXOrb'
import { MYAGENTX_URL } from '../askSky/constants'
import { renderBrandedIcon } from '@/utilities/iconMasking'


// Add style tag to override global white background for loading message
if (typeof document !== 'undefined') {
  const styleId = 'voice-call-loading-message-override'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .voice-call-ui-container {
        background-color: transparent !important;
        background: transparent !important;
      }
    `
    document.head.appendChild(style)
  }
}

const backgroundImage = {
  backgroundImage: 'url("/backgroundImage.png")', // Ensure the correct path
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  width: '100%',
  height: '100svh',
  overflow: 'hidden',
}

const Creator = ({ agentId, name }) => {
  const router = useRouter()
  const buttonRef = useRef(null)
  const buttonRef6 = useRef(null)
  const profileBoxRef = useRef(null)
  const createAIButtonRef = useRef(null)
  const endCallButtonRef = useRef(null)

  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const [boxVisible, setBoxVisible] = useState(false) // Animation state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }) // Mouse position state
  const { creator } = useParams()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const [isWideScreen, setIsWideScreen] = useState(false)
  const [isWideScreen2, setIsWideScreen2] = useState(false)
  const [isHighScreen, setIsHighScreen] = useState(false)
  const [windowHeight, setWindowHeight] = useState(1200)

  //triger vapi variables
  const [vapi, setVapi] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setloadingMessage] = useState('')
  const [transcript, setTranscript] = useState([])
  const [menuOpen, setMenuOpen] = useState(false) // Opens the support menu
  const [voiceOpen, setVoiceOpen] = useState(false) // Sets up the Voice AI interface
  const [chatOpen, setChatOpen] = useState(false) // Sets up the chat interface
  const [open, setOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('error')
  const [vapiAgent, setVapiAgent] = useState(null)
  const [assistantOverrides, setAssistantOverrides] = useState(null)
  const [isMuted, setIsMuted] = useState(false)

  // Modal and form states
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [smartListFields, setSmartListFields] = useState({})
  const [smartListData, setSmartListData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhoneNumber = (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase(),
    )
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Invalid')
    } else {
      setErrorMessage('')

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // setCheckPhoneResponse(null);
      // //console.log;

      timerRef.current = setTimeout(() => {
        checkPhoneNumber(phoneNumber)
      }, 300)
    }
  }

  const isValidPhone = (phone) => {
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(`+${phone}`)
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      return false
    } else {
      return true
    }
  }

  const isFormValid = () => {
    return (
      formData.firstName?.trim() &&
      formData.lastName?.trim() &&
      // formData.email?.trim() &&
      isValidEmail(formData.email) &&
      formData.phone?.trim() &&
      isValidPhone(formData.phone)
    )
  }

  //agent details by id
  const [agentDetails, setAgentDetails] = useState(null)
  const [profileLoader, setProfileLoader] = useState(true)

  const API_KEY = process.env.NEXT_PUBLIC_REACT_APP_VITE_API_KEY

  //fetch user profile data
  useEffect(() => {
    getUserByAgentId()
    // Load saved form data on component mount
    loadSavedFormData()
  }, [])

  // User loading messages to fake feedback...
  useEffect(() => {
    if (loading) {
      setloadingMessage(`${name.slice(0, 10)} ${name.length > 10 ? '...' : ''} is booting up...`)

      const timer = setTimeout(() => {
        setloadingMessage('...getting coffee...')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [loading])

  useEffect(() => {
    const handleResize = () => {
      // Check if width is greater than or equal to 1024px
      setWindowHeight(window.innerHeight)
      setIsWideScreen(window.innerWidth >= 950)

      setIsWideScreen2(window.innerWidth >= 500)
      // Check if height is greater than or equal to 1024px
      setIsHighScreen(window.innerHeight >= 950)

      // Log the updated state values for debugging (Optional)
      console.log('isWideScreen: ', window.innerWidth >= 950)
      console.log('isWideScreen2: ', window.innerWidth >= 500)
      console.log('isHighScreen: ', window.innerHeight >= 1024)
    }

    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  // Effect to update screen size status
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)') // Adjust the max-width according to your medium screen size breakpoint
    const handleResize = () => setIsSmallScreen(mediaQuery.matches)

    handleResize() // Check the screen size on component mount
    mediaQuery.addEventListener('change', handleResize) // Add listener for screen resize

    return () => mediaQuery.removeEventListener('change', handleResize) // Cleanup listener on component unmount
  }, [])

  // Function to remove duplicates from analysisPlan structure
  const removeDuplicatesFromAnalysisPlan = (assistantOverrides) => {
    if (!assistantOverrides || !assistantOverrides.analysisPlan) {
      return assistantOverrides
    }

    const analysisPlan = assistantOverrides.analysisPlan

    // Remove duplicates from structuredDataPlan.schema.required array
    if (
      analysisPlan.structuredDataPlan &&
      analysisPlan.structuredDataPlan.schema &&
      analysisPlan.structuredDataPlan.schema.required &&
      Array.isArray(analysisPlan.structuredDataPlan.schema.required)
    ) {
      const originalLength =
        analysisPlan.structuredDataPlan.schema.required.length
      analysisPlan.structuredDataPlan.schema.required = [
        ...new Set(analysisPlan.structuredDataPlan.schema.required),
      ]
      const newLength = analysisPlan.structuredDataPlan.schema.required.length

      if (originalLength !== newLength) {
        console.log(
          `Removed ${originalLength - newLength} duplicate values from analysisPlan.structuredDataPlan.schema.required`,
        )
      }
    }

    // Ensure unique properties in structuredDataPlan.schema.properties
    if (
      analysisPlan.structuredDataPlan &&
      analysisPlan.structuredDataPlan.schema &&
      analysisPlan.structuredDataPlan.schema.properties &&
      typeof analysisPlan.structuredDataPlan.schema.properties === 'object'
    ) {
      const uniqueProperties = {}
      const seenKeys = new Set()

      for (const [key, value] of Object.entries(
        analysisPlan.structuredDataPlan.schema.properties,
      )) {
        if (!seenKeys.has(key)) {
          uniqueProperties[key] = value
          seenKeys.add(key)
        } else {
          console.warn(
            `Duplicate property key found in analysisPlan.structuredDataPlan.schema.properties: ${key}`,
          )
        }
      }

      analysisPlan.structuredDataPlan.schema.properties = uniqueProperties
      console.log(
        `Ensured unique properties in analysisPlan.structuredDataPlan.schema.properties. Total properties: ${Object.keys(uniqueProperties).length}`,
      )
    }

    return assistantOverrides
  }

  //get user details by agentId
  const getUserByAgentId = async () => {
    try {
      setProfileLoader(true)
      // Add agentType query parameter for web agents
      const apiPath = `${Apis.getUserByAgentVapiId}/${agentId}?agentType=web`
      const response = await callApiGet(apiPath)
      // await axios.get(
      //   `${Apis.getUserByAgentVapiId}/${agentId}`
      // );
      console.log('Response of getagent details by id is', response)
      if (response) {
        setAgentDetails(response)
        setVapiAgent(response?.data?.data?.agent)

        // Clean assistantOverrides to remove duplicates
        const cleanedOverrides = removeDuplicatesFromAnalysisPlan(
          response?.data?.data?.assistantOverrides,
        )
        setAssistantOverrides(cleanedOverrides)

        setSmartListData(response?.data?.data?.smartList)
        console.log('Smart list data:', response?.data?.data?.smartList)
      }
      setProfileLoader(false)
    } catch (error) {
      console.log('Error occured in fetch user details by agent id', error)
      setProfileLoader(false)
    } finally {
      setProfileLoader(false)
    }
  }

  const callApiGet = async (path) => {
    const response = await axios.get(path)
    return response
  }
  const callApiPost = async (path, data) => {
    const response = await axios.post(path, data)
    return response
  }

  // Form handling functions
  const handleFormDataChange = (field, value) => {
    console.log(`Updating form field ${field} with value:`, value)
    const newFormData = {
      ...formData,
      [field]: value,
    }
    setFormData(newFormData)

    // Save to localStorage
    localStorage.setItem(
      `leadForm_${agentId}`,
      JSON.stringify({
        formData: newFormData,
        smartListFields: smartListFields,
      }),
    )
  }

  const handleSmartListFieldChange = (field, value) => {
    console.log(`Updating smart list field ${field} with value:`, value)
    const newSmartListFields = {
      ...smartListFields,
      [field]: value,
    }
    setSmartListFields(newSmartListFields)

    // Save to localStorage
    localStorage.setItem(
      `leadForm_${agentId}`,
      JSON.stringify({
        formData: formData,
        smartListFields: newSmartListFields,
      }),
    )
  }

  // Load saved form data from localStorage
  const loadSavedFormData = () => {
    try {
      const savedData = localStorage.getItem(`leadForm_${agentId}`)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log('Loading saved form data:', parsedData)
        setFormData(
          parsedData.formData || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
          },
        )
        setSmartListFields(parsedData.smartListFields || {})
      }
    } catch (error) {
      console.error('Error loading saved form data:', error)
    }
  }

  const handleModalClose = () => {
    console.log('Closing lead modal')
    setShowLeadModal(false)
    // Keep form data persistent - don't clear on close
  }

  const handleModalOpen = () => {
    console.log('Opening lead modal')
    loadSavedFormData() // Load saved data when opening
    setShowLeadModal(true)
  }

  const handleClearForm = () => {
    console.log('Clearing form data')
    localStorage.removeItem(`leadForm_${agentId}`)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    })
    setSmartListFields({})
    console.log('Form data cleared successfully')
  }

  const handleFormSubmit = async () => {
    console.log('Submitting form data:', { formData, smartListFields })
    setIsSubmitting(true)

    try {
      // Prepare extraColumns from smart list fields
      const extraColumns = {}
      Object.entries(smartListFields).forEach(([key, value]) => {
        if (value && value.trim()) {
          extraColumns[key] = value
        }
      })

      // Prepare lead_details object
      const leadDetails = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        extraColumns: extraColumns,
      }

      console.log('Sending lead details:', leadDetails)

      // Call API with lead details
      const response = await callApiPost(
        `${Apis.getUserByAgentVapiIdWithLeadDetails}/${agentId}?agentType=web`,
        { lead_details: leadDetails },
      )

      console.log('API response:', response)

      if (response && response.data && response.data.data) {
        const { totalSecondsAvailable } = response.data.data.user
        console.log('User total seconds available:', totalSecondsAvailable)

        if (totalSecondsAvailable < 120) {
          console.log('Insufficient balance, showing error')
          setSnackbarMessage('Insufficient Balance')
          setSnackbarSeverity('error')
          setSnackbarOpen(true)
          return
        }
        // Update assistant overrides with new data
        const newAssistantOverrides = response.data.data.assistantOverrides
        if (newAssistantOverrides) {
          // Clean assistantOverrides to remove duplicates
          const cleanedNewOverrides = removeDuplicatesFromAnalysisPlan(
            newAssistantOverrides,
          )
          setAssistantOverrides(cleanedNewOverrides)
          console.log('Updated assistant overrides:', cleanedNewOverrides)

          // Keep form data persistent - don't clear after submission
          console.log('Form submitted successfully, keeping data persistent')

          // Close modal and start call with new overrides
          handleModalClose()
          handleStartCallWithOverrides(newAssistantOverrides)
        } else {
          // Keep form data persistent - don't clear after submission
          console.log('Form submitted successfully, keeping data persistent')

          // Close modal and start call with existing overrides
          handleModalClose()
          handleStartCall()
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSnackbarMessage('Error submitting lead details. Please try again.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle button click
  const handleInitiateVapi = async () => {
    console.log('handleInitiateVapi called')
    console.log('Smart list data:', smartListData)

    // Check if agent has smartList attached
    if (smartListData && smartListData.id) {
      // Check if we have persisted data
      const savedData = localStorage.getItem(`leadForm_${agentId}`)

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          const {
            formData: savedFormData,
            smartListFields: savedSmartListFields,
          } = parsedData

          // Check if all required fields are filled and valid
          const isValidSavedData =
            savedFormData?.firstName?.trim() &&
            savedFormData?.lastName?.trim() &&
            savedFormData?.email?.trim() &&
            isValidEmail(savedFormData.email) &&
            savedFormData?.phone?.trim() &&
            isValidPhone(savedFormData.phone)

          if (isValidSavedData) {
            console.log(
              'Found persisted form data, submitting directly:',
              parsedData,
            )

            // Use the saved data to make API call directly
            setIsSubmitting(true)
            try {
              const extraColumns = {}
              Object.entries(savedSmartListFields || {}).forEach(
                ([key, value]) => {
                  if (value && value.trim()) {
                    extraColumns[key] = value
                  }
                },
              )

              const leadDetails = {
                firstName: savedFormData.firstName,
                lastName: savedFormData.lastName,
                phone: savedFormData.phone,
                email: savedFormData.email,
                extraColumns: extraColumns,
              }

              const response = await callApiPost(
                `${Apis.getUserByAgentVapiIdWithLeadDetails}/${agentId}?agentType=web`,
                { lead_details: leadDetails },
              )

              if (response && response.data && response.data.data) {
                const { totalSecondsAvailable } = response.data.data.user

                if (totalSecondsAvailable < 120) {
                  setSnackbarMessage('Insufficient Balance')
                  setSnackbarSeverity('error')
                  setSnackbarOpen(true)
                  return
                }

                const newAssistantOverrides =
                  response.data.data.assistantOverrides
                if (newAssistantOverrides) {
                  const cleanedNewOverrides = removeDuplicatesFromAnalysisPlan(
                    newAssistantOverrides,
                  )
                  setAssistantOverrides(cleanedNewOverrides)
                  handleStartCallWithOverrides(newAssistantOverrides)
                } else {
                  handleStartCall()
                }
              }
            } catch (error) {
              console.error('Error submitting persisted form data:', error)
              setSnackbarMessage('Error starting call. Please try again.')
              setSnackbarSeverity('error')
              setSnackbarOpen(true)
            } finally {
              setIsSubmitting(false)
            }
            return
          }
        } catch (error) {
          console.error('Error parsing saved form data:', error)
        }
      }

      // If no persisted data or incomplete data, show modal
      console.log('No complete persisted data found, showing modal')
      handleModalOpen()
    } else {
      console.log('No smart list found, starting call directly')
      handleStartCall()
    }
  }

  useEffect(() => {
    const vapiInstance = new Vapi(API_KEY)
    console.log('vapInstance', API_KEY)
    setVapi(vapiInstance)
    vapiInstance.on('call-start', (call) => {
      console.log('📞 CALL-START: Call started', call)
      setLoading(false)
      setOpen(true)
    })
    vapiInstance.on('call-end', () => {
      console.log('📞 CALL-END: Call ended')
      setIsSpeaking(false)
      setOpen(false)
      setloadingMessage('')
    })
    vapiInstance.on('speech-start', () => {
      console.log('🎤 SPEECH-START: Assistant started speaking')
      setIsSpeaking(true)
    })
    vapiInstance.on('speech-end', () => {
      console.log('🔇 SPEECH-END: Assistant stopped speaking')
      setIsSpeaking(false)
    })
    vapiInstance.on('message', (message) => {
      const mag = message?.transcript?.length
        ? message.transcript.length / 100
        : 100

      setTranscript((prev) => [...prev, message])
      console.log('MESSAGE:', message)
      console.log('MAGNITUDE:', mag)
    })
    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error)
    })

    return () => {
      vapiInstance?.stop()
    }
  }, [])

  async function handleStartCall(voice) {
    console.log('handleStartCall called with voice:', voice)
    try {
      setOpen(true)
      console.log('Setting up call UI and starting call')
      setLoading(true)
      setloadingMessage('')

      if (voice) {
        console.log('Setting voice interface')
        setVoiceOpen(true)
      } else {
        console.log('Setting chat interface')
        setChatOpen(true)
      }

      await startCall()
    } catch (error) {
      console.error('Error checking user minutes:', error)
      setSnackbarMessage('Error checking available minutes. Please try again.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  async function startCall(overrides = null) {
    console.log('starting call')
    if (vapi) {
      // Use overrides passed as parameter (from form submission) or fall back to state
      const overridesToUse = overrides || assistantOverrides

      // Remove variableValues field before passing to VAPI
      let cleanedOverrides = overridesToUse
      if (overridesToUse && overridesToUse.variableValues !== undefined) {
        cleanedOverrides = { ...overridesToUse }
        delete cleanedOverrides.variableValues
        console.log('Removed variableValues from overrides:', cleanedOverrides)
      }

      console.log('Current assistant overrides:', overridesToUse)
      console.log('Cleaned overrides for VAPI:', cleanedOverrides)
      console.log(
        'Using overrides for VAPI start:',
        cleanedOverrides ? cleanedOverrides : agentId,
      )
      if (agentDetails?.data?.data?.smartList) {
        //change this to check if agent has smart list attached

        console.log('agentId before starting call', agentId)
        vapi.start(agentId, cleanedOverrides ? cleanedOverrides : null)
      } else {
        console.log('Agent has no smart list, starting call directly')
        vapi.start(agentId)
      }
      vapi.start(agentId, cleanedOverrides ? cleanedOverrides : null)
    } else {
      console.error('Vapi instance not initialized')
    }
  }

  // Function to start call with specific overrides from form submission
  const handleStartCallWithOverrides = async (newOverrides) => {
    console.log(
      'handleStartCallWithOverrides called with overrides:',
      newOverrides,
    )
    try {
      setOpen(true)
      console.log('Setting up call UI and starting call with new overrides')
      setLoading(true)
      setloadingMessage('')

      // Start call with the new overrides directly
      await startCall(newOverrides)
    } catch (error) {
      console.error('Error starting call with overrides:', error)
      setSnackbarMessage('Error starting call. Please try again.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  async function handleCloseCall() {
    await vapi?.stop()
    setLoading(false)
    setloadingMessage('')
    setOpen(false)
    setIsMuted(false) // Reset mute state when call ends
    if (voiceOpen) {
      setVoiceOpen(false)
    }

    if (chatOpen) {
      setChatOpen(false)
    }
  }

  // Handle mute/unmute toggle
  const handleMuteToggle = () => {
    // Ensure vapi exists, call is open, and not loading (call is active)
    if (!vapi || !open || loading) return

    try {
      const newMutedState = !isMuted
      
      // Try using Vapi's setMuted method if available (preferred method)
      if (typeof vapi.setMuted === 'function') {
        try {
          vapi.setMuted(newMutedState)
          setIsMuted(newMutedState)
          console.log(`Microphone ${newMutedState ? 'muted' : 'unmuted'} via Vapi API`)
          return
        } catch (vapiError) {
          // If call object is not available, try fallback methods
          if (vapiError.message?.includes('Call object is not available') || 
              vapiError.message?.includes('not available')) {
            console.log('Call object not ready, using fallback mute method')
            // Fall through to fallback methods
          } else {
            throw vapiError // Re-throw if it's a different error
          }
        }
      }
      
      // Fallback: Try to find and mute/unmute active audio tracks
      // This works with the existing media stream that Vapi is using
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Get all media tracks from the current page
        navigator.mediaDevices.enumerateDevices()
          .then(() => {
            // Try to mute/unmute by accessing active media streams
            // Note: This is a fallback and may not work in all cases
            const audioElements = document.querySelectorAll('audio')
            let foundTrack = false
            
            audioElements.forEach((audio) => {
              if (audio.srcObject) {
                const stream = audio.srcObject
                if (stream instanceof MediaStream) {
                  stream.getAudioTracks().forEach((track) => {
                    track.enabled = !newMutedState
                    foundTrack = true
                  })
                }
              }
            })
            
            setIsMuted(newMutedState)
            if (foundTrack) {
              console.log(`Microphone ${newMutedState ? 'muted' : 'unmuted'} via media tracks`)
            } else {
              console.log(`Mute state updated in UI (no active tracks found)`)
            }
          })
          .catch((error) => {
            console.log('Could not enumerate devices for muting:', error)
            setIsMuted(newMutedState) // Update UI state anyway
          })
      } else {
        // Last resort: Update UI state (actual muting may not work)
        setIsMuted(newMutedState)
        console.log('Mute state updated in UI (actual muting may require Vapi API)')
      }
    } catch (error) {
      // Only show error snackbar for unexpected errors, not for "call not available"
      const isCallNotAvailableError = 
        error.message?.includes('Call object is not available') ||
        error.message?.includes('not available')
      
      if (!isCallNotAvailableError) {
        console.error('Error toggling mute:', error)
        setSnackbarMessage('Error toggling mute. Please try again.')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      } else {
        console.log('Call not ready for muting, will retry when call is active')
        // Silently fail - the call might not be fully initialized yet
      }
    }
  }

  // const handleMouseMove = (event) => {
  //   const centerX = window.innerWidth / 2;
  //   const centerY = window.innerHeight / 2;
  //   const x = event.clientX;
  //   const y = event.clientY;

  //   setMousePosition({ x, y });

  //   // Check if the mouse is within 150px of the center
  //   if (Math.abs(x - centerX) <= 150 && Math.abs(y - centerY) <= 150) {
  //     setBoxVisible(false); // Hide the box
  //     return;
  //   }

  //   // Check if the mouse is over buttonRef
  //   if (buttonRef.current) {
  //     const rect = buttonRef.current.getBoundingClientRect();
  //     if (
  //       x >= rect.left &&
  //       x <= rect.right &&
  //       y >= rect.top &&
  //       y <= rect.bottom
  //     ) {
  //       setBoxVisible(false); // Hide the animation when hovering over buttonRef
  //       return;
  //     }
  //   }

  //   setBoxVisible(true);

  // };

  // const handleMouseMove = (event) => {
  //   const centerX = window.innerWidth / 2;
  //   const centerY = window.innerHeight / 2;
  //   const x = event.clientX;
  //   const y = event.clientY;

  //   setMousePosition({ x, y });

  //   // Check if the mouse is within 150px of the center
  //   if (Math.abs(x - centerX) <= 150 && Math.abs(y - centerY) <= 150) {
  //     setBoxVisible(false); // Hide the box
  //     return;
  //   }

  //   // Check if the mouse is over buttonRef or createAIButtonRef
  //   if (
  //     (buttonRef.current && isMouseOverRef(buttonRef, x, y)) ||
  //     (createAIButtonRef.current && isMouseOverRef(createAIButtonRef, x, y)) ||
  //     (endCallButtonRef.current && isMouseOverRef(endCallButtonRef, x, y)) ||
  //     (profileBoxRef.current && isMouseOverRef(profileBoxRef, x, y))
  //   ) {
  //     setBoxVisible(false); // Hide the animation when hovering over either buttonRef or createAIButtonRef
  //     return;
  //   }

  //   setBoxVisible(true);
  // };

  // Helper function to check if mouse is over a specific element

  const handleMouseMove = (event) => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const x = event.clientX
    const y = event.clientY

    setMousePosition({ x, y })

    // Check if the mouse is within 150px of the center
    if (Math.abs(x - centerX) <= 150 && Math.abs(y - centerY) <= 150) {
      setBoxVisible(false) // Hide the box
      return
    }

    // Check if the mouse is over any of the refs (buttonRef, createAIButtonRef, endCallButtonRef, profileBoxRef)
    if (
      (buttonRef.current && isMouseOverRef(buttonRef, x, y)) ||
      (createAIButtonRef.current && isMouseOverRef(createAIButtonRef, x, y)) ||
      (endCallButtonRef.current && isMouseOverRef(endCallButtonRef, x, y)) || // Check for endCallButtonRef
      (profileBoxRef.current && isMouseOverRef(profileBoxRef, x, y))
    ) {
      setBoxVisible(false) // Hide the animation when hovering over any of the refs
      return
    }

    setBoxVisible(true) // Show the box when not hovering over the refs
  }

  // Helper function to check if mouse is over a specific element
  const isMouseOverRef = (ref, x, y) => {
    const rect = ref.current.getBoundingClientRect()
    // Log the position and check if it's correctly identifying the bounding box
    console.log('Checking mouse position over element:', rect)
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    )
  }

  // const isMouseOverRef = (ref, x, y) => {
  //   const rect = ref.current.getBoundingClientRect();
  //   return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  // };

  const showCallUI = () => {
    return (
      <div
        className="flex flex-col items-center justify-center voice-call-ui-container"
        style={{
          backgroundColor: 'transparent',
          background: 'transparent',
          width: '100%'
        }}
      >

        {loading || !open ? (
          <span
            style={{
              backgroundColor: 'transparent',
              background: 'transparent',
              padding: 0,
              marginTop: '40px',
              marginBottom: 0,
              marginLeft: 0,
              marginRight: 0,
              display: 'inline-block',
              boxShadow: 'none',
              border: 'none',
              outline: 'none',
              fontStyle: 'italic',
              color: 'inherit',
              fontSize: '13px',
              fontWeight: '500',

            }}
          >
            {loadingMessage}
          </span>
        ) : isSpeaking ? (
          <VoiceWavesComponent className="mt-12" />
        ) : (
          <AudioWaveActivity
            isActive={isSpeaking}
            barCount={25}
            className="mt-10"
          />
        )}
      

        {open && (
          <div className='flex mt-5 flex-row items-center justify-center gap-2'>
            <button
              onClick={handleCloseCall}
              className="px-3 py-2 flex flex-row items-center justify-center gap-3 rounded-full bg-[#ffffff40] shadow-md"
            >
              <Image src="/assets/cross.png" alt="end call" 
              width={12} height={12} />
              <span className='text-black text-[15px] font-normal'>
                End Call
              </span>
            </button>

            <button
              onClick={handleMuteToggle}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={`shadow-lg rounded-full ${isMuted && 'shadow-red-500'}`}

            >
              <Image 
                src={isMuted ? "/svgIcons/Mute.svg" : "/svgIcons/Unmuted.svg"} 
                alt={isMuted ? "mute" : "unmute"}   
                width={40} 
                height={40} 
              />
            </button>
          </div>
        )}
      </div>
    )
  }

  const gifBackgroundImageSmallScreen = {
    backgroundImage: 'url("/assets/applogo2.png")', // Ensure the correct path
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: isWideScreen2 ? '550px' : '380px',
    height: isWideScreen2 ? '550px' : '380px',
    borderRadius: '50%',
    resize: 'cover',
  }

  const gifBackgroundImage = {
    backgroundImage: 'url("/assets/applogo2.png")', // Ensure the correct path
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: isHighScreen ? '790px' : '530px',
    height: isHighScreen ? '790px' : '530px',
    borderRadius: '50%',
    resize: 'cover',
  }

  return (
    <div>
      <div
        style={{
          width: '100%',
          height: '100svh',
          overflow: 'hidden',
        }}
        className="  overflow-y-hidden"
        onMouseMove={handleMouseMove}
      >
        <div
          ref={profileBoxRef}
          style={{
            position: 'absolute',
            left: 20,
            top: 25,
          }}
        >
          <div className="rounded-full border border-[#ffffff] bg-[#FFFFFF39] shadow-md flex flex-row items-center gap-2 py-1 px-2 outline-none">
            {profileLoader ? (
              <CircularProgress size={15} />
            ) : (
              <div className="rounded-full">
                {agentImage(agentDetails?.data?.data?.agent)}
              </div>
            )}
            <div
              className="truncate"
              style={{ fontSize: '15px', fontWeight: '400', color: 'black' }}
            >
              {/*agentDetails?.data?.data?.agent?.name*/}
              {agentDetails?.data?.data?.agent?.name &&
                agentDetails?.data?.data?.agent?.name.charAt(0).toUpperCase() +
                agentDetails?.data?.data?.agent?.name.slice(1)}
            </div>
          </div>
        </div>

      


        {/* Animating Image */}
        <div
          style={{

          }}
          className="flex w-full h-full flex-col justify-center items-center"
        >
          <div
            className="flex items-center justify-center flex-col flex-1 "
            style={{
              cursor: 'pointer',
              outline: 'none',
              border: 'none',
              backgroundColor: 'transparent',
              backgroundImage: 'url("/svgIcons/onGoingCallBg.svg")',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              width: '100%',
              height: '100%',

            }}
          >
          {
            isSmallScreen && (
  
              <motion.div
                animate={{
                  y: [0, -30, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                }}
                className="-mb-16 rounded-lg flex flex-col justify-center"
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  fontFamily: 'inter',
                  backgroundColor: '#ffffff80',
                  padding: '10px 20px', // Add padding to the content inside the box
                  position: 'absolute',
                  top: '25%',
                  left: '40%',
                }}
              >
                Tap to Talk
                {/* Triangle at the bottom center */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '15px solid transparent',
                    borderRight: '15px solid transparent',
                    borderTop: '15px solid #ffffff80',
                  }}
                />
              </motion.div>
            )
          }
            <div
              className='flex items-center justify-center'
              style={{
                cursor: 'pointer',
                width: isSmallScreen ? '55%' : '30%',
                height: isSmallScreen ? '55%' : '30%',
                backgroundColor: 'transparent',
                backgroundImage: 'url("/svgIcons/onGoingCallOrb.svg")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
              onClick={() => {
                handleInitiateVapi()
              }}
            >

              <AgentXOrb size={200} />
            </div>

          </div>
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2'>
            <div
              className="flex flex-row items-center gap-1"
            >
              <p className="text-xs">Powered by</p>

              <img
                src="/assets/assignX.png"
                alt="AssignX Logo"
                className="h-3.5"
              />

            </div>
          </div>
          <div className='absolute bottom-20 left-1/2 -translate-x-1/2' ref={endCallButtonRef}>{showCallUI()}</div>
        </div>

        {/* Mouse Following Box Animation */}
        <div className="lg:flex hidden">
          <AnimatePresence>
            {boxVisible && (
              <motion.div
                style={{
                  position: 'absolute',
                  top: Math.min(
                    Math.max(mousePosition.y - 50, 0),
                    window.innerHeight - 120,
                  ), // Ensures the box stays within the viewport height
                  left: Math.min(
                    Math.max(mousePosition.x - 50, 0),
                    window.innerWidth - 120,
                  ), // Ensures the box stays within the viewport width
                  width: 100,
                  height: 100,
                  backgroundColor: '#ffffff60',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  style={{
                    color: 'black',
                    fontWeight: '500',
                    fontFamily: 'inter',
                    fontSize: 14,
                  }}
                >
                  Click to Talk
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lead Details Modal */}
      <Modal
        open={showLeadModal}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box
          className="xl:w-4/12 lg:w-4/12 sm:w-6/12 w-5/12"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: 2,
            border: 'none',
            outline: 'none',
            backgroundColor: 'white',
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
            <div className="flex flex-row items-center justify-between w-full">
              <div style={{ fontWeight: '500', fontSize: 15 }}>Get Started</div>
              <CloseBtn onClick={handleModalClose} />
            </div>

            <div className="w-full">
              {/* Basic Fields */}
              <div className="flex flex-row items-center justify-start mt-6 gap-2">
                <span style={{ fontWeight: '500', fontSize: 15 }}>
                  Contact Info
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleFormDataChange('firstName', e.target.value)
                    }
                    placeholder="First Name"
                    className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px] px-4"
                    style={{
                      fontWeight: '500',
                      fontSize: 15,
                      border: '1px solid #00000020',
                    }}
                    required
                  />
                </div>
                <div>
                  <input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleFormDataChange('lastName', e.target.value)
                    }
                    placeholder="Last Name"
                    className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px] px-4"
                    style={{
                      fontWeight: '500',
                      fontSize: 15,
                      border: '1px solid #00000020',
                    }}
                    required
                  />
                </div>

                <div>
                  <input
                    value={formData.email}
                    onChange={(e) =>
                      handleFormDataChange('email', e.target.value)
                    }
                    placeholder="Email"
                    className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px] px-4"
                    style={{
                      fontWeight: '500',
                      fontSize: 15,
                      border: '1px solid #00000020',
                    }}
                    required
                  />
                </div>
                <div>
                  <PhoneInput
                    country={'us'}
                    value={formData.phone}
                    onChange={(value) => handleFormDataChange('phone', value)}
                    placeholder="Enter Phone Number"
                    className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl"
                    style={{
                      borderRadius: '12px',
                      outline: 'none',
                      boxShadow: 'none',
                      border: '1px solid #00000020',
                    }}
                    inputStyle={{
                      width: '100%',
                      borderWidth: '0px',
                      backgroundColor: 'transparent',
                      paddingLeft: '60px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      height: '53px',
                      outline: 'none',
                      boxShadow: 'none',
                      fontWeight: '500',
                      fontSize: 15,
                    }}
                    buttonStyle={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none',
                    }}
                    dropdownStyle={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Smart List Fields */}
              {smartListData &&
                smartListData.columns &&
                smartListData.columns.length > 0 && (
                  <>
                    <div
                      className="mt-8"
                      style={{ fontWeight: '500', fontSize: 15 }}
                    >
                      Additional Info
                    </div>
                    <div className="mt-4 space-y-4">
                      {smartListData.columns.map((column, index) => (
                        <div key={index}>
                          <input
                            value={smartListFields[column.columnName] || ''}
                            onChange={(e) =>
                              handleSmartListFieldChange(
                                column.columnName,
                                e.target.value,
                              )
                            }
                            placeholder={
                              column.columnName.charAt(0).toUpperCase() +
                              column.columnName.slice(1)
                            }
                            className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px] px-4"
                            style={{
                              fontWeight: '500',
                              fontSize: 15,
                              border: '1px solid #00000020',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* Fixed Buttons */}
          <div
            style={{
              padding: 24,
              paddingTop: 16,
              borderTop: '1px solid #00000010',
            }}
          >
            <div className="flex flex-row gap-3">
              {isSubmitting ? (
                <div className="flex flex-row items-center justify-center flex-1 h-[50px]">
                  <CircularProgress size={25} sx={{ color: '#7902DF' }} />
                </div>
              ) : (
                <button
                  className={`h-[50px] rounded-xl text-white flex-1 ${isFormValid() ? 'bg-purple' : 'bg-gray-400'
                    }`}
                  style={{
                    fontWeight: '600',
                    fontSize: 16.8,
                  }}
                  onClick={handleFormSubmit}
                  disabled={!isFormValid()}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </Box>
      </Modal>

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
    </div>
  )
}

export default Creator
