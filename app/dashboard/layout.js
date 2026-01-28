'use client'

import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import ErrorBoundary from '@/components/ErrorBoundary'
import ProfileNav from '@/components/dashboard/Navbar/ProfileNav'
// import GhlOauthWatcher from "../components/dashboard/oAuthWatcher/GhlOAuthWatcher";
// import GhlOauthWatcher from '../components/dashboard/oAuthWatcher/GhlOauthWatcher'
import GhlOauthWatcher from '@/components/dashboard/oAuthWatcher/GhlOauthWatcher'
import DialerModal from '@/components/dialer/DialerModal'
import NavigationLoader from '@/components/common/NavigationLoader'
import IncomingCallBanner from '@/components/dialer/IncomingCallBanner'
import { selectIsDialerOpen, selectCallStatus, selectPreventClose, selectLeadData } from '@/store/slices/dialerSlice'
import { closeDialer, forceCloseDialer } from '@/store/slices/dialerSlice'
import { PermissionProvider } from '@/contexts/PermissionContext'

const shouldShowServiceBanner =
  process.env.NEXT_PUBLIC_REACT_APP_DOWN_TIME === 'Yes'

export default function DashboardLayout({ children }) {
  const message =
    'Our voice system is currently undergoing maintenance. Adding a few updates.'

  const [typedMessage, setTypedMessage] = useState(message)
  const [charIndex, setCharIndex] = useState(0)
  
  // Redux state for dialer
  const dispatch = useDispatch()
  const isDialerOpen = useSelector(selectIsDialerOpen)
  const callStatus = useSelector(selectCallStatus)
  const preventClose = useSelector(selectPreventClose)
  const leadData = useSelector(selectLeadData)

  // #region agent log
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())
  renderCount.current += 1
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dashboard/layout.js:30', message: 'DashboardLayout mounted', data: { pathname: typeof window !== 'undefined' ? window.location.pathname : 'server', mountTime: mountTime.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
    }
  }, [])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dashboard/layout.js:38', message: 'DashboardLayout render', data: { renderCount: renderCount.current, isDialerOpen, callStatus, preventClose, leadId: leadData?.leadId, leadName: leadData?.leadName, phoneNumber: leadData?.phoneNumber, pathname: typeof window !== 'undefined' ? window.location.pathname : 'server', timeSinceMount: Date.now() - mountTime.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
    }
  })
  // #endregion

  // Handle dialer close with call protection
  // Use useCallback to prevent function recreation on every render
  const handleDialerClose = useCallback(() => {
    if (preventClose && ['in-call', 'ringing', 'connecting'].includes(callStatus)) {
      // Show confirmation dialog
      if (window.confirm('You have an active call. Are you sure you want to close?')) {
        dispatch(forceCloseDialer())
      }
    } else {
      dispatch(closeDialer())
    }
  }, [preventClose, callStatus, dispatch])

  //   useEffect(() => {
  //     if (shouldShowServiceBanner && charIndex < message.length) {
  //       const timeout = setTimeout(() => {
  //         setTypedMessage((prev) => prev + message[charIndex]);
  //         setCharIndex((prev) => prev + 1);
  //       }, 50); // Typing speed

  //       return () => clearTimeout(timeout);
  //     }
  //   }, [charIndex, shouldShowServiceBanner]);

  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dashboard/layout.js:74', message: 'DashboardLayout render (not remount)', data: { pathname: window.location.pathname, renderCount: renderCount.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'K' }) }).catch(() => { });
    }
  })
  // #endregion
  
  return (
    <ErrorBoundary key="dashboard-error-boundary">
      <div className="flex flex-col w-full" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
        {/* Service Banner */}
        {shouldShowServiceBanner && (
          <div 
            className="pt-2 fixed top-0 left-0 w-full bg-purple text-white z-[9999] flex flex-col items-center justify-center"
            style={{ 
              backgroundColor: '#7902DF',
              background: '#7902DF',
              display: shouldShowServiceBanner ? 'flex' : 'none'
            }}
          >
            <p className=" text-md font-bold text-center">
              🚧 Maintenance Notice 🚧
            </p>
            <p className=" text-md font-medium text-center">{typedMessage}</p>
          </div>
        )}

        {/* Main Layout */}
        <div
          className={`flex flex-row w-full ${
            shouldShowServiceBanner ? 'pt-[4vh]' : ''
          }`}
          style={{ backgroundColor: '#f5f5f5', background: '#f5f5f5' }}
        >
          {/* Sidebar */}
          <div
            className="h-screen w-[15%]"
            style={{
              borderRight: '1px solid #00000010',
              backgroundColor: 'white',
            }}
          >
            <PermissionProvider>
              <ProfileNav />
            </PermissionProvider>
          </div>

          {/* Main Content */}
          <div className="w-[85%]" style={{ backgroundColor: '#f5f5f5', background: '#f5f5f5', minHeight: '100vh' }}>
            <div>
              {/* <NoPlanPopup /> */}
              <GhlOauthWatcher />
            </div>
            {children}
          </div>
        </div>
        
        {/* Navigation Loader - shows during page transitions */}
        <NavigationLoader />
        
        {/* Incoming Call Banner - shows on all pages */}
        <IncomingCallBanner />
        
        {/* Global Dialer Modal - persists across navigation */}
        {/* Use a stable key to prevent remounting on navigation */}
        <DialerModal
          key="global-dialer-modal"
          open={isDialerOpen}
          onClose={handleDialerClose}
          initialPhoneNumber={leadData.phoneNumber || ''}
          leadId={leadData.leadId}
          leadName={leadData.leadName}
        />
      </div>
    </ErrorBoundary>
  )
}
