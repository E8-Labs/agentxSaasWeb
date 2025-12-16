import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { AgentXOrb } from '@/components/common/AgentXOrb'
import { UserTypes } from '@/constants/UserTypes'
import AppLogo from '@/components/common/AppLogo'
import { forceApplyBranding } from '@/utilities/applyBranding'

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

  // Ensure branding variables are applied when onboarding screens mount
  useEffect(() => {
    forceApplyBranding().catch((err) =>
      console.error('Error applying branding in Header:', err),
    )
  }, [])

  const checkBranding = () => {
    if (typeof window === 'undefined') return

    try {
      const userData = localStorage.getItem('User')
      let isSub = false
      
      if (userData) {
        const parsedUser = JSON.parse(userData)
        isSub =
          parsedUser?.user?.userRole === 'AgencySubAccount' ||
          parsedUser?.userRole === 'AgencySubAccount'
        setIsSubaccount(isSub)
      }

      // Check if agency has branding logo
      let branding = null
      const storedBranding = localStorage.getItem('agencyBranding')
      if (storedBranding) {
        try {
          branding = JSON.parse(storedBranding)
        } catch (error) {
          console.log('Error parsing agencyBranding from localStorage:', error)
        }
      }

      // Also check user data for agencyBranding
      if ( userData) {
        
        try {
          const parsedUser = JSON.parse(userData)
          console.log('🔍 [Header] User data:', parsedUser)
          if (parsedUser?.user?.agencyBranding) {
            console.log('🔍 [Header] User agencyBranding:', parsedUser.user.agencyBranding)
            branding = parsedUser.user.agencyBranding
          } else if (parsedUser?.agencyBranding) {
            branding = parsedUser.agencyBranding
          } else if (parsedUser?.user?.agency?.agencyBranding) {
            branding = parsedUser.user.agency.agencyBranding
          }
        } catch (error) {
          console.log('Error parsing user data for agencyBranding:', error)
        }
      }

      // Set hasAgencyLogo if logoUrl exists
      const hasLogo = branding?.logoUrl
      setHasAgencyLogo(hasLogo)
      
      console.log('🔍 [Header] Branding check:', {
        isSubaccount: isSub,
        hasAgencyLogo: hasLogo,
        logoUrl: branding?.logoUrl,
        branding: branding
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

  function getSkipPageForSellerKyc() {
    if (user && user.user.userType != UserTypes.RealEstateAgent) {
      return '/pipeline'
    }
    return '/buyerskycquestions'
  }

  return (
    <div>
      <div className="px-4 flex flex-row items-center md:pt-6">
        <div className="w-4/12">
          <div className="ms-6 hidden md:flex">
            <AppLogo
              height={29}
              width={122}
              alt="logo"
            />
          </div>
        </div>
        <div className="w-4/12 flex flex-row justify-center">
          {(() => {
            const shouldShowOrb = !isSubaccount || (isSubaccount && !hasAgencyLogo)
            console.log('🎯 [Header] Orb visibility:', {
              isSubaccount,
              hasAgencyLogo,
              shouldShowOrb,
              condition: !isSubaccount || (isSubaccount && !hasAgencyLogo)
            })
            return shouldShowOrb ? (
              <AgentXOrb
                size={69}
                style={{ height: '69px', width: '75px', resize: 'contain' }}
              />
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
  )
}

export default Header
