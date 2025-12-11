'use client'

import { User } from 'lucide-react'
import dynamic from 'next/dynamic.js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import ErrorBoundary from '@/components/ErrorBoundary.js'
import SubAccountPlan from '@/components/agency/subaccount/SubAccountPlan.js'
import BackgroundVideo from '@/components/general/BackgroundVideo.js'
import { PersistanceKeys } from '@/constants/Constants.js'

const CreateAgent1 = dynamic(
  () => import('../../components/createagent/CreateAgent1.js'),
)
const CreateAgent2 = dynamic(
  () => import('../../components/createagent/CreateAgent1.js'),
)
const CreatAgent3 = dynamic(
  () => import('../../components/createagent/CreatAgent3.js'),
)
const UserPlans = dynamic(
  () => import('../../components/userPlans/UserPlans.js'),
)
const UserPlansMobile = dynamic(
  () => import('../../components/userPlans/UserPlansMobile.js'),
)
const CreateAgent4 = dynamic(
  () => import('../../components/createagent/CreateAgent4.js'),
)
const CreateAgentVoice = dynamic(
  () => import('../../components/createagent/CreateAgentVoice.js'),
)

const BuildAgentName = dynamic(
  () =>
    import('../../components/createagent/mobileCreateAgent/BuildAgentName.js'),
)
const BuildAgentObjective = dynamic(
  () =>
    import(
      '../../components/createagent/mobileCreateAgent/BuildAgentObjective.js'
    ),
)
const BuildAgentTask = dynamic(
  () =>
    import('../../components/createagent/mobileCreateAgent/BuildAgentTask.js'),
)

function EmptyPage() {
  return <div></div>
}

const Page = () => {
  // //console.log;

  const router = useRouter()
  const searchParams = useSearchParams()

  const stepFromUrl = parseInt(searchParams.get('step') || '1', 10)
  const [index, setIndex] = useState(stepFromUrl)

  const [user, setUser] = useState(null)
  const [components, setComponents] = useState([
    EmptyPage,
    // CreateAgent1,
    // CreatAgent3,
    // CreateAgent4,
    // CreateAgentVoice,
  ])

  const [windowSize, setWindowSize] = useState(null)
  const [subAccount, setSubaccount] = useState(null)
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [componentsReady, setComponentsReady] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [shouldShowGradient, setShouldShowGradient] = useState(false)
  const [gradientBackground, setGradientBackground] = useState(null)
  const isAgencyUser = user?.user?.userRole === 'Agency' || user?.userRole === 'Agency'

  // Only calculate CurrentComp when components are ready to prevent removeChild errors
  const CurrentComp = componentsReady && components.length > 0 
    ? (components[index - 1] || EmptyPage)
    : EmptyPage
  useEffect(() => {
    const currentStep = searchParams.get('step')
    if (currentStep !== index.toString()) {
      router.replace(`?step=${index}`)
    }
  }, [index, router, searchParams])

  // console.log("Rendering step:", index, components[index]);

  useEffect(() => {
    // Wait for page to be ready and ThemeProvider to finish DOM manipulation
    // Use multiple delays to ensure React and ThemeProvider have both finished
    const readyTimer1 = setTimeout(() => {
      setPageReady(true)
    }, 100)
    
    const initTimer = setTimeout(() => {
      let size = null
      if (typeof window !== 'undefined') {
        size = window.innerWidth
        setWindowSize(size)
        
        // Redirect mobile users (including subaccounts) to desktop page on initial load
        // Only redirect if we're on step 1 (initial landing after registration)
        if (size < 640 && stepFromUrl === 1) {
          router.push('/createagent/desktop')
          return
        }
      } else {
        // //console.log;
      }
      let user = localStorage.getItem(PersistanceKeys.LocalStorageUser)
      if (user) {
        let parsed = JSON.parse(user)
        setUser(parsed)
        // Check if user is subaccount
        if (
          parsed?.user?.userRole === 'AgencySubAccount' ||
          parsed?.userRole === 'AgencySubAccount'
        ) {
          console.log('User is subaccount', true)
          setIsSubaccount(true)
        }
      }
      // Also check User localStorage
      const userData = localStorage.getItem('User')
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          if (
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
            parsedUser?.userRole === 'AgencySubAccount'
          ) {
            setIsSubaccount(true)
          }
        } catch (error) {
          console.log('Error parsing User data:', error)
        }
      }
      // //console.log;
    }, 300) // Delay to allow ThemeProvider to finish DOM manipulation
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      clearTimeout(initTimer)
      clearTimeout(readyTimer1)
    }
  }, [])

  useEffect(() => {
    console.log('windowSize', windowSize)
    // Wait for windowSize to be set before determining components
    if (windowSize === null) {
      return
    }
    
    // //console.log;
    const localData = localStorage.getItem('User')

    if (localData) {
      const Data = JSON.parse(localData)
      // //console.log;
      // //console.log;

      let d = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      let fromAdmin = ''
      if (d) {
        fromAdmin = JSON.parse(d)
      }
      console.log('data form admin is', fromAdmin)
      
      // Set componentsReady to false before changing components to prevent removeChild errors
      setComponentsReady(false)
      
      // Use setTimeout to ensure DOM cleanup completes before setting new components
      setTimeout(() => {
        if (!fromAdmin) {
          if (Data.user.plan) {
            if (windowSize < 640) {
              //console.log;
              setComponents([
                BuildAgentName,
                BuildAgentTask,
                BuildAgentObjective,

                // CreatAgent3,
                // CreateAgent4,
                // CreateAgentVoice,
              ])
            } else {
              setComponents([
                CreateAgent1,
                // CreatAgent3,
                // UserPlans,
                CreateAgent4,
                CreateAgentVoice,
              ])
              // setIndex(1)
            }
          } else {
            if (windowSize < 640) {
              // Use UserPlansMobile for all users (normal, subaccounts, and agencies) on mobile
              setComponents([
                BuildAgentName,
                BuildAgentTask,
                BuildAgentObjective,
                UserPlansMobile,
                // CreateAgent4,
                // CreateAgentVoice,
              ])
              // setIndex(3)
            } else {
              if (subAccount) {
                setComponents([
                  CreateAgent1,
                  SubAccountPlan,
                  CreateAgent4,
                  CreateAgentVoice,
                  // setIndex(3)
                ])
              } else {
                setComponents([
                  CreateAgent1,
                  UserPlans,
                  CreateAgent4,
                  CreateAgentVoice,
                  // setIndex(3)
                ])
              }
            }
          }
        } else {
          setComponents([
            CreateAgent1,
            // CreatAgent3,
            CreateAgent4,
            CreateAgentVoice,
          ])
          console.log('This is admin')
        }
        
        // Mark components as ready after a small delay to ensure React has processed the changes
        setTimeout(() => {
          setComponentsReady(true)
        }, 50)
      }, 100)
    } else {
      // If no user data, still mark as ready to show EmptyPage
      setComponentsReady(true)
    }
  }, [windowSize, subAccount])

  useEffect(() => {
    checkIsFromOnboarding()
  }, [])

  const checkIsFromOnboarding = () => {
    let data = localStorage.getItem(PersistanceKeys.SubaccoutDetails)
    if (data) {
      let subAcc = JSON.parse(data)
      setSubaccount(subAcc)
      setIsSubaccount(true)
    }
  }

  // Function to proceed to the next step
  const handleContinue = () => setIndex((prev) => prev + 1)
  const handleBack = () => setIndex((prev) => Math.max(prev - 1, 0))
  const handleSkipAddPayment = () => setIndex((prev) => prev + 2)

  //function to get the agent Details
  const [AgentDetails, setAgentDetails] = useState({
    name: '',
    agentRole: '',
    agentType: '',
  })

  const getAgentDetails = (agentName, agentRole, agentType) => {
    // //console.log;
    // console.log(
    //   `"Agent Name is": ${agentName} ----- "Agent Role is" ${agentRole} ------ "Agent Type is" ${agentType}`
    // );
    setAgentDetails({
      name: agentName,
      agentRole: agentRole,
      agentType: agentType,
    })
  }

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
  }, [isSubaccount, subAccount, isAgencyUser])

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100svh',
    overflow: 'hidden',
    position: 'relative',
    ...(shouldShowGradient && gradientBackground ? { background: gradientBackground } : {}),
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
        <div
          style={backgroundImage}
          className={`main-div overflow-y-none flex flex-row justify-center items-center ${shouldShowGradient ? '' : 'bg-brand-primary'}`}
        >
          {!shouldShowGradient && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1, // Ensure the video stays behind content
              }}
            >
              <BackgroundVideo />
            </div>
          )}
          {pageReady && componentsReady ? (
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              <CurrentComp
                handleContinue={handleContinue}
                handleBack={handleBack}
                handleSkipAddPayment={handleSkipAddPayment}
                getAgentDetails={getAgentDetails}
                AgentDetails={AgentDetails}
                user={user}
                screenWidth={windowSize}
                isFrom={
                  subAccount 
                    ? 'SubAccount' 
                    : isSubaccount 
                      ? 'SubAccount' 
                      : user?.user?.userRole === 'Agency' || user?.userRole === 'Agency'
                        ? 'Agency'
                        : undefined
                }
                // Explicit flags for background decisions in child components
                isSubaccountContext={isSubaccount || Boolean(subAccount)}
                isAgencyContext={isAgencyUser}
              />
            </div>
          ) : (
            <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              Loading...
            </div>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

export default Page
