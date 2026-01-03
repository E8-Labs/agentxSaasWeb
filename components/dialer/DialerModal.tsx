'use client'

import React, { useEffect, useState, useRef, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button as ButtonBase } from '../ui/button'
import { Input as InputBase } from '../ui/input'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import DialerSettings from './DialerSettings'
import CallingScript from './CallingScript'
import CallNotesWindow from './CallNotesWindow'
import SmsTemplatePanel from './SmsTemplatePanel'
import EmailTemplatePanel from './EmailTemplatePanel'
import { getGmailAccounts } from '../pipeline/TempleteServices'
import ClaimNumber from '../dashboard/myagentX/ClaimNumber'
import { ArrowUp, Pause, Mic, MicOff, FileText, StickyNote, X, ChevronDown, Check, Phone, Mail, MessageSquare, MoreVertical, Pencil, Loader2, MessageCircleMore } from 'lucide-react'
import { Menu, MenuItem } from '@mui/material'
import Image from 'next/image'
import { formatPhoneNumber, getAgentsListImage } from '@/utilities/agentUtilities'
import {
  selectPhoneNumbers,
  selectSelectedInternalNumber,
  selectEmailTemplates,
  selectSmsTemplates,
  selectSelectedTemplate,
  selectEmailAccounts,
  selectSelectedEmailAccount,
  selectShouldRefetchPhoneNumbers,
  selectShouldRefetchEmailTemplates,
  selectShouldRefetchSmsTemplates,
  selectShouldRefetchEmailAccounts,
  selectCallStatus,
  selectLeadData,
  selectIsDialerOpen,
  selectIsMinimized,
  selectDialerPosition,
  updateCallStatus,
  updateDeviceState,
  setPhoneNumbers,
  setEmailTemplates,
  setSmsTemplates,
  setEmailAccounts,
  updateCallState,
  updateUIPanel,
  setSelectedTemplate,
  setSelectedInternalNumber,
  setSelectedEmailAccount,
  setSelectedUser,
  setLoadingState,
  toggleMinimized,
  setMinimized,
  updatePosition,
  openDialer,
  showIncomingCallBanner,
  hideIncomingCallBanner,
} from '@/store/slices/dialerSlice'

// @ts-ignore - Twilio Voice SDK types
import { Device, Call } from '@twilio/voice-sdk'

// Type assertions for components from .jsx files
const Button = ButtonBase as any
const Input = InputBase as any

// Simulation mode - set via environment variable
const SIMULATE_CALL_FLOW = process.env.NEXT_PUBLIC_SIMULATE_DIALER === 'true'

// Module-level store to persist device and call across component remounts
// This is necessary because refs are lost when the component unmounts
// Use window object to persist across module reloads (Next.js HMR can reload modules)
let globalDeviceStore: Device | null = null
let globalCallStore: Call | null = null
let globalIncomingCallStore: Call | null = null
let globalHasInitialized = false
let globalIsInitializing = false

// Helper functions to get/set from window (survives module reloads)
const getGlobalDevice = (): Device | null => {
  if (typeof window !== 'undefined' && (window as any).__dialerGlobalDevice) {
    return (window as any).__dialerGlobalDevice
  }
  return globalDeviceStore
}

const setGlobalDevice = (device: Device | null) => {
  globalDeviceStore = device
  if (typeof window !== 'undefined') {
    if (device) {
      // Store device in window - this persists across remounts and navigation
      (window as any).__dialerGlobalDevice = device
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:79', message: 'setGlobalDevice: Storing device in window', data: { deviceState: (device as any).state, hasWindowDevice: !!(window as any).__dialerGlobalDevice }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
      // #endregion
    } else {
      // CRITICAL: Never clear the window store during unmount/remount cycles
      // Only clear if we're explicitly destroying the device (user closed dialer)
      // Check if there's an existing device in the window store
      const existingDevice = (window as any).__dialerGlobalDevice
      if (existingDevice) {
        // Check if device is still valid (not destroyed)
        try {
          const deviceState = (existingDevice as any).state
          // NEVER clear if device is registered, registering, or in any active state
          // This preserves the device across navigation remounts
          if (deviceState === 'registered' || deviceState === 'registering' || deviceState === 'busy') {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:92', message: 'setGlobalDevice: Preserving device in window (not clearing)', data: { deviceState, reason: 'Device is active - preserving across remount', timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
            // #endregion
            // Keep the existing device in window store - don't clear
            return
          }
        } catch (e) {
          // Device might be destroyed - but still preserve it in case it's just a state issue
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:102', message: 'setGlobalDevice: Error checking device state, preserving anyway', data: { error: String(e), reason: 'Preserving device in window store despite error' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
          // #endregion
          // Preserve device even if we can't check its state
          return
        }
      }
      // Only clear if we're absolutely sure we want to destroy the device
      // For now, we'll be conservative and NOT clear during setGlobalDevice(null) calls
      // The device will only be cleared when explicitly destroyed in cleanup
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:110', message: 'setGlobalDevice: NOT clearing window store (preserving device)', data: { reason: 'Preserving device across remounts - only clear on explicit destroy' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
      // #endregion
      // Don't clear - preserve device in window store
      // Only update module-level store
      return
    }
  }
}

const getGlobalCall = (): Call | null => {
  if (typeof window !== 'undefined' && (window as any).__dialerGlobalCall) {
    return (window as any).__dialerGlobalCall
  }
  return globalCallStore
}

const setGlobalCall = (call: Call | null) => {
  globalCallStore = call
  if (typeof window !== 'undefined') {
    (window as any).__dialerGlobalCall = call
  }
}

const getGlobalHasInitialized = (): boolean => {
  if (typeof window !== 'undefined' && (window as any).__dialerGlobalHasInitialized !== undefined) {
    return (window as any).__dialerGlobalHasInitialized
  }
  return globalHasInitialized
}

const setGlobalHasInitialized = (value: boolean) => {
  globalHasInitialized = value
  if (typeof window !== 'undefined') {
    (window as any).__dialerGlobalHasInitialized = value
  }
}

const getGlobalIsInitializing = (): boolean => {
  if (typeof window !== 'undefined' && (window as any).__dialerGlobalIsInitializing !== undefined) {
    return (window as any).__dialerGlobalIsInitializing
  }
  return globalIsInitializing
}

const setGlobalIsInitializing = (value: boolean) => {
  globalIsInitializing = value
  if (typeof window !== 'undefined') {
    (window as any).__dialerGlobalIsInitializing = value
  }
}

type CallStatus = 'idle' | 'requesting-mic' | 'connecting' | 'ringing' | 'in-call' | 'ended' | 'error' | 'incoming-ringing'

interface DialerModalProps {
  open: boolean
  onClose: () => void
  initialPhoneNumber?: string
  leadId?: number
  leadName?: string
}

function DialerModal({
  open,
  onClose,
  initialPhoneNumber = '',
  leadId,
  leadName,
}: DialerModalProps) {
  const dispatch = useDispatch()
  
  // #region agent log
  const mountTime = useRef(Date.now())
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detect if this is a page refresh (not just navigation)
      // Use Performance API to detect page reload
      let isPageRefresh = false
      let timeSinceNavigation: number = Infinity
      try {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        if (navEntries.length > 0) {
          // 'reload' = page refresh, 'navigate' = initial load, 'back_forward' = browser back/forward
          isPageRefresh = navEntries[0].type === 'reload'
          // Calculate time since navigation for logging
          const navigationTimestamp = (window as any).__lastNavigationTime
          timeSinceNavigation = navigationTimestamp ? Date.now() - navigationTimestamp : Infinity
        } else {
          // Fallback: check if there's a navigation timestamp
          const navigationTimestamp = (window as any).__lastNavigationTime
          timeSinceNavigation = navigationTimestamp ? Date.now() - navigationTimestamp : Infinity
          isPageRefresh = timeSinceNavigation > 2000 // More than 2 seconds = likely page refresh
        }
      } catch (e) {
        // Performance API not available, use fallback
        const navigationTimestamp = (window as any).__lastNavigationTime
        timeSinceNavigation = navigationTimestamp ? Date.now() - navigationTimestamp : Infinity
        isPageRefresh = timeSinceNavigation > 2000
      }
      
      // Mark this navigation time for future checks
      ;(window as any).__lastNavigationTime = Date.now()
      
      const globalDevice = getGlobalDevice()
      const globalCall = getGlobalCall()
      const windowDevice = typeof window !== 'undefined' ? (window as any).__dialerGlobalDevice : null
      const windowCall = typeof window !== 'undefined' ? (window as any).__dialerGlobalCall : null
      
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:68', message: 'DialerModal component MOUNTED', data: { open, initialPhoneNumber, leadId, leadName, pathname: window.location.pathname, hasGlobalDevice: !!globalDevice, hasGlobalCall: !!globalCall, hasWindowDevice: !!windowDevice, hasWindowCall: !!windowCall, deviceState: globalDevice ? (globalDevice as any).state : null, isPageRefresh, timeSinceNavigation, mountTime: mountTime.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
      
      // CRITICAL: On page refresh, clear window store and reset state
      // Twilio connections are lost on page refresh, so we should start fresh
      if (isPageRefresh) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:82', message: 'Page refresh detected - clearing window store and resetting dialer state', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
        // #endregion
        
        // Clear window store
        if (typeof window !== 'undefined') {
          (window as any).__dialerGlobalDevice = null
          ;(window as any).__dialerGlobalCall = null
          ;(window as any).__dialerGlobalHasInitialized = false
          ;(window as any).__dialerGlobalIsInitializing = false
        }
        
        // Clear module-level store
        globalDeviceStore = null
        globalCallStore = null
        globalHasInitialized = false
        globalIsInitializing = false
        
        // Reset refs
        deviceRef.current = null
        activeCallRef.current = null
        hasInitializedRef.current = false
        isInitializingRef.current = false
        
        // Reset state
        setDevice(null)
        setActiveCall(null)
        
        // Reset Redux state via dispatch
        dispatch(updateCallStatus('idle'))
        dispatch(updateDeviceState({ deviceRegistered: false, initializing: false }))
        
        return // Don't restore anything on page refresh
      }
      
      // CRITICAL: Restore device from window store on mount if it exists (only on navigation, not page refresh)
      if (windowDevice && !device && !deviceRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:115', message: 'Restoring device from window store on mount (navigation, not refresh)', data: { deviceState: (windowDevice as any).state, isRegistered: (windowDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
        // #endregion
        deviceRef.current = windowDevice
        setDevice(windowDevice)
      }
      
      // CRITICAL: Restore call from window store on mount if it exists (only on navigation, not page refresh)
      if (windowCall && !activeCall && !activeCallRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:125', message: 'Restoring call from window store on mount (navigation, not refresh)', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
        // #endregion
        activeCallRef.current = windowCall
        setActiveCall(windowCall)
      }
    }
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:75', message: 'DialerModal props changed', data: { open, initialPhoneNumber, leadId, leadName, pathname: window.location.pathname, timeSinceMount: Date.now() - mountTime.current, hasGlobalDevice: !!getGlobalDevice(), hasGlobalCall: !!getGlobalCall() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
    }
  }, [open, initialPhoneNumber, leadId, leadName]);
  // #endregion
  
  // Redux state
  const reduxCallStatus = useSelector(selectCallStatus)
  const reduxIsDialerOpen = useSelector(selectIsDialerOpen) // Check Redux state, not just local prop
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:78', message: 'Redux selector: callStatus', data: { reduxCallStatus, open }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  }
  // #endregion
  const phoneNumbers = useSelector(selectPhoneNumbers)
  const selectedInternalNumber = useSelector(selectSelectedInternalNumber)
  const emailTemplates = useSelector(selectEmailTemplates)
  const smsTemplates = useSelector(selectSmsTemplates)
  const selectedTemplate = useSelector(selectSelectedTemplate)
  const emailAccounts = useSelector(selectEmailAccounts)
  const selectedEmailAccount = useSelector(selectSelectedEmailAccount)
  const leadData = useSelector(selectLeadData)
  const shouldRefetchPhoneNumbers = useSelector(selectShouldRefetchPhoneNumbers)
  const shouldRefetchEmailTemplates = useSelector(selectShouldRefetchEmailTemplates)
  const shouldRefetchSmsTemplates = useSelector(selectShouldRefetchSmsTemplates)
  const shouldRefetchEmailAccounts = useSelector(selectShouldRefetchEmailAccounts)
  
  // Use Redux callStatus, but keep local for immediate updates
  const [callStatus, setCallStatus] = useState<CallStatus>(reduxCallStatus)
  
  // Refs MUST be declared before useState that uses them
  // Store device and call in refs to persist across re-renders (backup to state)
  // Also sync with module-level store to persist across remounts
  const deviceRef = useRef<Device | null>(getGlobalDevice())
  const activeCallRef = useRef<Call | null>(getGlobalCall())
  const dialogJustOpened = useRef(false)
  const isClosingRef = useRef(false)
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const callDurationRef = useRef<number>(0) // Track call duration locally for interval
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitializedRef = useRef(getGlobalHasInitialized()) // Track if dialer has been initialized
  const isInitializingRef = useRef(getGlobalIsInitializing()) // Prevent concurrent initialization
  const initializationFailedRef = useRef(false) // Track if initialization failed to prevent retry loop
  const dragStartPos = useRef<{ x: number; y: number; mouseX?: number; mouseY?: number }>({ x: 0, y: 0 })
  
  // Local state for non-serializable objects and UI-only state
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || leadData.phoneNumber || '')
  // Initialize from window/global store or refs if they exist (persist across remounts/navigation)
  // This ensures device and call persist across page changes and component remounts
  const [device, setDevice] = useState<Device | null>(getGlobalDevice() || deviceRef.current)
  const [activeCall, setActiveCall] = useState<Call | null>(getGlobalCall() || activeCallRef.current)
  
  // Incoming call state
  const [incomingCall, setIncomingCall] = useState<Call | null>(null)
  const [incomingCallerInfo, setIncomingCallerInfo] = useState<{
    from: string
    to: string
    callerName?: string
  } | null>(null)
  
  // Sync refs and window/global store with state when state changes (but preserve if state is lost)
  useEffect(() => {
    if (device) {
      deviceRef.current = device
      setGlobalDevice(device) // Persist to window and module-level store
    } else if (deviceRef.current && !device) {
      // State was lost but ref has it - restore from ref
      setDevice(deviceRef.current)
    } else {
      // Check window/global store on every render to restore if module was reloaded
      const globalDevice = getGlobalDevice()
      if (globalDevice && !device && !deviceRef.current) {
        // Component remounted or module reloaded - restore from window/global store
        deviceRef.current = globalDevice
        setDevice(globalDevice)
      }
    }
  }, [device])
  
  useEffect(() => {
    if (activeCall) {
      activeCallRef.current = activeCall
      setGlobalCall(activeCall) // Persist to window and module-level store
    } else if (activeCallRef.current && !activeCall) {
      // State was lost but ref has it - restore from ref
      setActiveCall(activeCallRef.current)
    } else {
      // Check window/global store on every render to restore if module was reloaded
      const globalCall = getGlobalCall()
      if (globalCall && !activeCall && !activeCallRef.current) {
        // Component remounted or module reloaded - restore from window/global store
        activeCallRef.current = globalCall
        setActiveCall(globalCall)
      }
    }
  }, [activeCall])
  
  // Sync initialization flags with window/module-level store
  useEffect(() => {
    setGlobalHasInitialized(hasInitializedRef.current)
  }, [hasInitializedRef.current])
  
  useEffect(() => {
    setGlobalIsInitializing(isInitializingRef.current)
  }, [isInitializingRef.current])
  
  const [numberDropdownAnchor, setNumberDropdownAnchor] = useState<null | HTMLElement>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendingSms, setSendingSms] = useState(false)
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)
  const [showClaimNumberModal, setShowClaimNumberModal] = useState(false)
  
  // Sync Redux callStatus to local state
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:138', message: 'Sync effect: Redux callStatus changed', data: { reduxCallStatus, localCallStatus: callStatus, open, hasDevice: !!device, hasActiveCall: !!activeCall }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
    setCallStatus(reduxCallStatus)
  }, [reduxCallStatus])
  
  // Sync local callStatus changes to Redux
  const updateCallStatusInRedux = (status: CallStatus) => {
    setCallStatus(status)
    dispatch(updateCallStatus(status))
  }
  
  // Get Redux state for UI panels and other state
  const dialerState = useSelector((state: any) => state.dialer)
  const isMinimized = useSelector(selectIsMinimized)
  const dialerPosition = useSelector(selectDialerPosition)
  const showScriptPanel = dialerState.showScriptPanel
  const showNotes = dialerState.showNotes
  const showEmailPanel = dialerState.showEmailPanel
  const showSmsPanel = dialerState.showSmsPanel
  const callDuration = dialerState.callDuration
  const isMuted = dialerState.isMuted
  const isOnHold = dialerState.isOnHold
  const callEndedInError = dialerState.callEndedInError
  const phoneNumbersLoading = dialerState.phoneNumbersLoading
  const templatesLoading = dialerState.templatesLoading
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const collapsedRef = useRef<HTMLDivElement>(null)
  
  // Navigation detection for auto-collapse
  const pathnameRef = useRef<string | null>(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      if (pathnameRef.current && pathnameRef.current !== currentPath) {
        // Navigation detected - auto-collapse if call is active
        if ((callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting') && !isMinimized) {
          dispatch(setMinimized(true))
        }
      }
      pathnameRef.current = currentPath
    }
  }, [typeof window !== 'undefined' ? window.location.pathname : null, callStatus, isMinimized, dispatch])
  
  // Also listen to popstate for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      if ((callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting') && !isMinimized) {
        dispatch(setMinimized(true))
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [callStatus, isMinimized, dispatch])
  const emailAccountsLoading = dialerState.emailAccountsLoading
  const initializing = dialerState.initializing
  const checkingDialerNumber = dialerState.checkingDialerNumber
  const hasDialerNumber = dialerState.hasDialerNumber
  const deviceRegistered = dialerState.deviceRegistered
  const selectedUser = dialerState.selectedUser
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:175', message: 'Initialization state check', data: { initializing, deviceRegistered, hasDialerNumber, hasDevice: !!device, checkingDialerNumber, open }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
    }
  }, [initializing, deviceRegistered, hasDialerNumber, device, checkingDialerNumber, open]);
  // #endregion
  
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
        updateCallStatusInRedux('error')
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

  // Initialize device when modal opens (only once per open session)
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:223', message: 'Init effect: open changed', data: { open, reduxCallStatus, localCallStatus: callStatus, hasInitialized: hasInitializedRef.current, hasDevice: !!device, hasActiveCall: !!activeCall, deviceRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion
    if (open) {
      // Check if we already have a device and it's registered - if so, don't re-initialize
      // First check window/global store (persists across remounts), then refs, then state
      const existingDevice = getGlobalDevice() || device || deviceRef.current
      // Check device state directly (more reliable than Redux state on re-render)
      const isDeviceRegistered = existingDevice && (existingDevice as any).state === 'registered'
      const isDeviceReady = existingDevice && (deviceRegistered || isDeviceRegistered)
      
      // If we have a device in the window/global store but not in state/refs, restore it
      const globalDevice = getGlobalDevice()
      if (globalDevice && !device && !deviceRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:243', message: 'Restoring device from global store after remount', data: { deviceState: (globalDevice as any).state, isRegistered: (globalDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        deviceRef.current = globalDevice
        setDevice(globalDevice)
      }
      
      // If we have a call in the window/global store but not in state/refs, restore it
      const globalCall = getGlobalCall()
      if (globalCall && !activeCall && !activeCallRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:253', message: 'Restoring call from global store after remount', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        activeCallRef.current = globalCall
        setActiveCall(globalCall)
      }
      
      // Only initialize if we haven't already initialized AND we don't have a working device
      if (!hasInitializedRef.current && !isInitializingRef.current && !isDeviceReady) {
        console.log('[DialerModal] Modal opened, initializing for first time')
        isInitializingRef.current = true
      dialogJustOpened.current = true
      isClosingRef.current = false

      // Reset position to default when modal opens (if it was closed)
      if (dialerPosition.x !== null || dialerPosition.y !== null) {
        dispatch(updatePosition({ x: null, y: null }))
        rightPositionRef.current = null
      }
      
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
        
        hasInitializedRef.current = true
        isInitializingRef.current = false
      
      return () => {
        clearTimeout(timeoutId)
      }
      } else if (isDeviceReady) {
        // Device already exists and is ready - just mark as initialized, don't re-check
        console.log('[DialerModal] Device already ready, skipping re-initialization', {
          hasDevice: !!existingDevice,
          deviceState: existingDevice ? (existingDevice as any).state : 'none',
          deviceRegistered,
          hasInitialized: hasInitializedRef.current
        })
        if (!hasInitializedRef.current) {
          hasInitializedRef.current = true
        }
        // Restore device from ref if state was lost
        if (!device && deviceRef.current) {
          setDevice(deviceRef.current)
        }
        // Restore call from ref if state was lost
        if (!activeCall && activeCallRef.current) {
          setActiveCall(activeCallRef.current)
        }
        // Ensure deviceRegistered is set in Redux if device is actually registered
        if (isDeviceRegistered && !deviceRegistered) {
          dispatch(updateDeviceState({ deviceRegistered: true }))
        }
        // Update phone number if needed
        if (initialPhoneNumber && initialPhoneNumber !== phoneNumber) {
          setPhoneNumber(initialPhoneNumber)
      }
    } else {
        // Already initialized, just update phone number if needed
        if (initialPhoneNumber && initialPhoneNumber !== phoneNumber) {
          setPhoneNumber(initialPhoneNumber)
        }
      }
    } else {
      // Only cleanup if we're actually closing (not just re-rendering or remounting)
      // CRITICAL: Check Redux state, not just local prop - during remount, prop might be false but Redux says open
      // CRITICAL: Never cleanup if there's an active call - preserve call connection
      const globalCall = getGlobalCall()
      const hasActiveCall = activeCall || activeCallRef.current || globalCall
      const currentCallStatus = reduxCallStatus || callStatus
      const isCallActive = hasActiveCall && ['in-call', 'ringing', 'connecting'].includes(currentCallStatus)
      
      // #region agent log
      const globalDevice = getGlobalDevice()
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:363', message: 'Cleanup check: open=false', data: { open, reduxIsDialerOpen, reduxCallStatus, localCallStatus: callStatus, hasActiveCall, isCallActive, isClosing: isClosingRef.current, dialogJustOpened: dialogJustOpened.current, hasGlobalDevice: !!globalDevice, hasGlobalCall: !!globalCall }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G' }) }).catch(() => { });
      // #endregion
      
      // CRITICAL: Don't cleanup if there's a device in the window/global store (persists across remounts)
      // This handles the case where Redux state hasn't been restored yet during navigation
      if (globalDevice) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:375', message: 'Skipping cleanup: Device exists in global store (preserving across remount)', data: { open, reduxIsDialerOpen, hasGlobalDevice: !!globalDevice, deviceState: (globalDevice as any)?.state }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        return // Don't cleanup - device should persist
      }
      
      // DON'T cleanup if Redux says dialer is still open (might be remounting during navigation)
      // Only cleanup if Redux also says it's closed AND we're actually closing (not just remounting)
      if (reduxIsDialerOpen) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:384', message: 'Skipping cleanup: Redux says dialer is open (likely remounting)', data: { open, reduxIsDialerOpen }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        return // Don't cleanup - dialer should stay open
      }
      
      if ((isClosingRef.current || !dialogJustOpened.current) && !isCallActive) {
        console.log('[DialerModal] Modal closing, but keeping device registered for incoming calls')
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:291', message: 'Modal closing - preserving device for incoming calls', data: { reduxCallStatus, localCallStatus: callStatus, hasDevice: !!device }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion

        // Clear simulation
        if (simulationTimeoutRef.current) {
          clearTimeout(simulationTimeoutRef.current)
          simulationTimeoutRef.current = null
        }

        // IMPORTANT: Do NOT destroy the device when modal closes
        // The device must stay registered to receive incoming calls
        // Only destroy on explicit cleanup (logout, refresh, etc.)
        // The device will remain registered in the background
        console.log('[DialerModal] Device preserved for incoming calls - not destroying')
        
        // Don't reset device state - keep it registered for incoming calls
        // Only reset call status to idle (not device registration)
        if (!isCallActive) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:308', message: 'Resetting call status to idle, but keeping device registered', data: { reduxCallStatus, localCallStatus: callStatus, deviceRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
          // #endregion
          // Keep deviceRegistered as true - device stays registered for incoming calls
          // Only reset call status
          updateCallStatusInRedux('idle')
          // Don't reset initialization flags - device is still initialized and registered
        } else {
          console.log('[DialerModal] Preserving device and call state - active call in progress')
        }
      } else if (isCallActive) {
        console.log('[DialerModal] Modal closing prevented - active call in progress, preserving connection')
        // Keep device and call alive - don't cleanup
      }
    }
  }, [open, dispatch, hasDialerNumber, initialPhoneNumber, phoneNumber, reduxCallStatus, callStatus, device, activeCall, deviceRegistered])

  // Initialize device only after we confirm we have a dialer number
  // Only initialize once per session
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:358', message: 'Device init effect: checking conditions', data: { open, hasDialerNumber, hasDevice: !!device, initializing, checkingDialerNumber, hasInitialized: hasInitializedRef.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
    // #endregion
    
    // If initializing is stuck at true but we don't have a device, reset it
    // BUT only if initialization is NOT actually in progress (check isInitializingRef)
    if (open && hasDialerNumber && !device && initializing && !checkingDialerNumber && hasInitializedRef.current && !isInitializingRef.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:365', message: 'Resetting stuck initializing flag', data: { initializing, hasDevice: !!device, hasInitialized: hasInitializedRef.current, isInitializing: isInitializingRef.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
      // #endregion
      dispatch(setLoadingState({ key: 'initializing', value: false }))
      return
    }
    
    if (open && hasDialerNumber && !device && !initializing && !checkingDialerNumber && hasInitializedRef.current && !initializationFailedRef.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:373', message: 'Calling initializeDevice', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
      // #endregion
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        if (!device && !initializationFailedRef.current) { // Double check device wasn't created and initialization didn't fail
        initializeDevice()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasDialerNumber, device, initializing, checkingDialerNumber, dispatch])

  // Fetch phone numbers when hasDialerNumber becomes true (only if not already fetched)
  useEffect(() => {
    if (open && hasDialerNumber && phoneNumbers.length === 0 && hasInitializedRef.current) {
      fetchPhoneNumbersWithAgents()
    }
  }, [open, hasDialerNumber, phoneNumbers.length, shouldRefetchPhoneNumbers])

  // Get user data for template popups
  useEffect(() => {
    if (open && !selectedUser) {
      try {
        const userStr = localStorage.getItem('User')
        if (userStr) {
          const userData = JSON.parse(userStr)
          dispatch(setSelectedUser(userData?.user || userData))
        }
      } catch (e) {
        console.error('Error parsing User from localStorage:', e)
      }
    }
  }, [open, selectedUser, dispatch])

  const checkDialerNumber = async () => {
    try {
      dispatch(setLoadingState({ key: 'checkingDialerNumber', value: true }))
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
        dispatch(updateDeviceState({ hasDialerNumber: false, checkingDialerNumber: false }))
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
        dispatch(updateDeviceState({ hasDialerNumber: hasDialer, checkingDialerNumber: false }))
        if (!hasDialer) {
          // Don't show error toast here - let the UI show the message
        }
      } else {
        dispatch(updateDeviceState({ hasDialerNumber: false, checkingDialerNumber: false }))
      }
    } catch (error) {
      console.error('Error checking dialer number:', error)
      dispatch(updateDeviceState({ hasDialerNumber: false, checkingDialerNumber: false }))
    }
  }

  // Fetch phone numbers with agent assignments
  const fetchPhoneNumbersWithAgents = async () => {
    // Check if we should refetch (cache is stale or empty)
    if (!shouldRefetchPhoneNumbers && phoneNumbers.length > 0) {
      return // Use cached data
    }
    
    try {
      dispatch(setLoadingState({ key: 'phoneNumbers', value: true }))
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
        dispatch(setLoadingState({ key: 'phoneNumbers', value: false }))
        return
      }

      const response = await fetch('/api/dialer/phone-numbers/with-agents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.status && data.data) {
        // Find and set the internal dialer number
        const internalNumber = data.data.find((pn: any) => pn.usageType === 'internal_dialer')
        dispatch(setPhoneNumbers({
          phoneNumbers: data.data,
          selectedInternalNumber: internalNumber || null,
          timestamp: Date.now(),
        }))
      }
    } catch (error) {
      console.error('Error fetching phone numbers with agents:', error)
      dispatch(setLoadingState({ key: 'phoneNumbers', value: false }))
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
    if (initializing || isInitializingRef.current || initializationFailedRef.current) return
    if (!hasDialerNumber) {
      // Don't initialize if no dialer number is configured
      return
    }

    try {
      isInitializingRef.current = true
      initializationFailedRef.current = false // Reset failure flag on new attempt
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:545', message: 'Setting initializing=true', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
      // #endregion
      dispatch(setLoadingState({ key: 'initializing', value: true }))
      // Try multiple ways to get the token
      let token = localStorage.getItem('token')
      if (!token) {
        try {
          const userStr = localStorage.getItem('User')
          if (userStr) {
            const userData = JSON.parse(userStr)
            token = userData?.token //|| userData?.user?.token
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

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      let data: any = {}
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError)
          const text = await response.text()
          console.error('Response text:', text.substring(0, 200))
          throw new Error('Invalid JSON response from server')
        }
      } else {
        // Response is not JSON (likely HTML error page)
        const text = await response.text()
        console.error('Non-JSON response received:', text.substring(0, 200))
        throw new Error(`Server returned ${response.status} ${response.statusText}. Please check your API endpoint.`)
      }

      if (!response.ok) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:184', message: 'Token request failed', data: { status: response.status, message: data.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        if (response.status === 409) {
          dispatch(updateDeviceState({ hasDialerNumber: false }))
          toast.error('No internal dialer number set. Please configure one in settings.')
        } else {
          toast.error(data.message || 'Failed to get access token')
        }
        dispatch(setLoadingState({ key: 'initializing', value: false }))
        isInitializingRef.current = false
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
        accountSid: any
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
            accountSid: payload.iss, // JWT issuer is the Account SID
            exp: payload.exp,
            iat: payload.iat,
          }
          // Log Twilio account info for debugging
          console.log('[DialerModal] Access Token Details:', {
            accountSid: payload.iss,
            identity: payload.grants?.identity,
            twimlAppSid: payload.grants?.voice?.outgoing?.application_sid,
          })
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:981', message: 'H3,H4: Access token decoded on frontend', data: { accountSid: payload.iss, identity: payload.grants?.identity, twimlAppSid: payload.grants?.voice?.outgoing?.application_sid, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H3,H4' }) }).catch(() => { });
          // #endregion
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
          // Configure edge for US/Canada users - use US East (ashburn) for best coverage
          // This ensures device registers in US region, matching phone number configuration
          edge: 'ashburn', // US East edge - change to 'umatilla' for US West if needed
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
          dispatch(setLoadingState({ key: 'initializing', value: false }))
          isInitializingRef.current = false
        }
      }, 10000)

      twilioDevice.on('registered', () => {
        const deviceIdentity = (twilioDevice as any).identity
        // Try to get account SID from token
        let accountSid = 'unknown'
        let edge = 'unknown'
        let region = 'unknown'
        try {
          const tokenParts = data.token.split('.')
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            accountSid = payload.iss || 'unknown'
          }
          // Try to get edge/region from device's internal state
          const deviceInternal = twilioDevice as any
          if (deviceInternal._stream?.edge) {
            edge = deviceInternal._stream.edge
          }
          if (deviceInternal._stream?.region) {
            region = deviceInternal._stream.region
          }
        } catch (e) {
          // Ignore
        }
        console.log('[DialerModal] Twilio Device registered:', {
          state: twilioDevice.state,
          isRegistered: (twilioDevice as any).isRegistered,
          identity: deviceIdentity,
          accountSid: accountSid,
          twimlAppSid: (twilioDevice as any).outgoingConnection?.applicationSid || 'unknown',
          edge: edge,
          // region: region,
        })
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1030', message: 'H1,H4,H5,H6: Device registered event', data: { state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered, identity: deviceIdentity, accountSid, edge, region, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1,H4,H5,H6' }) }).catch(() => { });
        // #endregion
        clearTimeout(registrationTimeout)
        
        // Device is now registered in US region (ashburn/US_EAST_VIRGINIA/us1)
        // No need to call register() again - device is already registered and listening
        console.log('[DialerModal] Device registered successfully in US region - ready for incoming calls')
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1070', message: 'H6: Ensuring device stays registered for incoming calls', data: { state: twilioDevice.state, identity: deviceIdentity, edge, region, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H6' }) }).catch(() => { });
        // #endregion
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:653', message: 'Device registered event fired', data: { state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
        // #endregion
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:659', message: 'Dispatching updateDeviceState with initializing=false', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
        // #endregion
        dispatch(updateDeviceState({ deviceRegistered: true, initializing: false }))
        isInitializingRef.current = false
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
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:699', message: 'Device registered via state check', data: { state: twilioDevice.state }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
          // #endregion
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:702', message: 'Dispatching updateDeviceState (state check) with initializing=false', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
          // #endregion
          dispatch(updateDeviceState({ deviceRegistered: true, initializing: false }))
          isInitializingRef.current = false
        } else if (twilioDevice.state === 'registered' && !deviceRegistered) {
          // Also check state property directly
          dispatch(updateDeviceState({ deviceRegistered: true, initializing: false }))
          isInitializingRef.current = false
        }
        
        // Stop checking after 15 seconds
        if (checkCount >= 15) {
          clearInterval(stateCheckInterval)
        }
      }, 1000)
      
      twilioDevice.on('unregistered', (reason: string) => {
        console.log('[DialerModal] ⚠️ Device unregistered:', {
          reason,
          state: twilioDevice.state,
          identity: (twilioDevice as any).identity,
        })
        console.log('[DialerModal] ⚠️ This will prevent incoming calls from working!')
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1115', message: 'H1: Device unregistered event', data: { reason, state: twilioDevice.state, identity: (twilioDevice as any).identity, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
        // #endregion
        dispatch(updateDeviceState({ deviceRegistered: false }))
        
        // Try to re-register if unregistered unexpectedly
        if (reason && !reason.includes('token')) {
          console.log('[DialerModal] Attempting to re-register device...')
          try {
            twilioDevice.register()
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1130', message: 'H1: Attempting re-registration after unregister', data: { reason, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
            // #endregion
          } catch (e) {
            console.error('[DialerModal] Failed to re-register:', e)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1135', message: 'H1: Re-registration failed', data: { error: String(e), timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
            // #endregion
          }
        }
      })

      twilioDevice.on('error', (error: any) => {
        console.error('Twilio Device error:', error)
        clearTimeout(registrationTimeout)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:322', message: 'Device error event', data: { errorCode: error.code, errorMessage: error.message, errorName: error.name, errorTwilioError: error.twilioError?.message, errorTwilioCode: error.twilioError?.code }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        dispatch(updateDeviceState({ deviceRegistered: false, initializing: false }))
        updateCallStatusInRedux('error')
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
        console.warn('[DialerModal] Twilio Device warning:', name, data)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:343', message: 'Device warning event', data: { warningName: name, warningData: data }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
      })
      
      // Listen for state changes to track registration progress
      const originalState = twilioDevice.state
      console.log('[DialerModal] Device initial state:', originalState)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1180', message: 'H5: Device initial state', data: { state: originalState, isRegistered: (twilioDevice as any).isRegistered, identity: (twilioDevice as any).identity, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H5' }) }).catch(() => { });
      // #endregion
      
      // Monitor state changes
      const stateCheck = setInterval(() => {
        const currentState = twilioDevice.state
        if (currentState !== originalState) {
          console.log('[DialerModal] Device state changed:', {
            from: originalState,
            to: currentState,
            isRegistered: (twilioDevice as any).isRegistered,
            identity: (twilioDevice as any).identity,
          })
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1190', message: 'H5: Device state changed', data: { from: originalState, to: currentState, isRegistered: (twilioDevice as any).isRegistered, identity: (twilioDevice as any).identity, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H5' }) }).catch(() => { });
          // #endregion
        }
        // Also log periodic state check to verify device stays registered
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1195', message: 'H5: Periodic device state check', data: { state: currentState, isRegistered: (twilioDevice as any).isRegistered, identity: (twilioDevice as any).identity, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H5' }) }).catch(() => { });
        // #endregion
      }, 5000) // Check every 5 seconds
      
      // Clear interval after 2 minutes to allow monitoring during test
      setTimeout(() => clearInterval(stateCheck), 120000)

      twilioDevice.on('incoming', (call: Call) => {
        console.log('[DialerModal] ✅✅✅ INCOMING CALL EVENT RECEIVED ✅✅✅')
        console.log('[DialerModal] Incoming call event received:', {
          callSid: call.parameters?.CallSid,
          from: call.parameters?.From,
          to: call.parameters?.To,
          deviceState: twilioDevice.state,
          isRegistered: (twilioDevice as any).isRegistered,
          deviceIdentity: (twilioDevice as any).identity,
          hasActiveCall: !!activeCall,
        })
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1190', message: 'H2,H6: Incoming call event received on device', data: { callSid: call.parameters?.CallSid, from: call.parameters?.From, to: call.parameters?.To, deviceState: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered, deviceIdentity: (twilioDevice as any).identity, hasActiveCall: !!activeCall, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H2,H6' }) }).catch(() => { });
        // #endregion
        handleIncomingCall(call)
      })
      
      // Log when device is ready to receive incoming calls
      console.log('[DialerModal] Device incoming call listener set up. Device should receive incoming calls now.')
      console.log('[DialerModal] Current device state:', {
        state: twilioDevice.state,
        isRegistered: (twilioDevice as any).isRegistered,
        identity: (twilioDevice as any).identity,
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1205', message: 'H2: Incoming call listener attached', data: { state: twilioDevice.state, isRegistered: (twilioDevice as any).isRegistered, identity: (twilioDevice as any).identity, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H2' }) }).catch(() => { });
      // #endregion
      
      // Log device identity when registered
      twilioDevice.on('registered', () => {
        console.log('[DialerModal] Device registered with identity:', (twilioDevice as any).identity)
      })


      setDevice(twilioDevice)
      deviceRef.current = twilioDevice // Store in ref for persistence across re-renders
      setGlobalDevice(twilioDevice) // Store in window and module-level store for persistence across remounts
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:957', message: 'Device stored in window store', data: { deviceState: twilioDevice.state, hasWindowDevice: !!(typeof window !== 'undefined' && (window as any).__dialerGlobalDevice) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
      // #endregion
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
      dispatch(updateDeviceState({ deviceRegistered: false, initializing: false }))
      isInitializingRef.current = false
      hasInitializedRef.current = true // Mark as initialized to prevent retry loop
      initializationFailedRef.current = true // Mark initialization as failed to prevent retry loop
      let errorMsg = 'Failed to initialize dialer'
      if (error.message?.includes('token')) {
        errorMsg = 'Invalid access token. Please try again.'
      } else if (error.message?.includes('404') || error.message?.includes('Server returned')) {
        errorMsg = 'Dialer API endpoint not found. Please check your server configuration.'
      } else if (error.message) {
        errorMsg = `Initialization error: ${error.message}`
      }
      toast.error(errorMsg)
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
    callDurationRef.current = 0

    // Step 1: Connecting (5 seconds)
    setCallStatus('connecting')
    setActiveCall({} as Call) // Mock call object

    simulationTimeoutRef.current = setTimeout(() => {
      // Step 2: Ringing (5 seconds)
      setCallStatus('ringing')

      simulationTimeoutRef.current = setTimeout(() => {
        // Step 3: In-call (5 seconds)
        updateCallStatusInRedux('in-call')
        dispatch(updateCallState({ callDuration: 0 }))

        // Start call duration timer - use ref to track duration locally for interval
        let localDuration = 0
        callDurationIntervalRef.current = setInterval(() => {
          localDuration += 1
          dispatch(updateCallState({ callDuration: localDuration }))
        }, 1000)

        simulationTimeoutRef.current = setTimeout(() => {
          // Step 4: End call
          updateCallStatusInRedux('ended')
          setActiveCall(null)
          activeCallRef.current = null
          setGlobalCall(null) // Clear window and module-level store
          if (callDurationIntervalRef.current) {
            clearInterval(callDurationIntervalRef.current)
            callDurationIntervalRef.current = null
          }
          callDurationRef.current = 0
          dispatch(updateCallState({ callDuration: 0, isMuted: false, isOnHold: false }))
          dispatch(updateUIPanel({ panel: 'script', value: false }))
          simulationTimeoutRef.current = null
        }, 5000) // 5 seconds in-call
      }, 5000) // 5 seconds ringing
    }, 5000) // 5 seconds connecting
  }

  const handleCall = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:842', message: 'handleCall called', data: { hasDevice: !!device, deviceRegistered, initializing, hasDialerNumber, phoneNumber, SIMULATE_CALL_FLOW }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
    // #endregion
    
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:856', message: 'handleCall: No device', data: { hasDevice: !!device }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
      // #endregion
      toast.error('Device not initialized. Please wait...')
      return
    }

    if (!deviceRegistered) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:863', message: 'handleCall: Device not registered', data: { hasDevice: !!device, deviceRegistered, deviceState: device ? (device as any).state : 'none' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
      // #endregion
      toast.error('Device not ready. Please wait for connection...')
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

      updateCallStatusInRedux('connecting')

      const userStr = localStorage.getItem('User')
      if (!userStr) {
        console.error('User not found in localStorage')
        updateCallStatusInRedux('idle')
        toast.error('User not found. Please log in again.')
        return
      }
      
      let userData
      try {
        userData = JSON.parse(userStr)
      } catch (e) {
        console.error('Error parsing user data:', e)
        updateCallStatusInRedux('idle')
        toast.error('Invalid user data. Please log in again.')
        return
      }
      
      // Handle nested user structure: {token: '...', user: {id: ...}} or {id: ...}
      const user = userData.user || userData
      
      if (!user || !user.id) {
        console.error('User data missing id:', userData)
        updateCallStatusInRedux('idle')
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
      activeCallRef.current = call // Store in ref for persistence across re-renders
      setGlobalCall(call) // Store in window and module-level store for persistence across remounts
      updateCallStatusInRedux('ringing')

      call.on('accept', () => {
        updateCallStatusInRedux('in-call')
        // toast.success('Call connected')
        // Start call duration timer - use ref to track duration locally for interval
        callDurationRef.current = 0
        dispatch(updateCallState({ callDuration: 0 }))
        if (callDurationIntervalRef.current) {
          clearInterval(callDurationIntervalRef.current)
        }
        callDurationIntervalRef.current = setInterval(() => {
          callDurationRef.current += 1
          dispatch(updateCallState({ callDuration: callDurationRef.current }))
        }, 1000)
      })

      call.on('disconnect', () => {
        // Preserve error status if call ended in error
        const newStatus = callStatus === 'error' || callEndedInError ? 'error' : 'ended'
        updateCallStatusInRedux(newStatus)
        setActiveCall(null)
        activeCallRef.current = null
        globalCallStore = null // Clear module-level store
        // Stop call duration timer (but keep the duration value for summary)
        if (callDurationIntervalRef.current) {
          clearInterval(callDurationIntervalRef.current)
          callDurationIntervalRef.current = null
        }
        // Don't reset callDuration - keep it for the Call Summary
        dispatch(updateCallState({ isMuted: false, isOnHold: false }))
        dispatch(updateUIPanel({ panel: 'script', value: false }))
        // Only show "Call ended" toast if it wasn't an error
        if (!callEndedInError && callStatus !== 'error') {
        // toast.info('Call ended')
        }
        
        // Log device state after call ends to ensure it's still registered for incoming calls
        console.log('[DialerModal] Call disconnected. Device state:', {
          state: device?.state,
          isRegistered: (device as any)?.isRegistered,
          identity: (device as any)?.identity,
        })
        console.log('[DialerModal] Device should still be registered for incoming calls')
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:1434', message: 'H1,H5: Device state after outbound call disconnect', data: { deviceState: device?.state, isRegistered: (device as any)?.isRegistered, identity: (device as any)?.identity, callStatus: newStatus, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1,H5' }) }).catch(() => { });
        // #endregion
      })

      call.on('cancel', () => {
        updateCallStatusInRedux('ended')
        setActiveCall(null)
        activeCallRef.current = null
        globalCallStore = null // Clear module-level store
        // Stop call duration timer
        if (callDurationIntervalRef.current) {
          clearInterval(callDurationIntervalRef.current)
          callDurationIntervalRef.current = null
        }
        callDurationRef.current = 0
        dispatch(updateCallState({ callDuration: 0, isMuted: false, isOnHold: false }))
        dispatch(updateUIPanel({ panel: 'script', value: false }))
        // toast.info('Call canceled')
      })

      call.on('error', (error: any) => {
        console.error('Call error:', error)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:377', message: 'Call error event', data: { errorCode: error.code, errorMessage: error.message, errorName: error.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion
        updateCallStatusInRedux('error')
        dispatch(updateCallState({ callEndedInError: true }))
        setActiveCall(null)
        activeCallRef.current = null
        globalCallStore = null // Clear module-level store
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
      updateCallStatusInRedux('error')
      toast.error(`Failed to make call: ${error.message}`)
    }
  }

  const handleEndCall = () => {
    // Clear simulation if running
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current)
      simulationTimeoutRef.current = null
    }

    // If there's an incoming call, reject it
    if (incomingCall && callStatus === 'incoming-ringing') {
      handleRejectIncomingCall()
      return
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
      activeCallRef.current = null
      globalCallStore = null // Clear module-level store
      // Stop call duration timer
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
      // Don't reset callDuration - keep it for the summary
        dispatch(updateCallState({ isMuted: false, isOnHold: false, callEndedInError: false }))
        dispatch(updateUIPanel({ panel: 'script', value: false }))
    } else if (callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting' || callStatus === 'incoming-ringing') {
      // If there's no active call but status indicates a call was happening, set to ended
      setCallStatus('ended')
      // Stop call duration timer
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
    }
  }

  // Lookup lead by phone number
  const lookupLeadByPhone = async (phoneNumber: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('User') || '{}')
      if (!user?.id) return null

      const response = await fetch(`/api/leads/getLeadByPhone?phone=${encodeURIComponent(phoneNumber)}&userId=${user.id}`)
      if (!response.ok) return null

      const data = await response.json()
      // The API returns results array with lead data
      if (data?.results?.[0]?.result) {
        return data.results[0].result
      }
      // Alternative response format
      if (data?.lead) {
        return data.lead
      }
      return null
    } catch (error) {
      console.error('Error looking up lead by phone:', error)
      return null
    }
  }

  // Setup call event handlers (reusable for both outbound and incoming calls)
  const setupCallEventHandlers = (call: Call) => {
    call.on('accept', () => {
      updateCallStatusInRedux('in-call')
      // Start call duration timer - use ref to track duration locally for interval
      callDurationRef.current = 0
      dispatch(updateCallState({ callDuration: 0 }))
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
      }
      callDurationIntervalRef.current = setInterval(() => {
        callDurationRef.current += 1
        dispatch(updateCallState({ callDuration: callDurationRef.current }))
      }, 1000)
    })

    call.on('disconnect', () => {
      // Preserve error status if call ended in error
      const newStatus = callStatus === 'error' || callEndedInError ? 'error' : 'ended'
      updateCallStatusInRedux(newStatus)
      setActiveCall(null)
      activeCallRef.current = null
      globalCallStore = null // Clear module-level store
      // Stop call duration timer (but keep the duration value for summary)
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
      // Don't reset callDuration - keep it for the Call Summary
      dispatch(updateCallState({ isMuted: false, isOnHold: false }))
      dispatch(updateUIPanel({ panel: 'script', value: false }))
    })

    call.on('cancel', () => {
      updateCallStatusInRedux('ended')
      setActiveCall(null)
      activeCallRef.current = null
      globalCallStore = null // Clear module-level store
      // Stop call duration timer
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
      callDurationRef.current = 0
      dispatch(updateCallState({ callDuration: 0, isMuted: false, isOnHold: false }))
      dispatch(updateUIPanel({ panel: 'script', value: false }))
    })

    call.on('error', (error: any) => {
      console.error('Call error:', error)
      updateCallStatusInRedux('error')
      dispatch(updateCallState({ callEndedInError: true }))
      setActiveCall(null)
      activeCallRef.current = null
      globalCallStore = null // Clear module-level store
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
  }

  // Handle incoming call rejection/cleanup
  const handleIncomingCallRejected = () => {
    setIncomingCall(null)
    setIncomingCallerInfo(null)
    globalIncomingCallStore = null
    if (typeof window !== 'undefined') {
      (window as any).__dialerGlobalIncomingCall = null
    }
    dispatch(hideIncomingCallBanner())
    if (callStatus === 'incoming-ringing') {
      updateCallStatusInRedux('idle')
    }
  }

  // Handle reject incoming call
  const handleRejectIncomingCall = () => {
    const callToReject = incomingCall || globalIncomingCallStore || (typeof window !== 'undefined' ? (window as any).__dialerGlobalIncomingCall : null)
    if (callToReject) {
      try {
        callToReject.reject()
      } catch (error: any) {
        console.error('Error rejecting incoming call:', error)
        toast.error('Failed to reject call')
      }
    }
    handleIncomingCallRejected()
  }

  // Handle accept incoming call
  const handleAcceptIncomingCall = async () => {
    // Get call from state, ref, or global store (in case called from banner)
    const callToAccept = incomingCall || globalIncomingCallStore || (typeof window !== 'undefined' ? (window as any).__dialerGlobalIncomingCall : null)
    if (!callToAccept) return

    try {
      // Request microphone permission
      setCallStatus('requesting-mic')
      updateCallStatusInRedux('requesting-mic')
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop()) // Stop immediately, Device will handle it

      // Accept the call
      callToAccept.accept()
      
      // Set as active call
      setActiveCall(callToAccept)
      activeCallRef.current = callToAccept
      setGlobalCall(callToAccept)
      
      // Clear incoming call state
      setIncomingCall(null)
      setIncomingCallerInfo(null)
      globalIncomingCallStore = null
      if (typeof window !== 'undefined') {
        (window as any).__dialerGlobalIncomingCall = null
      }
      dispatch(hideIncomingCallBanner())
      
      // Setup event handlers
      setupCallEventHandlers(callToAccept)
      
      // Update status - the 'accept' event will fire and update to 'in-call'
      updateCallStatusInRedux('ringing')
    } catch (error: any) {
      console.error('Error accepting incoming call:', error)
      updateCallStatusInRedux('error')
      toast.error(`Failed to accept call: ${error.message}`)
      handleIncomingCallRejected()
    }
  }

  // Handle incoming call
  const handleIncomingCall = async (call: Call) => {
    console.log('[DialerModal] Incoming call received:', {
      hasDevice: !!device,
      deviceRegistered,
      deviceState: device?.state,
      isRegistered: (device as any)?.isRegistered,
      callParameters: call.parameters,
    })

    // Check if there's an active call - reject if allowIncomingWhileBusy is false
    if (activeCall || activeCallRef.current) {
      // Reject incoming call automatically
      try {
        call.reject()
        toast.info('Incoming call rejected - another call is active')
      } catch (error: any) {
        console.error('Error rejecting incoming call:', error)
      }
      return
    }

    // Extract caller information
    const from = call.parameters?.From || call.parameters?.from || ''
    const to = call.parameters?.To || call.parameters?.to || ''

    console.log('[DialerModal] Incoming call details:', { from, to, callSid: call.parameters?.CallSid })

    // Store incoming call in state and global store
    setIncomingCall(call)
    setIncomingCallerInfo({ from, to })
    globalIncomingCallStore = call
    if (typeof window !== 'undefined') {
      (window as any).__dialerGlobalIncomingCall = call
    }

    // Update Redux status
    updateCallStatusInRedux('incoming-ringing')

    // Lookup lead by phone number and show banner
    lookupLeadByPhone(from).then((lead) => {
      dispatch(showIncomingCallBanner({
        callerPhoneNumber: from,
        callerName: lead ? (lead.name || lead.firstName || '') : null,
        leadId: lead ? lead.id : null,
      }))
    }).catch(() => {
      // If lookup fails, show banner with just phone number
      dispatch(showIncomingCallBanner({
        callerPhoneNumber: from,
        callerName: null,
        leadId: null,
      }))
    })

    // Set up event listeners for when caller hangs up or call is rejected
    call.on('cancel', () => {
      handleIncomingCallRejected()
    })

    call.on('reject', () => {
      handleIncomingCallRejected()
    })
  }

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (!activeCall) return
    try {
      if (isMuted) {
        activeCall.mute(false)
        dispatch(updateCallState({ isMuted: false }))
      } else {
        activeCall.mute(true)
        dispatch(updateCallState({ isMuted: true }))
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
        dispatch(updateCallState({ isOnHold: false }))
      } else {
        if (typeof callWithHold.hold === 'function') {
          callWithHold.hold(true)
        } else {
          // Fallback: Hold is not supported in this SDK version
          toast.info('Hold functionality may not be available in this SDK version')
          return
        }
        dispatch(updateCallState({ isOnHold: true }))
      }
    } catch (error: any) {
      console.error('Error toggling hold:', error)
      toast.error('Failed to toggle hold. This feature may not be supported.')
      dispatch(updateCallState({ isOnHold: false })) // Reset state on error
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
    // Check if we should refetch (cache is stale or empty)
    if (!shouldRefetchEmailTemplates && emailTemplates.length > 0) {
      return // Use cached data
    }
    
    try {
      dispatch(setLoadingState({ key: 'templates', value: true }))
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
        dispatch(setEmailTemplates({ templates: data.data, timestamp: Date.now() }))
      } else {
        toast.error('Failed to load email templates')
        dispatch(setLoadingState({ key: 'templates', value: false }))
      }
    } catch (error: any) {
      console.error('Error fetching email templates:', error)
      toast.error('Failed to load email templates')
      dispatch(setLoadingState({ key: 'templates', value: false }))
    }
  }

  const fetchSmsTemplates = async () => {
    // Check if we should refetch (cache is stale or empty)
    if (!shouldRefetchSmsTemplates && smsTemplates.length > 0) {
      return // Use cached data
    }
    
    try {
      dispatch(setLoadingState({ key: 'templates', value: true }))
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        dispatch(setLoadingState({ key: 'templates', value: false }))
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
        dispatch(setSmsTemplates({ templates: data.data, timestamp: Date.now() }))
      } else {
        toast.error('Failed to load SMS templates')
        dispatch(setLoadingState({ key: 'templates', value: false }))
      }
    } catch (error: any) {
      console.error('Error fetching SMS templates:', error)
      toast.error('Failed to load SMS templates')
      dispatch(setLoadingState({ key: 'templates', value: false }))
    }
  }

  const handleSendSms = async (phoneNumberId?: number) => {
    if (!selectedTemplate || !leadId) {
      toast.error('Please select a template')
      return
    }

    // If no phoneNumberId provided, show phone number dropdown
    if (!phoneNumberId) {
      // Get A2P verified phone numbers
      // Handle both boolean (true) and numeric (1) values for isA2PVerified
      const a2pVerifiedNumbers = phoneNumbers.filter(
        (pn: any) => (pn.isA2PVerified === true || pn.isA2PVerified === 1) && 
                     (pn.a2pVerificationStatus === 'verified' || pn.a2pVerificationStatus === 'Verified')
      )
      
      // Deduplicate by phone number - keep the first occurrence of each unique phone
      const seenPhones = new Map<string, any>()
      const uniqueA2pNumbers = a2pVerifiedNumbers.filter((pn: any) => {
        const normalizedPhone = pn.phone?.trim()
        if (!normalizedPhone) return false
        if (!seenPhones.has(normalizedPhone)) {
          seenPhones.set(normalizedPhone, pn)
          return true
        }
        return false
      })
      
      if (uniqueA2pNumbers.length === 0) {
        toast.error('No A2P verified phone numbers found. Please verify a phone number first.')
        return
      }
      // The dropdown will be shown via the anchor element set in the button click handler
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
          phoneNumberId: phoneNumberId,
        }),
      })

      const data = await response.json()

      if (data?.status === true) {
        toast.success('SMS sent successfully')
        dispatch(setSelectedTemplate(null))
        dispatch(updateUIPanel({ panel: 'sms', value: false }))
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
    // This is now handled by the panel components
    // Keeping for backward compatibility but it won't be called
  }

  const fetchEmailAccounts = async () => {
    // Check if we should refetch (cache is stale or empty)
    if (!shouldRefetchEmailAccounts && emailAccounts.length > 0) {
      return // Use cached data
    }
    
    try {
      dispatch(setLoadingState({ key: 'emailAccounts', value: true }))
      const userId = selectedUser?.id || selectedUser?.user?.id
      const accounts = await getGmailAccounts(userId)
      dispatch(setEmailAccounts({ accounts: accounts || [], timestamp: Date.now() }))
    } catch (error: any) {
      console.error('Error fetching email accounts:', error)
      toast.error('Failed to load email accounts')
      dispatch(setLoadingState({ key: 'emailAccounts', value: false }))
    }
  }

  const handleSendEmail = async (emailAccountId?: number) => {
    if (!selectedTemplate || !leadId) {
      toast.error('Please select a template')
      return
    }

    // If no emailAccountId provided, show account dropdown
    if (!emailAccountId) {
      // Fetch accounts if not already loaded
      if (emailAccounts.length === 0 && !emailAccountsLoading) {
        await fetchEmailAccounts()
      }
      // The dropdown will be shown via the anchor element set in the button click handler
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
          emailAccountId: emailAccountId,
        }),
      })

      const data = await response.json()

      if (data?.status === true) {
        toast.success('Email sent successfully')
        dispatch(setSelectedTemplate(null))
        dispatch(updateUIPanel({ panel: 'email', value: false }))
        dispatch(setSelectedEmailAccount(null))
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



  // Start/stop call duration timer based on call status
  // This ensures the timer runs correctly even if 'accept' event fires early
  useEffect(() => {
    if (callStatus === 'in-call' && activeCall) {
      // Start timer if not already running
      if (!callDurationIntervalRef.current) {
        // Reset duration to 0 when call starts
        callDurationRef.current = 0
        dispatch(updateCallState({ callDuration: 0 }))
        
        // Start the interval
        callDurationIntervalRef.current = setInterval(() => {
          callDurationRef.current += 1
          dispatch(updateCallState({ callDuration: callDurationRef.current }))
        }, 1000)
        
        console.log('[Dialer] Call duration timer started (from useEffect)')
      }
    } else if (callStatus !== 'in-call' && callDurationIntervalRef.current) {
      // Stop timer when call status changes away from 'in-call'
      // But don't clear it on 'disconnect' - we want to keep the duration for the summary
      if (callStatus === 'ended' || callStatus === 'error') {
        // Only clear on ended/error - disconnect handler already cleared it
        // This is a safety net in case the disconnect event didn't fire
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
        console.log('[Dialer] Call duration timer stopped (from useEffect)')
      }
    }
    
    return () => {
      // Cleanup on unmount or when dependencies change
      // But only if call is not active (to preserve duration during call)
      if (callStatus !== 'in-call' && callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
        callDurationIntervalRef.current = null
      }
    }
  }, [callStatus, activeCall, dispatch])

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
      'incoming-ringing': 'bg-blue-500',
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


  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, isCollapsed: boolean = false) => {
    // Prevent dragging when script, SMS, or email panels are open
    if (showScriptPanel || showSmsPanel || showEmailPanel) {
      return // Don't allow dragging when panels are open
    }
    
    // Only allow dragging from header area or when clicking on empty space
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return // Don't drag when clicking on interactive elements
    }
    const ref = isCollapsed ? collapsedRef : modalRef
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      // Store the offset from mouse position to the modal's right edge and top edge
      // This keeps the cursor position relative to the modal consistent during drag
      dragStartPos.current = {
        x: rect.right - e.clientX,  // Offset from mouse X to right edge
        y: e.clientY - rect.top,     // Offset from mouse Y to top edge
        mouseX: e.clientX,          // Initial mouse X (for reference)
        mouseY: e.clientY,           // Initial mouse Y (for reference)
      }
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const activeRef = isMinimized ? collapsedRef.current : modalRef.current
        if (activeRef && dragStartPos.current.mouseX !== undefined) {
          // Calculate new right position: current mouse X + offset to right edge
          // This keeps the cursor position relative to the modal consistent
          const newRight = window.innerWidth - (e.clientX + dragStartPos.current.x)
          const newY = e.clientY - dragStartPos.current.y
          
          // Constrain to viewport
          const minRight = 0
          const maxRight = window.innerWidth - activeRef.offsetWidth
          const constrainedRight = Math.max(minRight, Math.min(newRight, maxRight))
          const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - activeRef.offsetHeight))
          
          // Update rightPositionRef immediately for real-time dragging
          rightPositionRef.current = constrainedRight
          
          // Convert right position to left position for storage (for backward compatibility)
          const leftX = window.innerWidth - constrainedRight - activeRef.offsetWidth
          
          // Store as left position (will be converted to right in getPosition)
          dispatch(updatePosition({ x: leftX, y: constrainedY }))
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isMinimized, dispatch])

  // Store the right position in a ref to keep it stable during panel expand/collapse
  const rightPositionRef = useRef<number | null>(null)

  // Calculate position - anchor from top-right, keep right edge fixed
  const getPosition = () => {
    // During dragging, use the ref value directly for immediate updates
    // If we have a stored right position, use it (keeps right edge fixed)
    if (rightPositionRef.current !== null && !isDragging) {
      return { right: rightPositionRef.current, y: dialerPosition.y !== null ? dialerPosition.y : (typeof window !== 'undefined' ? window.innerHeight * 0.01 : 0) }
    }
    
    // During dragging, calculate from dialerPosition directly for immediate updates
    if (isDragging && dialerPosition.x !== null && dialerPosition.y !== null) {
      const baseWidth = 380
      const right = typeof window !== 'undefined' ? window.innerWidth - dialerPosition.x - baseWidth : 20
      return { right: Math.max(0, right), y: dialerPosition.y }
    }
    
    // Initialize from stored position or default
    if (dialerPosition.x !== null && dialerPosition.y !== null) {
      // Convert stored left position to right position using current width
      const baseWidth = 380
      const right = typeof window !== 'undefined' ? window.innerWidth - dialerPosition.x - baseWidth : 20
      rightPositionRef.current = Math.max(0, right)
      return { right: rightPositionRef.current, y: dialerPosition.y }
    }
    
    // Default position - anchor from top-right
    if (typeof window !== 'undefined') {
      const defaultRight = 20
      rightPositionRef.current = defaultRight
      return { right: defaultRight, y: window.innerHeight * 0.01 }
    }
    
    const defaultRight = 20
    rightPositionRef.current = defaultRight
    return { right: defaultRight, y: 0 }
  }

  // Calculate modal dimensions - keep right edge fixed, adjust width smoothly
  const getModalDimensions = () => {
    const baseWidth = 380
    const expandedWidth = 700
    const panelWidth = 320 // Width of script/email/sms panel
    
    const isExpanded = (showScriptPanel && callStatus !== 'ended' && callStatus !== 'error') || 
                      ((showEmailPanel || showSmsPanel) && (callStatus === 'ended' || callStatus === 'error'))
    
    const desiredWidth = isExpanded ? expandedWidth : baseWidth
    const position = getPosition()
    // During dragging, use position directly; otherwise use ref for stability
    const currentRight = isDragging ? (position.right || 20) : (rightPositionRef.current !== null ? rightPositionRef.current : (position.right || 20))
    
    if (typeof window !== 'undefined') {
      // Calculate available space on the left
      const availableLeft = window.innerWidth - currentRight - baseWidth
      
      // If expanding and not enough space on left, we need to adjust
      if (isExpanded && availableLeft < panelWidth) {
        // Calculate how much we need to shift left to accommodate the panel
        const neededSpace = panelWidth - availableLeft
        const minRight = 20 // Minimum padding from right edge
        const maxRight = window.innerWidth - expandedWidth - 20 // Maximum right position
        
        // Calculate new right position (shift left)
        const adjustedRight = Math.max(minRight, Math.min(currentRight - neededSpace, maxRight))
        
        // Update the ref so it stays at this position
        rightPositionRef.current = adjustedRight
        
        return {
          width: expandedWidth,
          right: adjustedRight,
          y: position.y,
          adjusted: true
        }
      }
      
      // When collapsing, keep right position fixed (don't adjust it)
      if (!isExpanded) {
        // Keep the right position exactly as it was - only width changes
        // Only constrain if it would go outside viewport
        const minRight = 20
        const maxRight = window.innerWidth - baseWidth - 20
        if (currentRight < minRight || currentRight > maxRight) {
          const constrainedRight = Math.max(minRight, Math.min(currentRight, maxRight))
          rightPositionRef.current = constrainedRight
          return {
            width: baseWidth,
            right: constrainedRight,
            y: position.y,
            adjusted: false
          }
        }
        
        // Right position is fine, keep it exactly as is
        return {
          width: baseWidth,
          right: currentRight,
          y: position.y,
          adjusted: false
        }
      }
    }
    
    // Normal case - enough space, keep right fixed
    return {
      width: desiredWidth,
      right: currentRight,
      y: position.y,
      adjusted: false
    }
  }

  const modalDimensions = getModalDimensions()
  const position = { right: modalDimensions.right, y: modalDimensions.y }

  // Update stored position when adjusted (only when expanding and position changes)
  useEffect(() => {
    if (modalDimensions.adjusted && modalRef.current) {
      // Position was adjusted, update Redux store with new position
      const leftX = typeof window !== 'undefined' 
        ? window.innerWidth - modalDimensions.right - modalDimensions.width 
        : 0
      dispatch(updatePosition({ x: leftX, y: modalDimensions.y }))
    }
  }, [showScriptPanel, showEmailPanel, showSmsPanel, callStatus, modalDimensions.adjusted, dispatch])

  // Update right position ref when dragging
  useEffect(() => {
    if (dialerPosition.x !== null && !isDragging) {
      const baseWidth = 380
      const right = typeof window !== 'undefined' ? window.innerWidth - dialerPosition.x - baseWidth : 20
      rightPositionRef.current = Math.max(0, right)
    }
  }, [dialerPosition.x, isDragging])

  // Reset position and state when modal is closed
  useEffect(() => {
    if (!open) {
      // Reset position to default
      dispatch(updatePosition({ x: null, y: null }))
      rightPositionRef.current = null
      // Reset UI panels
      dispatch(updateUIPanel({ panel: 'script', value: false }))
      dispatch(updateUIPanel({ panel: 'email', value: false }))
      dispatch(updateUIPanel({ panel: 'sms', value: false }))
      dispatch(updateUIPanel({ panel: 'notes', value: false }))
      // Reset minimized state
      dispatch(setMinimized(false))
      // Clear dropdown anchors
      setNumberDropdownAnchor(null)
    }
  }, [open, dispatch])

  // Collapsed UI component
  const CollapsedDialer = () => {
    if (!isMinimized || (callStatus !== 'in-call' && callStatus !== 'ringing' && callStatus !== 'connecting' && callStatus !== 'incoming-ringing')) {
      return null
  }

  return (
      <div
        className="fixed z-[1402] bg-white rounded-lg shadow-lg border border-gray-200"
        style={{
          right: `${position.right}px`,
          top: `${position.y}px`,
          width: '280px',
          padding: '12px',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={(e) => handleMouseDown(e, true)}
        ref={collapsedRef}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-2 h-2 rounded-full ${callStatus === 'in-call' ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{leadName || formatPhoneNumber(phoneNumber)}</div>
              {callStatus === 'in-call' && (
                <div className="text-xs text-gray-500">{formatDuration(callDuration)}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Mute Button */}
            {callStatus === 'in-call' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMuteToggle()
                }}
                className="p-1.5 h-auto"
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
            )}
            
            {/* Hold Button */}
            {callStatus === 'in-call' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleHoldToggle()
                }}
                className="p-1.5 h-auto"
              >
                <Pause size={16} />
              </Button>
            )}
            
            {/* End Call Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleEndCall()
                dispatch(setMinimized(false)) // Expand when ending call
              }}
              className="p-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Phone size={16} className="rotate-135" />
            </Button>
            
            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                dispatch(toggleMinimized())
              }}
              className="p-1.5 h-auto"
            >
              <ArrowUp size={16} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!open) return null

  // Show collapsed UI if minimized and call is active
  if (isMinimized && (callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting')) {
    return <CollapsedDialer />
  }

  return (
    <div
      ref={modalRef}
      className="fixed z-[1401] bg-white"
      style={{
        right: `${modalDimensions.right}px`,
        top: `${modalDimensions.y}px`,
        left: 'auto',
        maxWidth: `${modalDimensions.width}px`,
        width: `${modalDimensions.width}px`,
        transition: isDragging ? 'none' : 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), right 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.1s ease',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
        minHeight: '500px',
        maxHeight: '80vh',
        borderRadius: '16px',
        overflow: 'hidden',
        pointerEvents: 'auto',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={(e) => handleMouseDown(e, false)}
      onKeyDown={(e) => {
          // Don't interfere with input fields
          const target = e.target as HTMLElement
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return
          }
        if (e.key === 'Escape') {
          // If there's an active call OR call is in any active state, disconnect it immediately
          const isActiveCallState = callStatus === 'requesting-mic' || 
                                   callStatus === 'connecting' || 
                                   callStatus === 'ringing' || 
                                   callStatus === 'in-call'
          
          if (activeCall || isActiveCallState) {
            handleEndCall()
          }
          // Reset dialer state to idle
          callDurationRef.current = 0
          updateCallStatusInRedux('idle')
          dispatch(updateCallState({ callDuration: 0, isMuted: false, isOnHold: false }))
          // Reset position to default
          dispatch(updatePosition({ x: null, y: null }))
          rightPositionRef.current = null
          // Reset UI panels
          dispatch(updateUIPanel({ panel: 'script', value: false }))
          dispatch(updateUIPanel({ panel: 'email', value: false }))
          dispatch(updateUIPanel({ panel: 'sms', value: false }))
          dispatch(updateUIPanel({ panel: 'notes', value: false }))
          // Reset minimized state
          dispatch(setMinimized(false))
          // Then close the dialer
          onClose()
        }
      }}
    >
      {/* Minimize and Close Buttons */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* Minimize Button - only show when call is active */}
        {(callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting') && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
              dispatch(toggleMinimized())
            }}
            variant="ghost"
                size="sm"
            className="p-2 h-auto"
            title="Minimize"
          >
            <ChevronDown size={20} />
              </Button>
        )}
        {/* Close Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
            // If there's an active call OR call is in any active state, disconnect it immediately
            // Active states: 'requesting-mic', 'connecting', 'ringing', 'in-call', 'incoming-ringing'
            const isActiveCallState = callStatus === 'requesting-mic' || 
                                     callStatus === 'connecting' || 
                                     callStatus === 'ringing' || 
                                     callStatus === 'in-call' ||
                                     callStatus === 'incoming-ringing'
            
            if (activeCall || isActiveCallState || incomingCall) {
              handleEndCall()
            }
            // Reset dialer state to idle
            callDurationRef.current = 0
            updateCallStatusInRedux('idle')
            dispatch(updateCallState({ callDuration: 0, isMuted: false, isOnHold: false }))
            // Reset position to default
            dispatch(updatePosition({ x: null, y: null }))
            rightPositionRef.current = null
            // Reset UI panels
            dispatch(updateUIPanel({ panel: 'script', value: false }))
            dispatch(updateUIPanel({ panel: 'email', value: false }))
            dispatch(updateUIPanel({ panel: 'sms', value: false }))
            dispatch(updateUIPanel({ panel: 'notes', value: false }))
            // Reset minimized state
            dispatch(setMinimized(false))
            // Then close the dialer
            onClose()
                          }}
                          variant="ghost"
                          size="sm"
          className="p-2 h-auto"
          title="Close"
                        >
          <X size={20} />
                        </Button>
                      </div>

      <div 
        className="flex flex-row" 
        style={{ minHeight: '500px', maxHeight: '80vh' }}
      >
        {/* Email/SMS Templates Panel - Left Side (when call ended and panel open) */}
        {(callStatus === 'ended' || callStatus === 'error') && showSmsPanel && (
          <SmsTemplatePanel
            smsTemplates={smsTemplates}
            selectedTemplate={selectedTemplate}
            templatesLoading={templatesLoading}
            phoneNumbers={phoneNumbers}
            phoneNumbersLoading={phoneNumbersLoading}
            sendingSms={sendingSms}
            leadId={leadId}
            leadPhone={phoneNumber}
            selectedUser={selectedUser}
            onTemplateSelect={(template) => dispatch(setSelectedTemplate(template))}
            onSendSms={handleSendSms}
            onDeleteTemplate={handleDeleteTemplate}
            onEditTemplate={handleEditTemplate}
            onRefreshTemplates={fetchSmsTemplates}
            onClose={() => dispatch(updateUIPanel({ panel: 'sms', value: false }))}
          />
        )}
        {(callStatus === 'ended' || callStatus === 'error') && showEmailPanel && (
          <EmailTemplatePanel
            emailTemplates={emailTemplates}
            selectedTemplate={selectedTemplate}
            templatesLoading={templatesLoading}
            emailAccounts={emailAccounts}
            emailAccountsLoading={emailAccountsLoading}
            sendingEmail={sendingEmail}
            leadId={leadId}
            selectedUser={selectedUser}
            onTemplateSelect={(template) => dispatch(setSelectedTemplate(template))}
            onSendEmail={handleSendEmail}
            onDeleteTemplate={handleDeleteTemplate}
            onEditTemplate={handleEditTemplate}
            onRefreshTemplates={fetchEmailTemplates}
            onRefreshEmailAccounts={fetchEmailAccounts}
            onClose={() => dispatch(updateUIPanel({ panel: 'email', value: false }))}
          />
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
              onClose={() => dispatch(updateUIPanel({ panel: 'script', value: false }))}
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
              ) : callStatus === 'incoming-ringing' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/svgIcons/dialer/OLD AGENTX UI/dialer_outoing_green_arrow.svg"
                      alt="Incoming call"
                      width={16}
                      height={16}
                      style={{ transform: 'rotate(180deg)' }}
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      Incoming
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 ml-[24px]">
                    {incomingCallerInfo?.from ? formatPhoneNumber(incomingCallerInfo.from) : 'Unknown caller'}
                  </div>
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
                    <div style={{ position: 'relative', zIndex: 1000 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setNumberDropdownAnchor(e.currentTarget)
                        }}
                        className="text-sm flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                          color: 'hsl(var(--brand-primary))',
                          zIndex: 1000,
                          position: 'relative',
                          pointerEvents: 'auto',
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: '4px 8px',
                          fontWeight: 500,
                        }}
                      >
                        <span className="text-gray-900">
                          {selectedInternalNumber?.phone ? formatPhoneNumber(selectedInternalNumber.phone) : 'No number selected'}
                        </span>
                        <ChevronDown size={14} style={{ color: 'hsl(var(--brand-primary))' }} />
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
                          ) : (() => {
                            // Deduplicate by phone number - keep the first occurrence of each unique phone
                            const seenPhones = new Map<string, any>()
                            const uniquePhoneNumbers = phoneNumbers.filter((pn: any) => {
                              const normalizedPhone = pn.phone?.trim()
                              if (!normalizedPhone) return false
                              if (!seenPhones.has(normalizedPhone)) {
                                seenPhones.set(normalizedPhone, pn)
                                return true
                              }
                              return false
                            })
                            
                            return uniquePhoneNumbers.map((pn) => {
                              const isSelected = pn.usageType === 'internal_dialer'
                              const hasAgents = pn.agentCount > 0
                              const additionalAgents = pn.agentCount > 1 ? pn.agentCount - 1 : 0
                              
                              return (
                                <MenuItem
                                  key={`phone-${pn.phone}-${pn.id}`}
                                  onClick={() => {
                                    if (pn.canBeInternalDialer) {
                                      handleSetInternalNumber(pn.id)
                                    }
                                  }}
                                  disabled={!pn.canBeInternalDialer || isSelected}
                                  style={{
                                    opacity: (!pn.canBeInternalDialer || isSelected) ? 0.6 : 1,
                                    display: 'block', // Ensure disabled items are visible
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
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900" style={{ color: 'hsl(var(--brand-primary))' }}>
                                        {formatPhoneNumber(pn.phone)}
                                        </span>
                                        {(() => {
                                          const isA2PVerified = pn.isA2PVerified === true || pn.isA2PVerified === 1
                                          const isVerified = pn.a2pVerificationStatus === 'verified' || pn.a2pVerificationStatus === 'Verified'
                                          const showA2PTag = isA2PVerified && isVerified
                                          return showA2PTag ? (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs font-semibold px-2 py-0.5 flex-shrink-0"
                                              style={{
                                                backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                                                color: 'hsl(var(--brand-primary))',
                                              }}
                                            >
                                              A2P
                                            </Badge>
                                          ) : null
                                        })()}
            </div>
                                    </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                                      {/* Agent Avatars */}
                                      {hasAgents && (
                                        <div className="flex items-center" style={{ marginLeft: '-4px' }}>
                                          {/* First Agent Avatar - Use getAgentsListImage for consistent fallback logic */}
                                          <div style={{ border: '2px solid white', borderRadius: '50%', display: 'inline-block' }}>
                                            {getAgentsListImage(pn.firstAgent, 24, 24)}
                                          </div>
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
                                        <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                </MenuItem>
                              )
                            })
                          })()}
                          {/* Get New Number Button */}
                          <MenuItem
                            onClick={() => {
                              setNumberDropdownAnchor(null)
                              setShowClaimNumberModal(true)
                            }}
                            style={{
                              display: 'block',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              margin: '4px 8px',
                              padding: '12px 16px',
                              backgroundColor: 'white',
                              borderTop: '2px solid #e5e7eb',
                              marginTop: '8px',
                            }}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Phone size={16} style={{ color: 'hsl(var(--brand-primary))' }} />
                              <span className="text-sm font-medium" style={{ color: 'hsl(var(--brand-primary))' }}>
                                Get New Number
                              </span>
                            </div>
                          </MenuItem>
                        </Menu>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: callStatus === 'in-call' || callStatus === 'ringing' || callStatus === 'connecting' || callStatus === 'incoming-ringing' ? '80px' : (callStatus === 'ended' || callStatus === 'error') ? '16px' : '24px' }}>
          {checkingDialerNumber || initializing ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">Connecting...</div>
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
                {/* Incoming Call Section */}
                {callStatus === 'incoming-ringing' ? (
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
                          {leadName ? leadName.charAt(0).toUpperCase() : incomingCallerInfo?.from?.charAt(incomingCallerInfo.from.length - 1) || '?'}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-base">
                          {leadName || (incomingCallerInfo?.from ? formatPhoneNumber(incomingCallerInfo.from) : 'Unknown Caller')}
                        </div>
                        {leadName && incomingCallerInfo?.from && (
                          <div className="text-sm text-gray-500">{formatPhoneNumber(incomingCallerInfo.from)}</div>
                        )}
                        <div className="text-sm text-gray-500 mt-2">Incoming call...</div>
                      </div>
                    </div>

                    {/* Accept/Reject Buttons */}
                    <div className="flex items-center justify-center gap-4 py-4">
                      {/* Reject Button */}
                      <button
                        onClick={handleRejectIncomingCall}
                        className="flex items-center justify-center transition-colors hover:bg-red-50 bg-white"
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          border: '2px solid #ef4444',
                          padding: 0,
                        }}
                      >
                        <Phone
                          size={24}
                          className="rotate-135"
                          style={{ color: '#ef4444' }}
                        />
                      </button>
                      
                      {/* Accept Button */}
                      <button
                        onClick={handleAcceptIncomingCall}
                        className="flex items-center justify-center transition-colors hover:bg-green-50"
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          border: '2px solid #10b981',
                          padding: 0,
                        }}
                      >
                        <Phone
                          size={24}
                          style={{ color: 'white' }}
                        />
                      </button>
                    </div>
                  </div>
                ) : (callStatus === 'ringing' || callStatus === 'in-call' || callStatus === 'connecting') ? (
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
                              dispatch(updateUIPanel({ panel: 'script', value: !showScriptPanel }))
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
                        onClick={() => dispatch(updateUIPanel({ panel: 'notes', value: !showNotes }))}
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
                    {/* <div className="w-full flex justify-center">
                      <Button
                        onClick={async () => {
                          // Reset call state
                          callDurationRef.current = 0
                          updateCallStatusInRedux('idle')
                          dispatch(updateCallState({ callDuration: 0 }))
                          // Call the lead again using the same phone number
                          if (phoneNumber) {
                            // Small delay to ensure state is reset
                            setTimeout(() => {
                              handleCall()
                            }, 100)
                          } else {
                            toast.error('No phone number available to call back')
                          }
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
                    </div> */}

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 my-3 w-full"></div>

                    {/* Follow Up Section */}
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-900">Follow up</span>
                        {/* <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">i</span>
                        </div> */}
              </div>

              <div className="space-y-2">
                        <Button
                          onClick={async () => {
                            if (!showEmailPanel) {
                              dispatch(updateUIPanel({ panel: 'email', value: true }))
                              dispatch(updateUIPanel({ panel: 'sms', value: false }))
                              dispatch(setSelectedTemplate(null))
                              if (emailTemplates.length === 0) {
                                await fetchEmailTemplates()
                              }
                            } else {
                              dispatch(updateUIPanel({ panel: 'email', value: false }))
                              dispatch(setSelectedTemplate(null))
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
                              dispatch(updateUIPanel({ panel: 'sms', value: true }))
                              dispatch(updateUIPanel({ panel: 'email', value: false }))
                              dispatch(setSelectedTemplate(null))
                              if (smsTemplates.length === 0) {
                                await fetchSmsTemplates()
                              }
                            } else {
                              dispatch(updateUIPanel({ panel: 'sms', value: false }))
                              dispatch(setSelectedTemplate(null))
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
                          <MessageCircleMore
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
                        onClick={() => dispatch(updateUIPanel({ panel: 'script', value: !showScriptPanel }))}
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
                        View Script
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
                {(() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:2299', message: 'Button render state', data: { initializing, deviceRegistered, hasDevice: !!device, hasPhoneNumber: !!phoneNumber, disabled: !device || !deviceRegistered || initializing || !phoneNumber }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
                  // #endregion
                  // Show "Initializing..." only if we're actually initializing AND don't have a device yet
                  // Once we have a device, show "Connecting..." if not registered, or "Start Call" if registered
                  if (initializing && !device) {
                    return 'Initializing...'
                  } else if (device && !deviceRegistered) {
                    return 'Connecting...'
                  } else if (device && deviceRegistered) {
                    return 'Start Call'
                  } else {
                    return 'Initializing...'
                  }
                })()}
              </Button>
                  </div>
          )}
                </div>
      </div>

      {/* Call Notes Window - Bottom Right */}
      {(callStatus === 'ringing' || callStatus === 'in-call' || callStatus === 'connecting') && (
        <CallNotesWindow
          open={showNotes}
          onClose={() => dispatch(updateUIPanel({ panel: 'notes', value: false }))}
          leadId={leadId}
          leadName={leadName}
        />
      )}

      {/* Claim Number Modal */}
      <ClaimNumber
        showClaimPopup={showClaimNumberModal}
        handleCloseClaimPopup={() => {
          setShowClaimNumberModal(false)
          // Refresh phone numbers after closing (in case a new number was purchased)
          fetchPhoneNumbersWithAgents()
        }}
        setOpenCalimNumDropDown={() => {}}
        setSelectNumber={() => {}}
        setPreviousNumber={() => {}}
        previousNumber={[]}
        AssignNumber={(phoneNumber: string) => {
          // After assigning a number, refresh the phone numbers list
          fetchPhoneNumbersWithAgents()
        }}
        selectedUSer={selectedUser}
      />

        </div>
  )
}

// Memoize component to prevent unnecessary re-renders on navigation
// Only re-render if critical props actually change
// IMPORTANT: This prevents re-renders but NOT remounts. Remounts happen when parent remounts.
const MemoizedDialerModal = memo(DialerModal, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  const propsEqual = (
    prevProps.open === nextProps.open &&
    prevProps.initialPhoneNumber === nextProps.initialPhoneNumber &&
    prevProps.leadId === nextProps.leadId &&
    prevProps.leadName === nextProps.leadName &&
    prevProps.onClose === nextProps.onClose // Also check onClose reference
  )
  // #region agent log
  if (typeof window !== 'undefined' && !propsEqual) {
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DialerModal.tsx:2400', message: 'React.memo: Props changed, allowing re-render', data: { openChanged: prevProps.open !== nextProps.open, phoneChanged: prevProps.initialPhoneNumber !== nextProps.initialPhoneNumber, leadIdChanged: prevProps.leadId !== nextProps.leadId, leadNameChanged: prevProps.leadName !== nextProps.leadName, onCloseChanged: prevProps.onClose !== nextProps.onClose }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G' }) }).catch(() => { });
  }
  // #endregion
  return propsEqual
})

export default MemoizedDialerModal

