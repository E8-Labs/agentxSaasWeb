'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * NavigationLoader - Shows a loading indicator during navigation
 * Detects link clicks and pathname changes to show loading overlay
 */
export default function NavigationLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const previousPathname = useRef(pathname)
  const loadingTimeoutRef = useRef(null)
  const maxLoadingTimeoutRef = useRef(null) // Separate ref for maximum timeout

  useEffect(() => {
    // Detect when user clicks on navigation links
    const handleLinkClick = (e) => {
      const target = e.target.closest('a')
      if (target && target.href) {
        const url = new URL(target.href)
        // Only show loading for internal navigation (same origin)
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setIsLoading(true)
        }
      }
    }

    // Listen for clicks on the document
    document.addEventListener('click', handleLinkClick, true)

    return () => {
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [pathname])

  useEffect(() => {
    // When pathname changes, ensure loading is shown
    if (pathname !== previousPathname.current) {
      setIsLoading(true)
      previousPathname.current = pathname

      // Clear any existing timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      if (maxLoadingTimeoutRef.current) {
        clearTimeout(maxLoadingTimeoutRef.current)
        maxLoadingTimeoutRef.current = null
      }

      // CRITICAL: Always set a maximum timeout to ensure loader never spins forever
      // This is a safety net - loader will ALWAYS hide after 5 seconds max
      maxLoadingTimeoutRef.current = setTimeout(() => {
        console.warn('[NavigationLoader] Maximum timeout reached, forcing loader to hide')
        setIsLoading(false)
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
      }, 5000) // 5 seconds maximum

      // Hide loading after page is ready or after minimum delay
      const hideLoading = () => {
        // Check if page is ready
        if (document.readyState === 'complete') {
          // Add a small delay to ensure smooth transition
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false)
            if (maxLoadingTimeoutRef.current) {
              clearTimeout(maxLoadingTimeoutRef.current)
              maxLoadingTimeoutRef.current = null
            }
          }, 200)
        } else {
          // Wait for page to load
          const handleLoad = () => {
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current)
            }
            loadingTimeoutRef.current = setTimeout(() => {
              setIsLoading(false)
              if (maxLoadingTimeoutRef.current) {
                clearTimeout(maxLoadingTimeoutRef.current)
                maxLoadingTimeoutRef.current = null
              }
            }, 200)
          }
          window.addEventListener('load', handleLoad, { once: true })
          
          // Fallback: hide after 2 seconds if page doesn't load
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false)
            if (maxLoadingTimeoutRef.current) {
              clearTimeout(maxLoadingTimeoutRef.current)
              maxLoadingTimeoutRef.current = null
            }
          }, 2000)
        }
      }

      // Small delay to show loading (prevents flicker on fast navigation)
      loadingTimeoutRef.current = setTimeout(hideLoading, 100)
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      if (maxLoadingTimeoutRef.current) {
        clearTimeout(maxLoadingTimeoutRef.current)
        maxLoadingTimeoutRef.current = null
      }
    }
  }, [pathname])

  // Additional safety: Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (maxLoadingTimeoutRef.current) {
        clearTimeout(maxLoadingTimeoutRef.current)
      }
      setIsLoading(false)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div
      className="fixed flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-200"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        zIndex: 1200, // Below dialer (z-[1401]) but above most content
        // Position to cover only the right content area (85% width, starting at 15% from left)
        left: '15%',
        right: 0,
        top: 0,
        bottom: 0,
        pointerEvents: 'none', // Allow clicks to pass through to dialer
      }}
    >
      <div className="flex flex-col items-center gap-4" style={{ pointerEvents: 'auto' }}>
        <Loader2 
          className="h-10 w-10 animate-spin" 
          style={{ color: 'var(--brand-primary, #7902DF)' }} 
        />
        <p className="text-sm font-medium" style={{ color: 'var(--brand-primary, #7902DF)' }}>
          Loading...
        </p>
      </div>
    </div>
  )
}
