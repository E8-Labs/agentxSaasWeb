import { Box, CircularProgress, Fade, Modal, Popover, Tooltip } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import Header from '@/components/onboarding/Header'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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

function SelectRadio({ checked }) {
  return (
    <div
      className={cn(
        'relative flex size-4 shrink-0 items-center justify-center rounded-full border bg-white',
        checked
          ? 'border-[hsl(var(--brand-primary))]'
          : 'border-[rgba(21,21,21,0.1)]',
      )}
      aria-hidden
    >
      {checked ? (
        <div className="size-2 rounded-full bg-[hsl(var(--brand-primary))]" />
      ) : null}
    </div>
  )
}

function SelectCheckbox({ checked }) {
  return (
    <div
      className={cn(
        'relative flex size-5 shrink-0 items-center justify-center rounded-[6px] border bg-white',
        'transition-colors duration-150',
        checked
          ? 'border-[hsl(var(--brand-primary))] bg-brand-primary'
          : 'border-black/[0.12]',
      )}
      aria-hidden
    >
      {checked ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : null}
    </div>
  )
}

/** Firecrawl-style inputs: soft border, brand ring on focus (see NewMessageModal / MessageComposer) */
const fcInputClassName = cn(
  'h-10 w-full rounded-lg border border-black/[0.06] bg-white px-3 text-sm leading-[1.6] text-foreground shadow-none',
  'transition-all duration-150',
  'placeholder:text-muted-foreground',
  'focus:outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/40',
)

const togglePressClassName =
  'transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-2'

/** Step 1 progress segment (first of ~3 steps) */
const CREATE_AGENT_STEP1_PROGRESS_PCT = 33

function createAgentEnterEase() {
  return 'cubic-bezier(0.22, 1, 0.36, 1)'
}

function createAgentHeaderEnterClass(entered) {
  return cn(
    'transition-[opacity,transform] duration-500 will-change-[opacity,transform]',
    entered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5',
  )
}

function createAgentBlockEnterClass(entered) {
  return cn(
    'transition-[opacity,transform] duration-[520ms] will-change-[opacity,transform]',
    entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
  )
}

function createAgentBlockEnterStyle(entered, delayMs) {
  return {
    transitionDelay: entered ? `${delayMs}ms` : '0ms',
    transitionTimingFunction: createAgentEnterEase(),
  }
}

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
  const [templateOptions, setTemplateOptions] = useState(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)

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

  /** Soft sequential entry (overlapping) + progress fill on load */
  const [step1ShellEntered, setStep1ShellEntered] = useState(false)
  const [step1ProgressPct, setStep1ProgressPct] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Redux state
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  const { canCreateAgent, isFreePlan, currentAgents, maxAgents } =
    usePlanCapabilities()

  // Removed address picker modal - no longer needed

  useEffect(() => {
    // Clear pipeline cadence data when creating a new agent
    localStorage.removeItem('AddCadenceDetails')
    refreshUserData()
    getTargetUser()
    
    // Track if user initially had a plan (to prevent redirect after upgrade)
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const hasPlan = parsedUser?.user?.plan !== null && parsedUser?.user?.plan?.price !== 0
          setUserInitiallyHadPlan(hasPlan)
        }
      } catch (error) {}
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
              } catch (error) {}
            }
          }
          
          // Check if agency has branding logo
          let branding = null
          const storedBranding = localStorage.getItem('agencyBranding')
          if (storedBranding) {
            try {
              branding = JSON.parse(storedBranding)
            } catch (error) {}
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
      } catch (error) {}
    }
  }, [])

  const getTargetUser = () => {
    let U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    if (U) {
      setSelectedUser(JSON.parse(U))
    } else {}
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
              } catch (error) {}
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
        } catch (error) {}
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPrefersReducedMotion(reduced)
    if (reduced) {
      setStep1ShellEntered(true)
      setStep1ProgressPct(CREATE_AGENT_STEP1_PROGRESS_PCT)
      return
    }
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStep1ShellEntered(true)
      })
    })
    const fillTimer = window.setTimeout(() => {
      setStep1ProgressPct(CREATE_AGENT_STEP1_PROGRESS_PCT)
    }, 280)
    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(fillTimer)
    }
  }, [])

  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (userData) {
      let d = JSON.parse(userData)
      setUser(d)
    }
  }, [])

  // Fetch templates (platform + agency) for create-agent step 1
  useEffect(() => {
    if (!canShowObjectives()) {
      setTemplateOptions(null)
      return
    }
    let cancelled = false
    const fetchTemplates = async () => {
      setTemplatesLoading(true)
      try {
        const UserDetails = localStorage.getItem(PersistanceKeys.LocalStorageUser)
        const AuthToken = UserDetails ? JSON.parse(UserDetails)?.token : null
        if (!AuthToken) {
          setTemplateOptions(null)
          return
        }
        const U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
        let forUserId = null
        if (U) {
          try {
            const Data = JSON.parse(U)
            if (Data?.subAccountData?.id) forUserId = Data.subAccountData.id
          } catch (e) {}
        }
        const url = forUserId
          ? `${Apis.getTemplates}?forUserId=${forUserId}`
          : Apis.getTemplates
        const res = await axios.get(url, {
          headers: { Authorization: 'Bearer ' + AuthToken },
        })
        if (cancelled) return
        if (res?.data?.status && res?.data?.data) {
          const { agencyTemplates = [] } = res.data.data
          console.log("agencyTemplates.kj", agencyTemplates)
          const agencyCards = (agencyTemplates || []).map((a) => ({
            id: 10000 + (a.agentTemplateId || 0),
            agentTemplateId: a.agentTemplateId,
            title: a.agentRole || '',
            details: a.description || '',
            source: 'agency',
            focusIcn: '/svgIcons/obj1F.svg',
            unFocusIcon: '/objectiveIcons/obj1UF.png',
          }))
          setTemplateOptions([...AgentObjective, ...agencyCards])
        } else {
          setTemplateOptions(null)
        }
      } catch (err) {
        if (!cancelled) setTemplateOptions(null)
      } finally {
        if (!cancelled) setTemplatesLoading(false)
      }
    }
    fetchTemplates()
    return () => { cancelled = true }
  }, [selectedUser?.subAccountData?.id, user?.user?.userType])

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

    const selectedColor = brandVar ? `hsl(${brandVar})` : 'hsl(var(--brand-primary))'
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
      } catch (error) {}
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


  // function getTargetUser(){
  //   const U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
  //   let targetUser = null

  //   if(U){
  //     // Admin or agency is trying to create agent for another user
  //     const Data = JSON.parse(U)
  //     if(Data.subAccountData){
  //       targetUserType = Data.subAccountData || Data.subAccountData?.user
  //     }
  //     if(!targetUser && selectedUser){
  //       targetUserType = selectedUser?.userType || selectedUser?.user?.userType
  //     }
  //     return targetUserType
  //   }
  // }

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
      } catch (error) {}
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

    // Calculate agents that would be created
    let agentsToCreate = 0
    if (wouldHaveInbound) agentsToCreate++
    if (wouldHaveOutbound) agentsToCreate++

    // check if user already view pay per month window from agents page and agree it by clicking on the button
    const isAlreadyViewedPayPerMonthWindow = localStorage.getItem(
      'AddAgentByPayingPerMonth',
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
    let user = localStorage.getItem('User')
  }, [reduxUser])

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

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
    let user = null;
    if(selectedUser){
      user = selectedUser.subAccountData;
    }else{
      user = reduxUser;
    }
    if (user?.plan && !isPlanActive(user?.plan)) {
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
        userId = selectedUser.subAccountData.id
      }

      if (userId) {
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
      } else if (agentObjective.source === 'agency') {
        formData.append('agentTemplateId', agentObjective.agentTemplateId)
        formData.append('agentObjective', agentObjective.title)
        formData.append('agentObjectiveDescription', agentObjective.details || '')
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
      for (let [key, value] of formData.entries()) {}

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
            }
            
            // Check selectedUser.subAccountData for subaccounts (if from admin/agency flow)
            if (!hasPlan && selectedUser?.subAccountData) {
              const subAccountPlan = selectedUser.subAccountData?.plan
              hasPlan = subAccountPlan !== null && 
                       subAccountPlan !== undefined && 
                       (subAccountPlan.planId !== null || subAccountPlan.id !== null)
            }
            
            // Fallback to Redux or local state if localStorage doesn't have plan info
            if (!hasPlan) {
              const currentUserData = selectedUser?.subAccountData || reduxUser || user
              const plan = currentUserData?.user?.plan || currentUserData?.plan
              hasPlan = plan !== null && 
                       plan !== undefined && 
                       (plan.planId !== null || plan.id !== null)
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

          // Priority order:
          // 1. localStorage flag (most reliable - set immediately after subscription)
          // 2. User has a plan (if they have any plan, they shouldn't see UserPlans)
          // 3. User has plan AND initially didn't have one (just subscribed)
          const shouldSkipUserPlans = 
            String(skipFlag) === 'true' ||  // Convert to string for strict comparison
            hasPlan ||              // If user has any plan, skip UserPlans
            (hasPlan && !userInitiallyHadPlan) // Backup check

          if (shouldSkipUserPlans) {
            // Clear the flag after using it
            try {
              localStorage.removeItem('skipUserPlansAfterSubscription')
            } catch (error) {
              console.error('Error removing skipUserPlansAfterSubscription from localStorage:', error)
            }

            handleContinue()
          } else {
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

  return (
    <div className="flex h-full min-h-0 w-full max-w-[100vw] flex-1 overflow-hidden">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#f9f9f9] lg:w-[65%]">
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

        <div
          className={cn(
            'relative z-20 shrink-0 bg-[#f9f9f9] shadow-[0_1px_0_0_rgba(21,21,21,0.08)]',
            createAgentHeaderEnterClass(step1ShellEntered),
          )}
          style={{ transitionTimingFunction: createAgentEnterEase() }}
        >
          <Header variant="createAgentToolbar" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollAreaRef}
            className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-brand-primary flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 pb-4 pt-3"
          >
            <div className="mx-auto flex w-full max-w-[600px] flex-col gap-3 px-0 pt-3">
              <div
                className={createAgentBlockEnterClass(step1ShellEntered)}
                style={createAgentBlockEnterStyle(step1ShellEntered, 72)}
              >
                <h1 className="text-center text-[22px] font-semibold leading-[30px] tracking-[-0.77px] text-foreground">
                  Get started with your AI agent
                </h1>
              </div>
              <div
                className={cn(
                  'flex flex-col gap-6 pb-8',
                  createAgentBlockEnterClass(step1ShellEntered),
                )}
                style={{
                  scrollbarWidth: 'none',
                  ...createAgentBlockEnterStyle(step1ShellEntered, 128),
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2 text-sm font-normal leading-[1.6] text-foreground">
                      {`What's this AI agent's name?`}
                      <div
                        aria-owns={open ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true"
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                        className="cursor-pointer"
                      >
                        <Image
                          src={'/svgIcons/infoIcon.svg'}
                          height={16}
                          width={16}
                          alt=""
                          style={{ filter: 'brightness(0)' }}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">
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
                  className={fcInputClassName}
                  placeholder="Ex: Ana's AI, Ana.ai, Ana's Assistant"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="done"
                  maxLength={40}
                />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-row items-center gap-2 text-sm font-normal leading-[1.6] text-foreground">
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
                    <div className="cursor-pointer">
                      <Image
                        src={'/svgIcons/infoIcon.svg'}
                        height={16}
                        width={16}
                        alt=""
                        style={{ filter: 'brightness(0)' }}
                      />
                    </div>
                  </Tooltip>
                </div>

                <div className="flex w-full flex-row items-stretch gap-2.5">
                  <button
                    type="button"
                    className={cn(
                      togglePressClassName,
                      'flex min-h-0 flex-1 cursor-pointer flex-row items-center gap-4 rounded-lg px-3 py-4 text-left',
                      OutBoundCalls
                        ? 'border-2 border-[hsl(var(--brand-primary))] bg-brand-primary/12 hover:border-[hsl(var(--brand-primary))]'
                        : 'border border-[rgba(21,21,21,0.1)] bg-white hover:border-black/15 hover:bg-black/[0.02]',
                    )}
                    onClick={handleOutBoundCallClick}
                  >
                    <div className="flex shrink-0 items-center rounded-lg bg-brand-primary/10 p-2">
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
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
                    </div>
                    <span className="min-w-0 flex-1 text-sm font-normal leading-[1.6] text-foreground">
                      Making Outbound Calls
                    </span>
                    <SelectCheckbox checked={OutBoundCalls} />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      togglePressClassName,
                      'flex min-h-0 flex-1 cursor-pointer flex-row items-center gap-4 rounded-lg px-3 py-4 text-left',
                      InBoundCalls
                        ? 'border-2 border-[hsl(var(--brand-primary))] bg-brand-primary/12 hover:border-[hsl(var(--brand-primary))]'
                        : 'border border-[rgba(21,21,21,0.1)] bg-white hover:border-black/15 hover:bg-black/[0.02]',
                    )}
                    onClick={handleInboundCallClick}
                  >
                    <div className="flex shrink-0 items-center rounded-lg bg-brand-primary/10 p-2">
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
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
                    </div>
                    <span className="min-w-0 flex-1 text-sm font-normal leading-[1.6] text-foreground">
                      Taking Inbound Calls
                    </span>
                    <SelectCheckbox checked={InBoundCalls} />
                  </button>
                </div>
                </div>

                <div className="flex flex-col gap-2">
                <div className="text-sm font-normal leading-[1.6] text-foreground">
                  {`What's this AI agent's title?`}
                </div>
                <Input
                  autoComplete="off"
                  autoCorrect="on"
                  spellCheck="true"
                  enterKeyHint="done"
                  placeholder="Ex: Senior Property Acquisition Specialist"
                  className={fcInputClassName}
                  value={agentRole}
                  onChange={(e) => {
                    setAgentRole(e.target.value)
                  }}
                />
                </div>

                {canShowObjectives() && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 text-sm font-normal leading-[1.6]">
                      <p className="text-foreground">
                        {`What's this AI agent's primary objective during the call?`}
                      </p>
                      <p className="text-muted-foreground">
                        Select only one. You can create new agents to dedicate
                        them to other objectives.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {(templateOptions && templateOptions.length > 0
                        ? templateOptions
                        : AgentObjective
                      ).map((item) => {
                        const selected = item.id === toggleClick
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={cn(
                              togglePressClassName,
                              'flex w-full cursor-pointer flex-row items-start gap-4 rounded-lg px-3 py-4 text-left',
                              selected
                                ? 'border-2 border-[hsl(var(--brand-primary))] bg-brand-primary/12 hover:border-[hsl(var(--brand-primary))]'
                                : 'border border-[rgba(21,21,21,0.1)] bg-white hover:border-black/15 hover:bg-black/[0.02]',
                            )}
                            onClick={() => {
                              handleToggleClick(item)
                            }}
                          >
                            <div className="flex shrink-0 items-center rounded-lg bg-brand-primary/10 p-2">
                              {renderBrandedIcon(
                                item.focusIcn || item.unFocusIcon,
                                16,
                                selected,
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-3 text-sm font-normal leading-[1.6]">
                              <span className="text-foreground">{item.title}</span>
                              <span className="text-muted-foreground">
                                {item.details}
                              </span>
                            </div>
                            <SelectRadio checked={selected} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {showOtherObjective && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-normal leading-[1.6] text-foreground">{`Agent's Objective`}</div>
                    <Input
                      ref={bottomRef}
                      enterKeyHint="done"
                      placeholder="Type Here...."
                      className={fcInputClassName}
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
                      // Refresh user data after upgrade to get new plan capabilities
                      const refreshSuccess = await refreshUserData()
                      if (refreshSuccess) {
                        // IMPORTANT: If user initially didn't have a plan, don't redirect them anywhere
                        // They should stay on the create agent page after upgrading
                        if (!userInitiallyHadPlan) {
                          // Update the flag since they now have a plan
                          setUserInitiallyHadPlan(true)
                        }

                        // If there was a pending selection, apply it now with the new plan limits
                        if (pendingAgentSelection) {
                          // Check if user is still on free plan after upgrade
                          const updatedUserData = reduxUser || user
                          const isStillFreePlan = () => {
                            if (updatedUserData?.user?.plan?.price === 0)
                              return true
                            return false
                          }

                          // If still on free plan and trying to select both agents, deselect one
                          if (
                            isStillFreePlan &&
                            pendingAgentSelection.inbound &&
                            pendingAgentSelection.outbound
                          ) {
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
                  setSelectedPlan={() => {}}
                  handleClose={async (result) => {
                    try {
                      setShowUpgradePlanModal(false)
                      setShowUnclockModal(false) // Also close the unlock modal
                      if (result) {
                        // Refresh user data after upgrade to get new plan capabilities
                        const refreshSuccess = await refreshUserData()
                        if (refreshSuccess) {
                          // IMPORTANT: If user initially didn't have a plan, don't redirect them anywhere
                          // They should stay on the create agent page after upgrading
                          if (!userInitiallyHadPlan) {
                            // Store a flag in localStorage to skip UserPlans step after agent creation
                            // This ensures we skip UserPlans even if parent page's components array wasn't updated
                            // IMPORTANT: Set this BEFORE updating userInitiallyHadPlan state
                            try {
                              localStorage.setItem('skipUserPlansAfterSubscription', 'true')
                              const flagCheck = localStorage.getItem('skipUserPlansAfterSubscription')
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
                          }

                          // If there was a pending selection, apply it now with the new plan limits
                          if (pendingAgentSelection) {
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

                            // If still on free plan and trying to select both agents, deselect one
                            if (
                              isStillFreePlan &&
                              pendingAgentSelection.inbound &&
                              pendingAgentSelection.outbound
                            ) {
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
          <div className="pointer-events-none absolute inset-0 z-[15] flex items-end justify-end p-6 pr-8 pb-[92px] max-lg:pb-[100px]">
            <div
              className="pointer-events-auto w-fit rounded-[12px] bg-white"
              style={{
                border: '1px solid #eaeaea',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
              }}
            >
              <VideoCard
                duration={(() => {
                  const tutorial = getTutorialByType(
                    HowToVideoTypes.GettingStarted,
                  )
                  return tutorial?.description || '1:47'
                })()}
                playVideo={() => {
                  setIntroVideoModal(true)
                }}
                title={
                  getTutorialByType(HowToVideoTypes.GettingStarted)?.title ||
                  'Learn about getting started'
                }
                videoUrl={
                  getVideoUrlByType(HowToVideoTypes.GettingStarted) ||
                  HowtoVideos.GettingStarted
                }
                hoverReveal
                hideCta
                className="rounded-[12px] border-0 bg-transparent shadow-none"
              />
            </div>
          </div>
          <div
            className={cn(
              'relative z-20 shrink-0 border-t border-[rgba(21,21,21,0.1)] bg-[#f9f9f9] shadow-[0_-1px_0_0_rgba(21,21,21,0.06)]',
              createAgentBlockEnterClass(step1ShellEntered),
            )}
            style={createAgentBlockEnterStyle(step1ShellEntered, 188)}
          >
            <div className="flex w-full flex-col border-t border-[rgba(21,21,21,0.1)] px-0 py-[0.5px]">
              <div className="h-1 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-[hsl(var(--brand-primary))]"
                  style={{
                    width: `${step1ProgressPct}%`,
                    transition: prefersReducedMotion
                      ? 'none'
                      : `width 780ms ${createAgentEnterEase()}`,
                  }}
                />
              </div>
            </div>
            <div className="flex h-[65px] shrink-0 items-center justify-end border-t border-[rgba(21,21,21,0.1)] px-8">
              {buildAgentLoader ? (
                <LoaderAnimation loaderModal={buildAgentLoader} />
              ) : (
                <button
                  type="button"
                  disabled={!canContinue()}
                  className={cn(
                    'flex min-h-[36px] items-center justify-center rounded-lg px-4 py-[7.5px] text-sm font-semibold tracking-[0.07px] transition-all duration-150',
                    canContinue()
                      ? 'bg-[hsl(var(--brand-primary))] text-primary-foreground hover:opacity-90 active:scale-[0.98]'
                      : 'cursor-not-allowed bg-[#efefef] text-foreground',
                  )}
                  onClick={handleBuildAgent}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'relative hidden h-full min-h-0 min-w-0 overflow-hidden bg-[hsl(var(--brand-primary))] lg:flex lg:w-[35%]',
          createAgentBlockEnterClass(step1ShellEntered),
        )}
        style={createAgentBlockEnterStyle(step1ShellEntered, 145)}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-[230px] h-[570px] w-[1146px] -translate-x-1/2 rounded-sm border border-white/[0.29] bg-white/[0.01] opacity-[0.38]"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[-30px] h-[1090px] w-[460px] -translate-x-1/2 rounded-sm border border-white/[0.29] bg-white/[0.01] opacity-[0.38]"
        />
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
          },
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={showModal} timeout={250}>
          <Box
            className={cn(
              'flex max-h-[min(90vh,640px)] flex-shrink-0 flex-col overflow-hidden rounded-[12px] bg-white',
            )}
            sx={{
              width: '400px',
              maxWidth: '90vw',
              boxSizing: 'border-box',
              boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
              border: '1px solid #eaeaea',
              outline: 'none',
              '@keyframes communityUpdateModalEnter': {
                '0%': { transform: 'scale(0.95)' },
                '100%': { transform: 'scale(1)' },
              },
              animation:
                'communityUpdateModalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <div className="flex flex-shrink-0 flex-row items-center justify-between border-b border-[#eaeaea] px-4 py-3">
              <span
                className="text-base font-semibold"
                style={{ color: 'rgba(0, 0, 0, 0.9)' }}
              >
                Community Update
              </span>
              <CloseBtn onClick={() => setShowModal(false)} />
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.8)' }}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    What&apos;s the status?
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {status.map((item) => {
                      const selected = selectedStatus?.id === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectStatus(item)}
                          className={cn(
                            togglePressClassName,
                            'flex min-h-[48px] w-full items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-normal leading-snug text-foreground',
                            selected
                              ? 'border-2 border-[hsl(var(--brand-primary))] bg-brand-primary/12 hover:border-[hsl(var(--brand-primary))]'
                              : 'border border-[rgba(21,21,21,0.1)] bg-white hover:border-black/15 hover:bg-black/[0.02]',
                          )}
                        >
                          {item.title}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {showSomtthingElse && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      What&apos;s that
                    </p>
                    <Input
                      className={fcInputClassName}
                      placeholder="Type here..."
                      value={otherStatus}
                      onChange={(e) => setOtherStatus(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    What&apos;s the address
                  </p>
                  <Input
                    className={fcInputClassName}
                    placeholder="Enter property address..."
                    value={addressValue}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-row items-center justify-between border-t border-[#eaeaea] px-4 py-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={cn(
                  'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium',
                  'bg-muted text-foreground hover:bg-muted/80',
                  'transition-colors duration-150 active:scale-[0.98]',
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={cn(
                  'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold',
                  'bg-brand-primary text-white hover:opacity-90',
                  'transition-all duration-150 active:scale-[0.98]',
                )}
              >
                Continue
              </button>
            </div>
          </Box>
        </Fade>
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
  );
}

export default CreateAgent1
