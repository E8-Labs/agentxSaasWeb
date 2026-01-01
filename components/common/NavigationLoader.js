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

      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Hide loading after page is ready or after minimum delay
      const hideLoading = () => {
        // Check if page is ready
        if (document.readyState === 'complete') {
          // Add a small delay to ensure smooth transition
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false)
          }, 200)
        } else {
          // Wait for page to load
          const handleLoad = () => {
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current)
            }
            loadingTimeoutRef.current = setTimeout(() => {
              setIsLoading(false)
            }, 200)
          }
          window.addEventListener('load', handleLoad, { once: true })
          
          // Fallback: hide after 2 seconds max
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false)
          }, 2000)
        }
      }

      // Small delay to show loading (prevents flicker on fast navigation)
      loadingTimeoutRef.current = setTimeout(hideLoading, 100)
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div
      className="fixed z-[9997] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-200"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        zIndex: 9997, // Below dialer (9998) but above most content
        // Position to cover only the right content area (85% width, starting at 15% from left)
        left: '15%',
        right: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="flex flex-col items-center gap-4">
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
