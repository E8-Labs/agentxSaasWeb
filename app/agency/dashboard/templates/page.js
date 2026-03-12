'use client'

import React from 'react'

import AgencyTemplatesList from '@/components/agency/templates/AgencyTemplatesList'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

const Page = () => {
  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.templates.manage"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to manage templates.</p>
          </div>
        }
      >
        <div>
          <AgencyTemplatesList />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
