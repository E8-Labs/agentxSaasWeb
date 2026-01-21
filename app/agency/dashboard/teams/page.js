'use client'

import React, { useEffect, useState } from 'react'

import AdminTeam from '@/components/admin/users/AdminTeams'
import Teams from '@/components/dashboard/teams/Teams'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

function Page() {
  const [agencyData, setAgencyData] = useState(null)

  useEffect(() => {
    const Data = localStorage.getItem('User')
    if (Data) {
      const LD = JSON.parse(Data)
      setAgencyData(LD.user)
    }
  }, [])

  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.teams.manage"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to manage teams.</p>
          </div>
        }
      >
        <div>
          <Teams agencyData={agencyData} from={'agency'} />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page
