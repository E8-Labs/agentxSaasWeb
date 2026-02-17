'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Apis from '@/components/apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'
import { UserRole } from '@/constants/UserRole'

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
  const [companyName, setCompanyName] = useState(null)
  // Initialize isAssignxDomain based on current hostname (if available)
  const [isAssignxDomain, setIsAssignxDomain] = useState(() => {
    if (typeof window === 'undefined') return true
    const hostname = window.location.hostname
    return hostname === "dev.assignx.ai" || hostname === "app.assignx.ai" || hostname.includes('localhost')
  })
  // On custom domain: don't show AssignX until branding is resolved (cookie → localStorage → API)
  const [brandingResolved, setBrandingResolved] = useState(false)

  useEffect(() => {
    console.log("Value of logoUrl is", logoUrl)
  }, [logoUrl])

  useEffect(() => {
    console.log("Value of companyName is", companyName)
  }, [companyName])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hostname = window.location.hostname

    // Check if hostname is assignx.ai domain
    const isAssignx = hostname === "dev.assignx.ai" || hostname === "app.assignx.ai" || hostname.includes('localhost')

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
    } catch (error) { }

    // Check if agency/admin is creating agent for subaccount
    let isAgencyCreatingForSubaccount = false
    let subaccountData = null
    try {
      const isFromAdminOrAgency = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      if (isFromAdminOrAgency) {
        const parsed = JSON.parse(isFromAdminOrAgency)
        if (parsed?.subAccountData) {
          isAgencyCreatingForSubaccount = true
          subaccountData = parsed.subAccountData
        }
      }
    } catch (error) { }

    // If assignx domain AND not a subaccount AND not agency creating for subaccount, always show assignx logo
    // Exception: If subaccount OR agency creating for subaccount, check for agency branding even on assignx.ai domains
    // if (isAssignx && !isSubaccount && !isAgencyCreatingForSubaccount) {
    //   setLogoUrl(null) // null means use assignx logo
    //   return
    // }

    // Resolution order: cookie (middleware) → localStorage → User (subaccounts)
    let branding = null

    // 1) Cookie first (set by middleware on custom domain / subdomain)
    // Use same parsing logic as BrandingProvider to handle double-encoding
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
            console.warn('[AppLogo] Error parsing branding cookie')
          }
        }
      }
    } catch (e) {
      console.warn('[AppLogo] Error reading branding cookie:', e)
    }

    // 2) localStorage
    if (!branding) {
      const storedBranding = localStorage.getItem('agencyBranding')
      if (storedBranding) {
        try {
          branding = JSON.parse(storedBranding)
        } catch (error) { }
      }
    }

    // 3) User data for agencyBranding (subaccounts)
    if (isSubaccount && !branding) {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          if (parsedUser?.user?.agencyBranding) branding = parsedUser.user.agencyBranding
          else if (parsedUser?.agencyBranding) branding = parsedUser.agencyBranding
          else if (parsedUser?.user?.agency?.agencyBranding) branding = parsedUser.user.agency.agencyBranding
        }
      } catch (error) { }
    }

    // Function to fetch branding from API (for custom domains or subaccounts)
    const fetchBrandingFromAPI = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_API_URL ||
          (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
            ? 'https://apimyagentx.com/agentx/'
            : 'https://apimyagentx.com/agentxtest/')

        // Try domain lookup API first (works for custom domains without auth)
        // Always pass full hostname as customDomain - backend will check domains table
        // Add timeout to prevent hanging on CORS errors
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        try {
          const lookupResponse = await fetch(
            `${baseUrl}api/agency/lookup-by-domain`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                customDomain: hostname,
              }),
              signal: controller.signal,
            },
          )

          clearTimeout(timeoutId)

          if (lookupResponse.ok) {
            const lookupData = await lookupResponse.json()
            if (lookupData.status && lookupData.data?.branding) {
              const freshBranding = lookupData.data.branding
              setLogoUrl(freshBranding?.logoUrl || null)
              setCompanyName(freshBranding?.companyName || null)
              localStorage.setItem(
                'agencyBranding',
                JSON.stringify(freshBranding),
              )
              setBrandingResolved(true)
              return
            }
          }
          setBrandingResolved(true)
          return
        } catch (fetchError) {
          console.warn('[AppLogo] Error fetching branding from API - continuing without custom logo:', fetchError)
          clearTimeout(timeoutId)
          // Silently handle CORS errors and network failures - don't block the page
          if (fetchError.name === 'AbortError') {
            console.warn('[AppLogo] Domain lookup timeout - continuing without custom logo')
          } else if (fetchError.message?.includes('CORS') || fetchError.message?.includes('Failed to fetch')) {
            console.warn('[AppLogo] Domain lookup CORS error - continuing without custom logo:', fetchError.message)
          } else {
            console.warn('[AppLogo] Domain lookup error - continuing without custom logo:', fetchError)
          }
          // Continue to fallback logic below
        }

        // Fallback: Try getAgencyBranding API if user is logged in (for subaccounts or agency creating for subaccount)
        if (isSubaccount || isAgencyCreatingForSubaccount) {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            const authToken = parsedUser?.token || parsedUser?.user?.token

            if (authToken) {
              // Add timeout to prevent hanging
              const fallbackController = new AbortController()
              const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 5000) // 5 second timeout

              try {
                // If agency is creating for subaccount, we need to get the subaccount's agency branding
                // The API should handle this based on the subaccount's agencyId
                const response = await fetch(Apis.getAgencyBranding, {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                  signal: fallbackController.signal,
                })

                clearTimeout(fallbackTimeoutId)

                if (response.ok) {
                  const data = await response.json()
                  if (data?.status === true && data?.data?.branding) {
                    const freshBranding = data.data.branding
                    setLogoUrl(freshBranding?.logoUrl || null)
                    setCompanyName(freshBranding?.companyName || null)
                    localStorage.setItem(
                      'agencyBranding',
                      JSON.stringify(freshBranding),
                    )
                    setBrandingResolved(true)
                    return
                  }
                }
              } catch (fallbackError) {
                clearTimeout(fallbackTimeoutId)
                // Silently handle errors - don't block the page
                if (fallbackError.name === 'AbortError') {
                  console.warn('[AppLogo] Fallback branding API timeout - continuing without custom logo')
                } else {
                  console.warn('[AppLogo] Fallback branding API error - continuing without custom logo:', fallbackError)
                }
              }
            }
          }
        }
        setBrandingResolved(true)
      } catch (error) {
        console.warn('[AppLogo] Error fetching branding from API - continuing without custom logo:', error)
        setBrandingResolved(true)
      }
    }

    const isCustomDomain = !isAssignx

    if (branding) {
      // We have branding from cookie / localStorage / User – resolve immediately
      setLogoUrl(branding?.logoUrl || null)
      setCompanyName(branding?.companyName || null)
      setBrandingResolved(true)
    } else if (isCustomDomain || isSubaccount || isAgencyCreatingForSubaccount) {
      // No sync branding – fetch from API; fetchBrandingFromAPI will setBrandingResolved(true) when done
      fetchBrandingFromAPI()
    } else {
      // Assignx domain, no subaccount – show AssignX
      setLogoUrl(null)
      setBrandingResolved(true)
    }

    // Listen for branding updates (event.detail is the branding object)
    const handleBrandingUpdate = (event) => {
      const updatedBranding = event.detail?.branding ?? event.detail
      if (updatedBranding && typeof updatedBranding === 'object') {
        setLogoUrl(updatedBranding.logoUrl || null)
        setCompanyName(updatedBranding.companyName || null)
        setBrandingResolved(true)
      } else {
        // Re-read from cookie with double-decode handling
        let b = null
        try {
          const cookies = document.cookie.split(';')
          const brandingCookie = cookies.find(c => c.trim().startsWith('agencyBranding='))
          if (brandingCookie) {
            const value = brandingCookie.split('=')[1]
            let decoded = decodeURIComponent(value)
            try {
              b = JSON.parse(decoded)
            } catch (e) {
              try { b = JSON.parse(decodeURIComponent(decoded)) } catch (e2) { }
            }
          }
        } catch (e) { }

        if (!b) {
          const stored = localStorage.getItem('agencyBranding')
          if (stored) try { b = JSON.parse(stored) } catch (e) { }
        }
        setLogoUrl(b?.logoUrl || null)
        setCompanyName(b?.companyName || null)
        setBrandingResolved(true)
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, []) // Empty deps - component will re-mount when route changes, which is sufficient

  // Show loading until branding is resolved (any domain) so we never flash default logo before we know
  if (!brandingResolved) {
    return (
      <div
        className={className}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          maxWidth: maxWidth ? `${maxWidth}px` : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          ...style,
        }}
        aria-label="Loading logo"
      >
        <div
          className="animate-pulse"
          style={{
            height: `${Math.max(16, height - 8)}px`,
            width: `${Math.min(80, width - 20)}px`,
            borderRadius: 4,
            backgroundColor: 'var(--brand-primary, rgba(121,2,223,0.2))',
          }}
        />
      </div>
    )
  }

  // Once resolved: show agency logo if we have logoUrl, else company name, else default AssignX
  if (logoUrl) {
    return (
      <Image
        className={className}
        src={logoUrl}
        alt={companyName || alt}
        height={height}
        width={maxWidth || 200}
        style={{
          height: `${height}px`,
          width: 'auto',
          maxWidth: maxWidth ? `${maxWidth}px` : '200px',
          objectFit: 'contain',
          ...style,
        }}
        unoptimized={true}
      />
    )
  }
  if (companyName && companyName !== "AssignX") { //userole !== AssignX
    // UserRole.AgentX   
    return (
      <div
        className={className}
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          fontWeight: 600,
          fontSize: `${Math.min(height * 0.7, 24)}px`,
          color: 'var(--brand-primary, #7902DF)',
          ...style,
        }}
      >
        {companyName}
      </div>
    )
  }

  // Default: show AssignX logo (assignx domains or no branding)
  return (
    <Image
      className={className}
      src="/assets/assignX.png"
      alt={alt}
      height={height}
      width={width}
      style={{
        height: `${height}px`,
        width: `${width}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        objectFit: 'contain',
        ...style,
      }}
      unoptimized={false}
    />
  )
}

export default AppLogo

