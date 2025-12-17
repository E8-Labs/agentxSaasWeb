'use client'

import axios from 'axios'
import dynamic from 'next/dynamic.js'
import { useRouter } from 'next/navigation.js'
import React, { useState, useEffect } from 'react'

import Apis from '@/components/apis/Apis.js'
import getProfileDetails from '@/components/apis/GetProfile.js'
// const Pipeline2 = dynamic(() =>
//   import("../../components/pipeline/Pipeline2.js")
// );
import { PersistanceKeys } from '@/constants/Constants.js'
import { useUser } from '@/hooks/redux-hooks.js'

// const AddCalender = dynamic(() =>
//   import("../../components/pipeline/AddCalender.js")

const Pipeline1 = dynamic(
  () => import('../../../components/pipeline/Pipeline1.js'),
)

// );

const Page = () => {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [shouldShowGradient, setShouldShowGradient] = useState(false)
  const [gradientBackground, setGradientBackground] = useState(null)

  // Redux user state
  const { user: userData, setUser: setUserData, token } = useUser()

  console.log('🔥 PIPELINE-UPDATE - Current userData from Redux:', userData)
  let components = [Pipeline1]

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

  // Check if user is subaccount or agency and set gradient
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
      
      // Check if we're on a custom domain or subdomain and have branding
      const hostname = window.location.hostname
      const isDevDomain = hostname === 'dev.assignx.ai'
      const isProdDomain = hostname === 'app.assignx.ai'
      const isLocalhost = hostname === 'localhost' || hostname.includes('127.0.0.1')
      const isCustomDomain = !hostname.includes('.assignx.ai') && hostname !== 'assignx.ai' && !isLocalhost
      const isAssignxSubdomain = hostname.includes('.assignx.ai') && 
                                 hostname !== 'assignx.ai' && 
                                 !isDevDomain && 
                                 !isProdDomain && 
                                 !isLocalhost
      
      const branding = localStorage.getItem('agencyBranding')
      if (branding) {
        try {
          const brandingData = JSON.parse(branding)
          if ((isCustomDomain || isAssignxSubdomain) && brandingData?.primaryColor) {
            return true
          }
        } catch (error) {
          console.log('Error parsing branding:', error)
        }
      }
      
      return false
    }

    const initGradient = () => {
      const isSubaccountOrAgency = checkUserRole()
      
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
    
    // Listen for branding updates
    const handleUpdate = () => {
      initGradient()
    }
    
    window.addEventListener('agencyBrandingUpdated', handleUpdate)
    
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('agencyBrandingUpdated', handleUpdate)
    }
  }, [])

  // Function to proceed to the next step
  const handleContinue = () => {
    //console.log;
    //Call the api here
    handleAddCadence()
  }

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1)
  }

  const handleAddCadence = async () => {
    try {
      //   setLoader(true);
      //////console.log;
      let cadence = null
      const cadenceData = localStorage.getItem('AddCadenceDetails')
      if (cadenceData) {
        const cadenceDetails = JSON.parse(cadenceData)
        cadence = cadenceDetails
      }

      ////console.log("cadence details are :",
      //     cadence
      // );

      let mainAgentId = null
      const mainAgentData = localStorage.getItem('agentDetails')
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData)
        //console.log;
        mainAgentId = Data.id
      }

      // Use Redux token instead of localStorage
      let AuthToken = token
      if (!AuthToken) {
        console.error('🔥 PIPELINE-UPDATE - No token available')
        return
      }

      //console.log;

      //console.log;

      console.log('Cadence is ', cadence)
      console.log('Main agent', mainAgentId)

      const ApiData = {
        pipelineId: cadence.pipelineID,
        mainAgentId: mainAgentId,
        cadence: cadence.cadenceDetails,
      }
      console.log('ApiData is ', ApiData)
      // return

      const ApiPath = Apis.createPipeLineCadence
      //////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //console.log;
        if (response.data.status === true) {
          console.log(
            '🔥 PIPELINE-UPDATE - Update cadence API successful:',
            response,
          )

          localStorage.removeItem('AddCadenceDetails')
          localStorage.removeItem(PersistanceKeys.selectedUser)

          // Refresh user data properly
          console.log('🔥 PIPELINE-UPDATE - Refreshing user data...')
          try {
            const profileResponse = await getProfileDetails()
            console.log(
              '🔥 PIPELINE-UPDATE - getProfileDetails response:',
              profileResponse,
            )

            if (profileResponse?.data?.status === true) {
              const freshUserData = profileResponse.data.data
              const localData = JSON.parse(localStorage.getItem('User') || '{}')

              console.log(
                '🔥 PIPELINE-UPDATE - Fresh user data:',
                freshUserData,
              )

              // Update Redux and localStorage with fresh data
              const updatedUserData = {
                token: localData.token || token,
                user: freshUserData,
              }

              console.log(
                '🔥 PIPELINE-UPDATE - About to call setUserData (Redux)',
              )
              setUserData(updatedUserData)
              console.log('🔥 PIPELINE-UPDATE - Redux update completed')

              // Verify localStorage was updated
              setTimeout(() => {
                const localStorageData = localStorage.getItem('User')
                console.log(
                  '🔥 PIPELINE-UPDATE - localStorage after update:',
                  localStorageData ? JSON.parse(localStorageData) : null,
                )
              }, 100)

              // Route based on updated user data
              if (freshUserData.userType === 'admin') {
                console.log('🔥 PIPELINE-UPDATE - Routing to admin')
                router.push('/admin')
                return
              }
            } else {
              console.error(
                '🔥 PIPELINE-UPDATE - Failed to get profile details',
              )
            }
          } catch (error) {
            console.error(
              '🔥 PIPELINE-UPDATE - Error refreshing user data:',
              error,
            )
          }

          // Check if user came from agency/subaccount page
          let isFromAgencyOrAdmin = null
          const FromAgencyOrAdmin = localStorage.getItem(
            PersistanceKeys.isFromAdminOrAgency,
          )
          if (FromAgencyOrAdmin) {
            try {
              isFromAgencyOrAdmin = JSON.parse(FromAgencyOrAdmin)
            } catch (error) {
              console.error('Error parsing isFromAdminOrAgency:', error)
            }
          }

          // Route based on where user came from
          // Check for both isFrom and isFromAgency properties (for compatibility)
          const isFromAdmin = isFromAgencyOrAdmin?.isFrom === 'admin' || isFromAgencyOrAdmin?.isFromAgency === 'admin'
          const isFromSubaccount = isFromAgencyOrAdmin?.isFrom === 'subaccount' || 
                                   isFromAgencyOrAdmin?.isFromAgency === 'subaccount' ||
                                   (isFromAgencyOrAdmin?.subAccountData && !isFromAdmin) // If subAccountData exists and not admin, assume subaccount
          
          if (isFromAdmin) {
            console.log('🔥 PIPELINE-UPDATE - Routing to admin')
            router.push('/admin')
            localStorage.removeItem(PersistanceKeys.isFromAdminOrAgency)
          } else if (isFromSubaccount) {
            console.log('🔥 PIPELINE-UPDATE - Routing to agency subaccounts')
            router.push('/agency/dashboard/subAccounts')
            localStorage.removeItem(PersistanceKeys.isFromAdminOrAgency)
          } else {
            console.log('🔥 PIPELINE-UPDATE - Routing to dashboard')
            router.push('/dashboard/agents')
          }
        } else {
          // setLoader(false);
        }
      }
    } catch (error) {
      console.error('Error occured in api is :', error)
      //show snackbar we created with error message here
      //   setLoader(false);
    } finally {
    }
  }

  const backgroundImage = {
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
            backgroundImage: 'url("/assets/background.png")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
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
