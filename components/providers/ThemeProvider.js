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

    // Shared favicon update function - React-friendly approach that updates href instead of removing nodes
    // This function updates favicon links synchronously to prevent flash
    const updateFavicon = (faviconUrl, immediate = false) => {
      if (!faviconUrl || faviconUrl.trim() === '') {
        console.log('ℹ️ [ThemeProvider] No favicon in branding, using default')
        return
      }

      const updateFaviconLinks = () => {
        try {
          if (!document.head) {
            console.warn('🗑️ [ThemeProvider] document.head not available')
            return
          }

          // Detect MIME type from file extension
          const getMIME = (url) => {
            const lowerUrl = url.toLowerCase()
            if (lowerUrl.includes('.png')) return 'image/png'
            if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) return 'image/jpeg'
            if (lowerUrl.includes('.svg')) return 'image/svg+xml'
            if (lowerUrl.includes('.ico')) return 'image/x-icon'
            if (lowerUrl.includes('.webp')) return 'image/webp'
            return 'image/png'
          }

          const mimeType = getMIME(faviconUrl)
          
          // Add timestamp for cache busting
          const separator = faviconUrl.includes('?') ? '&' : '?'
          const cacheBustedUrl = `${faviconUrl}${separator}t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`

          // Update existing favicon links instead of removing them (avoids removeChild errors)
          // This function finds and updates any existing favicon link, or creates a new one
          const updateOrCreateLink = (rel, type = null) => {
            // Try to find existing link - check both exact rel and variations
            let link = document.querySelector(`link[rel="${rel}"]`)
            
            // Also check for links with rel="icon" that might be the default Next.js favicon
            if (!link && rel === 'icon') {
              // Check for any icon link (Next.js might use different rel values)
              link = document.querySelector('link[rel*="icon"]') || 
                     document.querySelector('link[rel="shortcut icon"]')
            }
            
            if (link) {
              // Update existing link - this is safe and doesn't cause removeChild errors
              // We update the href directly, which prevents the flash
              link.href = cacheBustedUrl
              if (type) {
                link.type = type
              }
              // Ensure rel is correct
              if (link.rel !== rel) {
                link.rel = rel
              }
              console.log(`✅ [ThemeProvider] Updated existing ${rel} link:`, cacheBustedUrl)
            } else {
              // Only create new link if one doesn't exist
              link = document.createElement('link')
              link.rel = rel
              if (type) {
                link.type = type
              }
              link.href = cacheBustedUrl
              document.head.appendChild(link)
              console.log(`✅ [ThemeProvider] Created new ${rel} link:`, cacheBustedUrl)
            }
          }

          // Update or create primary favicon
          updateOrCreateLink('icon', mimeType)
          
          // Update or create shortcut icon for older browsers
          updateOrCreateLink('shortcut icon', mimeType)
          
          // Update or create apple-touch-icon
          updateOrCreateLink('apple-touch-icon')

          // Preload image to ensure it's ready (prevents flash)
          const img = new Image()
          img.onload = () => {
            console.log('✅ [ThemeProvider] Favicon image preloaded successfully')
          }
          img.onerror = () => {
            console.error('❌ [ThemeProvider] Failed to preload favicon image:', cacheBustedUrl)
          }
          img.src = cacheBustedUrl

          console.log('✅ [ThemeProvider] Favicon updated:', faviconUrl)
        } catch (error) {
          console.error('❌ [ThemeProvider] Error updating favicon:', error)
        }
      }

      // For immediate updates (initial load), run synchronously to prevent flash
      // For subsequent updates, use setTimeout to avoid React DOM conflicts
      if (immediate) {
        updateFaviconLinks()
      } else {
        setTimeout(updateFaviconLinks, 100)
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
                  
                  // Update favicon immediately to prevent flash
                  const faviconUrl = freshBranding.faviconUrl
                  if (faviconUrl) {
                    console.log('🔄 [ThemeProvider] Updating favicon:', faviconUrl)
                    updateFavicon(faviconUrl, true) // Immediate update to prevent flash
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
        // Use delayed update for async branding fetch (React is already mounted)
        updateFavicon(faviconUrl || null, false)

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

    // Check for custom favicon immediately on mount to prevent flash
    // This runs synchronously before any async operations
    // We need to set the favicon as early as possible to prevent the default favicon from showing
    if (typeof document !== 'undefined') {
      const setFaviconImmediately = () => {
        try {
          // Check if document.head is ready
          if (!document.head) {
            // If head isn't ready yet, wait a tiny bit and try again
            setTimeout(setFaviconImmediately, 0)
            return
          }

          // Check localStorage first (fastest)
          const storedBranding = localStorage.getItem('agencyBranding')
          let faviconUrl = null
          
          if (storedBranding) {
            try {
              const branding = JSON.parse(storedBranding)
              faviconUrl = branding?.faviconUrl
            } catch (e) {
              // Ignore parse errors
            }
          }
          
          // If we have a custom favicon, set it immediately (synchronously to prevent flash)
          if (faviconUrl && faviconUrl.trim() !== '') {
            console.log('⚡ [ThemeProvider] Setting custom favicon immediately on mount:', faviconUrl)
            // Update favicon immediately without any delay to prevent flash
            updateFavicon(faviconUrl, true) // Pass true for immediate update
          }
        } catch (error) {
          console.log('Error in setFaviconImmediately:', error)
        }
      }
      
      // Run immediately - this executes as soon as the component mounts
      // If document.head isn't ready, it will retry
      setFaviconImmediately()
    }

    // Apply theme on mount (this will also update favicon if needed)
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
        // Use immediate update for event-based changes to prevent flash
        updateFavicon(faviconUrlFromEvent, true)
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
