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
  
  // Global error handler for uncaught Twilio errors
  useEffect(() => {
    if (!open) return
    
    const handleError = (event: ErrorEvent) => {
      const message = event.message || ''
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:48',message:'Global error caught',data:{message,error:event.error?.message,filename:event.filename,lineno:event.lineno},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:67',message:'Unhandled promise rejection',data:{reason:event.reason?.message || event.reason,type:typeof event.reason},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      dialogJustOpened.current = true
      // Reset flag after a short delay to allow dialog to fully open
      setTimeout(() => {
        dialogJustOpened.current = false
      }, 300)
      checkDialerNumber()
    } else {
      // Cleanup when modal closes
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

    return () => {
      if (device) {
        try {
          device.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:168',message:'Requesting access token',data:{hasToken:!!token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:184',message:'Token request failed',data:{status:response.status,message:data.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:192',message:'Token received',data:{hasToken:!!data.token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:201',message:'Creating Twilio Device',data:{tokenLength:data.token.length,tokenPreview},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      let twilioDevice: Device
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:260',message:'About to create Device',data:{tokenLength:data.token.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        twilioDevice = new Device(data.token, {
          logLevel: 1, // DEBUG level (0=TRACE, 1=DEBUG, 2=INFO, 3=WARN, 4=ERROR, 5=SILENT)
          // Disable automatic error alerts
          allowIncomingWhileBusy: false,
        } as any)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:270',message:'Device created, checking state',data:{state:twilioDevice.state,isRegistered:(twilioDevice as any).isRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      } catch (deviceError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:273',message:'Device creation error',data:{errorMessage:deviceError.message,errorName:deviceError.name,errorStack:deviceError.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        throw new Error(`Failed to create device: ${deviceError.message}`)
      }

      // Set a timeout for device registration (10 seconds)
      const registrationTimeout = setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:266',message:'Device registration timeout check',data:{deviceRegistered,deviceState:twilioDevice.state,isRegistered:(twilioDevice as any).isRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        if (!deviceRegistered) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:269',message:'Device registration timeout - not registered',data:{deviceState:twilioDevice.state,isRegistered:(twilioDevice as any).isRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          toast.error('Device registration timed out. Please check your connection and try again.')
          setInitializing(false)
        }
      }, 10000)

      twilioDevice.on('registered', () => {
        console.log('Twilio Device registered')
        clearTimeout(registrationTimeout)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:311',message:'Device registered successfully',data:{state:twilioDevice.state,isRegistered:(twilioDevice as any).isRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:285',message:'Token will expire soon',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.log('Token will expire soon, refreshing...')
      })
      
      // Check device state periodically to see if it's trying to register
      let checkCount = 0
      const stateCheckInterval = setInterval(() => {
        checkCount++
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:360',message:'Device state check',data:{state:twilioDevice.state,isRegistered:(twilioDevice as any).isRegistered,deviceRegistered,checkCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        // Check if device state changed (might indicate registration attempt)
        if (twilioDevice.state === 'registering' || (twilioDevice.state === 'registered' && !deviceRegistered)) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:368',message:'Device state changed',data:{state:twilioDevice.state,isRegistered:(twilioDevice as any).isRegistered,deviceRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
        }
        
        // Update deviceRegistered state if device is registered
        if ((twilioDevice as any).isRegistered && !deviceRegistered) {
          clearInterval(stateCheckInterval)
          clearTimeout(registrationTimeout)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:376',message:'Device registered via state check',data:{state:twilioDevice.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:330',message:'Device unregistered',data:{reason,state:twilioDevice.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setDeviceRegistered(false)
      })

      twilioDevice.on('error', (error: any) => {
        console.error('Twilio Device error:', error)
        clearTimeout(registrationTimeout)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:322',message:'Device error event',data:{errorCode:error.code,errorMessage:error.message,errorName:error.name,errorTwilioError:error.twilioError?.message,errorTwilioCode:error.twilioError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:343',message:'Device warning event',data:{warningName:name,warningData:data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      })

      twilioDevice.on('incoming', (call: Call) => {
        console.log('Incoming call:', call)
        // Handle incoming calls if needed
      })


      setDevice(twilioDevice)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:404',message:'Device initialized and set, attempting explicit registration',data:{hasDevice:!!twilioDevice,state:twilioDevice.state,isRegistered:(twilioDevice as any).isRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      // Explicitly register the device (required by some browsers for audio access)
      // This is called after user interaction (modal open), so it should work
      try {
        twilioDevice.register()
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:411',message:'Explicit device.register() called',data:{state:twilioDevice.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      } catch (registerError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:414',message:'Error calling device.register()',data:{errorMessage:registerError.message,errorName:registerError.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.error('Error registering device:', registerError)
      }
      
      // Note: Don't set initializing to false here - wait for 'registered' event or timeout
    } catch (error: any) {
      console.error('Error initializing device:', error)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:310',message:'Error initializing device',data:{errorMessage:error.message,errorName:error.name,errorStack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:325',message:'Call attempted before device registered',data:{hasDevice:!!device,deviceRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:340',message:'Starting call',data:{phoneNumber,hasDevice:!!device,deviceRegistered},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:350',message:'Calling device.connect',data:{phoneNumber,userId,hasAgencyId:!!agencyId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:361',message:'Call connected',data:{hasCall:!!call},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      setActiveCall(call)
      setCallStatus('ringing')

      call.on('accept', () => {
        setCallStatus('in-call')
        toast.success('Call connected')
      })

      call.on('disconnect', () => {
        setCallStatus('ended')
        setActiveCall(null)
        toast.info('Call ended')
      })

      call.on('cancel', () => {
        setCallStatus('ended')
        setActiveCall(null)
        toast.info('Call canceled')
      })

      call.on('error', (error: any) => {
        console.error('Call error:', error)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DialerModal.tsx:377',message:'Call error event',data:{errorCode:error.code,errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
    }
  }

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

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Only close if dialog is being closed (isOpen === false)
        // Ignore if dialog just opened (prevents immediate close)
        if (!isOpen && !dialogJustOpened.current) {
          onClose()
        }
      }} 
      modal={false}
    >
      <DialogContent 
        className="sm:max-w-[500px]"
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
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <DialogTitle>Twilio Dialer</DialogTitle>
              <DialogDescription>
                {leadName ? `Calling ${leadName}` : 'Make a call directly from your browser'}
              </DialogDescription>
            </div>
            {hasDialerNumber && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <DialerSettings />
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
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
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge()}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={callStatus === 'in-call' || callStatus === 'connecting' || callStatus === 'ringing'}
                />
              </div>

              <div className="flex gap-2">
                {callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error' ? (
                  <Button onClick={handleCall} className="flex-1" disabled={!device || !deviceRegistered || initializing}>
                    {initializing ? 'Initializing...' : !deviceRegistered ? 'Connecting...' : 'Call'}
                  </Button>
                ) : (
                  <Button onClick={handleEndCall} className="flex-1" variant="destructive">
                    End Call
                  </Button>
                )}
              </div>

              {callStatus === 'in-call' && (
                <div className="text-center py-4">
                  <div className="text-lg font-semibold text-green-600">Call in progress...</div>
                  <div className="text-sm text-gray-500 mt-2">
                    You can close this dialog - the call will continue
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
