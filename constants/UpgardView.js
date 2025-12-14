import { CircularProgress } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import getProfileDetails from '@/components/apis/GetProfile'
import UnlockPremiunFeatures from '@/components/globalExtras/UnlockPremiunFeatures'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { useUser } from '@/hooks/redux-hooks'

// Helper function to get brand primary color as hex (for inline styles)
const getBrandPrimaryHex = () => {
  if (typeof window === 'undefined') return '#7902DF'
  const root = document.documentElement
  const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
  if (brandPrimary) {
    // Convert HSL to hex for inline styles
    const hslMatch = brandPrimary.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360
      const s = parseInt(hslMatch[2]) / 100
      const l = parseInt(hslMatch[3]) / 100
      
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = l - c / 2
      
      let r = 0, g = 0, b = 0
      
      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0
      } else if (1/6 <= h && h < 2/6) {
        r = x; g = c; b = 0
      } else if (2/6 <= h && h < 3/6) {
        r = 0; g = c; b = x
      } else if (3/6 <= h && h < 4/6) {
        r = 0; g = x; b = c
      } else if (4/6 <= h && h < 5/6) {
        r = x; g = 0; b = c
      } else if (5/6 <= h && h < 1) {
        r = c; g = 0; b = x
      }
      
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  return '#7902DF' // Default fallback
}

function UpgardView({
  title,
  subTitle,
  userData,
  onUpgradeSuccess,
  setShowSnackMsg,
  // handleContinue
}) {
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')
  const stripePromise = getStripe()

  const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)
  const [showUnlockPremiumFeaturesBtn, setShowUnlockPremiumFeaturesBtn] =
    useState(false)
  const [showUnlockPremiumFeaturesPopup, setShowUnlockPremiumFeaturesPopup] =
    useState(false)
  const [loading, setLoading] = useState(false)
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  //store local user data
  let localUserData = null

  // Update brand color on branding changes
  useEffect(() => {
    const updateBrandColor = () => {
      setBrandPrimaryColor(getBrandPrimaryHex())
    }
    
    // Set initial color
    updateBrandColor()
    
    // Listen for branding updates
    window.addEventListener('agencyBrandingUpdated', updateBrandColor)
    
    return () => {
      window.removeEventListener('agencyBrandingUpdated', updateBrandColor)
    }
  }, [])

  useEffect(() => {
    fetchLocalUserData()
    const Data = localUserData?.agencyCapabilities
    console.log('Title passed to upgrade view is', title)
    console.log('Plan capabilities in upgrade view is', Data)
    if (localUserData?.userRole === 'AgencySubAccount') {
      // For "Unlock Actions" - cascading check
      if (title === 'Unlock Actions') {
        // If agencyCapabilities is false, show "Request Feature"
        if (reduxUser?.agencyCapabilities?.allowToolsAndActions === false) {
          setShowUnlockPremiumFeaturesBtn(true)
        }
        // If agencyCapabilities is true but planCapabilities is false, show "Upgrade Plan" (button stays false)
        // If both are true, user has access (won't reach this component)
      }
      // For "Unlock Lead Scoring" - cascading check
      else if (title === 'Unlock Lead Scoring') {
        // If agencyCapabilities is false, show "Request Feature"
        if (reduxUser?.agencyCapabilities?.allowLeadScoring === false) {
          setShowUnlockPremiumFeaturesBtn(true)
        }
        // If agencyCapabilities is true but planCapabilities is false, show "Upgrade Plan" (button stays false)
        // If both are true, user has access (won't reach this component)
      }
      // For other features, keep existing logic
      else if (reduxUser?.agencyCapabilities?.allowCalendarIntegration === false) {
        setShowUnlockPremiumFeaturesBtn(true)
      } else if (reduxUser?.agencyCapabilities?.allowKnowledgeBases === false) {
        setShowUnlockPremiumFeaturesBtn(true)
      } else if (reduxUser?.agencyCapabilities?.allowVoicemail === false) {
        setShowUnlockPremiumFeaturesBtn(true)
      } else if (
        reduxUser?.agencyCapabilities?.allowLiveCallTransfer === false
      ) {
        setShowUnlockPremiumFeaturesBtn(true)
      } else if (title === 'Enable Live Transfer') {
        if (!Data?.allowLiveCallTransfer) {
          setShowUnlockPremiumFeaturesBtn(true)
        }
      } else if (
        title === 'Unlock Knowledge Base' ||
        title === 'Add Knowledge Base'
      ) {
        if (!Data?.allowKnowledgeBases) {
          setShowUnlockPremiumFeaturesBtn(true)
        }
      } else if (title === 'Unlock Voicemail' || title === 'Enable Voicemail') {
        if (!Data?.allowVoicemail) {
          setShowUnlockPremiumFeaturesBtn(true)
        }
      }
    }
  }, [localUserData, reduxUser, title])

  const fetchLocalUserData = (attempt = 1, maxAttempts = 5) => {
    if (userData) {
      localUserData = userData
      console.log(`✅ Found userData directly on attempt ${attempt}`)
      return
    }

    const localStorageUser = localStorage.getItem('User')

    if (localStorageUser) {
      try {
        const Data = JSON.parse(localStorageUser)
        localUserData = Data?.user

        if (localUserData) {
          console.log(
            `✅ Successfully fetched local data on attempt ${attempt}`,
          )
          return
        } else {
          console.warn(
            `⚠️ localStorage "user" found but invalid on attempt ${attempt}`,
          )
        }
      } catch (error) {
        console.error(`❌ JSON parse failed on attempt ${attempt}:`, error)
      }
    } else {
      console.warn(`⚠️ No localStorage "user" found on attempt ${attempt}`)
    }

    // Retry if not found and attempts remain
    if (attempt < maxAttempts) {
      console.log(`⏳ Retrying... attempt ${attempt + 1} in 300ms`)
      setTimeout(() => fetchLocalUserData(attempt + 1, maxAttempts), 300)
    } else {
      console.error('❌ Max attempts reached. Could not fetch local data.')
    }
  }

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      // console.log('🔄 [CREATE-AGENT] Refreshing user data after plan upgrade...');
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        console.log('🔄 [Upgrade view] Fresh user data received after upgrade')
        // Update Redux with fresh data
        setReduxUser({
          token: localData.token,
          user: freshUserData,
        })

        if (onUpgradeSuccess) {
          onUpgradeSuccess(freshUserData)
        }

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [Upgrade view] Error refreshing user data:', error)
      return false
    }
  }

  return (
    <>
      {loading ? (
        <CircularProgress size={30} />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6"
          style={{ gap: 4 }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 'clamp(16px, 24px, 30px)',
              height: 'clamp(16px, 24px, 30px)',
            }}
          >
            <Image
              alt="*"
              src={'/otherAssets/starsIcon2.png'}
              fill={false}
              height={32}
              width={30}
              className="flex-shrink-0 object-contain"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>

          {/*
                showUnlockPremiumFeaturesBtn && (
                    <div
                        className='font-semibold text-center'
                        style={{
                            fontSize: "clamp(17px, 22px, 26px)",
                        }}
                    >
                        Contact Your Agency
                    </div>
                )*/}
          <div
            className="font-semibold text-center"
            style={{
              fontSize: 'clamp(10px, 14vw, 18px)',
            }}
          >
            {title}
          </div>
          <div
            className="font-normal text-center w-full sm:w-[85%] md:w-[75%] leading-relaxed max-w-2xl"
            style={{
              fontSize: 'clamp(10px, 14px, 18px)',
              lineHeight: '1.5',
            }}
          >
            {subTitle}
          </div>

          {showUnlockPremiumFeaturesBtn ? (
            <button
              className="flex flex-col text-white items-center justify-center w-[60%] sm:w-[50%] md:w-[45%] rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl mt-4"
              style={{
                height: 'clamp(35px, 45px, 55px)',
                fontSize: 'clamp(10px, 13px, 16px)',
                backgroundColor: `hsl(var(--brand-primary))`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary) / 0.9)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary))`
              }}
              onClick={() => {
                setShowUnlockPremiumFeaturesPopup(true)
              }}
            >
              Request Feature
            </button>
          ) : (
            <button
              className="flex flex-col text-white items-center justify-center w-[60%] sm:w-[50%] md:w-[45%] rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl mt-4"
              style={{
                height: 'clamp(35px, 45px, 55px)',
                fontSize: 'clamp(10px, 13px, 16px)',
                backgroundColor: `hsl(var(--brand-primary))`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary) / 0.9)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary))`
              }}
              onClick={() => {
                setShowUpgradePlanPopup(true)
              }}
            >
              Upgrade Plan
            </button>
          )}

          <UnlockPremiunFeatures
            title={title}
            open={showUnlockPremiumFeaturesPopup}
            handleClose={() => {
              setShowUnlockPremiumFeaturesPopup(false)
            }}
          />

          <Elements stripe={stripePromise}>
            <UpgradePlan
              open={showUpgradePlanPopup}
              // setShowSnackMsg={setShowSnackMsg}
              setSelectedPlan={() => {
                console.log('setSelectedPlan is called')
              }}
              handleClose={async (data) => {
                setShowUpgradePlanPopup(false)
                if (data) {
                  setLoading(true)
                  await refreshUserData()
                  setLoading(false)
                }
                // handleContinue()
              }}
            />
          </Elements>
        </div>
      )}
    </>
  )
}

export default UpgardView
