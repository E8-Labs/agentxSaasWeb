'use client'

import { useEffect } from 'react'
import {
  hexToHsl,
  getDefaultPrimaryColor,
  getDefaultSecondaryColor,
  calculateIconFilter,
} from '@/utilities/colorUtils'

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
  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyTheme = () => {
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

      // Check if user is a subaccount (for exception rule)
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

      // If assignx domain AND not a subaccount, use default colors (don't override)
      // Exception: If subaccount, apply branding even on assignx.ai domains
      if (isAssignxDomain && !isSubaccount) {
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

      // For custom domains OR subaccounts on assignx.ai domains, check agency branding
      const getCookie = (name) => {
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

      // Additional fallback: Check user data for agencyBranding (for subaccounts)
      if (!branding && isSubaccount) {
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            // Check if agencyBranding exists in user object
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
            }
          }
        } catch (error) {
          console.log('Error parsing user data for agencyBranding:', error)
        }
      }

      // Apply colors if branding exists
      if (branding) {
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
    applyTheme()

    // Listen for branding updates (same event as logo updates)
    const handleBrandingUpdate = (event) => {
      console.log('🔄 [ThemeProvider] Branding updated, refreshing colors')
      applyTheme()
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  return <>{children}</>
}

export default ThemeProvider

