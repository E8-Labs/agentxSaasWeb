'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

import DashboardPlans from '@/components/agency/plan/DashboardPlans'

function Page() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  // Map tab parameter to planType: 'xbar' -> 'Xbar', default to 'monthly'
  const initialTab = tabParam === 'xbar' ? 'Xbar' : 'monthly'

  return (
    <div className="flex flex-col items-center w-full">
      <DashboardPlans initialTab={initialTab} />
    </div>
  )
}

export default Page
