import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { AgentXOrb } from '@/components/common/AgentXOrb'
import { UserTypes } from '@/constants/UserTypes'
import AppLogo from '@/components/common/AppLogo'
import { forceApplyBranding } from '@/utilities/applyBranding'
import { getAgencyUUIDForAPI } from '@/utilities/AgencyUtility'

const Header = ({
  skipSellerKYC,
  buyerKYC,
  shouldContinue,
  showSkip,
  handleContinue,
  user,
}) => {
  const router = useRouter()
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [hasAgencyLogo, setHasAgencyLogo] = useState(false)
  const [agencyLogoUrl, setAgencyLogoUrl] = useState(null)
  const [isAgencyOnboarding, setIsAgencyOnboarding] = useState(false)
  const [agencyName, setAgencyName] = useState(null)
  // Check if current domain is a custom domain (not app.assignx.ai or dev.assignx.ai)
  // Initialize immediately if on client side
  const getIsCustomDomain = () => {
    if (typeof window === 'undefined') return false
    const hostname = window.location.hostname
    return hostname !== 'app.assignx.ai' && hostname !== 'dev.assignx.ai'
  }
  
  const [isCustomDomain, setIsCustomDomain] = useState(() => getIsCustomDomain())

  // Ensure branding variables are applied when onboarding screens mount
  useEffect(() => {
    forceApplyBranding().catch((err) =>
      console.error('Error applying branding in Header:', err),
    )
    // Double-check domain on mount
    setIsCustomDomain(getIsCustomDomain())
  }, [])

  const [isAgencyCreatingForSubaccount, setIsAgencyCreatingForSubaccount] = useState(false)

  const checkBranding = () => {
    if (typeof window === 'undefined') return

    try {
      const userData = localStorage.getItem('User')
      let isSub = false
      let isAgency = false

      // Check if it's a subaccount registration (has AgencyUUID but no User data yet)
      const agencyUuid = getAgencyUUIDForAPI()
      const isSubaccountRegistration = !!agencyUuid && !userData

      if (userData) {
        const parsedUser = JSON.parse(userData)
        const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
        isSub = userRole === 'AgencySubAccount'
        isAgency = userRole === 'Agency'
        setIsSubaccount(isSub)

        // Check if current user is Agency and creating agent for subaccount
        if (isAgency) {
          const { PersistanceKeys } = require('@/constants/Constants')
          const fromAdminOrAgency = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
          if (fromAdminOrAgency) {
            try {
              const parsed = JSON.parse(fromAdminOrAgency)
              if (parsed?.subAccountData) {
                setIsAgencyCreatingForSubaccount(true)
              } else {
                setIsAgencyCreatingForSubaccount(false)
              }
            } catch (error) {
              setIsAgencyCreatingForSubaccount(false)
            }
          } else {
            setIsAgencyCreatingForSubaccount(false)
          }
        } else {
          setIsAgencyCreatingForSubaccount(false)
        }
      } else if (isSubaccountRegistration) {
        // During subaccount registration, treat as subaccount
        setIsSubaccount(true)
        setIsAgencyCreatingForSubaccount(false)
      }

      // Fallback: If we have agency UUID but user role check didn't detect as subaccount,
      // still treat as subaccount (might be during onboarding flow or role not set yet)
      if (!isSub && agencyUuid) {
        setIsSubaccount(true)
      }

      // Check if agency has branding logo: cookie (middleware) → localStorage → user data
      let branding = null
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
        return null
      }
      const brandingCookie = getCookie('agencyBranding')
      if (brandingCookie) {
        try {
          branding = JSON.parse(decodeURIComponent(brandingCookie))
        } catch (error) {}
      }
      if (!branding) {
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            branding = JSON.parse(storedBranding)
          } catch (error) {}
        }
      }

      // Also check user data for agencyBranding
      if (userData && !branding) {
        
        try {
          const parsedUser = JSON.parse(userData)
          if (parsedUser?.user?.agencyBranding) {
            branding = parsedUser.user.agencyBranding
          } else if (parsedUser?.agencyBranding) {
            branding = parsedUser.agencyBranding
          } else if (parsedUser?.user?.agency?.agencyBranding) {
            branding = parsedUser.user.agency.agencyBranding
          }
        } catch (error) {}
      }

      // Set hasAgencyLogo if logoUrl exists
      const hasLogo = branding?.logoUrl
      setHasAgencyLogo(hasLogo)
      setAgencyLogoUrl(branding?.logoUrl || null)
      setAgencyName(branding?.name || null)
      console.log('🔍 [Header] Branding check:', {
        isSubaccount: isSub || isSubaccountRegistration,
        isSubaccountRegistration,
        agencyUuid,
        hasAgencyLogo: hasLogo,
        logoUrl: branding?.logoUrl,
        branding: branding,
        isAgencyCreatingForSubaccount: isAgencyCreatingForSubaccount
      })
    } catch (error) {
      console.log('Error parsing user data:', error)
    }
  }

  useEffect(() => {
    checkBranding()

    // Listen for branding updates
    const handleBrandingUpdate = () => {
      checkBranding()
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  // Check if we're on agency onboarding page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkOnboarding = () => {
        const isOnboarding = window.location.pathname.includes('/agency/onboarding')
        setIsAgencyOnboarding(isOnboarding)
      }
      checkOnboarding()
      // Listen for route changes
      window.addEventListener('popstate', checkOnboarding)
      return () => window.removeEventListener('popstate', checkOnboarding)
    }
  }, [])

  function getSkipPageForSellerKyc() {
    if (user && user.user.userType != UserTypes.RealEstateAgent) {
      return '/pipeline'
    }
    return '/buyerskycquestions'
  }

  // Determine what to show on mobile left side
  const getMobileLeftLogo = () => {
    // If agency onboarding, don't show anything on left (orb will be centered)
    if (isAgencyOnboarding) {
      return null
    }
    
    // If subaccount (with or without logo), don't show anything on left (logo/orb will be centered)
    if (isSubaccount) {
      return null
    }
    
    // Default: show AppLogo
    return (
      <div className="flex md:hidden">
        <AppLogo
          height={30}
          width={130}
          alt="logo"
        />
      </div>
    )
  }

  // Determine what to show in center (for mobile orb/logo)
  const getMobileCenterOrb = () => {

    console.log('🔍 [Header] isAgencyOnboarding:', isAgencyOnboarding)
    console.log('🔍 [Header] isSubaccount:', isSubaccount)
    console.log('🔍 [Header] agencyLogoUrl:', agencyLogoUrl)
    // If agency onboarding, show orb in center
    if (isAgencyOnboarding) {
      return (
        <div className="flex md:hidden justify-center mt-4">
          <AgentXOrb
            size={30}
            style={{ height: '30px', width: '30px', resize: 'contain' }}
          />
        </div>
      )
    }
    
    // If subaccount with agency logo, show agency logo in center
    if (isSubaccount && agencyLogoUrl) {
      return (
        <div className="flex md:hidden justify-center mt-4">
          <Image
            src={agencyLogoUrl}
            alt="Agency logo"
            height={30}
            width={130}
            style={{ objectFit: 'contain', maxHeight: '30px' }}
          />
        </div>
      )
    }
    
    // If subaccount without agency logo, show orb in center
    if (isSubaccount && !agencyLogoUrl) {
      return (
        <div className="flex md:hidden justify-center mt-4">

         <div className="text-lg font-bold">{agencyName}</div>

        </div>
      )
    }
    
    return null
  }

  return (
    <div>
      <div className="px-4 flex flex-row items-center md:pt-6">
        <div className="w-4/12">
          {/* Desktop logo */}
          <div className="ms-6 hidden md:flex">
            <AppLogo
              height={29}
              width={122}
              alt="logo"
            />
          </div>
          {/* Mobile logo */}
          {getMobileCenterOrb()}
        </div>
        <div className="w-4/12 flex flex-row justify-center">
          {/* Mobile center orb */}
          {/* {getMobileCenterOrb()} */}
          {/* Desktop center orb */}
          {(() => {
            // Check domain again on render to ensure it's always current
            const currentIsCustomDomain = typeof window !== 'undefined' 
              ? window.location.hostname !== 'app.assignx.ai' && window.location.hostname !== 'dev.assignx.ai'
              : isCustomDomain

            // Hide orb if it's a custom domain (not app.assignx.ai or dev.assignx.ai)
            // Also hide if subaccount has agency logo
            // Also hide if agency is creating agent for subaccount
            const shouldShowOrb = !currentIsCustomDomain && (!isSubaccount || (isSubaccount && !hasAgencyLogo)) && !isAgencyCreatingForSubaccount
            return shouldShowOrb ? (
              <div className="hidden md:flex">
                {/*<AgentXOrb
                  size={69}
                  style={{ height: '69px', width: '75px', resize: 'contain' }}
                />*/}
              </div>
            ) : null
          })()}
        </div>
        <div className="w-4/12 flex felx-row items-start h-full justify-end">
          {skipSellerKYC && shouldContinue && (
            <Link
              className="underline h-full me-8"
              href={getSkipPageForSellerKyc()}
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#00000060',
              }}
              onClick={(e) => {
                e.preventDefault()
                router.push(getSkipPageForSellerKyc())
              }}
            >
              Skip
            </Link>
          )}
          {buyerKYC && shouldContinue && (
            <Link
              href={'/pipeline'}
              className="underline h-full me-8"
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#00000060',
              }}
              onClick={(e) => {
                e.preventDefault()
                router.push('/pipeline')
              }}
            >
              Skip
            </Link>
          )}
          {showSkip && shouldContinue && (
            <button
              className="underline h-full me-8"
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#00000060',
              }}
              onClick={handleContinue}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header
