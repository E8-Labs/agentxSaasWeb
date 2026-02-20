'use client'

import React from 'react'
import Messages from '@/components/messaging/Messages'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

const Page = () => {
  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agentx.messages.manage"
        hideIfNoPermission={false}
        fallback={
          <div className="w-full flex flex-col items-center justify-center h-[100svh]">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>
                Access Denied
              </h2>
              <p style={{ fontSize: '16px', color: '#666' }}>
                You do not have permission to view messages.
              </p>
            </div>
          </div>
        }
      >
        <Messages />
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page


