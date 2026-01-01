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
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'providers/branding-provider.js:8', message: 'BrandingProvider mounted', data: { pathname: window.location.pathname, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
    }
  }, [])
  // #endregion

  useEffect(() => {
    // Read branding from cookies client-side
    const getBrandingFromCookie = () => {
      try {
        const cookies = document.cookie.split(';')
        const brandingCookie = cookies.find(c => c.trim().startsWith('agencyBranding='))
        
        if (brandingCookie) {
          const value = brandingCookie.split('=')[1]
          const decoded = decodeURIComponent(value)
          return JSON.parse(decoded)
        }
      } catch (e) {
        console.error('[BrandingProvider] Error reading branding cookie:', e)
      }
      return null
    }

    const applyBranding = (branding) => {
      if (!branding) {
        // Use default colors (space-separated HSL format for CSS variables)
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

    // Apply branding immediately
    const branding = getBrandingFromCookie()
    applyBranding(branding)

    // Also listen for cookie changes (in case branding updates)
    const checkBranding = () => {
      const newBranding = getBrandingFromCookie()
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

