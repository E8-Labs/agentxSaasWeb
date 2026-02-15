'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

import DashboardPlans from '@/components/agency/plan/DashboardPlans'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

function Page() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  // Map tab parameter to planType: 'xbar' -> 'Xbar', default to 'monthly'
  const initialTab = tabParam === 'xbar' ? 'Xbar' : 'monthly'

  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.plans.manage"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to manage plans.</p>
          </div>
        }
      >
        <div className="h-auto w-full bg-white">
          <DashboardPlans initialTab={initialTab} />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
