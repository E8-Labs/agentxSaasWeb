'use client'

import { useEffect, useState, useRef } from 'react'
import { Button as ButtonBase } from '../ui/button'
import { Input as InputBase } from '../ui/input'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import DialerSettings from './DialerSettings'
import CallingScript from './CallingScript'
import CallNotesWindow from './CallNotesWindow'
import EmailTempletePopup from '../pipeline/EmailTempletePopup'
import SMSTempletePopup from '../pipeline/SMSTempletePopup'
import { ArrowUp, Pause, Mic, MicOff, FileText, StickyNote, X, ChevronDown, Check, Phone, Mail, MessageSquare, MoreVertical, Pencil } from 'lucide-react'
import { Menu, MenuItem } from '@mui/material'
import Image from 'next/image'
import { formatPhoneNumber } from '@/utilities/agentUtilities'

// @ts-ignore - Twilio Voice SDK types
import { Device, Call } from '@twilio/voice-sdk'

// Type assertions for components from .jsx files
const Button = ButtonBase as any
const Input = InputBase as any

// Simulation mode - set via environment variable
const SIMULATE_CALL_FLOW = process.env.NEXT_PUBLIC_SIMULATE_DIALER === 'true'

type CallStatus = 'idle' | 'requesting-mic' | 'connecting' | 'ringing' | 'in-call' | 'ended' | 'error'

interface DialerModalProps {
  open: boolean
  onClose: () => void
  initialPhoneNumber?: string
  leadId?: number
  leadName?: string
}

export default function DialerModal({
  open,
  onClose,
  initialPhoneNumber = '',
  leadId,
  leadName,
}: DialerModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [device, setDevice] = useState<Device | null>(null)
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [hasDialerNumber, setHasDialerNumber] = useState(false)
  const [checkingDialerNumber, setCheckingDialerNumber] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [deviceRegistered, setDeviceRegistered] = useState(false)
  const dialogJustOpened = useRef(false)
  const isClosingRef = useRef(false)

  // New state for enhanced UI
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([])
  const [selectedInternalNumber, setSelectedInternalNumber] = useState<any>(null)
  const [phoneNumbersLoading, setPhoneNumbersLoading] = useState(false)
  const [numberDropdownAnchor, setNumberDropdownAnchor] = useState<null | HTMLElement>(null)
  const [callDuration, setCallDuration] = useState(0) // in seconds
  const [isMuted, setIsMuted] = useState(false)
  const [isOnHold, setIsOnHold] = useState(false)
  const [callEndedInError, setCallEndedInError] = useState(false)
  const [showScriptPanel, setShowScriptPanel] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [showSmsPanel, setShowSmsPanel] = useState(false)
  const [emailTemplates, setEmailTemplates] = useState<any[]>([])
  const [smsTemplates, setSmsTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendingSms, setSendingSms] = useState(false)
  const [showEmailTemplatePopup, setShowEmailTemplatePopup] = useState(false)
  const [showSmsTemplatePopup, setShowSmsTemplatePopup] = useState(false)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedTemplateForMenu, setSelectedTemplateForMenu] = useState<any>(null)
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Global error handler for uncaught Twilio errors
  useEffect(() => {
    if (!open) return
    
    const handleError = (event: ErrorEvent) => {
      const message = event.message || ''
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:48', message: 'Global error caught', data: { message, error: event.error?.message, filename: event.filename, lineno: event.lineno }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion
      if (message.includes('application error') || message.includes('goodbye')) {
        event.preventDefault() // Prevent default error handling
        toast.error('Connection error. Please check your internet and try again.')
        setCallStatus('error')
        if (device) {
          try {
            device.destroy()
          } catch (e) {
            // Ignore cleanup errors
          }
          setDevice(null)
        }
      }
    }
    
    // Also listen for unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:67', message: 'Unhandled promise rejection', data: { reason: event.reason?.message || event.reason, type: typeof event.reason }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [open, device])

  // Update phone number when initialPhoneNumber changes
  useEffect(() => {
    if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber)
    }
  }, [initialPhoneNumber])

  // Initialize device when modal opens
  useEffect(() => {
    if (open) {
      console.log('[DialerModal] Modal opened, setting dialogJustOpened flag')
      dialogJustOpened.current = true
      isClosingRef.current = false

      // Reset dropdown anchor when modal opens
      setNumberDropdownAnchor(null)
      
      // Reset flag after a delay to allow dialog to fully open
      const timeoutId = setTimeout(() => {
        console.log('[DialerModal] Dialog fully opened, clearing protection flag')
        dialogJustOpened.current = false
      }, 1000) // Increased to 1 second
      
      checkDialerNumber()
      // Fetch phone numbers with agents when modal opens
      if (hasDialerNumber) {
        fetchPhoneNumbersWithAgents()
      }
      
      return () => {
        clearTimeout(timeoutId)
      }
    } else {
      // Only cleanup if we're actually closing (not just re-rendering)
      if (isClosingRef.current || !dialogJustOpened.current) {
        console.log('[DialerModal] Modal closing, cleaning up device')

        // Clear simulation
        if (simulationTimeoutRef.current) {
          clearTimeout(simulationTimeoutRef.current)
          simulationTimeoutRef.current = null
        }

        if (activeCall) {
          try {
            // Only disconnect if it's a real call
            if (typeof activeCall.disconnect === 'function') {
            activeCall.disconnect()
            }
          } catch (e) {
            console.error('Error disconnecting call:', e)
          }
          setActiveCall(null)
        }
        if (device) {
          try {
            device.destroy()
          } catch (e) {
            console.error('Error destroying device:', e)
          }
          setDevice(null)
        }
        setDeviceRegistered(false)
        setCallStatus('idle')
      }
    }
  }, [open])

  // Initialize device only after we confirm we have a dialer number
  useEffect(() => {
    if (open && hasDialerNumber && !device && !initializing && !checkingDialerNumber) {
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        initializeDevice()
      }, 100)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasDialerNumber])

  // Fetch phone numbers when hasDialerNumber becomes true
  useEffect(() => {
    if (open && hasDialerNumber && phoneNumbers.length === 0) {
      fetchPhoneNumbersWithAgents()
    }
  }, [open, hasDialerNumber])

  // Get user data for template popups
  useEffect(() => {
    if (open) {
      try {
        const userStr = localStorage.getItem('User')
        if (userStr) {
          const userData = JSON.parse(userStr)
          setSelectedUser(userData?.user || userData)
        }
      } catch (e) {
        console.error('Error parsing User from localStorage:', e)
      }
    }
  }, [open])

  const checkDialerNumber = async () => {
    try {
      setCheckingDialerNumber(true)
      // Try multiple ways to get the token
      let token = localStorage.getItem('token')
      if (!token) {
        try {
          const userStr = localStorage.getItem('User')
          if (userStr) {
            const userData = JSON.parse(userStr)
            token = userData?.token || userData?.user?.token
          }
        } catch (e) {
          console.error('Error parsing User from localStorage:', e)
        }
      }
      if (!token) {
        setHasDialerNumber(false)
        return
      }

      const response = await fetch('/api/dialer/phone-numbers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.status && data.data) {
        const hasDialer = data.data.some((pn: any) => pn.usageType === 'internal_dialer')
        setHasDialerNumber(hasDialer)
        if (!hasDialer) {
          // Don't show error toast here - let the UI show the message
        }
      } else {
        setHasDialerNumber(false)
      }
    } catch (error) {
      console.error('Error checking dialer number:', error)
      setHasDialerNumber(false)
    } finally {
      setCheckingDialerNumber(false)
    }
  }

  // Fetch phone numbers with agent assignments
  const fetchPhoneNumbersWithAgents = async () => {
    try {
      setPhoneNumbersLoading(true)
      let token = localStorage.getItem('token')
      if (!token) {
        try {
          const userStr = localStorage.getItem('User')
          if (userStr) {
            const userData = JSON.parse(userStr)
            token = userData?.token || userData?.user?.token
          }
        } catch (e) {
          console.error('Error parsing User from localStorage:', e)
        }
      }
      if (!token) {
        return
      }

      const response = await fetch('/api/dialer/phone-numbers/with-agents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.status && data.data) {
        setPhoneNumbers(data.data)
        // Find and set the internal dialer number
        const internalNumber = data.data.find((pn: any) => pn.usageType === 'internal_dialer')
        if (internalNumber) {
          setSelectedInternalNumber(internalNumber)
        }
      }
    } catch (error) {
      console.error('Error fetching phone numbers with agents:', error)
    } finally {
      setPhoneNumbersLoading(false)
    }
  }

  // Update internal dialer number
  const handleSetInternalNumber = async (phoneNumberId: number) => {
    try {
      let token = localStorage.getItem('token')
      if (!token) {
        try {
          const userStr = localStorage.getItem('User')
          if (userStr) {
            const userData = JSON.parse(userStr)
            token = userData?.token || userData?.user?.token
          }
        } catch (e) {
          console.error('Error parsing User from localStorage:', e)
        }
      }
      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch('/api/dialer/phone-numbers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumberId }),
      })

      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message || 'Failed to set dialer number')
        return
      }

      // Refresh phone numbers
      await fetchPhoneNumbersWithAgents()
      toast.success('Internal dialer number updated')
      setNumberDropdownAnchor(null)
    } catch (error: any) {
      console.error('Error setting dialer number:', error)
      toast.error('Failed to set dialer number')
    }
  }

  const initializeDevice = async () => {
    if (initializing) return
    if (!hasDialerNumber) {
      // Don't initialize if no dialer number is configured
      return
    }

    try {
      setInitializing(true)
      // Try multiple ways to get the token
      let token = localStorage.getItem('token')
      if (!token) {
        try {
          const userStr = localStorage.getItem('User')
          if (userStr) {
            const userData = JSON.parse(userStr)
            token = userData?.token || userData?.user?.token
          }
        } catch (e) {
          console.error('Error parsing User from localStorage:', e)
        }
      }
      if (!token) {
        toast.error('Not authenticated. Please log in again.')
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:168', message: 'Requesting access token', data: { hasToken: !!token }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion

      // Get access token from backend
      const response = await fetch('/api/dialer/calls/token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            leadId: leadId || null,
            leadName: leadName || null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:184', message: 'Token request failed', data: { status: response.status, message: data.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        if (response.status === 409) {
          setHasDialerNumber(false)
          toast.error('No internal dialer number set. Please configure one in settings.')
        } else {
          toast.error(data.message || 'Failed to get access token')
        }
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:192', message: 'Token received', data: { hasToken: !!data.token }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion

      // Initialize Twilio Device
      // #region agent log
      // Try to decode token to check if it's valid (just check structure, not signature)
      let tokenPreview: string | {
        hasGrants: boolean
        hasVoiceGrant: boolean
        hasOutgoingApp: boolean
        identity: any
        exp: any
        iat: any
      } = 'invalid'
      try {
        const tokenParts = data.token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          tokenPreview = {
            hasGrants: !!payload.grants,
            hasVoiceGrant: !!payload.grants?.voice,
            hasOutgoingApp: !!payload.grants?.voice?.outgoing?.application_sid,
            identity: payload.grants?.identity,
            exp: payload.exp,
            iat: payload.iat,
          }
        }
      } catch (e) {
        tokenPreview = 'decode_error'
      }
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:201', message: 'Creating Twilio Device', data: { tokenLength: data.token.length, tokenPreview }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion
      
      let twilioDevice: Device
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:260', message: 'About to create Device', data: { tokenLength: data.token.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        
        twilioDevice = new Device(data.token, {
          logLevel: 1, // DEBUG level (0=TRACE, 1=DEBUG, 2=INFO, 3=WARN, 4=ERROR, 5=SILENT)
          // Disable automatic error alerts
          allowIncomingWhileBusy: false,
        } as any)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:270', message: 'Device created, checking state', data: { state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
      } catch (deviceError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:273', message: 'Device creation error', data: { errorMessage: deviceError.message, errorName: deviceError.name, errorStack: deviceError.stack?.substring(0, 300) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        throw new Error(`Failed to create device: ${deviceError.message}`)
      }

      // Set a timeout for device registration (10 seconds)
      const registrationTimeout = setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:266', message: 'Device registration timeout check', data: { deviceRegistered, deviceState: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        if (!deviceRegistered) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:269', message: 'Device registration timeout - not registered', data: { deviceState: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
          // #endregion
          toast.error('Device registration timed out. Please check your connection and try again.')
          setInitializing(false)
        }
      }, 10000)

      twilioDevice.on('registered', () => {
        console.log('Twilio Device registered')
        clearTimeout(registrationTimeout)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:311', message: 'Device registered successfully', data: { state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        setDeviceRegistered(true)
        setInitializing(false)
      })
      
      // Note: The Device should automatically register when created with a valid token
      // If registration fails, check browser console for errors
      // Common issues:
      // 1. Invalid API key credentials (even if token structure is correct)
      // 2. Network connectivity issues
      // 3. CORS or firewall blocking Twilio servers
      
      // Listen for token expiration which might prevent registration
      twilioDevice.on('tokenWillExpire', () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:285', message: 'Token will expire soon', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        console.log('Token will expire soon, refreshing...')
      })
      
      // Check device state periodically to see if it's trying to register
      let checkCount = 0
      const stateCheckInterval = setInterval(() => {
        checkCount++
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:360', message: 'Device state check', data: { state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered, deviceRegistered, checkCount }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        
        // Check if device state changed (might indicate registration attempt)
        if (twilioDevice.state === 'registering' || (twilioDevice.state === 'registered' && !deviceRegistered)) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:368', message: 'Device state changed', data: { state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered, deviceRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
          // #endregion
        }
        
        // Update deviceRegistered state if device is registered
        if ((twilioDevice as any).isRegistered && !deviceRegistered) {
          clearInterval(stateCheckInterval)
          clearTimeout(registrationTimeout)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:376', message: 'Device registered via state check', data: { state: twilioDevice.state }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
          // #endregion
          setDeviceRegistered(true)
          setInitializing(false)
        } else if (twilioDevice.state === 'registered' && !deviceRegistered) {
          // Also check state property directly
          setDeviceRegistered(true)
          setInitializing(false)
        }
        
        // Stop checking after 15 seconds
        if (checkCount >= 15) {
          clearInterval(stateCheckInterval)
        }
      }, 1000)
      
      twilioDevice.on('unregistered', (reason: string) => {
        console.log('Twilio Device unregistered:', reason)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:330', message: 'Device unregistered', data: { reason, state: twilioDevice.state }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        setDeviceRegistered(false)
      })

      twilioDevice.on('error', (error: any) => {
        console.error('Twilio Device error:', error)
        clearTimeout(registrationTimeout)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:322', message: 'Device error event', data: { errorCode: error.code, errorMessage: error.message, errorName: error.name, errorTwilioError: error.twilioError?.message, errorTwilioCode: error.twilioError?.code }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        setDeviceRegistered(false)
        setInitializing(false)
        setCallStatus('error')
        // Provide user-friendly error messages
        let errorMsg = 'Device error occurred'
        if (error.code === 31005) {
          errorMsg = 'Connection error. The call could not be established. Please check your connection and try again.'
        } else if (error.code === 31000) {
          errorMsg = 'Connection error. Please check your internet connection.'
        } else if (error.code === 31205) {
          errorMsg = 'Invalid access token. Please refresh and try again.'
        } else if (error.code === 31208) {
          errorMsg = 'Registration error. Please check your Twilio configuration.'
        } else if (error.message) {
          errorMsg = `Device error: ${error.message}`
        }
        toast.error(errorMsg)
      })
      
      // Listen for warning events (might indicate registration issues)
      twilioDevice.on('warning', (name: string, data: any) => {
        console.warn('Twilio Device warning:', name, data)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:343', message: 'Device warning event', data: { warningName: name, warningData: data }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
      })

      twilioDevice.on('incoming', (call: Call) => {
        console.log('Incoming call:', call)
        // Handle incoming calls if needed
      })


      setDevice(twilioDevice)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:404', message: 'Device initialized and set, attempting explicit registration', data: { hasDevice: !!twilioDevice, state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion
      
      // Explicitly register the device (required by some browsers for audio access)
      // This is called after user interaction (modal open), so it should work
      try {
        twilioDevice.register()
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:411', message: 'Explicit device.register() called', data: { state: twilioDevice.state }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
      } catch (registerError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:414', message: 'Error calling device.register()', data: { errorMessage: registerError.message, errorName: registerError.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        console.error('Error registering device:', registerError)
      }
      
      // Note: Don't set initializing to false here - wait for 'registered' event or timeout
    } catch (error: any) {
      console.error('Error initializing device:', error)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:310', message: 'Error initializing device', data: { errorMessage: error.message, errorName: error.name, errorStack: error.stack?.substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion
      setDeviceRegistered(false)
      let errorMsg = 'Failed to initialize dialer'
      if (error.message?.includes('token')) {
        errorMsg = 'Invalid access token. Please try again.'
      } else if (error.message) {
        errorMsg = `Initialization error: ${error.message}`
      }
      toast.error(errorMsg)
      setInitializing(false)
    }
  }

  // Simulation function to cycle through call states
  const simulateCallFlow = () => {
    // Clear any existing simulation
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current)
      simulationTimeoutRef.current = null
    }
    if (callDurationIntervalRef.current) {
      clearInterval(callDurationIntervalRef.current)
      callDurationIntervalRef.current = null
    }

    // Step 1: Connecting (5 seconds)
    setCallStatus('connecting')
    setActiveCall({} as Call) // Mock call object

    simulationTimeoutRef.current = setTimeout(() => {
      // Step 2: Ringing (5 seconds)
      setCallStatus('ringing')

      simulationTimeoutRef.current = setTimeout(() => {
        // Step 3: In-call (5 seconds)
        setCallStatus('in-call')
        setCallDuration(0)

        // Start call duration timer
        callDurationIntervalRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1)
        }, 1000)

        simulationTimeoutRef.current = setTimeout(() => {
          // Step 4: End call
          setCallStatus('ended')
          setActiveCall(null)
          if (callDurationIntervalRef.current) {
            clearInterval(callDurationIntervalRef.current)
            callDurationIntervalRef.current = null
          }
          setCallDuration(0)
          setIsMuted(false)
          setIsOnHold(false)
          setShowScriptPanel(false)
          simulationTimeoutRef.current = null
        }, 5000) // 5 seconds in-call
      }, 5000) // 5 seconds ringing
    }, 5000) // 5 seconds connecting
  }

  const handleCall = async () => {
    // Check if simulation mode is enabled
    if (SIMULATE_CALL_FLOW) {
      if (!phoneNumber) {
        toast.error('Please enter a phone number')
        return
      }
      simulateCallFlow()
      return
    }

    if (!device) {
      toast.error('Device not initialized. Please wait...')
      return
    }

    if (!deviceRegistered) {
      toast.error('Device not ready. Please wait for connection...')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:325', message: 'Call attempted before device registered', data: { hasDevice: !!device, deviceRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion
      return
    }

    if (!phoneNumber) {
      toast.error('Please enter a phone number')
      return
    }

    if (!hasDialerNumber) {
      toast.error('No internal dialer number set. Please configure one first.')
      return
    }

    try {
      setCallStatus('requesting-mic')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:340', message: 'Starting call', data: { phoneNumber, hasDevice: !!device, deviceRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop()) // Stop immediately, Device will handle it

      setCallStatus('connecting')

      const userStr = localStorage.getItem('User')
      if (!userStr) {
        console.error('User not found in localStorage')
        setCallStatus('idle')
        toast.error('User not found. Please log in again.')
        return
      }
      
      let userData
      try {
        userData = JSON.parse(userStr)
      } catch (e) {
        console.error('Error parsing user data:', e)
        setCallStatus('idle')
        toast.error('Invalid user data. Please log in again.')
        return
      }
      
      // Handle nested user structure: {token: '...', user: {id: ...}} or {id: ...}
      const user = userData.user || userData
      
      if (!user || !user.id) {
        console.error('User data missing id:', userData)
        setCallStatus('idle')
        toast.error('Invalid user data. Please log in again.')
        return
      }
      
      const userId = user.id
      const agencyId = user.agencyId
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:350', message: 'Calling device.connect', data: { phoneNumber, userId, hasAgencyId: !!agencyId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion
      
      const call = await device.connect({
        params: {
          To: phoneNumber,
          tenantId: agencyId ? String(agencyId) : String(userId),
          userId: String(userId),
          leadId: leadId ? String(leadId) : '',
          leadName: leadName || '',
        },
      })
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:361', message: 'Call connected', data: { hasCall: !!call }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion

      setActiveCall(call)
      setCallStatus('ringing')

      call.on('accept', () => {
        setCallStatus('in-call')
        toast.success('Call connected')
        // Start call duration timer
        setCallDuration(0)
        if (callDurationIntervalRef.current) {
          clearInterval(callDurationIntervalRef.current)
        }
        callDurationIntervalRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1)
        }, 1000)
      })

      call.on('disconnect', () => {
        // Preserve error status if call ended in error
        setCallStatus((prevStatus) => {
          // If we already set it to error, keep it as error
          // Otherwise, if callEndedInError flag is set, set to error
          // Otherwise, set to ended
          if (prevStatus === 'error' || callEndedInError) {
            return 'error'
          }
          return 'ended'
        })
        setActiveCall(null)
        // Stop call duration timer (but keep the duration value for summary)
        if (callDurationIntervalRef.current) {
          clearInterval(callDurationIntervalRef.current)
          callDurationIntervalRef.current = null
        }
        // Don't reset callDuration - keep it for the Call Summary
        setIsMuted(false)
        setIsOnHold(false)
        setShowScriptPanel(false)
        // Only show "Call ended" toast if it wasn't an error
        if (!callEndedInError && callStatus !== 'error') {
        toast.info('Call ended')
        }
      })

      call.on('cancel', () => {
        setCallStatus('ended')
        setActiveCall(null)
        // Stop call duration timer
        if (callDurationIntervalRef.current) {
          clearInterval(callDurationIntervalRef.current)
          callDurationIntervalRef.current = null
        }
        setCallDuration(0)
        setIsMuted(false)
        setIsOnHold(false)
        setShowScriptPanel(false)
        toast.info('Call canceled')
      })

      call.on('error', (error: any) => {
        console.error('Call error:', error)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:377', message: 'Call error event', data: { errorCode: error.code, errorMessage: error.message, errorName: error.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        setCallStatus('error')
        setCallEndedInError(true)
        setActiveCall(null)
        let errorMsg = 'Call failed'
        if (error.code === 31005) {
          errorMsg = 'Connection error. The call could not be established. This may be due to network issues or an invalid phone number.'
        } else if (error.code === 31008) {
          errorMsg = 'Call rejected. The number may be invalid or unreachable.'
        } else if (error.code === 31205) {
          errorMsg = 'Invalid access token. Please refresh and try again.'
        } else if (error.message) {
          errorMsg = `Call error: ${error.message}`
        }
        toast.error(errorMsg)
      })
    } catch (error: any) {
      console.error('Error making call:', error)
      setCallStatus('error')
      toast.error(`Failed to make call: ${error.message}`)
    }
  }

  const handleEndCall = () => {
    // Clear simulation if running
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current)
      simulationTimeoutRef.current = null
    }

    if (activeCall) {
      // Only disconnect if it's a real call (not simulation)
      if (SIMULATE_CALL_FLOW && !device) {
        // Simulation mode - just reset state
        // Set status to 'ended' to show call summary
        if (callStatus !== 'error' && callStatus !== 'ended') {
          setCallStatus('ended')
        }
      } else if (activeCall && typeof activeCall.disconnect === 'function') {
        // Disconnect the call - the 'disconnect' event will handle status update
        // But we also set it here to ensure Call Summary shows immediately
        if (callStatus !== 'error' && callStatus !== 'ended') {
          setCallStatus('ended')
        }
      activeCall.disconnect()
      } else {
        // No active call but status might be in-call/ringing - set to ended
        if (callStatus !== 'error' && callStatus !== 'ended') {
          setCallStatus('ended')
        }
      }
      setActiveCall(null)
      // Stop call duration timer
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
      // Don't reset callDuration - keep it for the summary
      setIsMuted(false)
      setIsOnHold(false)
      setShowScriptPanel(false)
      setCallEndedInError(false)
    } else if (callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting') {
      // If there's no active call but status indicates a call was happening, set to ended
      setCallStatus('ended')
      // Stop call duration timer
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
    }
  }

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (!activeCall) return
    try {
      if (isMuted) {
        activeCall.mute(false)
        setIsMuted(false)
      } else {
        activeCall.mute(true)
        setIsMuted(true)
      }
    } catch (error: any) {
      console.error('Error toggling mute:', error)
      toast.error('Failed to toggle mute')
    }
  }

  // Handle hold toggle
  const handleHoldToggle = () => {
    if (!activeCall) return
    try {
      // Twilio SDK may not support hold() directly - using type assertion
      // If hold is not available, this will throw an error which we catch
      const callWithHold = activeCall as any
      if (isOnHold) {
        if (typeof callWithHold.hold === 'function') {
          callWithHold.hold(false)
        } else {
          // Fallback: Hold is not supported in this SDK version
          toast.info('Hold functionality may not be available in this SDK version')
          return
        }
        setIsOnHold(false)
      } else {
        if (typeof callWithHold.hold === 'function') {
          callWithHold.hold(true)
        } else {
          // Fallback: Hold is not supported in this SDK version
          toast.info('Hold functionality may not be available in this SDK version')
          return
        }
        setIsOnHold(true)
      }
    } catch (error: any) {
      console.error('Error toggling hold:', error)
      toast.error('Failed to toggle hold. This feature may not be supported.')
      setIsOnHold(false) // Reset state on error
    }
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatDurationForSummary = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')} Min ${secs.toString().padStart(2, '0')} Sec`
  }

  const fetchEmailTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/templates?communicationType=email', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data?.status === true && data?.data) {
        setEmailTemplates(data.data)
      } else {
        toast.error('Failed to load email templates')
      }
    } catch (error: any) {
      console.error('Error fetching email templates:', error)
      toast.error('Failed to load email templates')
    } finally {
      setTemplatesLoading(false)
    }
  }

  const fetchSmsTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/templates?communicationType=sms', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data?.status === true && data?.data) {
        setSmsTemplates(data.data)
      } else {
        toast.error('Failed to load SMS templates')
      }
    } catch (error: any) {
      console.error('Error fetching SMS templates:', error)
      toast.error('Failed to load SMS templates')
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleSendSms = async () => {
    if (!selectedTemplate || !leadId) {
      toast.error('Please select a template')
      return
    }

    try {
      setSendingSms(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/templates/send-sms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: leadId,
          templateId: selectedTemplate.id,
        }),
      })

      const data = await response.json()

      if (data?.status === true) {
        toast.success('SMS sent successfully')
        setSelectedTemplate(null)
        setShowSmsPanel(false)
      } else {
        toast.error(data?.message || 'Failed to send SMS')
      }
    } catch (error: any) {
      console.error('Error sending SMS:', error)
      toast.error('Failed to send SMS')
    } finally {
      setSendingSms(false)
    }
  }

  const handleDeleteTemplate = async (template: any) => {
    try {
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data?.status === true) {
        toast.success('Template deleted successfully')
        // Refresh templates
        if (showEmailPanel) {
          await fetchEmailTemplates()
        } else if (showSmsPanel) {
          await fetchSmsTemplates()
        }
        // Clear selection if deleted template was selected
        if (selectedTemplate?.id === template.id) {
          setSelectedTemplate(null)
        }
      } else {
        toast.error(data?.message || 'Failed to delete template')
      }
    } catch (error: any) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template)
    setIsEditingTemplate(true)
    if (showEmailPanel) {
      setShowEmailTemplatePopup(true)
    } else if (showSmsPanel) {
      setShowSmsTemplatePopup(true)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedTemplate || !leadId) {
      toast.error('Please select a template')
      return
    }

    try {
      setSendingEmail(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/templates/send-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: leadId,
          templateId: selectedTemplate.id,
        }),
      })

      const data = await response.json()

      if (data?.status === true) {
        toast.success('Email sent successfully')
        setSelectedTemplate(null)
        setShowEmailPanel(false)
      } else {
        toast.error(data?.message || 'Failed to send email')
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  // Cleanup intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
      }
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current)
      }
    }
  }, [])

  const getStatusBadge = () => {
    const statusColors: Record<CallStatus, string> = {
      idle: 'bg-gray-500',
      'requesting-mic': 'bg-yellow-500',
      connecting: 'bg-blue-500',
      ringing: 'bg-blue-500',
      'in-call': 'bg-green-500',
      ended: 'bg-gray-500',
      error: 'bg-red-500',
    }

    return (
      <Badge variant="outline" className={statusColors[callStatus] || 'bg-gray-500'}>
        {callStatus.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  const handleOpenChange = (isOpen: boolean) => {
    // Prevent closing if dialog just opened
    if (!isOpen && dialogJustOpened.current) {
      console.log('[DialerModal] Ignoring close event - dialog just opened')
      return
    }
    
    // Only close if explicitly closing
    if (!isOpen && !isClosingRef.current) {
      isClosingRef.current = true
      onClose()
    } else if (isOpen) {
      isClosingRef.current = false
    }
  }


  if (!open) return null

  return (
    <div
      className="fixed z-[1401] bg-white"
      style={{
        top: '80px',
        right: '20px',
        left: 'auto',
        maxWidth: (showScriptPanel && callStatus !== 'ended' && callStatus !== 'error') || ((showEmailPanel || showSmsPanel) && (callStatus === 'ended' || callStatus === 'error')) ? '700px' : '380px',
        width: (showScriptPanel && callStatus !== 'ended' && callStatus !== 'error') || ((showEmailPanel || showSmsPanel) && (callStatus === 'ended' || callStatus === 'error')) ? '700px' : '380px',
        transition: 'width 0.3s ease, max-width 0.3s ease',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
        minHeight: '500px',
        maxHeight: '80vh',
        borderRadius: '16px',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
      onKeyDown={(e) => {
          // Allow escape to close unless in active call
          // Don't interfere with input fields
          const target = e.target as HTMLElement
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return
          }
        if (e.key === 'Escape' && callStatus !== 'in-call' && callStatus !== 'ringing' && callStatus !== 'connecting') {
          onClose()
        }
      }}
    >
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-50 p-2 h-auto"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 50,
        }}
      >
        <X size={20} />
      </Button>

      <div 
        className="flex flex-row" 
        style={{ minHeight: '500px', maxHeight: '80vh' }}
      >
        {/* Email/SMS Templates Panel - Left Side (when call ended and panel open) */}
          {(callStatus === 'ended' || callStatus === 'error') && (showEmailPanel || showSmsPanel) && (
          <div 
            className="w-80 border-r border-gray-200 flex-shrink-0 flex flex-col" 
            style={{ maxHeight: '60vh', pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {showEmailPanel ? 'Select Email' : 'Select SMS'}
              </h3>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  // Reset editing state for new template
                  setIsEditingTemplate(false)
                  setEditingTemplate(null)
                  if (showEmailPanel) {
                    setShowEmailTemplatePopup(true)
                  } else {
                    setShowSmsTemplatePopup(true)
                  }
                }}
                size="sm"
                className="rounded-lg border border-gray-300"
                style={{
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '12px',
                  padding: '4px 12px',
                  height: 'auto',
                }}
              >
                <span className="mr-1">✏️</span>
                Compose New
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">Loading templates...</div>
                </div>
              ) : (showEmailPanel ? emailTemplates : smsTemplates).length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">No {showEmailPanel ? 'email' : 'SMS'} templates found</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(showEmailPanel ? emailTemplates : smsTemplates).map((template: any) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedTemplate?.id === template.id
                          ? 'border-2 border-purple-500 bg-purple-50'
                          : 'border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {template.templateName}
                          </div>
                          {showEmailPanel && (
                            <>
                              <div className="text-xs text-gray-500 line-clamp-2">
                                {template.subject}
                              </div>
                              {template.content && (
                                <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {template.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                </div>
                              )}
                            </>
                          )}
                          {showSmsPanel && template.content && (
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {template.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            setSelectedTemplateForMenu(template)
                            setTemplateMenuAnchor(e.currentTarget)
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                          }}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto ml-2 flex-shrink-0"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </Button>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (showEmailPanel) {
                                handleSendEmail()
                              } else {
                                handleSendSms()
                              }
                            }}
                            disabled={sendingEmail || sendingSms}
                            className="w-full rounded-lg"
                            style={{
                              backgroundColor: 'hsl(var(--brand-primary))',
                              color: 'white',
                              fontSize: '14px',
                              padding: '8px 16px',
                            }}
                          >
                            {(sendingEmail || sendingSms) ? 'Sending...' : 'Send'}
                          </Button>
            </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Script Panel - Left Side */}
        {showScriptPanel && callStatus !== 'ended' && (
          <div 
            className="w-80 border-r border-gray-200 flex-shrink-0 flex flex-col" 
            style={{ maxHeight: '80vh', position: 'relative', zIndex: 2000 }}
          >
            <CallingScript
              leadId={leadId}
              leadName={leadName}
              isExpanded={showScriptPanel}
              onClose={() => setShowScriptPanel(false)}
            />
          </div>
        )}

        {/* Main Content - Right Side */}
        <div
          className="flex flex-col relative"
            style={{
              width: (showScriptPanel && callStatus !== 'ended' && callStatus !== 'error') || ((showEmailPanel || showSmsPanel) && (callStatus === 'ended' || callStatus === 'error')) ? '380px' : '100%',
            flexShrink: 0,
            maxHeight: '80vh',
          }}
        >
          {/* Header with Your Number / Outgoing Call / Call Summary - Gray Background */}
          <div className="px-4 py-3 relative" style={{ backgroundColor: '#F5F5F5', zIndex: 1, pointerEvents: 'auto', minHeight: '72px' }}>
            <div className="space-y-2">
              {callStatus === 'ended' || callStatus === 'error' ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone size={16} style={{ color: 'hsl(var(--brand-primary))' }} />
                      <span className="text-sm font-semibold text-gray-900">Call Summary</span>
                    </div>
                  </div>
                  {selectedInternalNumber?.phone && (
                    <div className="text-xs text-gray-500">
                      {formatPhoneNumber(selectedInternalNumber.phone)}
                    </div>
                  )}
                </>
              ) : (callStatus === 'ringing' || callStatus === 'in-call' || callStatus === 'connecting') ? (
                <>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/svgIcons/dialer/OLD AGENTX UI/dialer_outoing_green_arrow.svg"
                      alt="Outgoing call"
                      width={16}
                      height={16}
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      Outgoing
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 ml-[24px]">
                    {selectedInternalNumber?.phone ? formatPhoneNumber(selectedInternalNumber.phone) : (SIMULATE_CALL_FLOW ? '+1 (234) 567-8900' : 'No number selected')}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/svgIcons/dialer/OLD AGENTX UI/dialer_arrow_icon_call_idle.svg"
                      alt="Your number"
                      width={16}
                      height={16}
                    />
                    <span className="text-sm font-semibold text-gray-900">Your Number</span>
                  </div>
                  <div className="flex items-center justify-between relative">
                    <div className="text-sm font-medium text-gray-900">
                      {selectedInternalNumber?.phone ? formatPhoneNumber(selectedInternalNumber.phone) : 'No number selected'}
                    </div>
                    <div style={{ position: 'relative', zIndex: 1000 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Change button clicked', e.currentTarget)
                          setNumberDropdownAnchor(e.currentTarget)
                        }}
                        className="text-sm flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                          color: 'hsl(var(--brand-primary))',
                          zIndex: 1000,
                          position: 'relative',
                          pointerEvents: 'auto',
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: '4px 8px',
                        }}
                      >
                        Change
                        <ChevronDown size={14} />
                      </button>
                      {numberDropdownAnchor && (
                        <Menu
                          anchorEl={numberDropdownAnchor}
                          open={Boolean(numberDropdownAnchor)}
                          onClose={() => setNumberDropdownAnchor(null)}
                          PaperProps={{
                            style: {
                              maxHeight: '300px',
                              width: '300px',
                              zIndex: 1500,
                            },
                          }}
                          style={{ zIndex: 1500 }}
                          MenuListProps={{
                            style: { zIndex: 1500 },
                          }}
                          container={() => document.body}
                          disablePortal={false}
                        >
                          {phoneNumbersLoading ? (
                            <MenuItem disabled>Loading...</MenuItem>
                          ) : phoneNumbers.length === 0 ? (
                            <MenuItem disabled>No phone numbers available</MenuItem>
                          ) : (
                            phoneNumbers.map((pn) => {
                              const isSelected = pn.usageType === 'internal_dialer'
                              const hasAgents = pn.agentCount > 0
                              const additionalAgents = pn.agentCount > 1 ? pn.agentCount - 1 : 0
                              
                              // Get agent initial for avatar fallback
                              const agentInitial = pn.firstAgent?.name 
                                ? pn.firstAgent.name.charAt(0).toUpperCase() 
                                : 'A'
                              
                              return (
                                <MenuItem
                                  key={pn.id}
                                  onClick={() => {
                                    if (pn.canBeInternalDialer) {
                                      handleSetInternalNumber(pn.id)
                                    }
                                  }}
                                  disabled={!pn.canBeInternalDialer || isSelected}
                                  style={{
                                    opacity: pn.canBeInternalDialer ? 1 : 0.6,
                                    border: isSelected ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    margin: '4px 8px',
                                    padding: '12px 16px',
                                    backgroundColor: isSelected ? 'hsl(var(--brand-primary) / 0.05)' : 'white',
                                    color: isSelected ? 'hsl(var(--brand-primary))' : 'inherit',
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full gap-3">
            <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900" style={{ color: 'hsl(var(--brand-primary))' }}>
                                        {formatPhoneNumber(pn.phone)}
            </div>
                                    </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                                      {/* Agent Avatars */}
                                      {hasAgents && (
                                        <div className="flex items-center" style={{ marginLeft: '-4px' }}>
                                          {/* First Agent Avatar */}
                                          {pn.firstAgent?.thumb_profile_image ? (
                                            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                                              <Image
                                                src={pn.firstAgent.thumb_profile_image}
                                                alt={pn.firstAgent.name || 'Agent'}
                                                width={24}
                                                height={24}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          ) : (
                                            <div
                                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                              style={{
                                                backgroundColor: `hsl(${(agentInitial.charCodeAt(0) * 137.508) % 360}, 70%, 50%)`,
                                              }}
                                            >
                                              {agentInitial}
              </div>
            )}
                                          {/* Counter Bubble for Additional Agents */}
                                          {additionalAgents > 0 && (
                                            <div
                                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                              style={{
                                                backgroundColor: '#6b7280',
                                                fontSize: '10px',
                                                marginLeft: '-8px',
                                              }}
                                            >
                                              +{additionalAgents}
          </div>
                                          )}
                                        </div>
                                      )}
                                      {/* Selected Checkmark */}
                                      {isSelected && (
                                        <div
                                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                          style={{
                                            backgroundColor: 'hsl(var(--brand-primary))',
                                          }}
                                        >
                                          <Check size={12} className="text-white" />
                                        </div>
                                      )}
                                      {/* Available Indicator (Green Dot) */}
                                      {pn.canBeInternalDialer && !isSelected && !hasAgents && (
                                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                </MenuItem>
                              )
                            })
                          )}
                        </Menu>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting' ? '80px' : (callStatus === 'ended' || callStatus === 'error') ? '16px' : '24px' }}>
          {checkingDialerNumber || initializing ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">Initializing dialer...</div>
            </div>
          ) : !hasDialerNumber ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-gray-500 mb-4">
                No internal dialer number configured. Please set one to start making calls.
              </p>
              <div className="flex justify-center">
                <DialerSettings />
              </div>
            </div>
          ) : (
              <div className="space-y-6">
                {/* Call Status Section - Show when call is active */}
                {(callStatus === 'ringing' || callStatus === 'in-call' || callStatus === 'connecting') ? (
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="flex flex-col items-center space-y-2 py-4">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.1)' }}
                      >
                        <span
                          className="text-3xl font-semibold"
                          style={{ color: 'hsl(var(--brand-primary))' }}
                        >
                          {leadName ? leadName.charAt(0).toUpperCase() : phoneNumber?.charAt(phoneNumber.length - 1) || '?'}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-base">{leadName || (phoneNumber ? formatPhoneNumber(phoneNumber) : '')}</div>
                        {leadName && phoneNumber && (
                          <div className="text-sm text-gray-500">{formatPhoneNumber(phoneNumber)}</div>
                        )}
                        {callStatus === 'in-call' && (
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-sm font-medium">{formatDuration(callDuration)}</span>
                          </div>
                        )}
                        {(callStatus === 'ringing' || callStatus === 'connecting') && (
                          <div className="text-sm text-gray-500 mt-2">Calling...</div>
                        )}
                      </div>
              </div>

                    {/* Call Controls */}
                    <div className="flex flex-col items-center gap-4 py-4">
                      {/* First Row: Hold, Mute, Script */}
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={handleHoldToggle}
                            className={`flex items-center justify-center transition-colors ${isOnHold
                              ? 'bg-gray-100'
                              : 'hover:bg-gray-50 bg-white'
                              }`}
                            disabled={!activeCall}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              border: isOnHold ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                              padding: 0,
                            }}
                          >
                            <Pause
                              size={20}
                              style={{
                                color: isOnHold ? 'hsl(var(--brand-primary))' : '#6b7280'
                              }}
                            />
                          </button>
                          <span className="text-xs" style={{ color: isOnHold ? 'hsl(var(--brand-primary))' : '#6b7280' }}>
                            Hold
                          </span>
              </div>
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={handleMuteToggle}
                            className={`flex items-center justify-center transition-colors ${isMuted
                              ? 'bg-gray-100'
                              : 'hover:bg-gray-50 bg-white'
                              }`}
                            disabled={!activeCall}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              border: isMuted ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                              padding: 0,
                            }}
                          >
                            {isMuted ? (
                              <MicOff size={20} style={{ color: 'hsl(var(--brand-primary))' }} />
                            ) : (
                              <Mic size={20} style={{ color: '#6b7280' }} />
                            )}
                          </button>
                          <span className="text-xs" style={{ color: isMuted ? 'hsl(var(--brand-primary))' : '#6b7280' }}>
                            Mute
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowScriptPanel(prev => {
                                console.log('Toggling script panel from', prev, 'to', !prev)
                                return !prev
                              })
                            }}
                            className={`flex items-center justify-center transition-all ${!showScriptPanel
                              ? 'hover:bg-gray-50'
                              : ''
                              }`}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              border: showScriptPanel ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                              backgroundColor: showScriptPanel
                                ? 'hsl(var(--brand-primary) / 0.1)'
                                : 'white',
                              padding: 0,
                            }}
                          >
                            <FileText
                              size={20}
                              style={{
                                color: showScriptPanel ? 'hsl(var(--brand-primary))' : '#6b7280'
                              }}
                            />
                          </button>
                          <span
                            className="text-xs"
                            style={{
                              color: showScriptPanel ? 'hsl(var(--brand-primary))' : '#6b7280'
                            }}
                          >
                            Script
                          </span>
                        </div>
                      </div>
                      {/* Second Row: Take Notes */}
                      <button
                        onClick={() => setShowNotes(!showNotes)}
                        className="rounded-full py-2 px-4 transition-all flex items-center gap-1.5"
                        style={{
                          backgroundColor: showNotes
                            ? 'hsl(var(--brand-primary) / 0.1)'
                            : '#F9F9F9',
                          border: 'none',
                          color: showNotes
                            ? 'hsl(var(--brand-primary))'
                            : '#374151',
                          fontSize: '14px',
                          height: 'auto',
                        }}
                      >
                        <StickyNote
                          size={14}
                          style={{
                            color: showNotes ? 'hsl(var(--brand-primary))' : '#374151'
                          }}
                        />
                        <span
                          style={{
                            color: showNotes ? 'hsl(var(--brand-primary))' : '#374151'
                          }}
                        >
                          Take Notes
                        </span>
                      </button>
                    </div>

                    {/* End Call Button - Fixed at bottom */}
                    <div
                      className="w-full px-6 py-4"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        width: showScriptPanel ? '380px' : '100%',
                      }}
                    >
                      <Button
                        onClick={handleEndCall}
                        className="w-full rounded-lg"
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontWeight: 600,
                          height: '56px',
                          fontSize: '16px',
                        }}
                      >
                    End Call
                  </Button>
                    </div>
                  </div>
                ) : callStatus === 'ended' || callStatus === 'error' ? (
                  /* Call Summary UI - Show when call ends */
                  <div className="space-y-3 py-2 flex flex-col items-center">
                    {/* Contact Info - Name and Phone in a row */}
                    <div className="w-full flex flex-row items-center gap-3 w-full justify-center">
                      <div className="text-base font-semibold text-gray-900">
                        {leadName || ''}
                      </div>
                      {phoneNumber && (
                        <div className="text-sm text-gray-600">{phoneNumber}</div>
                )}
              </div>

                    {/* Call Status - Side by Side */}
                    <div className="flex items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                        <Phone size={14} className="text-red-500" />
                        <span className="text-sm text-red-500">Call Ended</span>
                  </div>
                      {callStatus === 'error' ? (
                        <div
                          className="flex items-center gap-2 px-3 py-1 rounded-full"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            <X size={10} className="text-white" />
                          </div>
                          <span className="text-sm" style={{ color: '#ef4444' }}>
                            Failed
                          </span>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 px-3 py-1 rounded-full"
                          style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.1)' }}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'hsl(var(--brand-primary))' }}
                          >
                            <Check size={10} className="text-white" />
                          </div>
                          <span className="text-sm" style={{ color: 'hsl(var(--brand-primary))' }}>
                            Completed
                          </span>
                </div>
              )}
                    </div>

                    {/* Call Duration */}
                    <div className="text-sm text-gray-900 text-center">
                      {formatDurationForSummary(callDuration)}
                    </div>

                    {/* Call Back Button - 60% width, centered */}
                    <div className="w-full flex justify-center">
                      <Button
                        onClick={() => {
                          setCallStatus('idle')
                          setCallDuration(0)
                        }}
                        className="rounded-lg border border-gray-300"
                        style={{
                          width: '60%',
                          backgroundColor: 'white',
                          color: '#374151',
                          fontSize: '14px',
                          padding: '10px 16px',
                          height: 'auto',
                          boxShadow: 'none',
                        }}
                      >
                        <Phone size={16} className="mr-2" />
                        Call Back
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 my-3 w-full"></div>

                    {/* Follow Up Section */}
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-900">Follow up</span>
                        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">i</span>
                        </div>
              </div>

              <div className="space-y-2">
                        <Button
                          onClick={async () => {
                            if (!showEmailPanel) {
                              setShowEmailPanel(true)
                              setShowSmsPanel(false)
                              setSelectedTemplate(null)
                              if (emailTemplates.length === 0) {
                                await fetchEmailTemplates()
                              }
                            } else {
                              setShowEmailPanel(false)
                              setSelectedTemplate(null)
                            }
                          }}
                          className="w-full rounded-lg"
                          style={{
                            backgroundColor: showEmailPanel
                              ? 'hsl(var(--brand-primary) / 0.1)'
                              : 'white',
                            color: showEmailPanel
                              ? 'hsl(var(--brand-primary))'
                              : '#374151',
                            fontSize: '14px',
                            padding: '12px 16px',
                            border: showEmailPanel
                              ? '2px solid hsl(var(--brand-primary))'
                              : '1px solid #d1d5db',
                            height: 'auto',
                            boxShadow: 'none',
                          }}
                        >
                          <Mail
                            size={16}
                            className="mr-2"
                            style={{
                              color: showEmailPanel
                                ? 'hsl(var(--brand-primary))'
                                : '#374151'
                            }}
                          />
                          Send Email
                        </Button>

                        <Button
                          onClick={async () => {
                            if (!showSmsPanel) {
                              setShowSmsPanel(true)
                              setShowEmailPanel(false)
                              setSelectedTemplate(null)
                              if (smsTemplates.length === 0) {
                                await fetchSmsTemplates()
                              }
                            } else {
                              setShowSmsPanel(false)
                              setSelectedTemplate(null)
                            }
                          }}
                          className="w-full rounded-lg"
                          style={{
                            backgroundColor: showSmsPanel
                              ? 'hsl(var(--brand-primary) / 0.1)'
                              : 'white',
                            color: showSmsPanel
                              ? 'hsl(var(--brand-primary))'
                              : '#374151',
                            fontSize: '14px',
                            padding: '12px 16px',
                            border: showSmsPanel
                              ? '2px solid hsl(var(--brand-primary))'
                              : '1px solid #d1d5db',
                            height: 'auto',
                            boxShadow: 'none',
                          }}
                        >
                          <MessageSquare
                            size={16}
                            className="mr-2"
                            style={{
                              color: showSmsPanel
                                ? 'hsl(var(--brand-primary))'
                                : '#374151'
                            }}
                          />
                          Send Text
                  </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Pre-call UI - Show when not in call */
                  <>
                    {/* Contact Information Section */}
                    <div className="flex flex-col items-center space-y-3 py-6">
                      {/* Contact Avatar */}
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'hsl(var(--brand-primary))' }}
                      >
                        <span
                          className="text-4xl font-semibold text-white"
                        >
                          {leadName ? leadName.charAt(0).toUpperCase() : phoneNumber?.charAt(phoneNumber.length - 1) || '?'}
                        </span>
                      </div>

                      {/* Contact Name */}
                      <div className="text-center">
                        <div className="font-bold text-xl text-gray-900">
                          {leadName || (phoneNumber ? formatPhoneNumber(phoneNumber) : '') || 'Unknown Contact'}
                        </div>
                        {/* Phone Number as Label */}
                        {phoneNumber && (
                          <div className="text-sm text-gray-600 mt-1">
                            {formatPhoneNumber(phoneNumber)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Create Script Button - Show if no script exists */}
                    <div className="flex w-full justify-center">
                      <Button
                        onClick={() => setShowScriptPanel(!showScriptPanel)}
                        variant="filled"
                        className="rounded-full py-2 px-4 transition-all"
                        style={{
                          backgroundColor: showScriptPanel
                            ? 'hsl(var(--brand-primary) / 0.1)'
                            : '#F9F9F9',
                          border: showScriptPanel
                            ? '2px solid hsl(var(--brand-primary))'
                            : '1px solid #e5e7eb',
                          color: showScriptPanel
                            ? 'hsl(var(--brand-primary))'
                            : '#374151',
                          fontSize: '14px',
                          height: 'auto',
                        }}
                      >
                        <FileText
                          size={14}
                          className="mr-1.5"
                          style={{
                            color: showScriptPanel
                              ? 'hsl(var(--brand-primary))'
                              : '#374151'
                          }}
                        />
                        Create Script
                  </Button>
                    </div>
            </>
          )}
        </div>
                )}
              </div>

          {/* Fixed Start Call Button at Bottom - Only in main content area */}
          {(callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error') && (
            <div
              className="px-6 py-4 border-t border-gray-200"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                width: '100%',
              }}
            >
              <Button
                onClick={handleCall}
                className="w-full rounded-lg"
                disabled={!device || !deviceRegistered || initializing || !phoneNumber}
                style={{
                  backgroundColor: 'hsl(var(--brand-primary))',
                  color: 'white',
                  fontWeight: 600,
                  height: '56px',
                  fontSize: '16px',
                }}
              >
                {initializing ? 'Initializing...' : !deviceRegistered ? 'Connecting...' : 'Start Call'}
              </Button>
                  </div>
          )}
                </div>
      </div>

      {/* Call Notes Window - Bottom Right */}
      {(callStatus === 'ringing' || callStatus === 'in-call' || callStatus === 'connecting') && (
        <CallNotesWindow
          open={showNotes}
          onClose={() => setShowNotes(false)}
          leadId={leadId}
          leadName={leadName}
        />
      )}

      {/* Email Template Popup - Only render when actually open */}
      {showEmailTemplatePopup && (
        <EmailTempletePopup
          open={showEmailTemplatePopup}
          onClose={() => {
            setShowEmailTemplatePopup(false)
            setIsEditingTemplate(false)
            setEditingTemplate(null)
            // Refresh email templates after closing
            if (showEmailPanel) {
              fetchEmailTemplates()
            }
          }}
          communicationType="email"
          addRow={null}
          isEditing={isEditingTemplate}
          editingRow={editingTemplate}
          onUpdateRow={null}
          selectedGoogleAccount={selectedGoogleAccount}
          setSelectedGoogleAccount={setSelectedGoogleAccount}
          onSendEmail={null}
          isLeadEmail={false}
          leadEmail={null}
          leadId={leadId}
          selectedUser={selectedUser}
        />
      )}

      {/* SMS Template Popup - Only render when actually open */}
      {showSmsTemplatePopup && (
        <SMSTempletePopup
          open={showSmsTemplatePopup}
          onClose={() => {
            setShowSmsTemplatePopup(false)
            setIsEditingTemplate(false)
            setEditingTemplate(null)
            // Refresh SMS templates after closing
            if (showSmsPanel) {
              fetchSmsTemplates()
            }
          }}
          phoneNumbers={phoneNumbers.map((pn: any) => ({ id: pn.id, phone: pn.phone }))}
          phoneLoading={phoneNumbersLoading}
          communicationType="sms"
          addRow={null}
          isEditing={isEditingTemplate}
          editingRow={editingTemplate}
          onUpdateRow={null}
          onSendSMS={null}
          isLeadSMS={false}
          leadPhone={phoneNumber}
          leadId={leadId}
          selectedUser={selectedUser}
        />
      )}

      {/* Template Menu */}
      {selectedTemplateForMenu && (
        <Menu
          anchorEl={templateMenuAnchor}
          open={Boolean(templateMenuAnchor)}
          onClose={() => {
            setTemplateMenuAnchor(null)
            setSelectedTemplateForMenu(null)
          }}
          MenuListProps={{
            'aria-labelledby': 'template-menu-button',
          }}
          PaperProps={{
            style: {
              minWidth: '120px',
              zIndex: 1500,
            },
          }}
          style={{
            zIndex: 1500,
          }}
          disablePortal={false}
        >
          <MenuItem
            onClick={() => {
              if (selectedTemplateForMenu) {
                handleEditTemplate(selectedTemplateForMenu)
              }
              setTemplateMenuAnchor(null)
              setSelectedTemplateForMenu(null)
            }}
          >
            <Pencil size={14} className="mr-2" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedTemplateForMenu) {
                handleDeleteTemplate(selectedTemplateForMenu)
              }
              setTemplateMenuAnchor(null)
              setSelectedTemplateForMenu(null)
            }}
            style={{ color: '#dc2626' }}
          >
            <X size={14} className="mr-2" />
            Delete
          </MenuItem>
        </Menu>
      )}

        </div>
  )
}

