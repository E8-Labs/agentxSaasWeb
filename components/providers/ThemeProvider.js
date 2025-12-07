'use client'

import { useEffect, useState } from 'react'
import {
  hexToHsl,
  getDefaultPrimaryColor,
  getDefaultSecondaryColor,
  calculateIconFilter,
} from '@/utilities/colorUtils'
import Apis from '@/components/apis/Apis'

/**
 * ThemeProvider Component
 * Dynamically applies agency branding colors (primary/secondary) based on hostname
 * - Only applies colors on custom domains (not assignx.ai domains)
 * - Exception: Applies branding on assignx.ai domains if user is a subaccount
 * - Reads agencyBranding from cookie/localStorage
 * - Converts hex colors to HSL and injects CSS variables
 * - Listens for branding updates to refresh colors
 * - Can be disabled via NEXT_PUBLIC_DISABLE_AGENCY_BRANDING env variable
 */
const ThemeProvider = ({ children }) => {
  const [brandingFetched, setBrandingFetched] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyTheme = async (forceRefresh = false) => {
      // Check if agency branding is disabled via environment variable
      const isBrandingDisabled =
        process.env.NEXT_PUBLIC_DISABLE_AGENCY_BRANDING === 'true' ||
        process.env.NEXT_PUBLIC_DISABLE_AGENCY_BRANDING === '1'

      if (isBrandingDisabled) {
        console.log('🚫 [ThemeProvider] Agency branding disabled via environment variable')
        // Force assignx branding
        const defaultPrimary = getDefaultPrimaryColor()
        const defaultSecondary = getDefaultSecondaryColor()
        document.documentElement.style.setProperty(
          '--brand-primary',
          defaultPrimary,
        )
        document.documentElement.style.setProperty(
          '--brand-secondary',
          defaultSecondary,
        )
        document.documentElement.style.setProperty(
          '--icon-filter',
          'brightness(0) saturate(100%)',
        )
        return
      }

      const hostname = window.location.hostname

      // Check if hostname is assignx.ai domain
      const isAssignxDomain =
        hostname.includes('.assignx.ai') ||
        hostname === 'assignx.ai' ||
        hostname.includes('localhost')

      // Check if user is a subaccount or agency (for exception rule)
      let isSubaccount = false
      let isAgency = false
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          isSubaccount = userRole === 'AgencySubAccount'
          isAgency = userRole === 'Agency'
        }
      } catch (error) {
        console.log('Error parsing user data:', error)
      }

      // If assignx domain AND not a subaccount AND not an agency, use default colors (don't override)
      // Exception: If subaccount or agency, apply branding even on assignx.ai domains
      if (isAssignxDomain && !isSubaccount && !isAgency) {
        // Set defaults explicitly to ensure consistency
        const defaultPrimary = getDefaultPrimaryColor()
        const defaultSecondary = getDefaultSecondaryColor()
        document.documentElement.style.setProperty(
          '--brand-primary',
          defaultPrimary,
        )
        document.documentElement.style.setProperty(
          '--brand-secondary',
          defaultSecondary,
        )
        // Icons stay purple (no filter needed)
        document.documentElement.style.setProperty(
          '--icon-filter',
          'brightness(0) saturate(100%)',
        )
        return
      }

      // For custom domains OR subaccounts/agencies on assignx.ai domains, check agency branding
      const getCookie = (name) => {
        if(name === 'agencyBranding') {
          return null
        }
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
        return null
      }

      // Try to get agency branding from cookie (set by middleware)
      const brandingCookie = getCookie('agencyBranding')
      let branding = null

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

      // Additional fallback: Check user data for agencyBranding (for subaccounts and agencies)
      if (!branding && (isSubaccount || isAgency)) {
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            // Check multiple possible locations for agencyBranding
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
              console.log('✅ [ThemeProvider] Found branding in user.user.agencyBranding')
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
              console.log('✅ [ThemeProvider] Found branding in user.agencyBranding')
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              branding = parsedUser.user.agency.agencyBranding
              console.log('✅ [ThemeProvider] Found branding in user.agency.agencyBranding')
            }
          }
        } catch (error) {
          console.log('Error parsing user data for agencyBranding:', error)
        }
      }

      // Debug logging for subaccounts/agencies on localhost
      if ((isSubaccount || isAgency) && isAssignxDomain) {
        console.log('🔍 [ThemeProvider] User detected on assignx domain:', {
          hostname,
          isSubaccount,
          isAgency,
          hasBranding: !!branding,
          brandingSource: branding
            ? 'found'
            : 'not found - will use defaults',
        })
      }

      // For subaccounts/agencies on localhost, try to fetch fresh branding from API if not found or if forced
      if ((!branding || forceRefresh) && (isSubaccount || isAgency) && isAssignxDomain && !brandingFetched) {
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            const authToken = parsedUser?.token || parsedUser?.user?.token

            if (authToken) {
              console.log('🔄 [ThemeProvider] Fetching fresh branding from API for user...')
              setBrandingFetched(true) // Prevent multiple simultaneous requests

              const response = await fetch(Apis.getAgencyBranding, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              })

              if (response.ok) {
                const data = await response.json()
                if (data?.status === true && data?.data?.branding) {
                  const freshBranding = data.data.branding
                  branding = freshBranding

                  // Update localStorage and cookie with fresh data
                  localStorage.setItem(
                    'agencyBranding',
                    JSON.stringify(freshBranding),
                  )
                  const cookieValue = encodeURIComponent(
                    JSON.stringify(freshBranding),
                  )
                  // document.cookie = `agencyBranding=${cookieValue}; path=/; max-age=${60 * 60 * 24}`

                  console.log('✅ [ThemeProvider] Fetched and cached fresh branding from API')
                }
              }
            }
          }
        } catch (error) {
          console.log('Error fetching branding from API:', error)
        }
      }

      // Update favicon if branding exists and has faviconUrl
      const updateFavicon = (faviconUrl) => {
        // Remove ALL existing favicon and shortcut icon links
        // We'll add a new one if faviconUrl is provided
        const existingLinks = document.querySelectorAll(
          'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
        )
        existingLinks.forEach((link) => {
          link.remove()
        })

        if (faviconUrl && faviconUrl.trim() !== '') {
          // Create new favicon link with cache busting to ensure it updates
          const link = document.createElement('link')
          link.rel = 'icon'
          link.type = 'image/x-icon'
          // Add timestamp to prevent caching issues
          const separator = faviconUrl.includes('?') ? '&' : '?'
          const cacheBustedUrl = `${faviconUrl}${separator}t=${Date.now()}`
          link.href = cacheBustedUrl
          document.head.appendChild(link)

          // Also add apple-touch-icon for better mobile support
          const appleIconLink = document.createElement('link')
          appleIconLink.rel = 'apple-touch-icon'
          appleIconLink.href = cacheBustedUrl
          document.head.appendChild(appleIconLink)

          console.log('✅ [ThemeProvider] Favicon updated:', faviconUrl)
        } else {
          // If no favicon, browser will use default favicon.ico
          console.log('ℹ️ [ThemeProvider] No favicon in branding, using default')
        }
      }

      // Apply colors if branding exists
      if (branding) {
        // Always update favicon (pass null/undefined if not available)
        const faviconUrl = branding.faviconUrl
        console.log('🔍 [ThemeProvider] Branding faviconUrl:', faviconUrl)
        updateFavicon(faviconUrl || null)

        // Convert and apply primary color
        if (branding.primaryColor) {
          const primaryHsl = hexToHsl(branding.primaryColor)
          document.documentElement.style.setProperty(
            '--brand-primary',
            primaryHsl,
          )
          // Also update --primary for shadcn/ui compatibility
          document.documentElement.style.setProperty('--primary', primaryHsl)
          
          // Calculate and apply icon filter to convert purple icons to brand color
          const iconFilter = calculateIconFilter(branding.primaryColor)
          document.documentElement.style.setProperty(
            '--icon-filter',
            iconFilter,
          )
        } else {
          // Use default if no primary color
          const defaultPrimary = getDefaultPrimaryColor()
          document.documentElement.style.setProperty(
            '--brand-primary',
            defaultPrimary,
          )
          // Reset icon filter to default
          document.documentElement.style.setProperty(
            '--icon-filter',
            'brightness(0) saturate(100%)',
          )
        }

        // Convert and apply secondary color
        if (branding.secondaryColor) {
          const secondaryHsl = hexToHsl(branding.secondaryColor)
          document.documentElement.style.setProperty(
            '--brand-secondary',
            secondaryHsl,
          )
          // Also update --secondary for shadcn/ui compatibility
          document.documentElement.style.setProperty('--secondary', secondaryHsl)
        } else {
          // Use default if no secondary color
          const defaultSecondary = getDefaultSecondaryColor()
          document.documentElement.style.setProperty(
            '--brand-secondary',
            defaultSecondary,
          )
        }
      } else {
        // No branding found, use defaults
        const defaultPrimary = getDefaultPrimaryColor()
        const defaultSecondary = getDefaultSecondaryColor()
        document.documentElement.style.setProperty(
          '--brand-primary',
          defaultPrimary,
        )
        document.documentElement.style.setProperty(
          '--brand-secondary',
          defaultSecondary,
        )
        // Reset icon filter to default
        document.documentElement.style.setProperty(
          '--icon-filter',
          'brightness(0) saturate(100%)',
        )
      }
    }

    // Apply theme on mount
    applyTheme().catch((error) => {
      console.log('Error applying theme:', error)
    })

    // Listen for branding updates (same event as logo updates)
    const handleBrandingUpdate = (event) => {
      console.log('🔄 [ThemeProvider] Branding updated, refreshing theme and favicon')
      
      // Use event detail if available (faster), otherwise re-read from localStorage
      let brandingToUse = null
      if (event?.detail) {
        brandingToUse = event.detail
        console.log('✅ [ThemeProvider] Using branding from event detail:', brandingToUse)
      } else {
        // Fallback: read from localStorage
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            brandingToUse = JSON.parse(storedBranding)
            console.log('✅ [ThemeProvider] Using branding from localStorage:', brandingToUse)
          } catch (error) {
            console.log('Error parsing agencyBranding from localStorage:', error)
          }
        }
      }

      // If we have branding data, update favicon immediately
      const faviconUrlFromEvent = brandingToUse?.faviconUrl
      console.log('🔍 [ThemeProvider] Event faviconUrl:', faviconUrlFromEvent)
      
      if (faviconUrlFromEvent) {
        const updateFaviconFromEvent = (faviconUrl) => {
          // Remove ALL existing favicon links
          const existingLinks = document.querySelectorAll(
            'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
          )
          existingLinks.forEach((link) => {
            console.log('🗑️ [ThemeProvider] Removing existing favicon link:', link.href)
            link.remove()
          })

          if (faviconUrl && faviconUrl.trim() !== '') {
            // Create new favicon link with cache busting
            const link = document.createElement('link')
            link.rel = 'icon'
            link.type = 'image/x-icon'
            const separator = faviconUrl.includes('?') ? '&' : '?'
            const cacheBustedUrl = `${faviconUrl}${separator}t=${Date.now()}`
            link.href = cacheBustedUrl
            document.head.appendChild(link)
            console.log('✅ [ThemeProvider] Added new favicon link:', cacheBustedUrl)

            // Add apple-touch-icon
            const appleIconLink = document.createElement('link')
            appleIconLink.rel = 'apple-touch-icon'
            appleIconLink.href = cacheBustedUrl
            document.head.appendChild(appleIconLink)
            console.log('✅ [ThemeProvider] Added apple-touch-icon:', cacheBustedUrl)

            console.log('✅ [ThemeProvider] Favicon updated from event:', faviconUrl)
          } else {
            console.log('⚠️ [ThemeProvider] Favicon URL is empty or invalid:', faviconUrl)
          }
        }
        updateFaviconFromEvent(faviconUrlFromEvent)
      } else {
        console.log('ℹ️ [ThemeProvider] No faviconUrl in event branding data')
      }

      setBrandingFetched(false) // Reset to allow fresh fetch if needed
      applyTheme(true).catch((error) => {
        console.log('Error refreshing theme:', error)
      })
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  return <>{children}</>
}

export default ThemeProvider

