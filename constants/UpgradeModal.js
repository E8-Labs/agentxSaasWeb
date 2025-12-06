import { Box, Modal, Slider } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import UnlockPremiunFeatures from '@/components/globalExtras/UnlockPremiunFeatures'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { useUser } from '@/hooks/redux-hooks'

import {
  defaultFeatures,
  pipelineFeatures,
  webAgentFeatures,
} from './UpgradeModalFeatures'

const UpgradeModal = ({
  featureTitle,
  title,
  subTitle,
  buttonTitle,
  open,
  handleClose,
  onUpgradeSuccess,
  selectedPlan = null, // Pre-selected plan from previous screen
  features = null, // Dynamic features array for different functionalities
  functionality = 'default', // Functionality type to determine which features to use
}) => {
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')

  // Update brand color on branding changes
  useEffect(() => {
    const updateBrandColor = () => {
      if (typeof window !== 'undefined') {
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
            
            setBrandPrimaryColor(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
            return
          }
        }
      }
      setBrandPrimaryColor('#7902DF') // Default fallback
    }
    
    // Set initial color
    updateBrandColor()
    
    // Listen for branding updates
    window.addEventListener('agencyBrandingUpdated', updateBrandColor)
    
    return () => {
      window.removeEventListener('agencyBrandingUpdated', updateBrandColor)
    }
  }, [])
  console.log('SelectedPlan in UpgradeModal is ', selectedPlan)
  let stripePublickKey =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
      ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
      : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY
  const stripePromise = loadStripe(stripePublickKey)

  // Get features based on functionality or use provided features
  const getFeaturesByFunctionality = (func) => {
    switch (func) {
      case 'webAgent':
        return webAgentFeatures
      case 'pipeline':
        return pipelineFeatures
      case 'smartRefill':
        return webAgentFeatures //smart refill features are same as web agent features
      default:
        return defaultFeatures
    }
  }

  // Use provided features, or get features by functionality, or use default
  const allFeatures = features || getFeaturesByFunctionality(functionality)

  // Split features into two columns (first 8 and remaining)
  const benifits1 = allFeatures.slice(0, 8)
  const benifits2 = allFeatures.slice(8)

  const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  const [showUnlockPremiumFeaturesPopup, setShowUnlockPremiumFeaturesPopup] =
    useState(false)

  const handleRequestFeature = (featureTitle) => {
    console.log('featureTitle in upgrade modal is', featureTitle)
    setShowUnlockPremiumFeaturesPopup(true)
  }

  return (
    <div className="w-full">
      <Modal
        open={open}
        // onClose={handleClose()}
        //     handleResetValues();
        //     handleClose("");
        // }}
      >
        {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
        <Box
          className="bg-white max-h-[90svh] h-auto overflow-hidden rounded-xl w-11/12 sm:w-10/12 md:w-8/12 lg:w-5/12 xl:w-5/12 2xl:w-4/12 border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            scrollbarWidth: 'none',
          }}
        >
          <div className="w-full ">
            <div
              className="w-full h-[80vh] flex flex-col items-center pb-6 justify-between border"
              style={{
                backgroundImage: "url('/otherAssets/gradientBg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // borderRadius:'20px'
              }}
            >
                <div className="w-full flex flex-row items-start justify-end p-5">
                  <CloseBtn onClick={handleClose} />
                </div>

                <div className="flex flex-row items-center justify-center gap-4">
                  <div
                    style={{ 
                      fontSize: '29px', 
                      fontWeight: '700',
                      color: `hsl(var(--brand-primary))`,
                    }}
                  >
                    {title}
                  </div>
                  <Image
                    alt="*"
                    src={'/otherAssets/starsIcon2.png'}
                    height={28}
                    width={26}
                    className="filter-brand-primary"
                  />
                </div>
                <div
                  className=""
                  style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    color: '#00000050',
                  }}
                >
                  {subTitle}
                </div>
                <div
                  className="mt-4 w-full text-start px-8 "
                  style={{ fontSize: '18px', fontWeight: '700' }}
                >
                  {`What You'll Get`}
                </div>
                <div className="w-full flex flex-col items-center justify-center px-8 pt-4 overflow-y-auto max-h-[50vh]">
                  <div className="w-full flex flex-row items-start mt-4">
                    <div className="w-1/2 flex flex-col gap-4">
                      {benifits1.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-row items-center gap-4"
                        >
                          <Image
                            alt="*"
                            src={'/otherAssets/simpleTick.png'}
                            height={16}
                            width={16}
                          />
                          <div style={{ fontSize: '15px', fontWeight: '500' }}>
                            {item.title}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="w-1/2 flex flex-col gap-4">
                      {benifits2.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-row items-center gap-4"
                        >
                          <Image
                            alt="*"
                            src={'/otherAssets/simpleTick.png'}
                            height={16}
                            width={16}
                          />
                          <div style={{ fontSize: '15px', fontWeight: '500' }}>
                            {item.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center">
                  <button
                    className="h-[54px] w-[20vw] rounded-xl text-white text-center flex flex-row items-center justify-center transition-colors"
                    style={{ 
                      fontSize: '15px', 
                      fontWeight: '500',
                      backgroundColor: `hsl(var(--brand-primary))`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary) / 0.9)`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary))`
                    }}
                    onClick={() => {
                      if (featureTitle) {
                        handleRequestFeature(featureTitle)
                      } else {
                        setShowUpgradePlanPopup(true)
                      }
                    }}
                  >
                    {featureTitle ? 'Request Feature' : 'Upgrade'}
                  </button>

                  <button
                    className="mt-4 transition-colors"
                    style={{ 
                      fontSize: '15px', 
                      fontWeight: '500',
                      color: `hsl(var(--brand-primary))`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = `hsl(var(--brand-primary) / 0.8)`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = `hsl(var(--brand-primary))`
                    }}
                    onClick={handleClose}
                  >
                    {buttonTitle}
                  </button>
                </div>
            </div>
          </div>
        </Box>
      </Modal>

      <UnlockPremiunFeatures
        title={featureTitle}
        open={showUnlockPremiumFeaturesPopup}
        handleClose={() => {
          setShowUnlockPremiumFeaturesPopup(false)
          handleClose()
        }}
      />

      <Elements stripe={stripePromise}>
        <UpgradePlan
          open={showUpgradePlanPopup}
          selectedPlan={selectedPlan} // Pass the pre-selected plan
          handleClose={async (upgradeResult) => {
            setShowUpgradePlanPopup(false)
            handleClose()
            // If upgrade was successful, call the success callback
            // The upgradeResult indicates success but doesn't contain profile data
            if (upgradeResult && onUpgradeSuccess) {
              console.log(
                '🎉 [UPGRADE-MODAL] Upgrade successful, calling success callback',
              )
              await onUpgradeSuccess()
            }
          }}
          plan={selectedPlan}
          currentFullPlan={reduxUser?.user?.plan}
          setSelectedPlan={() => {}}
        />
      </Elements>
    </div>
  )
}

export default UpgradeModal
