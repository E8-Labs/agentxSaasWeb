'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Apis from '@/components/apis/Apis'

/**
 * AppLogo Component
 * Automatically decides which logo to show based on hostname and agency branding
 * - Shows assignx.ai logo on assignx.ai domains (ai.assignx.ai, dev.assignx.ai, etc.)
 * - Shows agency logo on custom domains (if available), otherwise falls back to assignx.ai logo
 */
const AppLogo = ({
  height = 29,
  width = 122,
  maxWidth,
  className = '',
  style = {},
  alt = 'logo',
}) => {
  const [logoUrl, setLogoUrl] = useState(null)
  const [isAssignxDomain, setIsAssignxDomain] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hostname = window.location.hostname

    // Check if hostname is assignx.ai domain
    const isAssignx = hostname.includes('.assignx.ai') || hostname === 'assignx.ai' || hostname.includes('localhost')

    setIsAssignxDomain(isAssignx)

    // Check if user is a subaccount (for exception rule - show agency logo even on assignx domains)
    let isSubaccount = false
    try {
      const userData = localStorage.getItem('User')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        isSubaccount =
          parsedUser?.user?.userRole === 'AgencySubAccount' ||
          parsedUser?.userRole === 'AgencySubAccount'
      }
    } catch (error) {
      console.log('Error parsing user data:', error)
    }

    // If assignx domain AND not a subaccount, always show assignx logo
    // Exception: If subaccount, check for agency branding even on assignx.ai domains
    if (isAssignx && !isSubaccount) {
      setLogoUrl(null) // null means use assignx logo
      return
    }

    // For custom domains OR subaccounts on assignx.ai domains, check agency branding
    const getCookie = (name) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    }

    let branding = null

    // Try to get agency branding from cookie (set by middleware)
    const brandingCookie = getCookie('agencyBranding')
    if (brandingCookie) {
      try {
        branding = JSON.parse(decodeURIComponent(brandingCookie))
      } catch (error) {
        console.log('Error parsing agencyBranding cookie:', error)
      }
    }

    // Fallback to localStorage
    if (!branding) {
      const storedBranding = localStorage.getItem('agencyBranding')
      if (storedBranding) {
        try {
          branding = JSON.parse(storedBranding)
        } catch (error) {
          console.log('Error parsing agencyBranding from localStorage:', error)
        }
      }
    }

    // Additional fallback: Check user data for agencyBranding (for subaccounts)
    if (!branding && isSubaccount) {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          // Check multiple possible locations for agencyBranding
          if (parsedUser?.user?.agencyBranding) {
            branding = parsedUser.user.agencyBranding
          } else if (parsedUser?.agencyBranding) {
            branding = parsedUser.agencyBranding
          } else if (parsedUser?.user?.agency?.agencyBranding) {
            branding = parsedUser.user.agency.agencyBranding
          }
        }
      } catch (error) {
        console.log('Error parsing user data for agencyBranding:', error)
      }
    }

    // For subaccounts on localhost, try to fetch fresh branding from API if not found
    if (!branding && isSubaccount && isAssignx) {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const authToken = parsedUser?.token || parsedUser?.user?.token

          if (authToken) {
            // Fetch fresh branding from API
            fetch(Apis.getAgencyBranding, {
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            })
              .then((response) => response.json())
              .then((data) => {
                if (data?.status === true && data?.data?.branding) {
                  const freshBranding = data.data.branding
                  if (freshBranding?.logoUrl) {
                    setLogoUrl(freshBranding.logoUrl)
                    // Update localStorage and cookie with fresh data
                    localStorage.setItem(
                      'agencyBranding',
                      JSON.stringify(freshBranding),
                    )
                    const cookieValue = encodeURIComponent(
                      JSON.stringify(freshBranding),
                    )
                    document.cookie = `agencyBranding=${cookieValue}; path=/; max-age=${60 * 60 * 24}`
                  }
                }
              })
              .catch((error) => {
                console.log('Error fetching branding from API:', error)
              })
          }
        }
      } catch (error) {
        console.log('Error fetching branding from API:', error)
      }
    }

    // Set logo URL if branding found
    if (branding?.logoUrl) {
      setLogoUrl(branding.logoUrl)
    } else {
      // If no agency logo found, use assignx logo (null)
      setLogoUrl(null)
    }
  }, [])

  // Determine which logo to show
  const logoSrc = logoUrl || '/assets/assignX.png'
  // For agency logos, use a default width but let style override with 'auto'
  // For assignx logo, use the provided width
  const imageWidth = logoUrl ? (maxWidth || 200) : width
  const logoStyle = {
    height: `${height}px`,
    width: logoUrl ? 'auto' : `${width}px`,
    maxWidth: maxWidth ? `${maxWidth}px` : logoUrl ? '200px' : undefined,
    resize: 'contain',
    objectFit: 'contain',
    ...style,
  }

  return (
    <Image
      className={className}
      src={logoSrc}
      alt={alt}
      height={height}
      width={imageWidth}
      style={logoStyle}
    />
  )
}

export default AppLogo

