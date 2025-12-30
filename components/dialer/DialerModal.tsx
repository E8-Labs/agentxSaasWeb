'use client'

import { useEffect, useState, useRef } from 'react'
import { Button as ButtonBase } from '../ui/button'
import { Input as InputBase } from '../ui/input'
import {
  Dialog,
  DialogContent as DialogContentBase,
  DialogDescription as DialogDescriptionBase,
  DialogHeader as DialogHeaderBase,
  DialogTitle as DialogTitleBase,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import DialerSettings from './DialerSettings'
import CallingScript from './CallingScript'
import { ArrowUp, Pause, Mic, MicOff, FileText, StickyNote, X, ChevronDown, Check } from 'lucide-react'
import { Menu, MenuItem } from '@mui/material'
import Image from 'next/image'

// @ts-ignore - Twilio Voice SDK types
import { Device, Call } from '@twilio/voice-sdk'

// Type assertions for components from .jsx files
const DialogContent = DialogContentBase as any
const DialogDescription = DialogDescriptionBase as any
const DialogHeader = DialogHeaderBase as any
const DialogTitle = DialogTitleBase as any
const Button = ButtonBase as any
const Input = InputBase as any

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
  const [showScriptPanel, setShowScriptPanel] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
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
        if (activeCall) {
          try {
            activeCall.disconnect()
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

  const handleCall = async () => {
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
        toast.info('Call ended')
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
    if (activeCall) {
      activeCall.disconnect()
      setActiveCall(null)
      setCallStatus('idle')
      // Stop call duration timer
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
      setCallDuration(0)
      setIsMuted(false)
      setIsOnHold(false)
      setShowScriptPanel(false)
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
      if (isOnHold) {
        activeCall.hold(false)
        setIsOnHold(false)
      } else {
        activeCall.hold(true)
        setIsOnHold(true)
      }
    } catch (error: any) {
      console.error('Error toggling hold:', error)
      toast.error('Failed to toggle hold')
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
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

  // Reduce overlay opacity and hide close button
  useEffect(() => {
    if (open) {
      const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement
      if (overlay) {
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
      }
      
      // Hide the close button - use MutationObserver to catch it when it's added
      const hideCloseButton = () => {
        const selectors = [
          '[data-radix-dialog-content] button[aria-label="Close"]',
          '[data-radix-dialog-content] > button',
          'button[aria-label="Close"]',
          '[data-radix-dialog-content] [aria-label="Close"]',
        ]
        selectors.forEach((selector) => {
          const closeButton = document.querySelector(selector) as HTMLElement
          if (closeButton) {
            closeButton.style.display = 'none'
            closeButton.style.visibility = 'hidden'
            closeButton.style.opacity = '0'
            closeButton.style.pointerEvents = 'none'
          }
        })
      }
      
      // Try immediately
      hideCloseButton()
      
      // Try after a short delay (in case button is added asynchronously)
      const timeoutId = setTimeout(hideCloseButton, 100)
      
      // Use MutationObserver to watch for button additions
      const observer = new MutationObserver(hideCloseButton)
      const dialogContent = document.querySelector('[data-radix-dialog-content]')
      if (dialogContent) {
        observer.observe(dialogContent, {
          childList: true,
          subtree: true,
        })
      }
      
      return () => {
        clearTimeout(timeoutId)
        observer.disconnect()
      }
    }
  }, [open])

  // Add global style to hide close button
  useEffect(() => {
    if (open) {
      const style = document.createElement('style')
      style.id = 'dialer-modal-hide-close'
      style.textContent = `
        [data-radix-dialog-content] button[aria-label="Close"],
        [data-radix-dialog-content] > button {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `
      document.head.appendChild(style)
      return () => {
        const existingStyle = document.getElementById('dialer-modal-hide-close')
        if (existingStyle) {
          existingStyle.remove()
        }
      }
    }
  }, [open])

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogContent 
          className="sm:max-w-[380px] p-0 [&_button[aria-label='Close']]:!hidden [&>button]:!hidden"
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          left: 'auto',
          transform: 'none',
          margin: 0,
          maxWidth: '380px',
          width: '380px',
        }}
        onInteractOutside={(e) => {
          // Prevent closing when dialog just opened (prevents MUI Drawer conflicts)
          // or during active call
          if (dialogJustOpened.current || callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting') {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Allow escape to close unless in active call
          if (callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting') {
            e.preventDefault()
          }
        }}
        onPointerDownOutside={(e) => {
          // Prevent closing when dialog just opened (prevents MUI Drawer conflicts)
          // or during active call
          if (dialogJustOpened.current || callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting') {
            e.preventDefault()
          }
        }}
      >
        <div className="flex flex-row" style={{ minHeight: '500px', maxHeight: '80vh' }}>
          {/* Script Panel - Left Side */}
          {showScriptPanel && (
            <div className="w-80 border-r border-gray-200 flex-shrink-0">
              <CallingScript
                leadId={leadId}
                leadName={leadName}
                isExpanded={showScriptPanel}
                onClose={() => setShowScriptPanel(false)}
              />
            </div>
          )}

          {/* Main Content - Right Side */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header with Your Number - Gray Background */}
            <div className="px-4 py-3 relative" style={{ backgroundColor: '#F5F5F5', zIndex: 1, pointerEvents: 'auto' }}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'hsl(var(--brand-primary))' }}
                  >
                    <ArrowUp 
                      size={14} 
                      className="text-white"
                    />
              </div>
                  <span className="text-sm font-semibold text-gray-900">Your Number</span>
                </div>
                <div className="flex items-center justify-between relative">
                  <div className="text-base font-medium text-gray-900">
                    {selectedInternalNumber?.phone || 'No number selected'}
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
                    phoneNumbers.map((pn) => (
                      <MenuItem
                        key={pn.id}
                        onClick={() => {
                          if (pn.canBeInternalDialer) {
                            handleSetInternalNumber(pn.id)
                          }
                        }}
                        disabled={!pn.canBeInternalDialer || pn.usageType === 'internal_dialer'}
                        style={{
                          opacity: pn.canBeInternalDialer ? 1 : 0.6,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="text-sm">{pn.phone}</span>
                            {pn.agentCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {pn.firstAgent?.name || 'Agent'} {pn.agentCount > 1 ? `+${pn.agentCount - 1}` : ''}
                              </span>
            )}
          </div>
                          <div className="flex items-center gap-2">
                            {pn.usageType === 'internal_dialer' && (
                              <Check size={16} style={{ color: 'hsl(var(--brand-primary))' }} />
                            )}
                            {pn.canBeInternalDialer && pn.usageType !== 'internal_dialer' && (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>
                        </div>
                      </MenuItem>
                    ))
                  )}
                    </Menu>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-24">
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
                  {/* Pre-call UI - Only show when not in call */}
                  {(callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error') && (
                    <>

                      {/* Call Status Section - Only show when call is active */}
                      {(callStatus === 'ringing' || callStatus === 'in-call' || callStatus === 'connecting') ? (
                        <div className="space-y-4">
                          {/* Outgoing Call Header */}
                          <div className="space-y-1">
              <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: '#10b981' }}
                              />
                              <span className="text-sm font-semibold">
                                {callStatus === 'connecting' || callStatus === 'ringing' ? 'Outgoing Call' : 'Call Connected'}
                              </span>
                            </div>
                            {selectedInternalNumber && (
                              <div className="text-xs text-gray-500 ml-6">
                                {selectedInternalNumber.phone}
                              </div>
                            )}
              </div>

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
                              <div className="font-semibold text-base">{leadName || phoneNumber}</div>
                              {leadName && (
                                <div className="text-sm text-gray-500">{phoneNumber}</div>
                              )}
                              {callStatus === 'in-call' && callDuration > 0 && (
                                <div className="flex items-center justify-center gap-1 mt-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                  <span className="text-sm font-medium">{formatDuration(callDuration)}</span>
                                </div>
                              )}
                              {callStatus === 'ringing' && (
                                <div className="text-sm text-gray-500 mt-2">Calling...</div>
                              )}
                            </div>
              </div>

                          {/* Call Controls */}
                          <div className="flex items-center justify-center gap-4 py-4">
                            <button
                              onClick={handleHoldToggle}
                              className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${isOnHold
                                  ? 'bg-gray-100'
                                  : 'hover:bg-gray-50 bg-white'
                                }`}
                              disabled={!activeCall}
                              style={{
                                border: isOnHold ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                              }}
                            >
                              <Pause
                                size={20}
                                style={{
                                  color: isOnHold ? 'hsl(var(--brand-primary))' : '#6b7280'
                                }}
                              />
                              <span className="text-xs" style={{ color: isOnHold ? 'hsl(var(--brand-primary))' : '#6b7280' }}>
                                Hold
                              </span>
                            </button>
                            <button
                              onClick={handleMuteToggle}
                              className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${isMuted
                                  ? 'bg-gray-100'
                                  : 'hover:bg-gray-50 bg-white'
                                }`}
                              disabled={!activeCall}
                              style={{
                                border: isMuted ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                              }}
                            >
                              {isMuted ? (
                                <MicOff size={20} style={{ color: 'hsl(var(--brand-primary))' }} />
                              ) : (
                                <Mic size={20} style={{ color: '#6b7280' }} />
                              )}
                              <span className="text-xs" style={{ color: isMuted ? 'hsl(var(--brand-primary))' : '#6b7280' }}>
                                Mute
                              </span>
                            </button>
                            <button
                              onClick={() => setShowScriptPanel(!showScriptPanel)}
                              className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${showScriptPanel
                                  ? 'bg-gray-100'
                                  : 'hover:bg-gray-50 bg-white'
                                }`}
                              style={{
                                border: showScriptPanel ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                              }}
                            >
                              <FileText
                                size={20}
                                style={{
                                  color: showScriptPanel ? 'hsl(var(--brand-primary))' : '#6b7280'
                                }}
                              />
                              <span
                                className="text-xs"
                                style={{
                                  color: showScriptPanel ? 'hsl(var(--brand-primary))' : '#6b7280'
                                }}
                              >
                                Script
                              </span>
                            </button>
                            <button
                              onClick={() => setShowNotes(!showNotes)}
                              className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${showNotes
                                  ? 'bg-gray-100'
                                  : 'hover:bg-gray-50 bg-white'
                                }`}
                              style={{
                                border: showNotes ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                                borderStyle: 'dashed',
                              }}
                            >
                              <StickyNote
                                size={20}
                                style={{
                                  color: showNotes ? 'hsl(var(--brand-primary))' : '#6b7280'
                                }}
                              />
                              <span
                                className="text-xs"
                                style={{
                                  color: showNotes ? 'hsl(var(--brand-primary))' : '#6b7280'
                                }}
                              >
                                Take Notes
                              </span>
                            </button>
                          </div>

                          {/* End Call Button */}
                          <Button
                            onClick={handleEndCall}
                            className="w-full"
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                            }}
                          >
                    End Call
                  </Button>
                        </div>
                      ) : (
                        /* Pre-call UI - Only show when not in call */
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
                                {leadName || phoneNumber || 'Unknown Contact'}
                  </div>
                              {/* Phone Number as Label */}
                              {phoneNumber && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {phoneNumber}
                </div>
                              )}
                            </div>
                          </div>

                          {/* Create Script Button - Show if no script exists */}
                          <div className="flex w-full justify-center">
                            <Button
                              onClick={() => setShowScriptPanel(true)}
                              variant="filled"
                              className=" rounded-full py-2 px-4"
                              style={{
                                backgroundColor: '#F9F9F9',
                                // borderColor: '#e5e7eb',
                                color: '#374151',
                                fontSize: '14px',
                                height: 'auto',
                              }}
                            >
                              <FileText size={14} className="mr-1.5" />
                              Create Script
                            </Button>
                          </div>
                        </>
              )}
            </>
          )}
                </div>
              )}
            </div>

            {/* Fixed Start Call Button at Bottom */}
            {(callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error') && (
              <div
                className="w-full px-6 py-4 border-t border-gray-200 "
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
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
      </DialogContent>
    </Dialog>
  )
}

