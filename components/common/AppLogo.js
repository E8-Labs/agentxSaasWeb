'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Apis from '@/components/apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'

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
    const isAssignx = hostname == "dev.assignx.ai" || hostname == "app.assignx.ai" || hostname.includes('localhost')

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
    } catch (error) {
      console.log('Error parsing isFromAdminOrAgency:', error)
    }

    // If assignx domain AND not a subaccount AND not agency creating for subaccount, always show assignx logo
    // Exception: If subaccount OR agency creating for subaccount, check for agency branding even on assignx.ai domains
    // if (isAssignx && !isSubaccount && !isAgencyCreatingForSubaccount) {
    //   setLogoUrl(null) // null means use assignx logo
    //   return
    // }

    // For custom domains OR subaccounts on assignx.ai domains, check agency branding
    const getCookie = (name) => {
      if(name === 'agencyBranding') {
        return null
      }
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    }

    let branding = null

    // Try to get agency branding from cookie (set by middleware)
    // const brandingCookie = getCookie('agencyBranding')
    // if (brandingCookie) {
    //   try {
    //     branding = JSON.parse(decodeURIComponent(brandingCookie))
    //   } catch (error) {
    //     console.log('Error parsing agencyBranding cookie:', error)
    //   }
    // }

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
    if ( isSubaccount) {
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

    // Additional fallback: If agency is creating agent for subaccount, fetch subaccount's agency branding
    if (!branding && isAgencyCreatingForSubaccount && subaccountData) {
      try {
        // The subaccountData should have agencyId or we can fetch it
        // For now, try to get branding from the subaccount's user data if available
        // Or fetch it via API using the subaccount's agencyId
        if (subaccountData.agencyId) {
          // We'll fetch branding via API in the fetchBrandingFromAPI function
          // This will be handled below
        }
      } catch (error) {
        console.log('Error getting branding for subaccount:', error)
      }
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
        const lookupResponse = await fetch(
          `${baseUrl}api/agency/lookup-by-domain`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customDomain: hostname,
              subdomain: isAssignx && hostname.includes('.assignx.ai')
                ? hostname.split('.')[0]
                : null,
            }),
          },
        )

        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          if (lookupData.status && lookupData.data?.branding) {
            const freshBranding = lookupData.data.branding
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
              // document.cookie = `agencyBranding=${cookieValue}; path=/; max-age=${60 * 60 * 24}`
              return
            }
          }
        }

        // Fallback: Try getAgencyBranding API if user is logged in (for subaccounts or agency creating for subaccount)
        if (isSubaccount || isAgencyCreatingForSubaccount) {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            const authToken = parsedUser?.token || parsedUser?.user?.token

            if (authToken) {
              // If agency is creating for subaccount, we need to get the subaccount's agency branding
              // The API should handle this based on the subaccount's agencyId
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
                    // document.cookie = `agencyBranding=${cookieValue}; path=/; max-age=${60 * 60 * 24}`
                    return
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('Error fetching branding from API:', error)
      }
    }

    // For custom domains or subaccounts or agency creating for subaccount, fetch from API if branding not found
    const isCustomDomain = !isAssignx
    if (!branding && (isCustomDomain || isSubaccount || isAgencyCreatingForSubaccount)) {
      // Fetch from API immediately
      fetchBrandingFromAPI()
    } else {
      // Set logo URL if branding found
      if (branding?.logoUrl) {
        setLogoUrl(branding.logoUrl)
      } else {
        // If no agency logo found, use assignx logo (null)
        setLogoUrl(null)
      }
    }

    // Also retry checking cookie after a short delay (in case middleware hasn't set it yet)
    // This is especially important for custom domains on first load
    if (!branding && isCustomDomain) {
      const retryTimeout = setTimeout(() => {
        const retryCookie = getCookie('agencyBranding')
        if (retryCookie) {
          try {
            const retryBranding = JSON.parse(decodeURIComponent(retryCookie))
            if (retryBranding?.logoUrl) {
              setLogoUrl(retryBranding.logoUrl)
            }
          } catch (error) {
            console.log('Error parsing retry cookie:', error)
          }
        }
      }, 300) // Wait 300ms for middleware to set cookie

      return () => clearTimeout(retryTimeout)
    }

    // Listen for branding updates
    const handleBrandingUpdate = (event) => {
      if (event.detail?.branding) {
        const updatedBranding = event.detail.branding
        if (updatedBranding?.logoUrl) {
          setLogoUrl(updatedBranding.logoUrl)
        } else {
          setLogoUrl(null)
        }
      } else {
        // Re-check branding sources
        const retryCookie = getCookie('agencyBranding')
        let updatedBranding = null
        if (retryCookie) {
          try {
            updatedBranding = JSON.parse(decodeURIComponent(retryCookie))
          } catch (error) {
            console.log('Error parsing branding cookie:', error)
          }
        }
        if (!updatedBranding) {
          const storedBranding = localStorage.getItem('agencyBranding')
          if (storedBranding) {
            try {
              updatedBranding = JSON.parse(storedBranding)
            } catch (error) {
              console.log('Error parsing branding from localStorage:', error)
            }
          }
        }
        if (updatedBranding?.logoUrl) {
          setLogoUrl(updatedBranding.logoUrl)
        } else {
          setLogoUrl(null)
        }
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, []) // Empty deps - component will re-mount when route changes, which is sufficient

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

