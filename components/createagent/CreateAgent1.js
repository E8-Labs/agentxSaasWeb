import { Box, CircularProgress, Modal, Popover, Tooltip } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { Input } from '@/components/ui/input'
import {
  HowToVideoTypes,
  HowtoVideos,
  PersistanceKeys,
} from '@/constants/Constants'
import UnlockAgentModal from '@/constants/UnlockAgentModal'
import { UserTypes } from '@/constants/UserTypes'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'

import { useUser } from '../../hooks/redux-hooks'
import { usePlanCapabilities } from '../../hooks/use-plan-capabilities'
import LoaderAnimation from '../animations/LoaderAnimation'
import Apis from '../apis/Apis'
import getProfileDetails from '../apis/GetProfile'
import MoreAgentsPopup from '../dashboard/MoreAgentsPopup'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import UpgradePlan from '../userPlans/UpgradePlan'
import { isPlanActive } from '../userPlans/UserPlanServices'
import IntroVideoModal from './IntroVideoModal'
// Removed Google Maps imports for simple string input
import VideoCard from './VideoCard'

const CreateAgent1 = ({
  handleContinue,
  handleSkipAddPayment,
  isSubaccountContext = false,
  isAgencyContext = false,
}) => {
  // Removed Google Maps API key - no longer needed
  const router = useRouter()
  const bottomRef = useRef()
  const scrollAreaRef = useRef(null)
  const [loaderModal, setLoaderModal] = useState(false)
  const [shouldContinue, setShouldContinue] = useState(true)
  const [toggleClick, setToggleClick] = useState(false)
  const [OutBoundCalls, setOutBoundCalls] = useState(false)
  const [InBoundCalls, setInBoundCalls] = useState(false)
  const [buildAgentLoader, setBuildAgentLoader] = useState(false)
  const [agentObjective, setAgentObjective] = useState(null)

  const [agentName, setAgentName] = useState('')
  const [agentRole, setAgentRole] = useState('')

  const [showModal, setShowModal] = useState(false)

  //variable for video card
  const [introVideoModal, setIntroVideoModal] = useState(false)

  //sbakc message when agent builded
  const [snackMessage, setSnackMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [msgType, setMsgType] = useState(null)

  //other status
  const [showSomtthingElse, setShowSomtthingElse] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [otherStatus, setOtherStatus] = useState('')
  //get address
  const [address, setAddress] = useState('')

  const bottomToAddress = useRef(null) // Ref for scrolling
  const [addressSelected, setAddressSelected] = useState(null)

  //code for address input (simple string)
  const [addressValue, setAddressValue] = useState('')

  const [user, setUser] = useState(null)
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [isAgencyCreatingForSubaccount, setIsAgencyCreatingForSubaccount] = useState(false)
  const [hasAgencyLogo, setHasAgencyLogo] = useState(false)
  const [isCustomDomain, setIsCustomDomain] = useState(false)

  const [showUnclockModal, setShowUnclockModal] = useState(false)
  const [modalDesc, setModalDesc] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showMoreAgentsModal, setShowMoreAgentsModal] = useState(false)
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)
  const [pendingAgentSelection, setPendingAgentSelection] = useState(null) // Track what selection was attempted
  const [hasAgreedToExtraCost, setHasAgreedToExtraCost] = useState(false) // Track if user agreed to pay extra
  const [userInitiallyHadPlan, setUserInitiallyHadPlan] = useState(false) // Track if user initially had a plan

  // Redux state
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  const { canCreateAgent, isFreePlan, currentAgents, maxAgents } =
    usePlanCapabilities()

  // Removed address picker modal - no longer needed

  useEffect(() => {
    // Clear pipeline cadence data when creating a new agent
    localStorage.removeItem('AddCadenceDetails')
    refreshUserData()
    getSelectedUser()
    
    // Track if user initially had a plan (to prevent redirect after upgrade)
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const hasPlan = parsedUser?.user?.plan !== null && parsedUser?.user?.plan?.price !== 0
          setUserInitiallyHadPlan(hasPlan)
          console.log('🔍 [CREATE-AGENT] User initially had plan:', hasPlan)
        }
      } catch (error) {
        console.log('Error checking initial plan status:', error)
      }
    }
    
    // Check if custom domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const isCustom = hostname !== 'app.assignx.ai' && hostname !== 'dev.assignx.ai'
      setIsCustomDomain(isCustom)
    }
    
    // Check if user is subaccount
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const isSub = parsedUser?.user?.userRole === 'AgencySubAccount' ||
            parsedUser?.userRole === 'AgencySubAccount'
          setIsSubaccount(isSub)
          
          // Check if current user is Agency and creating agent for subaccount
          const isAgency = parsedUser?.user?.userRole === 'Agency' || parsedUser?.userRole === 'Agency'
          if (isAgency) {
            const fromAdminOrAgency = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
            if (fromAdminOrAgency) {
              try {
                const parsed = JSON.parse(fromAdminOrAgency)
                if (parsed?.subAccountData) {
                  setIsAgencyCreatingForSubaccount(true)
                }
              } catch (error) {
                console.log('Error parsing isFromAdminOrAgency:', error)
              }
            }
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
          if (parsedUser?.user?.agencyBranding) {
            branding = parsedUser.user.agencyBranding
          } else if (parsedUser?.agencyBranding) {
            branding = parsedUser.agencyBranding
          } else if (parsedUser?.user?.agency?.agencyBranding) {
            branding = parsedUser.user.agency.agencyBranding
          }
          
          // Set hasAgencyLogo if logoUrl exists
          const hasLogo = branding?.logoUrl
          setHasAgencyLogo(hasLogo)
        }
      } catch (error) {
        console.log('Error parsing user data:', error)
      }
    }
  }, [])

  const getSelectedUser = () => {
    let U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    console.log('selected user in localstorage is', U)
    if (U) {
      console.log('found selected user')
      setSelectedUser(JSON.parse(U))
    } else {
      console.log('slected user not found')
    }
  }

  useEffect(() => {
    setAddress(address?.label)
  }, [addressSelected])

  // Listen for branding updates to update title position
  useEffect(() => {
    const handleBrandingUpdate = () => {
      if (typeof window !== 'undefined') {
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            let branding = null
            const storedBranding = localStorage.getItem('agencyBranding')
            if (storedBranding) {
              try {
                branding = JSON.parse(storedBranding)
              } catch (error) {
                console.log('Error parsing agencyBranding:', error)
              }
            }
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              branding = parsedUser.user.agency.agencyBranding
            }
            const hasLogo = branding?.logoUrl
            setHasAgencyLogo(hasLogo)
          }
        } catch (error) {
          console.log('Error updating branding:', error)
        }
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (userData) {
      let d = JSON.parse(userData)
      setUser(d)
    }
  }, [])
  // const [scollAddress, setScollAddress] = useState("");
  //// //console.log;

  //other objective
  const [showOtherObjective, setShowOtherObjective] = useState(false)
  const [otherObjVal, setOtherObjVal] = useState('')

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  //auto move to the bottom
  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (userData) {
      let d = JSON.parse(userData)
      setUser(d)
    }
    if (showOtherObjective && scrollAreaRef.current) {
      // IMPORTANT: only scroll the inner scroll area (not the window)
      // so we don't "jump" the page and hide the title.
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [showOtherObjective])

  useEffect(() => {
    if (
      OutBoundCalls ||
      (InBoundCalls === true && agentName && agentRole && toggleClick)
    ) {
      setShouldContinue(false)
      // //console.log;
    } else if (
      !OutBoundCalls ||
      (!InBoundCalls === true && !agentName && !agentRole && !toggleClick)
    ) {
      setShouldContinue(true)
      // //console.log;
    }
  }, [agentName, agentRole, agentObjective, otherObjVal])

  const handleToggleClick = (item) => {
    setAgentObjective(item)
    setToggleClick(item.id)
    // setToggleClick(prevId => (prevId === item.id ? null : item.id));

    if (item.id === 3) {
      setShowModal(true)
    }
    if (item.id === 100) {
      // //console.log;
      // if (bottomRef.current) {
      //     bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      // }
      setShowOtherObjective(true)
    } else {
      setShowOtherObjective('')
      setOtherObjVal('')
    }
  }

  // Branded icon renderer (same mask-image approach as notifications drawer)
  const renderBrandedIcon = (iconPath, size = 30, isSelected = false) => {
    if (!iconPath) return null
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return <Image src={iconPath} height={size} width={size} alt="*" />
    }

    const brandVar = getComputedStyle(document.documentElement)
      .getPropertyValue('--brand-primary')
      .trim()

    const selectedColor = brandVar ? `hsl(${brandVar})` : 'hsl(270 75% 50%)'
    const unselectedColor = '#000000'

    return (
      <div
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          backgroundColor: isSelected ? selectedColor : unselectedColor,
          WebkitMaskImage: `url(${iconPath})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(${iconPath})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          transition: 'background-color 0.2s ease-in-out',
          flexShrink: 0,
        }}
      />
    )
  }

  const AgentObjective = [
    {
      id: 1,
      icon: '',
      title: 'Absentee Owners',
      details:
        'Reach out to property owners who may not live in the property to discuss potential selling or investment opportunities.',
      focusIcn: '/svgIcons/obj1F.svg',
      unFocusIcon: '/objectiveIcons/obj1UF.png',
    },
    {
      id: 2,
      icon: '',
      title: 'Circle Prospecting',
      details:
        'Call homeowners in a specific farm to inform them about recent property activities, and gauge their interest in selling or buying.',
      focusIcn: '/svgIcons/obj2F.svg',
      unFocusIcon: '/objectiveIcons/obj2UF.png',
    },
    {
      id: 3,
      icon: '',
      title: 'Community Update',
      details:
        'Provide local homeowners with relevant updates on a property like just listed, just sold, in escrow or something else. ',
      focusIcn: '/svgIcons/obj3F.svg',
      unFocusIcon: '/objectiveIcons/obj3UF.png',
    },
    {
      id: 4,
      icon: '',
      title: 'Lead Reactivation',
      details:
        'Reconnect with past leads who previously expressed interest but did not convert, to reignite their interest in your services.',
      focusIcn: '/svgIcons/obj3F.svg',
      unFocusIcon: '/objectiveIcons/obj3UF.png',
    },
    {
      id: 5,
      icon: '',
      title: 'Recruiting Agent',
      details:
        'Identify, engage, and attract potential real estate agents to expand your team with top talent. Recruit new agents to your team.',
      focusIcn: '/svgIcons/obj5RAF.svg',
      unFocusIcon: '/svgIcons/obj5RAU.svg',
    },
    {
      id: 7,
      icon: '',
      title: 'Receptionist',
      details:
        'Greet clients, manage appointments, and ensure smooth office operations. Provide front-desk support for incoming calls.',
      focusIcn: '/svgIcons/reciptionistFC.svg',
      unFocusIcon: '/svgIcons/reciptionistUFC.svg',
    },
    {
      id: 6,
      icon: '',
      title: 'Expired Listing',
      details:
        'Connect with homeowners whose listings have expired to understand their needs and offer solutions. Help relist their property and guide them toward a successful sale.',
      focusIcn: '/svgIcons/obj6FOCUS.svg',
      unFocusIcon: '/svgIcons/obj6ELU.svg',
    },
    {
      id: 8,
      icon: '',
      title: 'Speed to Lead',
      details:
        'Instantly engage new leads from Zillow, Realtor.com, Facebook ads, and more the moment they enter your CRM to maximize conversion chances.',
      focusIcn: '/svgIcons/obj5RAF.svg',
      unFocusIcon: '/objectiveIcons/obj5UF.png',
    },
    {
      id: 9,
      icon: '',
      title: 'FSBO (For Sale By Owner)',
      details:
        'Connect with homeowners trying to sell on their own, offering professional guidance and solutions to help them successfully close.',
      focusIcn: '/svgIcons/obj2F.svg',
      unFocusIcon: '/objectiveIcons/obj2UF.png',
    },
    {
      id: 10,
      icon: '',
      title: 'Probate',
      details:
        'Reach out to property heirs navigating probate, providing support and options for handling inherited real estate during a difficult time.',
      focusIcn: '/svgIcons/obj1F.svg',
      unFocusIcon: '/objectiveIcons/obj1UF.png',
    },
    {
      id: 100,
      icon: '',
      title: 'Something Else',
      details: '',
      focusIcn: '/svgIcons/obj6F.svg',
      unFocusIcon: '/objectiveIcons/obj6UF.png',
    },
  ]

  function canShowObjectives() {
    // If agency/admin is creating agent for another user (subaccount), check that user's type
    const U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    let targetUserType = null
    
    if (U) {
      try {
        const Data = JSON.parse(U)
        // Check if there's subAccountData (when agency/admin creates for subaccount)
        if (Data.subAccountData) {
          targetUserType = Data.subAccountData?.userType || Data.subAccountData?.user?.userType
        }
        // Also check selectedUser state as fallback
        if (!targetUserType && selectedUser) {
          targetUserType = selectedUser?.userType || selectedUser?.user?.userType
        }
      } catch (error) {
        console.log('Error parsing isFromAdminOrAgency:', error)
      }
    }
    
    // If we have a target user type (agency/admin creating for another user), use that
    if (targetUserType) {
      return targetUserType === UserTypes.RealEstateAgent
    }
    
    // Otherwise, check the logged-in user's type (normal user or subaccount creating for themselves)
    if (user && user.user && user.user.userType) {
      return user.user.userType === UserTypes.RealEstateAgent
    }
    
    // Fallback: check redux user
    if (reduxUser && reduxUser.userType) {
      return reduxUser.userType === UserTypes.RealEstateAgent
    }
    
    return false
  }

  // Helper function to check if user has payment methods
  const hasPaymentMethod = () => {
    try {
      // First check localStorage (primary source)
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        const cards = userData?.user?.cards || userData?.data?.user?.cards
        if (Array.isArray(cards) && cards.length > 0) {
          return true
        }
      }
      // Fallback to Redux user data (check both reduxUser.cards and reduxUser.user.cards)
      if (
        reduxUser?.cards &&
        Array.isArray(reduxUser.cards) &&
        reduxUser.cards.length > 0
      ) {
        return true
      }
      if (
        reduxUser?.user?.cards &&
        Array.isArray(reduxUser.user.cards) &&
        reduxUser.user.cards.length > 0
      ) {
        return true
      }
      // Also check user state
      if (
        user?.user?.cards &&
        Array.isArray(user.user.cards) &&
        user.user.cards.length > 0
      ) {
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking payment methods:', error)
      return false
    }
  }

  function canContinue() {
    // If agency/admin is creating agent for another user (subaccount), check that user's type
    const U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    let targetUserType = null
    
    if (U) {
      try {
        const Data = JSON.parse(U)
        // Check if there's subAccountData (when agency/admin creates for subaccount)
        if (Data.subAccountData) {
          targetUserType = Data.subAccountData?.userType || Data.subAccountData?.user?.userType
        }
        // Also check selectedUser state as fallback
        if (!targetUserType && selectedUser) {
          targetUserType = selectedUser?.userType || selectedUser?.user?.userType
        }
      } catch (error) {
        console.log('Error parsing isFromAdminOrAgency:', error)
      }
    }
    
    // Determine which user type to check
    let userTypeToCheck = null
    if (targetUserType) {
      // Use target user type (agency/admin creating for another user)
      userTypeToCheck = targetUserType
    } else if (user && user.user && user.user.userType) {
      // Use logged-in user's type (normal user or subaccount creating for themselves)
      userTypeToCheck = user.user.userType
    } else if (reduxUser && reduxUser.userType) {
      // Fallback: check redux user
      userTypeToCheck = reduxUser.userType
    }
    
    if (!userTypeToCheck) {
      return false
    }
    
    // Check if user has a paid plan (not free) and if they have a payment method
    // For subaccounts (when agency/admin creates for another user), check the subaccount's data
    let currentUserData = null
    if (selectedUser?.subAccountData) {
      // Use subaccount data when creating agent for subaccount
      currentUserData = { user: selectedUser.subAccountData }
    } else {
      // Use logged-in user data
      currentUserData = reduxUser || user
    }
    console.log('[CREATE-AGENT] currentUserData plan is', currentUserData)
    let plan = currentUserData?.user?.plan || currentUserData?.plan
    
    const hasPlan = plan !== null && plan?.price !== 0
    const isFreePlan = !hasPlan || plan?.price === 0
    
    // If user has a paid plan, they must have a payment method to continue
    if (hasPlan && !isFreePlan) {
      // For subaccounts, check their payment methods
      let hasPM = false
      if (selectedUser?.subAccountData) {
        const subaccountCards = selectedUser.subAccountData?.cards || selectedUser.subAccountData?.user?.cards
        hasPM = Array.isArray(subaccountCards) && subaccountCards.length > 0
      } else {
        hasPM = hasPaymentMethod()
      }
      
      if (!hasPM) {
        console.log('🚫 [CREATE-AGENT] User has paid plan but no payment method - cannot continue')
        return false
      }
    }
    
    // Check requirements based on user type
    if (userTypeToCheck === UserTypes.RealEstateAgent) {
      // Real estate agents need: name, role, objective, and call type
      if (
        agentName &&
        agentRole &&
        agentObjective &&
        (InBoundCalls || OutBoundCalls)
      ) {
        return true
      } else {
        return false
      }
    } else {
      // Other user types need: name, role, and call type (no objective required)
      if (agentName && agentRole && (InBoundCalls || OutBoundCalls)) {
        return true
      }
    }
    return false
  }

  //code for selecting inbound calls
  const handleInboundCallClick = () => {
    const newInboundState = !InBoundCalls

    // Always allow toggling OFF
    if (!newInboundState) {
      setInBoundCalls(false)
      setPendingAgentSelection(null)
      return
    }

    // Check limits when toggling ON
    const limitResult = checkAgentLimits(
      'inbound',
      newInboundState,
      OutBoundCalls,
    )
    console.log('limitResult is', limitResult)
    if (limitResult.showModal) {
      // Store what the user was trying to select
      setPendingAgentSelection({
        type: 'inbound',
        inbound: newInboundState,
        outbound: OutBoundCalls,
      })
      return // Don't toggle the state, just show the modal
    } else {
      setInBoundCalls(true)
    }
  }

  //code for selecting outbound calls
  const handleOutBoundCallClick = () => {
    const newOutboundState = !OutBoundCalls

    // Always allow toggling OFF
    if (!newOutboundState) {
      setOutBoundCalls(false)
      setPendingAgentSelection(null)
      return
    }

    // Check limits when toggling ON
    const limitResult = checkAgentLimits(
      'outbound',
      InBoundCalls,
      newOutboundState,
    )
    console.log('limitResult is', limitResult)
    if (limitResult?.showModal) {
      // Store what the user was trying to select
      setPendingAgentSelection({
        type: 'outbound',
        inbound: InBoundCalls,
        outbound: newOutboundState,
      })
      return // Don't toggle the state, just show the modal
    } else {
      setOutBoundCalls(true)
    }
  }

  // Comprehensive plan checking logic
  const checkAgentLimits = (agentType, wouldHaveInbound, wouldHaveOutbound) => {
    console.log('🔍 [CREATE-AGENT] Checking agent limits')
    console.log('Redux user', reduxUser)

    // Use Redux as primary source, localStorage as fallback
    const planData = reduxUser?.planCapabilities
      ? {
          isFreePlan: isFreePlan,
          currentAgents: currentAgents,
          maxAgents: maxAgents,
          costPerAdditionalAgent:
            reduxUser?.planCapabilities?.costPerAdditionalAgent || 10,
        }
      : {
          isFreePlan: (() => {
            const planType = user?.user?.plan?.type?.toLowerCase()
            if (planType?.includes('free')) return true
            if (user?.user?.planCapabilities?.maxAgents > 1) return false
            return user?.user?.plan === null || user?.user?.plan?.price === 0
          })(),
          currentAgents: user?.user?.currentUsage?.maxAgents || 0,
          maxAgents: user?.user?.planCapabilities?.maxAgents || 1,
          costPerAdditionalAgent:
            user?.user?.planCapabilities?.costPerAdditionalAgent || 10,
        }

    console.log('Plan data is', planData)

    // Calculate agents that would be created
    let agentsToCreate = 0
    if (wouldHaveInbound) agentsToCreate++
    if (wouldHaveOutbound) agentsToCreate++

    // check if user already view pay per month window from agents page and agree it by clicking on the button
    const isAlreadyViewedPayPerMonthWindow = localStorage.getItem(
      'AddAgentByPayingPerMonth',
    )
    console.log(
      'isAlreadyViewedPayPerMonthWindow is',
      isAlreadyViewedPayPerMonthWindow,
    )
    if (
      isAlreadyViewedPayPerMonthWindow != null &&
      isAlreadyViewedPayPerMonthWindow?.status === true
    ) {
      return true
    }

    // console.log('📊 [CREATE-AGENT] Agent calculation complete');

    // FREE PLAN LOGIC
    // no need to check for free plan here as we are compairing currentAgents with maxAgents
    // if (planData.isFreePlan) {
    //   console.log('🆓 [CREATE-AGENT] Free plan detected');

    //   // If user already has 1 agent, don't allow any more
    //   if (planData.currentAgents >= 1 && planData.maxAgents > planData.currentAgents) {
    //     console.log('🚫 [CREATE-AGENT] Free plan user has reached limit');
    //     setModalDesc("The free plan only allows for 1 AI Agent.");
    //     setShowUnclockModal(true);
    //     return { showModal: true };
    //   }

    //   // If user is trying to select both types at once on free plan
    //   if (agentsToCreate > 1) {
    //     // console.log('🚫 [CREATE-AGENT] Free plan user trying to select both agent types');
    //     setModalDesc("The free plan only allows for 1 AI Agent.");
    //     setShowUnclockModal(true);
    //     return { showModal: true };
    //   }

    //   return { showModal: false };
    // }

    // PAID PLAN LOGIC
    // console.log('💰 [CREATE-AGENT] Paid plan detected');

    // Check if user has already reached their limit
    if (planData.currentAgents >= planData.maxAgents) {
      // console.log('🚫 [CREATE-AGENT] Paid plan user has reached limit');
      // if user is on free plan then show unlock modal
      if (planData.isFreePlan) {
        setShowUnclockModal(true)
        setModalDesc('The free plan only allows for 1 AI Agent.')
        return { showModal: true }
      }
      // if user already view pay per month window from agents page then no need to show more agents modal

      if (isAlreadyViewedPayPerMonthWindow) {
        console.log(
          'no need to show more agents modal, user already view pay per month window from agents page',
        )
        return { showModal: false }
      }
      setShowMoreAgentsModal(true)
      return { showModal: true }
    }

    // Check if the selection would exceed the limit
    if (planData.currentAgents + agentsToCreate > planData.maxAgents) {
      // console.log('🚫 [CREATE-AGENT] Selection would exceed limit');
      // if user is on free plan then show unlock modal
      if (planData.isFreePlan) {
        setShowUnclockModal(true)
        setModalDesc('The free plan only allows for 1 AI Agent.')
        return { showModal: true }
      }
      // if user already view pay per month window from agents page then no need to show more agents modal
      if (isAlreadyViewedPayPerMonthWindow) {
        return
      }
      setShowMoreAgentsModal(true)
      return { showModal: true }
    }

    // console.log('✅ [CREATE-AGENT] Selection allowed');
    return { showModal: false }
  }

  // Function to apply the pending agent selection when user agrees to extra cost
  const applyPendingSelection = () => {
    if (pendingAgentSelection) {
      // console.log('💰 [CREATE-AGENT] Applying pending selection with extra cost');
      setInBoundCalls(pendingAgentSelection.inbound)
      setOutBoundCalls(pendingAgentSelection.outbound)
      setHasAgreedToExtraCost(true)
      setPendingAgentSelection(null)
    }
  }

  useEffect(() => {
    //add interval here
    console.log('reduxUser is', reduxUser)
    let user = localStorage.getItem('User')
    console.log('local user is', user)
  }, [reduxUser])

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    console.log('🔄 REFRESH USER DATA STARTED')
    try {
      console.log('🔄 Calling getProfileDetails...')
      const profileResponse = await getProfileDetails()
      console.log('🔄 getProfileDetails response:', profileResponse)

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        // console.log('🔄 [CREATE-AGENT] Fresh user data received after upgrade');

        // Update Redux and localStorage with fresh data
        console.log('updating redux user', freshUserData)
        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        setReduxUser(updatedUserData)

        // Update local state as well
        setUser(updatedUserData)

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [CREATE-AGENT] Error refreshing user data:', error)
      return false
    }
  }

  //code for creating agent api
  const handleBuildAgent = async () => {
    if (reduxUser?.plan && !isPlanActive(reduxUser?.plan)) {
      setSnackMessage('Your plan is paused. Activate to create agents')
      setIsVisible(true)
      setMsgType(SnackbarTypes.Error)
      return
    }
    // return
    try {
      setBuildAgentLoader(true)
      setLoaderModal(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      let LocalDetails = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        // //console.log;
        AuthToken = UserDetails.token
        LocalDetails = UserDetails
      }
      // return
      // //console.log;
      const ApiPath = Apis.buildAgent
      // //console.log;
      const formData = new FormData()

      //code for sending the user  id if from agency subaccount flow
      let userId = null

      if (selectedUser && selectedUser?.subAccountData?.id) {
        console.log(
          'Subaccount data recieved on createagent_1 screen is',
          selectedUser,
        )
        userId = selectedUser.subAccountData.id
      }

      if (userId) {
        console.log('User id to create new agent is', userId)
        formData.append('userId', userId)
      }

      formData.append('name', agentName)
      formData.append('agentRole', agentRole)
      let agentType = null
      if (InBoundCalls && OutBoundCalls) {
        agentType = 'both'
      } else if (InBoundCalls) {
        agentType = 'inbound'
      } else if (OutBoundCalls) {
        agentType = 'outbound'
      }
      formData.append('agentType', agentType)

      // Include extra cost agreement information if user agreed to pay additional
      if (hasAgreedToExtraCost) {
        formData.append('hasAgreedToExtraCost', 'true')
        formData.append(
          'extraCostAmount',
          reduxUser?.planCapabilities?.costPerAdditionalAgent ||
            user?.user?.planCapabilities?.costPerAdditionalAgent ||
            10,
        )
        // console.log('💰 [CREATE-AGENT] Including extra cost agreement in API call');
      }

      if (selectedStatus) {
        if (selectedStatus.id === 5) {
          formData.append('status', otherStatus)
        } else {
          formData.append('status', selectedStatus.title)
        }
      } else {
      }
      // return;
      if (addressValue) {
        formData.append('address', addressValue)
      }
      if (!canShowObjectives()) {
        //if the user type is not real estate then we don't show objectives to user
        formData.append('agentObjective', 'others')
        formData.append('agentObjectiveDescription', '')
        formData.append('agentObjectiveId', 100)
      } else if (agentObjective.id === 100) {
        formData.append('agentObjective', 'others')
        formData.append('agentObjectiveDescription', otherObjVal)
        formData.append('agentObjectiveId', 100)
      } else {
        formData.append('agentObjective', agentObjective.title)
        formData.append('agentObjectiveDescription', agentObjective.details)
        formData.append('agentObjectiveId', agentObjective.id)
      }

      // //console.log;
      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`)
      }

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      // Check HTTP status code first
      if (response.status !== 200) {
        setLoaderModal(false)
        setBuildAgentLoader(false)
        setIsVisible(true)
        
        if (response.status === 401) {
          setSnackMessage('Unauthorized. Please log in again.')
          setMsgType(SnackbarTypes.Error)
        } else if (response.status === 403) {
          setSnackMessage('Access forbidden. You do not have permission to create agents.')
          setMsgType(SnackbarTypes.Error)
        } else {
          setSnackMessage(`Agent creation failed! (Status: ${response.status})`)
          setMsgType(SnackbarTypes.Error)
        }
        return
      }

      if (response) {
        // //console.log;
        setIsVisible(true)
        if (response.data.status === true) {
          console.log('Response of add new agent is', response.data)
          setSnackMessage('Agent created successfully.')
          setMsgType(SnackbarTypes.Success)
          localStorage.setItem(
            PersistanceKeys.LocalSavedAgentDetails,
            JSON.stringify(response.data.data),
          )

          let AT = { agentType, agentName }
          localStorage.setItem('agentType', JSON.stringify(AT))

          const L = localStorage.getItem('isFromCheckList')

          const localData = localStorage.getItem('User')
          if (localData) {
            let D = JSON.parse(localData)
            D.user.checkList.checkList.agentCreated = true
            localStorage.setItem('User', JSON.stringify(D))
          }
          window.dispatchEvent(
            new CustomEvent('UpdateCheckList', { detail: { update: true } }),
          )
          
          // Check if user has a plan - if they just subscribed (initially had no plan),
          // skip the UserPlans step to prevent redirect to plans screen
          // Check from multiple sources to ensure we have the latest data
          let hasPlan = false
          try {
            // First check localStorage (most up-to-date after subscription)
            const localUserData = localStorage.getItem('User')
            if (localUserData) {
              const parsedUser = JSON.parse(localUserData)
              const plan = parsedUser?.user?.plan
              // Consider user has plan if plan exists and is not null
              // Check both plan existence and planId to be more robust
              hasPlan = plan !== null && plan !== undefined && (plan.planId !== null || plan.id !== null)
              console.log('🔍 [CREATE-AGENT] Plan check from localStorage:', {
                plan,
                planId: plan?.planId,
                id: plan?.id,
                price: plan?.price,
                hasPlan
              })
            }
            
            // Check selectedUser.subAccountData for subaccounts (if from admin/agency flow)
            if (!hasPlan && selectedUser?.subAccountData) {
              const subAccountPlan = selectedUser.subAccountData?.plan
              hasPlan = subAccountPlan !== null && 
                       subAccountPlan !== undefined && 
                       (subAccountPlan.planId !== null || subAccountPlan.id !== null)
              console.log('🔍 [CREATE-AGENT] Plan check from selectedUser.subAccountData:', {
                plan: subAccountPlan,
                planId: subAccountPlan?.planId,
                id: subAccountPlan?.id,
                price: subAccountPlan?.price,
                hasPlan
              })
            }
            
            // Fallback to Redux or local state if localStorage doesn't have plan info
            if (!hasPlan) {
              const currentUserData = selectedUser?.subAccountData || reduxUser || user
              const plan = currentUserData?.user?.plan || currentUserData?.plan
              hasPlan = plan !== null && 
                       plan !== undefined && 
                       (plan.planId !== null || plan.id !== null)
              console.log('🔍 [CREATE-AGENT] Plan check from Redux/state:', {
                plan,
                planId: plan?.planId,
                id: plan?.id,
                price: plan?.price,
                hasPlan
              })
            }
          } catch (error) {
            console.error('Error checking plan status:', error)
            // On error, default to normal flow
            hasPlan = false
          }
          
          // Check if we should skip UserPlans step
          // This prevents redirect to plans screen after subscribing and creating agent
          // Check localStorage flag FIRST (most reliable indicator that user just subscribed)
          let skipFlag = null
          try {
            skipFlag = localStorage.getItem('skipUserPlansAfterSubscription')
          } catch (error) {
            console.error('Error reading skipUserPlansAfterSubscription from localStorage:', error)
          }
          
          // Also check all localStorage keys to debug
          console.log('🔍 [CREATE-AGENT] localStorage check:', {
            skipFlag,
            skipFlagType: typeof skipFlag,
            skipFlagStrict: skipFlag === 'true',
            allKeys: Object.keys(localStorage).filter(key => key.includes('skip') || key.includes('plan') || key.includes('User'))
          })
          
          // Priority order:
          // 1. localStorage flag (most reliable - set immediately after subscription)
          // 2. User has a plan (if they have any plan, they shouldn't see UserPlans)
          // 3. User has plan AND initially didn't have one (just subscribed)
          const shouldSkipUserPlans = 
            String(skipFlag) === 'true' ||  // Convert to string for strict comparison
            hasPlan ||              // If user has any plan, skip UserPlans
            (hasPlan && !userInitiallyHadPlan) // Backup check
          
          console.log('🔍 [CREATE-AGENT] Checking if should skip UserPlans:', {
            hasPlan,
            userInitiallyHadPlan,
            skipFlag,
            skipFlagString: String(skipFlag),
            skipFlagCheck: String(skipFlag) === 'true',
            shouldSkipUserPlans,
            condition1: String(skipFlag) === 'true',
            condition2: hasPlan,
            condition3: hasPlan && !userInitiallyHadPlan,
            finalDecision: shouldSkipUserPlans ? 'SKIP' : 'SHOW'
          })
          
          if (shouldSkipUserPlans) {
            console.log('✅ [CREATE-AGENT] Skipping UserPlans step to avoid redirect')
            // Clear the flag after using it
            try {
              localStorage.removeItem('skipUserPlansAfterSubscription')
            } catch (error) {
              console.error('Error removing skipUserPlansAfterSubscription from localStorage:', error)
            }
            // Use handleSkipAddPayment to skip UserPlans step (increments by 2 instead of 1)
            // This ensures we skip UserPlans even if the parent's components array wasn't updated
            handleSkipAddPayment()
          } else {
            console.log('ℹ️ [CREATE-AGENT] Proceeding normally - will show UserPlans')
            console.log('⚠️ [CREATE-AGENT] DEBUG - Why not skipping:', {
              skipFlag,
              skipFlagString: String(skipFlag),
              skipFlagCheck: String(skipFlag) === 'true',
              hasPlan,
              userInitiallyHadPlan,
              allConditions: {
                flag: String(skipFlag) === 'true',
                hasPlanCheck: hasPlan,
                backup: hasPlan && !userInitiallyHadPlan
              }
            })
            // User doesn't have plan, so they need to see UserPlans
            handleContinue()
          }
          // }
        } else if (response.data.status === false) {
          setSnackMessage('Agent creation failed!')
          setMsgType(SnackbarTypes.Error)
          setBuildAgentLoader(false)
        }
      }
    } catch (error) {
      // console.error("Error occured in build agent api is: ----", error);
      setLoaderModal(false)
      setBuildAgentLoader(false)
      setIsVisible(true)
      
      // Handle axios error responses
      if (error.response) {
        const statusCode = error.response.status
        if (statusCode === 401) {
          setSnackMessage('Unauthorized. Please log in again.')
          setMsgType(SnackbarTypes.Error)
        } else if (statusCode === 403) {
          setSnackMessage('Access forbidden. You do not have permission to create agents.')
          setMsgType(SnackbarTypes.Error)
        } else {
          const errorMessage = error.response.data?.message || error.response.data?.error || `Agent creation failed! (Status: ${statusCode})`
          setSnackMessage(errorMessage)
          setMsgType(SnackbarTypes.Error)
        }
      } else if (error.request) {
        // Request was made but no response received
        setSnackMessage('Network error. Please check your connection and try again.')
        setMsgType(SnackbarTypes.Error)
      } else {
        // Something else happened
        setSnackMessage('An unexpected error occurred. Please try again.')
        setMsgType(SnackbarTypes.Error)
      }
    } finally {
    }
  }

  //code to select the status
  const handleSelectStatus = (item) => {
    if (item.id === 5) {
      setShowSomtthingElse(true)
    } else {
      setShowSomtthingElse(false)
    }
    setSelectedStatus((prevId) => (prevId === item ? null : item))
  }

  // Removed Google Places service - using simple string input

  // Simple address input handler
  const handleAddressChange = (evt) => {
    setAddressValue(evt.target.value)
  }

  const status = [
    {
      id: 1,
      title: 'Coming soon',
    },
    {
      id: 2,
      title: 'Just sold',
    },
    {
      id: 3,
      title: 'Just listed',
    },
    {
      id: 4,
      title: 'In escrow',
    },
    {
      id: 5,
      title: 'Something else',
    },
  ]

  const styles = {
    headingStyle: {
      fontSize: 14,
      fontWeight: '600',
    },
    inputStyle: {
      fontSize: 13,
      fontWeight: '400',
      width: '95%',
    },
    headingTitle: {
      fontSize: 13,
      fontWeight: '700',
      width: '95%',
    },
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  const isAgencyUser =
    user?.user?.userRole === 'Agency' || user?.userRole === 'Agency'
  const useTransparentBackground =
    isSubaccount || isAgencyUser || isSubaccountContext || isAgencyContext

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-hidden flex flex-row justify-center items-center  w-full"
    >
      <div
        className="bg-white sm:rounded-2xl flex flex-col w-full sm:mx-2 md:w-10/12 h-[100%] sm:h-[95%] py-4 relative"
        style={{
          scrollbarWidth: 'none',
          backgroundColor: useTransparentBackground ? 'transparent' : '#ffffff',
        }}
      >
        <AgentSelectSnackMessage
          message={snackMessage}
          type={msgType}
          isVisible={isVisible}
          hide={() => {
            setIsVisible(false)
            setSnackMessage('')
            setMsgType(null)
          }}
        />

        <div className="h-[95svh] sm:h-[92svh] overflow-hidden flex flex-col">
          {/* Video card */}

          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle={
              getTutorialByType(HowToVideoTypes.GettingStarted)?.title ||
              'Learn about getting started'
            }
            videoUrl={
              getVideoUrlByType(HowToVideoTypes.GettingStarted) ||
              HowtoVideos.GettingStarted
            }
          />

          {/* header */}
          <div className="h-[10%]">
            <Header />
          </div>
          {/* Video */}
          <div
            className="-ml-4 lg:flex hidden  xl:w-[280px] lg:w-[280px]"
            style={{
              position: 'absolute',
              // left: "18%",
              // translate: "-50%",
              // left: "14%",
              top: '20%',
              // backgroundColor: "red"
            }}
          >
            <VideoCard
              duration={(() => {
                const tutorial = getTutorialByType(
                  HowToVideoTypes.GettingStarted,
                )
                return tutorial?.description || '1:47'
              })()}
              horizontal={false}
              playVideo={() => {
                setIntroVideoModal(true)
              }}
              title={
                getTutorialByType(HowToVideoTypes.GettingStarted)?.title ||
                'Learn about getting started'
              }
            />
          </div>
          <div className="flex flex-col items-center px-4 w-full flex-1 min-h-0">
            <button
              className="w-11/12 md:text-4xl text-lg font-[700] mt-6"
              style={{
                textAlign: 'center',
                // Move title up when orb is hidden (same logic as Header component)
                // Orb is hidden when: custom domain OR (subaccount with logo) OR (agency creating for subaccount)
                marginTop: (isCustomDomain || (isSubaccount && hasAgencyLogo) || isAgencyCreatingForSubaccount) ? '-40px' : undefined,
              }}
              // onClick={handleContinue}
            >
              Get started with your AI agent
            </button>
            <div
              ref={scrollAreaRef}
              className="w-full flex flex-col items-center flex-1 min-h-0 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-40"
            >
              <div
                className="mt-8 w-6/12  gap-4 flex flex-col  px-2 "
                style={{ scrollbarWidth: 'none' }}
              >
                <div className="w-[95%] flex flex-row items-center justify-between">
                  <div
                    style={styles.headingStyle}
                    className="flex flex-row items-center gap-2"
                    // onClick={handleContinue}
                  >
                    {`What's this AI agent's name?`}
                    <div
                      aria-owns={open ? 'mouse-over-popover' : undefined}
                      aria-haspopup="true"
                      onMouseEnter={handlePopoverOpen}
                      onMouseLeave={handlePopoverClose}
                      style={{ cursor: 'pointer' }}
                    >
                      <Image
                        src={'/svgIcons/infoIcon.svg'}
                        height={20}
                        width={20}
                        alt="*"
                        style={{ filter: 'brightness(0)' }}
                      />
                    </div>
                  </div>
                  <div
                    className="text-[12px] font-[400]"
                    style={{
                      color: '#00000060',
                    }}
                  >
                    {agentName.length}/40
                  </div>
                </div>
                {/* Info popover */}
                <Popover
                  id="mouse-over-popover"
                  sx={{ pointerEvents: 'none' }}
                  open={open}
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  onClose={handlePopoverClose}
                  disableRestoreFocus
                >
                  <div className="flex flex-row items-center px-2 h-[40px] gap-2">
                    <Image
                      src={'/svgIcons/infoIcon.svg'}
                      height={20}
                      width={20}
                      alt="*"
                    />
                    <div style={{ fontWeight: '600', fontSize: 15 }}>
                      Your AI will identify itself by this name
                    </div>
                  </div>
                </Popover>
                <Input
                  value={agentName}
                  onChange={(e) => {
                    setAgentName(e.target.value)
                  }}
                  className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
                  style={{
                    ...styles.inputStyle,
                    border: '1px solid #00000020',
                  }}
                  placeholder="Ex: Ana's AI, Ana.ai, Ana's Assistant"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="done"
                  maxLength={40}
                />

                <div
                  className="mt-2 flex flex-row items-center gap-2"
                  style={styles.headingStyle}
                >
                  {`What's this AI agent's task?`}
                  <Tooltip
                    title="Inbound and Outbound calls need to be handled by different agents."
                    arrow
                    placement="top"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: '#ffffff',
                          color: '#333',
                          fontSize: '13px',
                          padding: '10px 15px',
                          borderRadius: '8px',
                          boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                          maxWidth: '300px',
                        },
                      },
                      arrow: {
                        sx: {
                          color: '#ffffff',
                        },
                      },
                    }}
                  >
                    <div style={{ cursor: 'pointer' }}>
                      <Image
                        src={'/svgIcons/infoIcon.svg'}
                        height={20}
                        width={20}
                        alt="info"
                        style={{ filter: 'brightness(0)' }}
                      />
                    </div>
                  </Tooltip>
                </div>

                <div className="sm:flex sm:flex-row items-center gap-4">
                  <div
                    className="flex flex-row cursor-pointer items-center justify-center gap-2 h-[60px] w-full sm:w-[240px] px-6"
                    style={{
                      borderRadius: '23px',
                      border: OutBoundCalls
                        ? '2px solid hsl(var(--brand-primary))'
                        : '2px solid #00000010',
                    }}
                    onClick={handleOutBoundCallClick}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: OutBoundCalls
                          ? 'hsl(var(--brand-primary))'
                          : '#000000',
                        WebkitMaskImage: 'url(/assets/callOut.png)',
                        maskImage: 'url(/assets/callOut.png)',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }}
                    />
                    <div
                      className={`text-start ms-2 sm:text-center sm:ms-0`} // transition-all duration-400 ease-in-out transform active:scale-90
                      style={{
                        ...styles.inputStyle,
                        // transition: "0.4s ease",
                        // scale: "0.9"
                      }}
                    >
                      Making Outbound Calls
                    </div>
                  </div>
                  <div
                    className="flex flex-row cursor-pointer items-center justify-center gap-2  h-[60px] sm:mt-0 mt-4 w-full sm:w-[240px] px-6"
                    style={{
                      borderRadius: '23px',
                      border: InBoundCalls
                        ? '2px solid hsl(var(--brand-primary))'
                        : '2px solid #00000010',
                    }}
                    onClick={handleInboundCallClick}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: InBoundCalls
                          ? 'hsl(var(--brand-primary))'
                          : '#000000',
                        WebkitMaskImage: 'url(/assets/callIn.png)',
                        maskImage: 'url(/assets/callIn.png)',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }}
                    />
                    <div
                      className="text-start ms-2 sm:text-center sm:ms-0"
                      style={styles.inputStyle}
                    >
                      Taking Inbound Calls
                    </div>
                  </div>
                </div>

                <div className="mt-2" style={styles.headingStyle}>
                  {`What's this AI agent's title?`}
                </div>
                <Input
                  autoComplete="off"
                  autoCorrect="on"
                  spellCheck="true"
                  enterKeyHint="done"
                  placeholder="Ex: Senior Property Acquisition Specialist"
                  className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black transition-colors"
                  style={{
                    ...styles.inputStyle,
                    border: '1px solid #00000020',
                  }}
                  value={agentRole}
                  onChange={(e) => {
                    setAgentRole(e.target.value)
                  }}
                />

                {canShowObjectives() && (
                  <div className="mt-2" style={styles.headingStyle}>
                    {`What's this AI agent's primary objective during the call?`}
                  </div>
                )}

                {canShowObjectives() && (
                  <div style={styles.inputStyle}>
                    Select only one. You can create new agents to dedicate them
                    to other objectives.
                  </div>
                )}
                {canShowObjectives() && (
                  <div className="flex flex-wrap">
                    {AgentObjective.map((item) => (
                      <div
                        key={item.id}
                        className="w-full text-start md:w-1/2 pe-2 flex py-4"
                      >
                        <button
                          className="border-2 w-full rounded-2xl text-start p-4 h-full flex flex-col justify-between outline-none"
                          onClick={() => {
                            handleToggleClick(item)
                          }}
                          style={{
                            borderColor:
                              item.id === toggleClick ? 'hsl(var(--brand-primary))' : '',
                            backgroundColor:
                              item.id === toggleClick ? 'hsl(var(--brand-primary) / 0.1)' : '',
                          }}
                        >
                          {renderBrandedIcon(
                            item.focusIcn || item.unFocusIcon,
                            30,
                            item.id === toggleClick,
                          )}
                          <div className="mt-8" style={styles.headingTitle}>
                            {item.title}
                          </div>
                          <div
                            className="mt-4"
                            style={{ fontSize: 11, fontWeight: '300' }}
                          >
                            {item.details}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {showOtherObjective && (
                  <div>
                    <div style={styles.headingStyle}>{`Agent's Objective`}</div>
                    {/* <input ref={bottomRef}
                                            placeholder="Type Here.... "
                                            className='border   rounded p-3 outline-none w-full mt-1 mx-2'
                                            style={styles.inputStyle}
                                            value={otherObjVal}
                                            onChange={(e) => { setOtherObjVal(e.target.value) }}
                                        /> */}
                    <Input
                      ref={bottomRef}
                      enterKeyHint="done"
                      placeholder="Type Here...."
                      className="border w-6/12 rounded px-3 py-2.5 outline-none w-full mt-1 mx-2 mb-2 focus:outline-none focus:ring-0 focus:border-black transition-colors"
                      style={{
                        ...styles.inputStyle,
                        border: '1px solid #00000020',
                      }}
                      value={otherObjVal}
                      onChange={(e) => setOtherObjVal(e.target.value)}
                    />
                  </div>
                )}

                <UnlockAgentModal
                  open={showUnclockModal}
                  handleClose={async (data) => {
                    setShowUnclockModal(false)
                    if (data) {
                      console.log('data', data)
                      // setSelectedUser(data)
                      console.log('plan upgraded successfully')
                      // Refresh user data after upgrade to get new plan capabilities
                      const refreshSuccess = await refreshUserData()
                      console.log('refreshSuccess:', refreshSuccess)
                      if (refreshSuccess) {
                        console.log(
                          'User data refreshed successfully after upgrade',
                        )
                        
                        // IMPORTANT: If user initially didn't have a plan, don't redirect them anywhere
                        // They should stay on the create agent page after upgrading
                        if (!userInitiallyHadPlan) {
                          console.log('✅ [CREATE-AGENT] User initially had no plan - staying on create agent page after upgrade')
                          // Update the flag since they now have a plan
                          setUserInitiallyHadPlan(true)
                        }
                        
                        // If there was a pending selection, apply it now with the new plan limits
                        if (pendingAgentSelection) {
                          console.log(
                            'Retrying pending selection with new plan limits...',
                          )

                          // Check if user is still on free plan after upgrade
                          const updatedUserData = reduxUser || user
                          const isStillFreePlan = () => {
                            if (updatedUserData?.user?.plan?.price === 0)
                              return true
                            return false
                          }

                          console.log(
                            '🔍 [CREATE-AGENT] Checking if still on free plan after upgrade:',
                            {
                              isStillFreePlan,
                              planType: updatedUserData?.user?.plan?.type,
                              maxAgents:
                                updatedUserData?.user?.planCapabilities
                                  ?.maxAgents,
                              planPrice: updatedUserData?.user?.plan?.price,
                            },
                          )

                          // If still on free plan and trying to select both agents, deselect one
                          if (
                            isStillFreePlan &&
                            pendingAgentSelection.inbound &&
                            pendingAgentSelection.outbound
                          ) {
                            console.log(
                              '🚫 [CREATE-AGENT] Free plan user trying to select both agents - deselecting outbound',
                            )
                            // Keep only inbound, deselect outbound for free plan users
                            const modifiedSelection = {
                              ...pendingAgentSelection,
                              inbound: false,
                            }
                            setInBoundCalls(modifiedSelection.inbound)
                            setOutBoundCalls(modifiedSelection.outbound)
                            setPendingAgentSelection(null)
                            return
                          }

                          // Clear the pending selection and apply it
                          const pendingSelection = pendingAgentSelection
                          setPendingAgentSelection(null)

                          // Apply the selection now that limits have been upgraded
                          setInBoundCalls(pendingSelection.inbound)
                          setOutBoundCalls(pendingSelection.outbound)
                          console.log('Applied pending selection after upgrade')
                        }
                      } else {
                        console.error(
                          'Failed to refresh user data after upgrade',
                        )
                      }
                    }
                    setShowUnclockModal(false)
                  }}
                  desc={modalDesc}
                />

                <MoreAgentsPopup
                  open={showMoreAgentsModal}
                  onClose={() => {
                    setShowMoreAgentsModal(false)
                    setPendingAgentSelection(null) // Clear pending selection if user cancels
                  }}
                  onUpgrade={() => {
                    setShowMoreAgentsModal(false)
                    setShowUnclockModal(false) // Ensure unlock modal is closed
                    setShowUpgradePlanModal(true)
                    // Keep the pending selection so it can be applied after upgrade
                    console.log('🔄 [CREATE-AGENT] User chose to upgrade plan')
                  }}
                  onAddAgent={() => {
                    // Handle "Add Agent with price" - apply the pending selection
                    setShowMoreAgentsModal(false)
                    applyPendingSelection() // This will set the agent states and mark as agreed to extra cost
                    // console.log('💰 [CREATE-AGENT] User chose to add agent with additional cost');
                  }}
                  costPerAdditionalAgent={
                    reduxUser?.planCapabilities?.costPerAdditionalAgent ||
                    user?.user?.planCapabilities?.costPerAdditionalAgent ||
                    10
                  }
                />

                <UpgradePlan
                  open={showUpgradePlanModal}
                  setSelectedPlan={() => {
                    console.log('setSelectedPlan is called')
                  }}
                  handleClose={async (result) => {
                    console.log('🔥 HANDLECLOSE CALLED WITH RESULT:', result)
                    console.log('🔥 HANDLECLOSE FUNCTION STARTED')
                    try {
                      setShowUpgradePlanModal(false)
                      setShowUnclockModal(false) // Also close the unlock modal
                      console.log('in UpgradePlan result is', result)
                      if (result) {
                        console.log('plan upgraded successfully')
                        // Refresh user data after upgrade to get new plan capabilities
                        const refreshSuccess = await refreshUserData()
                        console.log('refreshSuccess:', refreshSuccess)
                        if (refreshSuccess) {
                          console.log(
                            'User data refreshed successfully after upgrade',
                          )
                          
                          // IMPORTANT: If user initially didn't have a plan, don't redirect them anywhere
                          // They should stay on the create agent page after upgrading
                          if (!userInitiallyHadPlan) {
                            console.log('✅ [CREATE-AGENT] User initially had no plan - staying on create agent page after upgrade')
                            // Store a flag in localStorage to skip UserPlans step after agent creation
                            // This ensures we skip UserPlans even if parent page's components array wasn't updated
                            // IMPORTANT: Set this BEFORE updating userInitiallyHadPlan state
                            try {
                              localStorage.setItem('skipUserPlansAfterSubscription', 'true')
                              const flagCheck = localStorage.getItem('skipUserPlansAfterSubscription')
                              console.log('✅ [CREATE-AGENT] Set skipUserPlansAfterSubscription flag in localStorage:', {
                                set: 'true',
                                retrieved: flagCheck,
                                match: flagCheck === 'true'
                              })
                              // Verify it was set correctly
                              if (flagCheck !== 'true') {
                                console.error('❌ [CREATE-AGENT] Flag was not set correctly!')
                                // Try setting it again
                                localStorage.setItem('skipUserPlansAfterSubscription', 'true')
                              }
                            } catch (error) {
                              console.error('❌ [CREATE-AGENT] Error setting localStorage flag:', error)
                            }
                            
                            // Update the flag since they now have a plan (do this AFTER setting localStorage)
                            setUserInitiallyHadPlan(true)
                            
                            // Dispatch custom event to notify parent page that plan was subscribed
                            // This allows parent to potentially re-evaluate components array
                            window.dispatchEvent(
                              new CustomEvent('planSubscribed', {
                                detail: { hasPlan: true }
                              })
                            )
                            console.log('✅ [CREATE-AGENT] Dispatched planSubscribed event')
                          }
                          
                          // If there was a pending selection, apply it now with the new plan limits
                          if (pendingAgentSelection) {
                            console.log(
                              'Retrying pending selection with new plan limits...',
                            )

                            // Check if user is still on free plan after upgrade
                            const updatedUserData = reduxUser || user
                            const isStillFreePlan = (() => {
                              const planType =
                                updatedUserData?.user?.plan?.type?.toLowerCase()
                              if (planType?.includes('free')) return true
                              if (
                                updatedUserData?.user?.planCapabilities
                                  ?.maxAgents > 1
                              )
                                return false
                              return (
                                updatedUserData?.user?.plan === null ||
                                updatedUserData?.user?.plan?.price === 0
                              )
                            })()

                            console.log(
                              '🔍 [CREATE-AGENT] Checking if still on free plan after upgrade:',
                              {
                                isStillFreePlan,
                                planType: updatedUserData?.user?.plan?.type,
                                maxAgents:
                                  updatedUserData?.user?.planCapabilities
                                    ?.maxAgents,
                                planPrice: updatedUserData?.user?.plan?.price,
                              },
                            )

                            // If still on free plan and trying to select both agents, deselect one
                            if (
                              isStillFreePlan &&
                              pendingAgentSelection.inbound &&
                              pendingAgentSelection.outbound
                            ) {
                              console.log(
                                '🚫 [CREATE-AGENT] Free plan user trying to select both agents - deselecting outbound',
                              )
                              // Keep only inbound, deselect outbound for free plan users
                              const modifiedSelection = {
                                ...pendingAgentSelection,
                                inbound: false,
                              }
                              setInBoundCalls(modifiedSelection.inbound)
                              setOutBoundCalls(modifiedSelection.outbound)
                              setPendingAgentSelection(null)
                              return
                            }

                            // Clear the pending selection and apply it
                            const pendingSelection = pendingAgentSelection
                            setPendingAgentSelection(null)

                            // Apply the selection now that limits have been upgraded
                            setInBoundCalls(pendingSelection.inbound)
                            setOutBoundCalls(pendingSelection.outbound)
                            console.log(
                              'Applied pending selection after upgrade',
                            )
                          }
                        } else {
                          console.error(
                            'Failed to refresh user data after upgrade',
                          )
                        }
                      }
                    } catch (error) {
                      console.error('Error in UpgradePlan handleClose:', error)
                    }
                  }}
                />

                {/* <Body /> */}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="px-4 pt-3 pb-2">
            <ProgressBar value={33} />
          </div>
          <div className="flex items-center justify-between w-full " style={{ minHeight: '50px' }}>
            <Footer
              handleContinue={handleBuildAgent}
              donotShowBack={true}
              registerLoader={buildAgentLoader}
              shouldContinue={!canContinue()}
            />
          </div>
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-10/12 w-full" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full h-[70vh]">
            <div
              className="w-full overflow-auto"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div
                className="w-full px-2 h-[90%] overflow-auto"
                style={{ scrollbarWidth: 'none', zIndex: 12 }}
              >
                <div className="flex flex-row items-center justify-end w-full">
                  <button
                    className="outline-none border-none"
                    onClick={() => {
                      setShowModal(false)
                    }}
                  >
                    <Image
                      src={'/assets/crossIcon.png'}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>

                <div
                  className="text-center"
                  style={{ fontWeight: '600', fontSize: 24 }}
                >
                  Community Update
                </div>

                <div style={styles.headingStyle} className="mt-4">
                  {`What's the status?`}
                </div>

                <div className="flex flex-row flex-wrap gap-4 mt-4">
                  {status.map((item) => (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        handleSelectStatus(item)
                      }}
                      className="px-6 border rounded-3xl h-[65px] text-center flex flex-row justify-center items-center outline-none"
                      style={{
                        border:
                          selectedStatus?.id === item.id
                            ? '2px solid hsl(var(--brand-primary))'
                            : '',
                        backgroundColor:
                          selectedStatus?.id === item.id ? 'hsl(var(--brand-primary) / 0.1)' : '',
                      }}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>

                {showSomtthingElse && (
                  <div>
                    <div style={styles.headingStyle} className="mt-4">
                      {`What's that`}
                    </div>

                    <div className="mt-1">
                      <Input
                        className="h-[50px] border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-0 focus:border-black transition-colors"
                        placeholder="Type here..."
                        value={otherStatus}
                        onChange={(e) => setOtherStatus(e.target.value)}
                        style={{
                          ...styles.inputStyle,
                          border: '1px solid #00000020',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={styles.headingStyle} className="mt-4">
                  {`What's the address`}
                </div>
                {/* Simple address input */}
                <div className="mt-1 pb-4">
                  <Input
                    className="w-full h-[50px] rounded-lg outline-none focus:ring-0 focus:border-black px-3 py-2.5 transition-colors"
                    style={{ border: '1px solid #00000020' }}
                    placeholder="Enter property address..."
                    value={addressValue}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>

              <div
                className="w-full flex flex-row items-center justify-center"
                style={{ position: 'absolute', bottom: 0, left: 0 }}
              >
                <button
                  className="text-white w-11/12 h-[50px] rounded-lg bg-brand-primary mb-8"
                  onClick={() => {
                    setShowModal(false)
                  }}
                >
                  Continue
                </button>
              </div>

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      <LoaderAnimation loaderModal={loaderModal} />

      {/* <Modal
                open={loaderModal}
                // onClose={() => loaderModal(false)}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full h-[65vh]">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "transparent",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >

                            <div className='flex flex-row items-center justify-center h-full'>
                                <CircularProgress size={200} thickness={1} />
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal> */}
    </div>
  )
}

export default CreateAgent1
