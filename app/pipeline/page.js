'use client'

import dynamic from 'next/dynamic.js'
import React, { useEffect, useState } from 'react'

import BackgroundVideo from '@/components/general/BackgroundVideo.js'

const AddCalender = dynamic(
  () => import('../../components/pipeline/AddCalender.js'),
)
const Pipeline1 = dynamic(
  () => import('../../components/pipeline/Pipeline1.js'),
)
const Pipeline2 = dynamic(
  () => import('../../components/pipeline/Pipeline2.js'),
)

const Page = () => {
  const [index, setIndex] = useState(1)
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [shouldShowGradient, setShouldShowGradient] = useState(false)
  const [gradientBackground, setGradientBackground] = useState(null)
  let components = [AddCalender, Pipeline1, Pipeline2]

  let CurrentComp = components[index]

  // Function to get brand primary color from CSS variable
  const getBrandColor = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return 'hsl(270, 75%, 50%)'
    try {
      const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
      if (computedColor) {
        if (computedColor.startsWith('hsl')) {
          return computedColor
        } else {
          return `hsl(${computedColor})`
        }
      }
    } catch (error) {
      console.log('Error getting brand color:', error)
    }
    return 'hsl(270, 75%, 50%)'
  }

  // Function to create gradient string
  const getGradientString = (brandColor) => {
    const hslMatch = brandColor.match(/hsl\(([^)]+)\)/)
    if (hslMatch) {
      let hslValues = hslMatch[1].trim()
      if (!hslValues.includes(',')) {
        const parts = hslValues.split(/\s+/)
        hslValues = parts.join(', ')
      }
      const baseColor = `hsl(${hslValues})`
      const colorWithOpacity = `hsla(${hslValues}, 0.4)`
      const gradientType = process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
        ? 'linear-gradient(to bottom left'
        : 'radial-gradient(circle at top right'
      return `${gradientType}, ${baseColor} 0%, ${colorWithOpacity} 100%)`
    }
    const gradientType = process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
      ? 'linear-gradient(to bottom left'
      : 'radial-gradient(circle at top right'
    return `${gradientType}, hsl(270, 75%, 50%) 0%, hsla(270, 75%, 50%, 0.4) 100%)`
  }

  // Check if user is subaccount or agency
  useEffect(() => {
    const checkUserRole = () => {
      if (typeof window === 'undefined') return false
      
      const userData = localStorage.getItem('User')
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            return true
          }
        } catch (error) {
          console.log('Error parsing User data:', error)
        }
      }
      
      const localUser = localStorage.getItem('LocalStorageUser')
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser)
          const userRole = parsed?.user?.userRole || parsed?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            return true
          }
        } catch (error) {
          console.log('Error parsing LocalStorageUser:', error)
        }
      }
      
      const subAccountData = localStorage.getItem('SubaccoutDetails')
      if (subAccountData) {
        try {
          const parsed = JSON.parse(subAccountData)
          if (parsed) {
            return true
          }
        } catch (error) {
          console.log('Error parsing SubaccoutDetails:', error)
        }
      }
      
      return false
    }

    const initGradient = () => {
      const isSubaccountOrAgency = checkUserRole()
      setIsSubaccount(isSubaccountOrAgency)
      
      if (isSubaccountOrAgency) {
        const brandColor = getBrandColor()
        const gradientStr = getGradientString(brandColor)
        setShouldShowGradient(true)
        setGradientBackground(gradientStr)
      } else {
        setShouldShowGradient(false)
        setGradientBackground(null)
      }
    }

    initGradient()
    const timeout = setTimeout(initGradient, 500)
    
    return () => clearTimeout(timeout)
  }, [])

  // Function to proceed to the next step
  const handleContinue = () => {
    // //console.log;
    setIndex(index + 1)
  }

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1)
  }

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100vh',
    overflow: 'none',
    ...(shouldShowGradient && gradientBackground ? { background: gradientBackground } : {}),
  }

  return (
    <div
      style={backgroundImage}
      className={`overflow-y-none flex flex-row justify-center items-center ${shouldShowGradient ? '' : 'bg-brand-primary'}`}
    >
      {!shouldShowGradient && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1, // Ensure the video stays behind content
          }}
        >
          <BackgroundVideo />
        </div>
      )}
      <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
    </div>
    // <div className='w-full h-screen' style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems:" center" }}>
    //     <div style={{width: "90%", height: "80%"}}>

    //     </div>
    // </div>
  )
}

export default Page
