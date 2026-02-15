'use client'

import React from 'react'

import AgencySubacount from '@/components/agency/subaccount/AgencySubacount'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

const Page = () => {
  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.subaccounts.manage"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to manage subaccounts.</p>
          </div>
        }
      >
        <div className="w-full h-auto bg-transparent">
          <AgencySubacount />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
