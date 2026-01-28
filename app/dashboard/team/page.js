'use client'

import React, { useEffect, useState } from 'react'

import Teams from '@/components/dashboard/teams/Teams'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

function Page() {
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const userLocalData = localStorage.getItem('User')
    if (userLocalData) {
      const D = JSON.parse(userLocalData)
      if (D?.user?.userRole === 'AgencySubAccount') {
        setUserRole('SubAccount')
      } else {
        setUserRole('user')
      }
    }
  }, [])

  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agentx.teams.manage"
        hideIfNoPermission={false}
        fallback={
          <div className="w-full flex flex-col items-center justify-center h-screen">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>
                Access Denied
              </h2>
              <p style={{ fontSize: '16px', color: '#666' }}>
                You do not have permission to view teams.
              </p>
            </div>
          </div>
        }
      >
        <div>
          <Teams from={userRole} />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
