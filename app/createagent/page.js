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

  let CurrentComp = components[index - 1] || EmptyPage
  useEffect(() => {
    const currentStep = searchParams.get('step')
    if (currentStep !== index.toString()) {
      router.replace(`?step=${index}`)
    }
  }, [index, router, searchParams])

  // console.log("Rendering step:", index, components[index]);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
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
    }
  }, [windowSize])

  useEffect(() => {
    checkIsFromOnboarding()
  }, [])

  const checkIsFromOnboarding = () => {
    let data = localStorage.getItem(PersistanceKeys.SubaccoutDetails)
    if (data) {
      let subAcc = JSON.parse(data)
      setSubaccount(subAcc)
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

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100svh',
    overflow: 'hidden',
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<div></div>}>
        <div
          style={backgroundImage}
          className="overflow-y-none flex flex-row justify-center items-center"
        >
          {windowSize > 640 && (
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
              {isSubaccount ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background:
                      process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
                        ? `linear-gradient(to bottom left, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary) / 0.4) 100%)`
                        : `radial-gradient(circle at top right, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary) / 0.4) 100%)`,
                  }}
                />
              ) : (
                <BackgroundVideo />
              )}
            </div>
          )}
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
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

export default Page
