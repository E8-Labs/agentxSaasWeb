'use client'

import { useEffect } from 'react'
import {
  hexToHsl,
  getDefaultPrimaryColor,
  getDefaultSecondaryColor,
} from '@/utilities/colorUtils'

/**
 * ThemeProvider Component
 * Dynamically applies agency branding colors (primary/secondary) based on hostname
 * - Only applies colors on custom domains (not assignx.ai domains)
 * - Reads agencyBranding from cookie/localStorage
 * - Converts hex colors to HSL and injects CSS variables
 * - Listens for branding updates to refresh colors
 */
const ThemeProvider = ({ children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyTheme = () => {
      const hostname = window.location.hostname

      // Check if hostname is assignx.ai domain
      const isAssignxDomain =
        hostname.includes('.assignx.ai') ||
        hostname === 'assignx.ai' ||
        hostname.includes('localhost')

      // If assignx domain, use default colors (don't override)
      if (isAssignxDomain) {
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
        return
      }

      // For custom domains, check agency branding
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
        } else {
          // Use default if no primary color
          const defaultPrimary = getDefaultPrimaryColor()
          document.documentElement.style.setProperty(
            '--brand-primary',
            defaultPrimary,
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

