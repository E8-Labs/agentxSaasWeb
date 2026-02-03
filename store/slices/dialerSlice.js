import { createSlice } from '@reduxjs/toolkit'

// Cache duration constants
const CACHE_DURATION = {
  phoneNumbers: 5 * 60 * 1000, // 5 minutes
  templates: 10 * 60 * 1000, // 10 minutes
  emailAccounts: 5 * 60 * 1000, // 5 minutes
}

// Helper function to check if cache is stale
const isCacheStale = (lastFetched, duration) => {
  if (!lastFetched) return true
  return Date.now() - lastFetched > duration
}

// Initial state
const initialState = {
  // UI State
  isOpen: false,
  isMinimized: false, // Collapsed/minimized state
  callStatus: 'idle', // 'idle' | 'requesting-mic' | 'connecting' | 'ringing' | 'in-call' | 'ended' | 'error'
  showScriptPanel: false,
  showNotes: false,
  showEmailPanel: false,
  showSmsPanel: false,
  // Draggable position
  position: { x: null, y: null }, // null = use default, { x, y } = custom position
  
  // Lead/Contact Data
  leadId: null,
  leadName: null,
  phoneNumber: '',
  selectedLeadDetails: null, // Full lead object
  
  // Phone Numbers
  phoneNumbers: [],
  selectedInternalNumber: null,
  phoneNumbersLoading: false,
  phoneNumbersLastFetched: null, // timestamp
  
  // Templates
  emailTemplates: [],
  smsTemplates: [],
  selectedTemplate: null,
  templatesLoading: false,
  emailTemplatesLastFetched: null,
  smsTemplatesLastFetched: null,
  
  // Email Accounts
  emailAccounts: [],
  emailAccountsLoading: false,
  selectedEmailAccount: null,
  emailAccountsLastFetched: null,
  
  // Call State
  callDuration: 0,
  isMuted: false,
  isOnHold: false,
  callEndedInError: false,
  
  // Device State
  deviceRegistered: false,
  initializing: false,
  checkingDialerNumber: false,
  hasDialerNumber: false,
  
  // User
  selectedUser: null,
  
  // Protection
  preventClose: false, // true when call is active
  
  // Incoming Call Banner
  incomingCallBanner: {
    visible: false,
    callerPhoneNumber: '',
    callerName: null,
    leadId: null,
  },
}

const dialerSlice = createSlice({
  name: 'dialer',
  initialState,
  reducers: {
    // Open dialer with lead data
    openDialer: (state, action) => {
      const { leadId, leadName, phoneNumber, selectedLeadDetails } = action.payload
      state.isOpen = true
      if (leadId !== undefined) state.leadId = leadId
      if (leadName !== undefined) state.leadName = leadName
      if (phoneNumber !== undefined) state.phoneNumber = phoneNumber
      if (selectedLeadDetails !== undefined) state.selectedLeadDetails = selectedLeadDetails
    },

    // Close dialer (with protection check in component)
    closeDialer: (state) => {
      // Only close if not prevented
      if (!state.preventClose) {
        state.isOpen = false
      }
    },

    // Force close dialer (bypasses protection)
    forceCloseDialer: (state) => {
      state.isOpen = false
      state.preventClose = false
    },

    // Update call status and auto-set preventClose
    updateCallStatus: (state, action) => {
      // #region agent log
      if (typeof window !== 'undefined') {
        //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dialerSlice.js:115', message: 'Redux: updateCallStatus action', data: { newStatus: action.payload, previousStatus: state.callStatus, preventClose: ['in-call', 'ringing', 'connecting'].includes(action.payload) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      }
      // #endregion
      state.callStatus = action.payload
      // Auto-set preventClose based on call status
      state.preventClose = ['in-call', 'ringing', 'connecting', 'incoming-ringing'].includes(action.payload)
    },

    // Set phone numbers with timestamp
    setPhoneNumbers: (state, action) => {
      const { phoneNumbers, selectedInternalNumber, timestamp } = action.payload
      state.phoneNumbers = phoneNumbers || []
      if (selectedInternalNumber !== undefined) {
        state.selectedInternalNumber = selectedInternalNumber
      }
      state.phoneNumbersLastFetched = timestamp || Date.now()
      state.phoneNumbersLoading = false
    },

    // Set email templates with timestamp
    setEmailTemplates: (state, action) => {
      const { templates, timestamp } = action.payload
      state.emailTemplates = templates || []
      state.emailTemplatesLastFetched = timestamp || Date.now()
      state.templatesLoading = false
    },

    // Set SMS templates with timestamp
    setSmsTemplates: (state, action) => {
      const { templates, timestamp } = action.payload
      state.smsTemplates = templates || []
      state.smsTemplatesLastFetched = timestamp || Date.now()
      state.templatesLoading = false
    },

    // Set email accounts with timestamp
    setEmailAccounts: (state, action) => {
      const { accounts, timestamp } = action.payload
      state.emailAccounts = accounts || []
      state.emailAccountsLastFetched = timestamp || Date.now()
      state.emailAccountsLoading = false
    },

    // Update call-related state
    updateCallState: (state, action) => {
      const { callDuration, isMuted, isOnHold, callEndedInError } = action.payload
      if (callDuration !== undefined) state.callDuration = callDuration
      if (isMuted !== undefined) state.isMuted = isMuted
      if (isOnHold !== undefined) state.isOnHold = isOnHold
      if (callEndedInError !== undefined) state.callEndedInError = callEndedInError
    },

    // Update UI panel visibility
    updateUIPanel: (state, action) => {
      const { panel, value } = action.payload
      if (panel === 'script') state.showScriptPanel = value
      else if (panel === 'notes') state.showNotes = value
      else if (panel === 'email') state.showEmailPanel = value
      else if (panel === 'sms') state.showSmsPanel = value
    },

    // Set selected template
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload
    },

    // Set selected internal number
    setSelectedInternalNumber: (state, action) => {
      state.selectedInternalNumber = action.payload
    },

    // Set selected email account
    setSelectedEmailAccount: (state, action) => {
      state.selectedEmailAccount = action.payload
    },

    // Set selected user
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },

    // Generic loading state updater
    setLoadingState: (state, action) => {
      const { key, value } = action.payload
      if (key === 'phoneNumbers') state.phoneNumbersLoading = value
      else if (key === 'templates') state.templatesLoading = value
      else if (key === 'emailAccounts') state.emailAccountsLoading = value
      else if (key === 'initializing') {
        // #region agent log
        //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dialerSlice.js:190', message: 'Redux: setLoadingState initializing', data: { oldValue: state.initializing, newValue: value }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
        // #endregion
        state.initializing = value
      }
      else if (key === 'checkingDialerNumber') state.checkingDialerNumber = value
    },

    // Update device state
    updateDeviceState: (state, action) => {
      const { deviceRegistered, hasDialerNumber, checkingDialerNumber, initializing } = action.payload
      if (deviceRegistered !== undefined) state.deviceRegistered = deviceRegistered
      if (hasDialerNumber !== undefined) state.hasDialerNumber = hasDialerNumber
      if (checkingDialerNumber !== undefined) state.checkingDialerNumber = checkingDialerNumber
      if (initializing !== undefined) {
        // #region agent log
        //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dialerSlice.js:200', message: 'Redux: updateDeviceState initializing', data: { oldValue: state.initializing, newValue: initializing, deviceRegistered: action.payload.deviceRegistered }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
        // #endregion
        state.initializing = initializing
      }
    },

    // Toggle minimized state
    toggleMinimized: (state) => {
      state.isMinimized = !state.isMinimized
    },
    
    // Set minimized state
    setMinimized: (state, action) => {
      state.isMinimized = action.payload
    },
    
    // Update position
    updatePosition: (state, action) => {
      state.position = action.payload
    },

    // Reset all dialer state
    resetDialer: (state) => {
      return initialState
    },

    // Show incoming call banner
    showIncomingCallBanner: (state, action) => {
      const { callerPhoneNumber, callerName, leadId } = action.payload
      state.incomingCallBanner = {
        visible: true,
        callerPhoneNumber: callerPhoneNumber || '',
        callerName: callerName || null,
        leadId: leadId || null,
      }
    },

    // Hide incoming call banner
    hideIncomingCallBanner: (state) => {
      state.incomingCallBanner = {
        visible: false,
        callerPhoneNumber: '',
        callerName: null,
        leadId: null,
      }
    },
  },
})


export const {
  openDialer,
  closeDialer,
  forceCloseDialer,
  updateCallStatus,
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
  updateDeviceState,
  toggleMinimized,
  setMinimized,
  updatePosition,
  resetDialer,
  showIncomingCallBanner,
  hideIncomingCallBanner,
} = dialerSlice.actions

// Selectors
export const selectDialerState = (state) => state.dialer
export const selectIsDialerOpen = (state) => state.dialer.isOpen
export const selectIsMinimized = (state) => state.dialer.isMinimized
export const selectDialerPosition = (state) => state.dialer.position
export const selectCallStatus = (state) => state.dialer.callStatus
export const selectPreventClose = (state) => state.dialer.preventClose
export const selectPhoneNumbers = (state) => state.dialer.phoneNumbers
export const selectSelectedInternalNumber = (state) => state.dialer.selectedInternalNumber
export const selectEmailTemplates = (state) => state.dialer.emailTemplates
export const selectSmsTemplates = (state) => state.dialer.smsTemplates
export const selectSelectedTemplate = (state) => state.dialer.selectedTemplate
export const selectEmailAccounts = (state) => state.dialer.emailAccounts
export const selectSelectedEmailAccount = (state) => state.dialer.selectedEmailAccount
export const selectLeadData = (state) => ({
  leadId: state.dialer.leadId,
  leadName: state.dialer.leadName,
  phoneNumber: state.dialer.phoneNumber,
  selectedLeadDetails: state.dialer.selectedLeadDetails,
})

// Cache validation selectors
export const selectShouldRefetchPhoneNumbers = (state) => {
  const lastFetched = state.dialer.phoneNumbersLastFetched
  return isCacheStale(lastFetched, CACHE_DURATION.phoneNumbers) || state.dialer.phoneNumbers.length === 0
}

export const selectShouldRefetchEmailTemplates = (state) => {
  const lastFetched = state.dialer.emailTemplatesLastFetched
  return isCacheStale(lastFetched, CACHE_DURATION.templates) || state.dialer.emailTemplates.length === 0
}

export const selectShouldRefetchSmsTemplates = (state) => {
  const lastFetched = state.dialer.smsTemplatesLastFetched
  return isCacheStale(lastFetched, CACHE_DURATION.templates) || state.dialer.smsTemplates.length === 0
}

export const selectShouldRefetchEmailAccounts = (state) => {
  const lastFetched = state.dialer.emailAccountsLastFetched
  return isCacheStale(lastFetched, CACHE_DURATION.emailAccounts) || state.dialer.emailAccounts.length === 0
}

export const selectIncomingCallBanner = (state) => state.dialer.incomingCallBanner

export default dialerSlice.reducer

