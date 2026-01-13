'use client'

import React from 'react'

import AdminDashboardCallLogs from '@/components/admin/CallLogs/AdminDashboardCallLogs'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

const Page = () => {
  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.activity.view"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to view activity logs.</p>
          </div>
        }
      >
        <div className="w-full h-screen flex flex-col">
          <AdminDashboardCallLogs isFromAgency={true} />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
