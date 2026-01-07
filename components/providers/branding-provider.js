'use client'

import { useEffect, useState } from 'react'
import { hexToHsl, calculateIconFilter } from '@/utilities/colorUtils'

/**
 * Client-side branding provider
 * Reads branding from cookies and injects CSS variables
 * This prevents the root layout from re-executing on navigation
 */
export function BrandingProvider({ children }) {
  const [brandingLoaded, setBrandingLoaded] = useState(false)

  useEffect(() => {
    
    // Get branding from multiple sources (same as blocking script)
    const getBranding = () => {
      var branding = null;
      
      // 1. Try cookie first (set by middleware - most up-to-date)
      try {
        const cookies = document.cookie.split(';')
        const brandingCookie = cookies.find(c => c.trim().startsWith('agencyBranding='))
        
        if (brandingCookie) {
          const value = brandingCookie.split('=')[1]
          // Cookie may be double-encoded, try decoding twice
          let decoded = decodeURIComponent(value)
          try {
            branding = JSON.parse(decoded)
          } catch (e) {
            // If first decode fails, try decoding again (double-encoded)
            try {
              branding = JSON.parse(decodeURIComponent(decoded))
            } catch (e2) {
              console.error('[BrandingProvider] Error parsing double-encoded cookie:', e2)
            }
          }
        }
      } catch (e) {
        console.error('[BrandingProvider] Error reading branding cookie:', e)
      }
      
      // 2. Try localStorage 'agencyBranding' key if cookie not found
      if (!branding) {
        try {
          const storedBranding = localStorage.getItem('agencyBranding')
          if (storedBranding) {
            branding = JSON.parse(storedBranding)
          }
        } catch (e) {
          // Ignore errors
        }
      }
      
      // 3. Try User object in localStorage if still not found
      if (!branding) {
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            // Check multiple possible locations (no optional chaining for compatibility)
            branding = 
              (parsedUser && parsedUser.user && parsedUser.user.agencyBranding) ||
              (parsedUser && parsedUser.agencyBranding) ||
              (parsedUser && parsedUser.user && parsedUser.user.agency && parsedUser.user.agency.agencyBranding) ||
              (parsedUser && parsedUser.agency && parsedUser.agency.agencyBranding)
          }
        } catch (e) {
          // Ignore errors
        }
      }
      
      return branding
    }

    const applyBranding = (branding) => {
      if (!branding) {
        // Check if branding colors are already set (by blocking script)
        // If they are, don't override with defaults
        const currentPrimary = window.getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
        const isDefaultPurple = currentPrimary === 'hsl(270, 91%, 65%)' || currentPrimary === '270 91% 65%' || currentPrimary === '270 75% 50%'
        const isBrandingColor = currentPrimary && !isDefaultPurple && currentPrimary !== ''
        
        // If branding colors are already set (by blocking script), don't override
        if (isBrandingColor) {
          setBrandingLoaded(true)
          return
        }
        
        // Use default colors only if no branding colors are set
        const defaultPrimary = '270 75% 50%' // #7902DF
        const defaultSecondary = '258 60% 60%' // #8B5CF6
        
        document.documentElement.style.setProperty('--brand-primary', defaultPrimary)
        document.documentElement.style.setProperty('--brand-secondary', defaultSecondary)
        document.documentElement.style.setProperty('--primary', defaultPrimary)
        document.documentElement.style.setProperty('--secondary', defaultSecondary)
        document.documentElement.style.setProperty('--icon-filter', 'brightness(0) saturate(100%)')
        setBrandingLoaded(true)
        return
      }

      // Use utility functions that return space-separated HSL format
      const primaryHsl = branding.primaryColor ? hexToHsl(branding.primaryColor) : '270 75% 50%'
      const secondaryHsl = branding.secondaryColor ? hexToHsl(branding.secondaryColor) : '258 60% 60%'
      const iconFilter = branding.primaryColor ? calculateIconFilter(branding.primaryColor) : 'brightness(0) saturate(100%)'

      document.documentElement.style.setProperty('--brand-primary', primaryHsl)
      document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
      document.documentElement.style.setProperty('--primary', primaryHsl)
      document.documentElement.style.setProperty('--secondary', secondaryHsl)
      document.documentElement.style.setProperty('--icon-filter', iconFilter)
      
      setBrandingLoaded(true)
    }

    // Apply branding immediately - check all sources
    const branding = getBranding()
    applyBranding(branding)

    // Also listen for cookie changes (in case branding updates)
    const checkBranding = () => {
      const newBranding = getBranding()
      if (newBranding) {
        applyBranding(newBranding)
      }
    }

    // Check periodically (every 5 seconds) for branding updates
    const interval = setInterval(checkBranding, 5000)

    return () => clearInterval(interval)
  }, [])

  // Render children immediately (branding will apply asynchronously)
  return <>{children}</>
}

