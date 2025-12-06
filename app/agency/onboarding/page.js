'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import ProgressBar from '@/components/onboarding/ProgressBar'
import AgencySignUp from '@/components/onboarding/agencyOnboarding/AgencySignUp'
import AgencySignupMobile from '@/components/onboarding/agencyOnboarding/AgencySignupMobile'
import AgencyPlans from '@/components/plan/AgencyPlans'
import { PersistanceKeys } from '@/constants/Constants'
import AppLogo from '@/components/common/AppLogo'

function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get step from URL, default to 1
  const stepFromUrl = parseInt(searchParams.get('step') || '1', 10)
  const [currentIndex, setCurrentIndex] = useState(stepFromUrl)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const D = localStorage.getItem('User')
    const subPlanData = localStorage.getItem(
      PersistanceKeys.LocalStorageSubPlan,
    )

    if (D) {
      const Data = JSON.parse(D)

      // Check if user is here intentionally for onboarding (no plan)
      const needsOnboarding =
        subPlanData && JSON.parse(subPlanData)?.subPlan === false

      if (Data.user.userType == 'admin') {
        // router.push("/admin");
        window.location.href = '/admin'
      } else if (Data.user.userRole == 'Agency' && !needsOnboarding) {
        // Only redirect if user doesn't need onboarding
        // router.push("/agency/dashboard");
        // window.location.href = "/agency/dashboard";
      } else if (Data.user.userRole !== 'Agency') {
        // router.push("/dashboard");
        window.location.href = '/dashboard'
      }
      // If userRole == "Agency" AND needsOnboarding is true, stay on onboarding page
    }
  }, [])

  // Update URL when currentIndex changes
  useEffect(() => {
    const currentStep = searchParams.get('step')
    if (currentStep !== currentIndex.toString()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('step', currentIndex.toString())
      router.replace(`/agency/onboarding?${params.toString()}`, {
        scroll: false,
      })
    }
  }, [currentIndex, router, searchParams])

  useEffect(() => {
    const userData = localStorage.getItem(PersistanceKeys.LocalStorageSubPlan)
    if (userData) {
      const D = JSON.parse(userData)
      if (D) {
        setCurrentIndex(2)
      }
    }
  }, [])

  // Detect mobile/desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640) // Tailwind's sm breakpoint
      }
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleContinue = () => {
    setCurrentIndex((prev) => prev + 1)
  }
  return (
    <div className="flex flex-col w-full items-center justify-center py-5 overflow-y-auto">
      <div
        className="flex w-full px-4 flex-row items-center justify-start gap-2 mt-4  sm:rounded-2xl sm:mx-2 w-full md:w-11/12 h-[10%]"
        style={{ backgroundColor: '' }}
      >
        <AppLogo
          height={30}
          width={130}
          alt="logo"
        />
        {/* /assets/agentX.png */}

        <div className="w-[100%]">
          <ProgressBar value={currentIndex > 1 ? 100 : 50} />
        </div>
      </div>

      {currentIndex > 1 ? (
        <AgencyPlans isMobile={isMobile} />
      ) : isMobile ? (
        <AgencySignupMobile handleContinue={handleContinue} />
      ) : (
        <AgencySignUp handleContinue={handleContinue} />
      )}

      {/* <AgencyPlans /> */}
    </div>
  )
}

export default Page
