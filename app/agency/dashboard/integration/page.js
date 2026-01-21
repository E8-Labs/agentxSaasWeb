'use client'

import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

import AgencyIntegrations from '@/components/agency/dashboard/AgencyIntegrations'
import Integrations from '@/components/agency/integrations/Integrations'
import ConnectStripe from '@/components/agency/stripe/ConnectStripe'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

function Page() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = tabParam ? parseInt(tabParam, 10) : 1

  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.integrations.manage"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to manage integrations.</p>
          </div>
        }
      >
        <div>
          <AgencyIntegrations initialTab={initialTab} />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
