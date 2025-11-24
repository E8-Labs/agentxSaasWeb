'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

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

    // If assignx domain, always show assignx logo
    if (isAssignx) {
      setLogoUrl(null) // null means use assignx logo
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
    if (brandingCookie) {
      try {
        const brandingData = JSON.parse(decodeURIComponent(brandingCookie))
        if (brandingData?.logoUrl) {
          setLogoUrl(brandingData.logoUrl)
          return
        }
      } catch (error) {
        console.log('Error parsing agencyBranding cookie:', error)
      }
    }

    // Fallback to localStorage
    const storedBranding = localStorage.getItem('agencyBranding')
    if (storedBranding) {
      try {
        const brandingData = JSON.parse(storedBranding)
        if (brandingData?.logoUrl) {
          setLogoUrl(brandingData.logoUrl)
          return
        }
      } catch (error) {
        console.log('Error parsing agencyBranding from localStorage:', error)
      }
    }

    // If no agency logo found, use assignx logo (null)
    setLogoUrl(null)
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

