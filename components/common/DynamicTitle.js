'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAgencyTeamMember } from '@/store/slices/userSlice'

/**
 * Helper to update favicon link elements
 * Forces browser to refetch by updating href with cache-busting param
 */
function updateFavicon(faviconUrl) {
  if (typeof document === 'undefined') return

  // Create a hash from faviconUrl for cache-busting
  const hash = faviconUrl
    ? btoa(faviconUrl).slice(0, 8)
    : 'default'

  // Update all icon link elements
  const iconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
  iconLinks.forEach((link) => {
    const currentHref = link.getAttribute('href') || ''
    const baseHref = currentHref.split('?')[0] || '/icon'
    link.setAttribute('href', `${baseHref}?v=${hash}&t=${Date.now()}`)
  })

  // Update apple-touch-icon if present
  const appleLinks = document.querySelectorAll('link[rel="apple-touch-icon"]')
  appleLinks.forEach((link) => {
    const currentHref = link.getAttribute('href') || ''
    const baseHref = currentHref.split('?')[0] || '/apple-icon'
    link.setAttribute('href', `${baseHref}?v=${hash}&t=${Date.now()}`)
  })
}

/**
 * DynamicTitle component that updates the browser tab title and favicon
 * based on whether the user is a subaccount.
 * If the user is a subaccount, it shows the agency name and favicon instead of AssignX defaults
 */
export default function DynamicTitle() {
  const user = useSelector(selectUser)
  const isAgencyTeamMember = useSelector(selectIsAgencyTeamMember)

  useEffect(() => {
    // Only update if we're in the browser
    if (typeof window === 'undefined') return

    // Check if user is a subaccount and has agency information
    if (user?.agencyBranding?.companyName) {
      // Update document title to show agency name
      document.title = user.agencyBranding.companyName

      // Update favicon if custom faviconUrl exists
      if (user.agencyBranding.faviconUrl) {
        updateFavicon(user.agencyBranding.faviconUrl)
      }
      return
    }

    // Default to "AssignX" for regular users or when agency info is not available
    document.title = 'AssignX'
    updateFavicon(null) // Reset to default
  }, [user, isAgencyTeamMember])

  // This component doesn't render anything
  return null
}







