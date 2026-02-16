'use client'

import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import ErrorBoundary from '@/components/ErrorBoundary'
import AgencyNavBar from '@/components/dashboard/Navbar/AgencyNavBar'
import AgencySupportWidget from '@/components/agency/AgencySupportWidget'
import DialerModal from '@/components/dialer/DialerModal'
import IncomingCallBanner from '@/components/dialer/IncomingCallBanner'
import {
  selectIsDialerOpen,
  selectCallStatus,
  selectPreventClose,
  selectLeadData,
  closeDialer,
  forceCloseDialer,
} from '@/store/slices/dialerSlice'

const shouldShowServiceBanner =
  process.env.NEXT_PUBLIC_REACT_APP_DOWN_TIME === 'Yes'

export default function DashboardLayout({ children }) {
  const message =
    'Taking a brief pause to invent the future. Calls will resume soon.'

  const [typedMessage, setTypedMessage] = useState(message)
  const [charIndex, setCharIndex] = useState(0)

  const dispatch = useDispatch()
  const isDialerOpen = useSelector(selectIsDialerOpen)
  const callStatus = useSelector(selectCallStatus)
  const preventClose = useSelector(selectPreventClose)
  const leadData = useSelector(selectLeadData)

  const handleDialerClose = useCallback(() => {
    if (preventClose && ['in-call', 'ringing', 'connecting'].includes(callStatus)) {
      if (window.confirm('You have an active call. Are you sure you want to close?')) {
        dispatch(forceCloseDialer())
      }
    } else {
      dispatch(closeDialer())
    }
  }, [preventClose, callStatus, dispatch])

  return (
    <ErrorBoundary>
      <div className="agency-dashboard-layout-wrap flex flex-col w-full">
        {/* Service Banner */}
        {shouldShowServiceBanner && (
          <div className="pt-2 fixed top-0 left-0 w-full  bg-purple text-white z-[9999] flex flex-col items-center justify-center">
            <p className=" text-md font-bold text-center">
              🚧 Maintenance Notice 🚧
            </p>
            <p className=" text-md font-medium text-center">{typedMessage}</p>
          </div>
        )}

        {/* Main Layout */}
        <div
          className={`agency-dashboard-layout-row flex flex-row w-full px-0 ${
            shouldShowServiceBanner ? 'pt-[4vh]' : ''
          }`}
        >
          {/* Sidebar - fixed, does not scroll with page */}
          <div
            className="fixed left-0 top-0 z-20 h-screen w-[250px] min-w-[250px] shrink-0"
            style={{
              borderRight: '1px solid #00000010',
              backgroundColor: 'white',
            }}
          >
            <AgencyNavBar />
          </div>

          {/* Main Content - offset for fixed sidebar */}
          <div className="agency-dashboard-content ml-[250px] mb-0 mt-0 flex-1 min-w-0 w-full h-auto min-h-0 max-h-none bg-white">
            <div>{/* <NoPlanPopup /> */}</div>
            {children}
          </div>
        </div>

        <IncomingCallBanner />

        <DialerModal
          key="global-dialer-modal"
          open={isDialerOpen}
          onClose={handleDialerClose}
          initialPhoneNumber={leadData?.phoneNumber || ''}
          leadId={leadData?.leadId}
          leadName={leadData?.leadName}
        />

        {/* Agency Support Widget */}
        <AgencySupportWidget needHelp={false} />
      </div>
    </ErrorBoundary>
  )
}
