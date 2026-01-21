'use client'

import React from 'react'

import WhiteLabel from '@/components/agency/whiteLabeling/WhiteLabel'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

const Page = () => {
  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.whitelabel.manage"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to manage whitelabel settings.</p>
          </div>
        }
      >
        <div className="w-full">
          <WhiteLabel />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
