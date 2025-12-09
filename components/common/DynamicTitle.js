'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAgencyTeamMember } from '@/store/slices/userSlice'

/**
 * DynamicTitle component that updates the browser tab title
 * based on whether the user is a subaccount.
 * If the user is a subaccount, it shows the agency name instead of "AssignX"
 */
export default function DynamicTitle() {
  const user = useSelector(selectUser)
  const isAgencyTeamMember = useSelector(selectIsAgencyTeamMember)

  useEffect(() => {
    // Only update title if we're in the browser
    if (typeof window === 'undefined') return
    
    // Check if user is a subaccount and has agency information
    if (user?.agencyBranding?.companyName) {
      // Prefer agency name, fallback to company name if name is not available
      const agencyName = user?.agencyBranding?.companyName
      
      if (agencyName) {
        // Update document title to show agency name
        document.title = agencyName
        return
      }
    }
    
    // Default to "AssignX" for regular users or when agency info is not available
    document.title = 'AssignX'
  }, [user, isAgencyTeamMember])

  // This component doesn't render anything
  return null
}
