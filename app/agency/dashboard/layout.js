'use client'

import { useEffect, useState } from 'react'

import ErrorBoundary from '@/components/ErrorBoundary'
import AgencyNavBar from '@/components/dashboard/Navbar/AgencyNavBar'
import ProfileNav from '@/components/dashboard/Navbar/ProfileNav'
import AgencySupportWidget from '@/components/agency/AgencySupportWidget'

const shouldShowServiceBanner =
  process.env.NEXT_PUBLIC_REACT_APP_DOWN_TIME === 'Yes'

export default function DashboardLayout({ children }) {
  const message =
    'Taking a brief pause to invent the future. Calls will resume soon.'
  //Our voice system is currently undergoing maintenance. Adding a few updates.

  const [typedMessage, setTypedMessage] = useState(message)
  const [charIndex, setCharIndex] = useState(0)

  //   useEffect(() => {
  //     if (shouldShowServiceBanner && charIndex < message.length) {
  //       const timeout = setTimeout(() => {
  //         setTypedMessage((prev) => prev + message[charIndex]);
  //         setCharIndex((prev) => prev + 1);
  //       }, 50); // Typing speed

  //       return () => clearTimeout(timeout);
  //     }
  //   }, [charIndex, shouldShowServiceBanner]);

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
          {/* Sidebar - fixed width 250px, no max-width */}
          <div
            className="h-screen w-[250px] min-w-[250px] shrink-0"
            style={{
              borderRight: '1px solid #00000010',
              backgroundColor: 'white',
            }}
          >
            <AgencyNavBar />
          </div>

          {/* Main Content - page background #f9f9f9 */}
          <div className="agency-dashboard-content flex-1 min-w-0 w-full min-h-screen bg-[#f9f9f9]">
            <div>{/* <NoPlanPopup /> */}</div>
            {children}
          </div>
        </div>
        
        {/* Agency Support Widget */}
        <AgencySupportWidget needHelp={false} />
      </div>
    </ErrorBoundary>
  )
}
