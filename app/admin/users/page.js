'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails'
import SelectedUserDetails from '@/components/admin/users/SelectedUserDetails'

export default function Page() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isFromAgency, setIsFromAgency] = useState(false)

  // ✅ Manually get `userId` from the URL (avoids Suspense issue)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('userId')
      const isFromAgency = params.get('agencyUser')
      setIsFromAgency(isFromAgency)
      if (id) {
        setUserId(id)
      }
    }
  }, [])

  // ✅ Fetch user details when `userId` is available
  useEffect(() => {
    if (userId) {
      //console.log;
      fetchUserDetails(userId)
    }
  }, [userId])

  const fetchUserDetails = async (userId) => {
    try {
      const data = await AdminGetProfileDetails(userId)
      if (data) {
        setSelectedUser(data)
        //console.log;
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  return (
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
          agencyUser={isFromAgency}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
