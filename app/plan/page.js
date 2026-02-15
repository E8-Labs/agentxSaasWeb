'use client'

import React, { useEffect } from 'react'

import UserPlans from '@/components/userPlans/UserPlans'
import UserPlansMobile from '@/components/userPlans/UserPlansMobile'

function page() {
  let isFrom = ''

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
  const SM_SCREEN_SIZE = 640
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  )

  return (
    <div>
      {
        (screenWidth <= SM_SCREEN_SIZE || isMobileDevice) ? (
          <UserPlansMobile
            handleContinue={() => {

              const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
              const SM_SCREEN_SIZE = 640
              const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                typeof navigator !== 'undefined' ? navigator.userAgent : ''
              )

              // For mobile subaccounts, redirect to continue to desktop screen
              if (screenWidth <= SM_SCREEN_SIZE || isMobileDevice) {
                // Use window.location.href for hard redirect to prevent React cleanup errors
                setTimeout(() => {
                  window.location.href = '/createagent/desktop'
                }, 0)
              }
            }}
            
        />
      ):(
      <UserPlans from="dashboard" />
      )
    }
    </div>
  )
}

export default page
