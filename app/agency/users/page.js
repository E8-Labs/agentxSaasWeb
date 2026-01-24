'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails'
import SelectedUserDetails from '@/components/admin/users/SelectedUserDetails'
import { PermissionProvider } from '@/contexts/PermissionContext'

export default function Page() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [enablePermissionChecks, setEnablePermissionChecks] = useState(false)

  // ✅ Manually get `userId` from the URL (avoids Suspense issue)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('userId')
      const permChecks = params.get('enablePermissionChecks')
      setEnablePermissionChecks(permChecks === 'true')
      if (id) {
        setUserId(id)
      }
    }
  }, [])

  // ✅ Fetch user details when `userId` is available
  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId)
    }
  }, [userId])

  const fetchUserDetails = async (userId) => {
    try {
      const data = await AdminGetProfileDetails(userId)
      if (data) {
        setSelectedUser(data)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  return (
    <PermissionProvider>
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        {selectedUser ? (
          <SelectedUserDetails
            handleDel={() => {
              // Notify parent window to refresh
              if (window.opener) {
                window.opener.location.reload()
              }

              // Close the current tab
              window.close()
            }}
            selectedUser={selectedUser}
            enablePermissionChecks={enablePermissionChecks}
            hideViewDetails={true}
            from="subaccount"
            agencyUser={true}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </PermissionProvider>
  )
}
