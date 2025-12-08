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

    // Shared favicon update function (moved outside applyTheme for reuse)
    const updateFavicon = (faviconUrl) => {
      // Remove ALL existing favicon and shortcut icon links (more comprehensive selector)
      // This catches all possible favicon link variations
      const existingLinks = document.querySelectorAll(
        'link[rel*="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]',
      )
      existingLinks.forEach((link) => {
        console.log('🗑️ [ThemeProvider] Removing existing favicon link:', link.href, link.rel)
        link.remove()
      })

      // Also try to remove by href pattern (catches Next.js default favicon.ico)
      const allLinks = document.querySelectorAll('link[href*="favicon"]')
      allLinks.forEach((link) => {
        console.log('🗑️ [ThemeProvider] Removing favicon by href pattern:', link.href)
        link.remove()
      })

      if (faviconUrl && faviconUrl.trim() !== '') {
        // Detect MIME type from file extension
        const getMimeType = (url) => {
          const lowerUrl = url.toLowerCase()
          if (lowerUrl.includes('.png')) return 'image/png'
          if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) return 'image/jpeg'
          if (lowerUrl.includes('.svg')) return 'image/svg+xml'
          if (lowerUrl.includes('.ico')) return 'image/x-icon'
          if (lowerUrl.includes('.webp')) return 'image/webp'
          // Default to png if unknown
          return 'image/png'
        }

        const mimeType = getMimeType(faviconUrl)
        
        // Add timestamp and random number for aggressive cache busting
        const separator = faviconUrl.includes('?') ? '&' : '?'
        const cacheBustedUrl = `${faviconUrl}${separator}t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`
        
        // Create primary favicon link
        const link = document.createElement('link')
        link.rel = 'icon'
        link.type = mimeType
        link.href = cacheBustedUrl
        document.head.appendChild(link)
        console.log('✅ [ThemeProvider] Added favicon link:', cacheBustedUrl, 'type:', mimeType)

        // Also add shortcut icon for older browsers
        const shortcutLink = document.createElement('link')
        shortcutLink.rel = 'shortcut icon'
        shortcutLink.type = mimeType
        shortcutLink.href = cacheBustedUrl
        document.head.appendChild(shortcutLink)

        // Add apple-touch-icon for better mobile support
        const appleIconLink = document.createElement('link')
        appleIconLink.rel = 'apple-touch-icon'
        appleIconLink.href = cacheBustedUrl
        document.head.appendChild(appleIconLink)

        // Force browser to reload favicon by creating an image and setting it
        // This helps bypass aggressive browser caching
        const img = new Image()
        img.onload = () => {
          console.log('✅ [ThemeProvider] Favicon image loaded successfully')
          // Trigger a small DOM update to force browser refresh
          if (document.querySelector('link[rel="icon"]')) {
            const faviconLink = document.querySelector('link[rel="icon"]')
            const currentHref = faviconLink.href
            faviconLink.href = ''
            setTimeout(() => {
              faviconLink.href = currentHref
            }, 10)
          }
        }
        img.onerror = () => {
          console.error('❌ [ThemeProvider] Failed to load favicon image:', cacheBustedUrl)
        }
        img.src = cacheBustedUrl

        console.log('✅ [ThemeProvider] Favicon updated:', faviconUrl)
      } else {
        // If no favicon, browser will use default favicon.ico
        console.log('ℹ️ [ThemeProvider] No favicon in branding, using default')
      }
    }

    const applyTheme = async (forceRefresh = false) => {
      // Check if agency branding is disabled via environment variable
      const envValue = process.env.NEXT_PUBLIC_DISABLE_AGENCY_BRANDING
      const isBrandingDisabled =
        envValue === 'true' ||
        envValue === '1'

      // Log the environment variable value for debugging
      console.log('🔍 [ThemeProvider] Environment check:', {
        NEXT_PUBLIC_DISABLE_AGENCY_BRANDING: envValue,
        isBrandingDisabled,
        type: typeof envValue,
      })

      if (isBrandingDisabled) {
        console.log('🚫 [ThemeProvider] Agency branding disabled via environment variable - skipping branding application')
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

      // Exclude app.assignx.ai and dev.assignx.ai from branding
      const isExcludedSubdomain = hostname === 'app.assignx.ai' || hostname === 'dev.assignx.ai'

      // Check if we're on an assignx.ai subdomain (e.g., eric.assignx.ai)
      // This must be checked BEFORE the early return for assignx domains
      // Exclude app.assignx.ai and dev.assignx.ai - these should not have branding
      const isAssignxSubdomain = isAssignxDomain && 
        hostname !== 'assignx.ai' && 
        !hostname.includes('localhost') &&
        hostname.includes('.assignx.ai') &&
        !isExcludedSubdomain

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

      // If assignx domain AND not a subdomain AND not a subaccount AND not an agency, use default colors (don't override)
      // Exception 1: Subdomains (like eric.assignx.ai, but NOT app.assignx.ai or dev.assignx.ai) should fetch branding even if user is not logged in
      // Exception 2: If subaccount or agency, apply branding even on assignx.ai domains
      // Note: app.assignx.ai and dev.assignx.ai are excluded and will use default colors
      if (isAssignxDomain && !isAssignxSubdomain && !isSubaccount && !isAgency) {
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

      // Additional fallback: Check user data for agencyBranding (always check, not just for subaccounts/agencies)
      // This ensures branding is applied even if localStorage doesn't have it yet
      if (!branding) {
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            // Check multiple possible locations for agencyBranding
            let foundBranding = null
            let foundPath = null
            
            if (parsedUser?.user?.agencyBranding) {
              foundBranding = parsedUser.user.agencyBranding
              foundPath = 'user.user.agencyBranding'
            } else if (parsedUser?.agencyBranding) {
              foundBranding = parsedUser.agencyBranding
              foundPath = 'user.agencyBranding'
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              foundBranding = parsedUser.user.agency.agencyBranding
              foundPath = 'user.agency.agencyBranding'
            }
            
            if (foundBranding && typeof foundBranding === 'object' && Object.keys(foundBranding).length > 0) {
              branding = foundBranding
              console.log(`✅ [ThemeProvider] Found branding in ${foundPath}:`, branding)
              
              // Store in localStorage so it persists and is found on next check
              localStorage.setItem('agencyBranding', JSON.stringify(branding))
              console.log('✅ [ThemeProvider] Stored branding from user profile to localStorage')
            } else {
              console.log('🔍 [ThemeProvider] Checked user data but no valid branding found:', {
                hasUser: !!parsedUser?.user,
                hasAgencyBranding: !!parsedUser?.user?.agencyBranding,
                hasTopLevelBranding: !!parsedUser?.agencyBranding,
                hasAgencyNestedBranding: !!parsedUser?.user?.agency?.agencyBranding,
                userKeys: parsedUser?.user ? Object.keys(parsedUser.user).slice(0, 10) : [],
              })
            }
          }
        } catch (error) {
          console.log('Error parsing user data for agencyBranding:', error)
        }
      }

      // Check if we're on a custom domain (not assignx.ai and not localhost)
      const isCustomDomain = !isAssignxDomain && 
        hostname !== 'localhost' && 
        !hostname.includes('127.0.0.1')
      
      // Note: isAssignxSubdomain is already defined above (before the early return)

      // Debug logging
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

      if (isCustomDomain) {
        console.log('🔍 [ThemeProvider] Custom domain detected:', {
          hostname,
          hasBranding: !!branding,
          brandingSource: branding
            ? 'found'
            : 'not found - will fetch from API',
        })
      }
      
      if (isAssignxSubdomain) {
        console.log('🔍 [ThemeProvider] AssignX subdomain detected:', {
          hostname,
          hasBranding: !!branding,
          brandingSource: branding
            ? 'found'
            : 'not found - will fetch from API',
        })
      }

      if (isExcludedSubdomain) {
        console.log('🔍 [ThemeProvider] Excluded subdomain detected (app/dev):', {
          hostname,
          willUseDefaults: true,
        })
      }

      // For custom domains OR assignx subdomains when user is not logged in, fetch branding from domain lookup API
      // This is critical for onboarding pages where users aren't logged in yet
      // Subdomains like eric.assignx.ai should also fetch branding if user is not logged in
      if ((!branding || forceRefresh) && (isCustomDomain || isAssignxSubdomain) && !brandingFetched) {
        try {
          // Check if user is logged in
          const userData = localStorage.getItem('User')
          const isLoggedIn = !!userData

          // Only fetch from domain lookup if user is NOT logged in
          // (If logged in, we'll use the authenticated API below)
          if (!isLoggedIn) {
            const domainType = isCustomDomain ? 'custom domain' : 'subdomain'
            console.log(`🔄 [ThemeProvider] User not logged in on ${domainType}, fetching branding from domain lookup API...`)
            setBrandingFetched(true) // Prevent multiple simultaneous requests

            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_API_URL ||
              (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
                ? 'https://apimyagentx.com/agentx/'
                : 'https://apimyagentx.com/agentxtest/')

            // For subdomains, send the full subdomain (e.g., "eric.assignx.ai")
            // The backend accepts either format, but sending full subdomain is more explicit
            const subdomain = isAssignxSubdomain 
              ? hostname  // Send full hostname like "eric.assignx.ai"
              : null

            console.log('🔍 [ThemeProvider] Domain lookup request:', {
              isCustomDomain,
              isAssignxSubdomain,
              hostname,
              subdomain,
              customDomain: isCustomDomain ? hostname : null,
            })

            const lookupResponse = await fetch(
              `${baseUrl}api/agency/lookup-by-domain`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  customDomain: isCustomDomain ? hostname : null,
                  subdomain: subdomain,
                }),
              },
            )

            console.log('🔍 [ThemeProvider] Domain lookup response status:', lookupResponse.status)

            if (lookupResponse.ok) {
              const lookupData = await lookupResponse.json()
              if (lookupData.status && lookupData.data?.branding) {
                const freshBranding = lookupData.data.branding
                branding = freshBranding

                // Update localStorage with fresh data
                localStorage.setItem(
                  'agencyBranding',
                  JSON.stringify(freshBranding),
                )

                console.log('✅ [ThemeProvider] Fetched and cached branding from domain lookup API:', freshBranding)
                
                // Apply branding immediately after fetching (don't wait for function to continue)
                // This ensures branding is applied right away for onboarding pages
                if (freshBranding) {
                  console.log('🎨 [ThemeProvider] Applying branding immediately:', {
                    hasPrimaryColor: !!freshBranding.primaryColor,
                    hasSecondaryColor: !!freshBranding.secondaryColor,
                    hasFavicon: !!freshBranding.faviconUrl,
                    primaryColor: freshBranding.primaryColor,
                  })
                  
                  // Update favicon
                  const faviconUrl = freshBranding.faviconUrl
                  if (faviconUrl) {
                    console.log('🔄 [ThemeProvider] Updating favicon:', faviconUrl)
                    updateFavicon(faviconUrl)
                  }
                  
                  // Apply primary color
                  if (freshBranding.primaryColor) {
                    const primaryHsl = hexToHsl(freshBranding.primaryColor)
                    console.log('🎨 [ThemeProvider] Applying primary color:', {
                      hex: freshBranding.primaryColor,
                      hsl: primaryHsl,
                    })
                    document.documentElement.style.setProperty('--brand-primary', primaryHsl)
                    document.documentElement.style.setProperty('--primary', primaryHsl)
                    const iconFilter = calculateIconFilter(freshBranding.primaryColor)
                    document.documentElement.style.setProperty('--icon-filter', iconFilter)
                    console.log('✅ [ThemeProvider] Primary color applied:', primaryHsl)
                  } else {
                    console.log('⚠️ [ThemeProvider] No primary color in branding')
                  }
                  
                  // Apply secondary color
                  if (freshBranding.secondaryColor) {
                    const secondaryHsl = hexToHsl(freshBranding.secondaryColor)
                    console.log('🎨 [ThemeProvider] Applying secondary color:', {
                      hex: freshBranding.secondaryColor,
                      hsl: secondaryHsl,
                    })
                    document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
                    document.documentElement.style.setProperty('--secondary', secondaryHsl)
                    console.log('✅ [ThemeProvider] Secondary color applied:', secondaryHsl)
                  } else {
                    console.log('⚠️ [ThemeProvider] No secondary color in branding')
                  }
                  
                  // Verify the colors were actually set
                  const appliedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary')
                  const appliedSecondary = getComputedStyle(document.documentElement).getPropertyValue('--brand-secondary')
                  console.log('✅ [ThemeProvider] Verified applied colors:', {
                    primary: appliedPrimary,
                    secondary: appliedSecondary,
                  })
                  
                  console.log('✅ [ThemeProvider] Applied branding immediately after fetch')
                } else {
                  console.log('⚠️ [ThemeProvider] No branding data to apply')
                }
                
                // Also dispatch event as a backup to ensure any listeners get notified
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('agencyBrandingUpdated', { detail: freshBranding })
                  )
                  console.log('✅ [ThemeProvider] Dispatched agencyBrandingUpdated event')
                }
              } else {
                console.log('⚠️ [ThemeProvider] Domain lookup API returned no branding data')
              }
            } else {
              console.log('⚠️ [ThemeProvider] Domain lookup API failed:', lookupResponse.status)
            }
          } else {
            console.log('ℹ️ [ThemeProvider] User is logged in on custom domain, will use authenticated API if needed')
          }
        } catch (error) {
          console.log('❌ [ThemeProvider] Error fetching branding from domain lookup API:', error)
          // Reset brandingFetched on error so it can retry
          setBrandingFetched(false)
        }
      }

      // For subaccounts/agencies on localhost/assignx domains, try to fetch fresh branding from API if not found or if forced
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
      console.log('🔄 [ThemeProvider] Branding updated event received, refreshing theme and favicon')
      
      // Use event detail if available (faster), otherwise re-read from localStorage
      let brandingToUse = null
      if (event?.detail) {
        brandingToUse = event.detail
        console.log('✅ [ThemeProvider] Using branding from event detail:', brandingToUse)
        
        // If branding is in event detail, store it in localStorage for persistence
        if (brandingToUse && typeof brandingToUse === 'object') {
          localStorage.setItem('agencyBranding', JSON.stringify(brandingToUse))
          console.log('✅ [ThemeProvider] Stored branding from event to localStorage')
        }
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
        // Use the same updateFavicon function for consistency
        updateFavicon(faviconUrlFromEvent)
      } else {
        console.log('ℹ️ [ThemeProvider] No faviconUrl in event branding data')
      }

      // Reset brandingFetched to allow fresh fetch if needed
      setBrandingFetched(false)
      
      // Force refresh theme with the new branding
      // Use a small delay to ensure localStorage is updated
      setTimeout(() => {
        applyTheme(true).catch((error) => {
          console.log('Error refreshing theme:', error)
        })
      }, 50)
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  return <>{children}</>
}

export default ThemeProvider

