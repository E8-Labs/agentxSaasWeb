'use client'

import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  // Link,
  Modal,
  Snackbar,
  Typography,
} from '@mui/material'
import Link from "next/link";
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import { initializeApp } from 'firebase/app'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import moment from 'moment'

import EditAgencyName from '@/components/agency/agencyExtras.js/EditAgencyName'
import { CheckStripe } from '@/components/agency/agencyServices/CheckAgencyData'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import AgencyWalkThrough from '@/components/agency/walkthrough/AgencyWalkThrough'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { UpdateProfile } from '@/components/apis/UpdateProfile'
import { checkCurrentUserRole } from '@/components/constants/constants'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import { requestToken } from '@/components/firbase'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { PersistanceKeys, userType } from '@/constants/Constants'
import { useUser } from '@/hooks/redux-hooks'
import { logout } from '@/utilities/UserUtility'
import { cn } from '@/lib/utils'

// const FacebookPixel = dynamic(() => import("../utils/facebookPixel.js"), {
//   ssr: false,
// });

// import { initFacebookPixel } from "@/utilities/facebookPixel";

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import AgencyChecklist from './AgencyChecklist'
import CheckList from './CheckList'
import { PermissionProvider, useHasPermission, usePermission } from '@/contexts/PermissionContext'

const stripePromise = getStripe()

// Component to render a nav link with permission check
function PermissionNavLink({ item, isActive, hasAccess }) {
  // hasAccess is passed from parent to avoid individual loading states
  if (!hasAccess) {
    return null
  }
  
  return <NavLinkItem item={item} isActive={isActive} />
}

// Component to render a nav link
function NavLinkItem({ item, isActive }) {
  return (
    <div className={cn(
      'relative z-10 w-full flex flex-col px-3 h-10 flex justify-center gap-2 rounded-xl transition-colors [&_*]:!bg-transparent',
      isActive(item.href) ? 'bg-brand-primary/5' : '!bg-transparent',
    )}>
      <Link
        className="no-underline hover:no-underline w-full h-full flex flex-row items-center gap-2 active:scale-[0.95] transition-transform duration-150 ease-out origin-center"
        style={{ cursor: 'pointer', textDecoration: 'none' }}
        href={item.href}
      >
        <div className="w-full flex flex-row gap-2 items-center h-10 rounded-xl !bg-transparent">
          <div
            className={cn(
              isActive(item.href)
                ? 'icon-brand-primary'
                : 'icon-black',
            )}
            style={
              isActive(item.href)
                ? {
                    '--icon-mask-image': `url(${
                      isActive(item.href)
                        ? item.selected
                        : item.uneselected
                    })`,
                  }
                : {}
            }
          >
            <Image
              src={
                isActive(item.href)
                  ? item.selected
                  : item.uneselected
              }
              height={16}
              width={16}
              alt="icon"
            />
          </div>
          <div
            className={cn(
              'text-sm font-medium',
              isActive(item.href)
                ? 'text-brand-primary'
                : 'text-black/80',
            )}
          >
            {item.name}
          </div>
        </div>
      </Link>
    </div>
  )
}

const AgencyNavBarContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const permissionContext = usePermission()
  
  // Get user data to check if they're an Invitee
  const [userRole, setUserRole] = useState(null)
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  const [menuPermissions, setMenuPermissions] = useState({})
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('User')
      if (localData) {
        try {
          const userData = JSON.parse(localData)
          setUserRole(userData.user?.userRole || userData.userRole)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
  }, [])
  
  // For non-Invitee users, show all links (they have full access)
  // For Invitee users, we'll filter based on permissions
  const isInvitee = userRole === 'Invitee'
  
  // Define agency links with their required permissions (memoized to prevent unnecessary re-renders)
  const allAgencyLinks = useMemo(() => [
    {
      id: 1,
      name: 'Dashboard',
      href: '/agency/dashboard',
      selected: '/agencyNavbarIcons/selectdDashboardIcon.png',
      uneselected: '/agencyNavbarIcons/unSelectedDashboardIcon.png',
      permissionKey: 'agency.dashboard.view',
    },
    {
      id: 2,
      name: 'Integrations',
      href: '/agency/dashboard/integration',
      selected: '/agencyNavbarIcons/integrationFocus.png',
      uneselected: '/agencyNavbarIcons/integrationsUnFocus.png',
      permissionKey: 'agency.integrations.manage',
    },
    {
      id: 3,
      name: 'Plans',
      href: '/agency/dashboard/plans',
      selected: '/agencyNavbarIcons/selectedPlansIcon.png',
      uneselected: '/agencyNavbarIcons/unSelectedPlansIcon.png',
      permissionKey: 'agency.plans.manage',
    },
    {
      id: 4,
      name: 'Sub Account',
      href: '/agency/dashboard/subAccounts',
      selected: '/agencyNavbarIcons/selectedSubAccountIcon.png',
      uneselected: '/agencyNavbarIcons/unSelectedSubAccountIcon.png',
      permissionKey: 'agency.subaccounts.manage',
    },
    {
      id: 5,
      name: 'Activity',
      href: '/agency/dashboard/callLogs',
      selected: '/otherAssets/selectedActivityLog.png',
      uneselected: '/otherAssets/activityLog.png',
      permissionKey: 'agency.activity.view',
    },
    {
      id: 6,
      name: 'Teams',
      href: '/agency/dashboard/teams',
      selected: '/agencyNavbarIcons/selectedTeam.png',
      uneselected: '/agencyNavbarIcons/unSelectedTeamIcon.png',
      permissionKey: 'agency.teams.manage',
    },
    {
      id: 7,
      name: 'Whitelabel',
      href: '/agency/dashboard/whitelabel',
      selected: '/agencyNavbarIcons/selectedWhitelabelling.png',
      uneselected: '/agencyNavbarIcons/unSelectedWhitelabelling.png',
      permissionKey: 'agency.whitelabel.manage',
    },
  ], [])

  // Pre-check all permissions for Invitee users to prevent flicker
  useEffect(() => {
    if (!isInvitee || !permissionContext) {
      // Non-Invitee users have all permissions, or no permission context
      setPermissionsLoaded(true)
      return
    }
    
    const checkAllPermissions = async () => {
      const permissions = {}
      const permissionChecks = allAgencyLinks.map(async (item) => {
        const hasAccess = await permissionContext.hasPermission(item.permissionKey)
        permissions[item.id] = hasAccess
      })
      
      await Promise.all(permissionChecks)
      setMenuPermissions(permissions)
      setPermissionsLoaded(true)
    }
    
    checkAllPermissions()
  }, [isInvitee, permissionContext, allAgencyLinks])

  // Track current pathname in state to force re-renders when it changes
  // This ensures the UI updates immediately when navigation occurs
  const [currentPathname, setCurrentPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : pathname
  )

  // Sliding pill background for nav links hover
  const [navHoveredIndex, setNavHoveredIndex] = useState(null)
  const [navPillStyle, setNavPillStyle] = useState(null)
  const [navPillScaleIn, setNavPillScaleIn] = useState(false)
  const navListContainerRef = useRef(null)
  const navItemRefs = useRef([])

  useLayoutEffect(() => {
    if (navHoveredIndex === null || !navListContainerRef.current) {
      setNavPillStyle(null)
      setNavPillScaleIn(false)
      return
    }
    const itemEl = navItemRefs.current[navHoveredIndex]
    const containerEl = navListContainerRef.current
    if (!itemEl || !containerEl) return
    const itemRect = itemEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()
    setNavPillStyle({
      left: itemRect.left - containerRect.left,
      top: itemRect.top - containerRect.top,
      width: itemRect.width,
      height: itemRect.height,
    })
    setNavPillScaleIn(false)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setNavPillScaleIn(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [navHoveredIndex])
  
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Update state when pathname hook changes (Next.js navigation)
    const updatePathname = () => {
      const newPathname = window.location.pathname
      setCurrentPathname(newPathname)
    }

    // Update immediately
    updatePathname()

    // Also listen for browser navigation (back/forward)
    window.addEventListener('popstate', updatePathname)

    // Check periodically to catch window.location updates during navigation
    // This ensures we catch the exact moment when the URL changes
    const interval = setInterval(() => {
      const newPathname = window.location.pathname
      if (newPathname !== currentPathname) {
        setCurrentPathname(newPathname)
      }
    }, 16) // ~60fps for smooth updates

    return () => {
      window.removeEventListener('popstate', updatePathname)
      clearInterval(interval)
    }
  }, [pathname, currentPathname])

  // Helper function to check if a menu item is active
  // Uses window.location.pathname directly for the most accurate, up-to-date pathname
  // The currentPathname state ensures React re-renders when pathname changes
  const isActive = (href) => {
    if (typeof window === 'undefined') return pathname === href
    
    // Use window.location.pathname directly - it's always the current, accurate pathname
    // The state update above ensures React re-renders when this value changes
    return window.location.pathname === href
  }

  const [loader, setLoader] = useState(false)

  const [showPlansPopup, setShowPlansPopup] = useState(false)
  const [showAddPaymentPopup, setShowAddPaymentPopup] = useState(false)

  const initialUser =
    typeof window !== 'undefined'
      ? (JSON.parse(localStorage.getItem('User'))?.user ?? null)
      : null

  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false)
  const [showPaymentFailedPopup, setShowPaymentFailedPopup] = useState(false)
  const [togglePlan, setTogglePlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  //snack messages variables
  const [successSnack, setSuccessSnack] = useState(null)
  const [showsuccessSnack, setShowSuccessSnack] = useState(null)
  const [errorSnack, setErrorSnack] = useState(null)
  const [showerrorSnack, setShowErrorSnack] = useState(null)

  const [userType, setUserType] = useState('')

  const [addPaymentPopUp, setAddPaymentPopup] = useState(false)
  const [canAcceptPaymentsAgencyccount, setCanAcceptPaymentsAgencyccount] =
    useState(false)
  const [navigatingTo, setNavigatingTo] = useState(null)

  //check the stripe
  const [checkStripeStatus, setCheckStripeStatus] = useState(false)
  const [checkStripeStatusLoader, setCheckStripeStatusLoader] = useState(false)

  const [showAgencyWalkThrough, setShowAgencyWalkThrough] = useState(false)

  const { user: reduxUser, setUser: setReduxUser } = useUser()

  // Branding state for powered by icon
  const [poweredByIconUrl, setPoweredByIconUrl] = useState('/agencyIcons/poweredByIcon.png')
  
  // Branding state for logo
  const [agencyLogoUrl, setAgencyLogoUrl] = useState(null)

  //check stripe
  useEffect(() => {
    //
    // setCheckStripeStatus(stripeStatus);
    checkStripe()
  }, [])

  //reset navigation loader
  useEffect(() => {
    // checkCurrentUserRole();
    // Fallback reset after 2 seconds
    if (navigatingTo) {
      const timeout = setTimeout(() => {
        setNavigatingTo(null)
      }, 2000) // adjust if needed
      return () => clearTimeout(timeout)
    }
  }, [navigatingTo])

  useEffect(() => {
    const local = localStorage.getItem('User')
    if (local) {
      const parsed = JSON.parse(local)
    }

    // getAgencyPlans();
    getUserProfile() // sets `userDetails`
  }, [])

  //useeffect that redirect the user back to the main screen for mobile view
  useEffect(() => {
    getShowWalkThrough()
    getAgencyPlans()
    const LocalData = localStorage.getItem('User')

    let windowWidth = 1000
    if (typeof window !== 'undefined') {
      windowWidth = window.innerWidth
    }
    if (windowWidth < 640) {
      router.push('/createagent/desktop')
    } else {
      const d = localStorage.getItem('User')
    }
  }, [])

  // useEffect(() => {
  //   agencyLinks.forEach((link) => {
  //     router.prefetch(link.href);
  //   });
  // }, []);

  //check stripe
  const checkStripe = async () => {
    try {
      setCheckStripeStatusLoader(true)
      const agencyProfile = await getProfileDetails()
      const stripeStatus =
        agencyProfile?.data?.data?.canAcceptPaymentsAgencyccount
      setCheckStripeStatus(!stripeStatus)
      setCheckStripeStatusLoader(false)
    } catch (error) {
      setCheckStripeStatusLoader(false)
    }
  }

  const getShowWalkThrough = () => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const UserDetails = JSON.parse(localData)
      const watched = UserDetails?.user?.walkthroughWatched

      if (
        UserDetails?.user?.plan &&
        (watched === false || watched === 'false')
      ) {
        setShowAgencyWalkThrough(true)
      } else {
        // 👇 Prevent flipping it back off if it’s already been set
        // console.log("⛔ should not show intro video");
        // Do not set it to false here — allow modal to control it via onClose
      }
    }
  }

  const updateWalkthroughWatched = async () => {
    try {
      const apidata = {
        walkthroughWatched: true,
      }
      const response = await UpdateProfile(apidata)
      if (response) {
        setShowAgencyWalkThrough(false)
      }
      // console.log("Response of update profile api is", response)
    } catch (error) {}
  }

  //get agency plans list
  const getAgencyPlans = async () => {
    try {
      let localData = localStorage.getItem(PersistanceKeys.LocalStorageUser)
      if (localData) {
        let u = JSON.parse(localData)

        const response = await axios.get(Apis.getPlansForAgency, {
          headers: {
            Authorization: `Bearer ${u.token}`,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            let plansList = response.data.data
            localStorage.setItem('agencyPlansList', JSON.stringify(plansList))
          } else {}
        }
      }
    } catch (error) {}
  }

  const getUserProfile = async () => {
    const data = localStorage.getItem('User')
    if (data) {
      const LocalData = JSON.parse(data)
      let stripeStatus = LocalData?.user?.canAcceptPaymentsAgencyccount || false
      if (showAgencyWalkThrough) return //if walkthrough is shown, don't check stripe status
      setCheckStripeStatus(!stripeStatus)
      // setUserDetails(LocalData);

      const agencyProfile = await getProfileDetails()
      if (agencyProfile) {
        // route  on plans if paymnet failed 3 times
        const agencyProfileData = agencyProfile.data.data

        // Check profile_status from API response
        if (
          agencyProfileData?.profile_status &&
          agencyProfileData.profile_status !== 'active'
        ) {
          setErrorSnack('Your account has been frozen.')
          setShowErrorSnack(true)
          // Show snackbar briefly before logout
          setTimeout(() => {
            logout('Profile status is not active')
          }, 2000)
          return
        }
        if (
          agencyProfileData.plan?.status === 'cancelled' &&
          (agencyProfileData.nextChargeDate &&
            moment(agencyProfileData.nextChargeDate).isBefore(moment()))
        ) {
          router.push('/agency/plan')
          return
        }

        if (
          agencyProfileData.consecutivePaymentFailures == 1 ||
          agencyProfileData.consecutivePaymentFailures == 2
        ) {
          setShowPaymentFailedPopup(true)
        } else if (agencyProfileData.consecutivePaymentFailures >= 3) {
          router.push('/plan')
          // setShowPaymentFailedPopup(false)
        }

        // Update Redux store with fresh profile data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')
        const updatedUserData = {
          token: localData.token,
          user: agencyProfileData,
        }
        setReduxUser(updatedUserData)

        // setUserDetails(agencyProfileData)
        if (!agencyProfileData.plan) {
          const d = {
            subPlan: false,
          }
          localStorage.setItem(
            PersistanceKeys.LocalStorageSubPlan,
            JSON.stringify(d),
          )
          router.push('/agency/onboarding')
        } else if (
          agencyProfileData.plan &&
          agencyProfileData.canAcceptPaymentsAgencyccount === false
        ) {
          setCanAcceptPaymentsAgencyccount(true)
        }
      } else {}
      if (LocalData.user.profile_status !== 'active') {
        setErrorSnack('Your account has been frozen.')
        setShowErrorSnack(true)
        // Show snackbar briefly before logout
        setTimeout(() => {
          logout('Profile status is not active')
        }, 2000)
        return
      }
      if (LocalData.user.plan == null) {
        // user haven't subscribed to any plan
        // setPlans(plansWitTrial);
      }
    }
  }

  useEffect(() => {
    getUserProfile()
  }, [])

  // Listen for UpdateProfile event to update Redux store immediately
  useEffect(() => {
    const handleUpdateProfile = (event) => {
      const data = localStorage.getItem('User')
      if (data) {
        const LocalData = JSON.parse(data)
        setReduxUser(LocalData) // Update Redux from localStorage
      }
    }
    window.addEventListener('UpdateProfile', handleUpdateProfile)
    return () => {
      window.removeEventListener('UpdateProfile', handleUpdateProfile)
    }
  }, [setReduxUser])

  // Listen for branding updates and update powered by icon and logo
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBranding = () => {
      // Check if user is a subaccount or agency (for exception rule)
      let isSubaccount = false
      let isAgency = false
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          isSubaccount = userRole === 'AgencySubAccount'
          isAgency = userRole === 'Agency'
        }
      } catch (error) {}

      const hostname = window.location.hostname
      const isAssignxDomain =
        hostname.includes('.assignx.ai') ||
        hostname === 'assignx.ai' ||
        hostname.includes('localhost')

      // If assignx domain AND not a subaccount AND not an agency, use default icon
      if (isAssignxDomain && !isSubaccount && !isAgency) {
        setPoweredByIconUrl('/agencyIcons/poweredByIcon.png')
        setAgencyLogoUrl(null)
        return
      }

      // For custom domains OR subaccounts/agencies on assignx.ai domains, check agency branding
      const getCookie = (name) => {
        if (name === 'agencyBranding') {
          return null
        }
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
        return null
      }

      let branding = null

      // Try to get agency branding from cookie (set by middleware)
      const brandingCookie = getCookie('agencyBranding')
      if (brandingCookie) {
        try {
          branding = JSON.parse(decodeURIComponent(brandingCookie))
        } catch (error) {}
      }

      // Fallback to localStorage
      if (!branding) {
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            branding = JSON.parse(storedBranding)
          } catch (error) {}
        }
      }

      // Additional fallback: Check user data for agencyBranding (for subaccounts and agencies)
      if (!branding && (isSubaccount || isAgency)) {
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              branding = parsedUser.user.agency.agencyBranding
            }
          }
        } catch (error) {}
      }

      // Set logo URL if available
      if (branding?.logoUrl) {
        setAgencyLogoUrl(branding.logoUrl)
      } else {
        setAgencyLogoUrl(null)
      }

      // Use default icon if no branding found or no custom powered by icon
      setPoweredByIconUrl('/agencyIcons/poweredByIcon.png')
    }

    // Initial update
    updateBranding()

    // Listen for branding updates
    const handleBrandingUpdate = (event) => {
      updateBranding()
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  //code for verify now

  const handleVerifyClick = async () => {
    try {
      setLoader(true)
      const data = localStorage.getItem('User')
      if (data) {
        const D = JSON.parse(data)
        if (D.user.plan) {
          const Token = AuthToken()
          const ApiPath = Apis.createOnboardingLink
          const response = await axios.post(ApiPath, null, {
            headers: {
              Authorization: 'Bearer ' + Token,
            },
          })
          if (response) {
            // console.log("Response of get verify link api is", response);
            window.open(response?.data?.data?.url, '_blank')
            setLoader(false)
          }
          // router.push("/agency/verify")
        } else {
          const d = {
            subPlan: false,
          }
          localStorage.setItem(
            PersistanceKeys.LocalStorageSubPlan,
            JSON.stringify(d),
          )
          router.push('/agency/onboarding')
        }
      }
    } catch (error) {
      setLoader(false)
      console.error('Error occured  in getVerify link api is', error)
    }
  }


  const styles = {
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
    paymentModal: {
      // height: "auto",
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      // my: "50vh",
      // transform: "translateY(-50%)",
      borderRadius: 2,
      border: 'none',
      outline: 'none',
      height: '100svh',
    },
    cardStyles: {
      fontSize: '14',
      fontWeight: '500',
      border: '1px solid #00000020',
    },
    pricingBox: {
      position: 'relative',
      // padding: '10px',
      borderRadius: '10px',
      // backgroundColor: '#f9f9ff',
      display: 'inline-block',
      width: '100%',
    },
    triangleLabel: {
      position: 'absolute',
      top: '0',
      right: '0',
      width: '0',
      height: '0',
      borderTop: '50px solid hsl(var(--brand-primary))', // Increased height again for more padding
      borderLeft: '50px solid transparent',
    },
    labelText: {
      position: 'absolute',
      top: '10px', // Adjusted to keep the text centered within the larger triangle
      right: '5px',
      color: 'white',
      fontSize: '10px',
      fontWeight: 'bold',
      transform: 'rotate(45deg)',
    },
    content: {
      textAlign: 'left',
      paddingTop: '10px',
    },
    originalPrice: {
      textDecoration: 'line-through',
      color: 'hsl(var(--brand-primary) / 0.65)',
      fontSize: 18,
      fontWeight: '600',
    },
    discountedPrice: {
      color: 'hsl(var(--foreground))',
      fontWeight: 'bold',
      fontSize: 18,
      marginLeft: '10px',
    whiteSpace: 'nowrap',
    },
  }

  return (
    <div>
      <AgentSelectSnackMessage
        isVisible={showsuccessSnack}
        hide={() => {
          setShowSuccessSnack(false)
          setSuccessSnack(null)
        }}
        message={successSnack}
        type={SnackbarTypes.Success}
      />
      <AgentSelectSnackMessage
        isVisible={showerrorSnack}
        hide={() => {
          setShowErrorSnack(false)
          setErrorSnack(null)
        }}
        message={errorSnack}
        type={SnackbarTypes.Error}
      />
      {/* Sticky Modal */}
      {checkStripeStatusLoader ? (
        <div
          style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}
        >
          <div className="flex flex-row items-center gap-4 bg-white rounded-md shadow-lg p-2">
            <CircularProgress size={20} />
            <div className="text-foreground text-sm font-medium">
              {`Connecting to Stripe...`}
            </div>
          </div>
        </div>
      ) : (
        checkStripeStatus && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
          >
            <div className="flex flex-row items-center gap-4 bg-white rounded-md shadow-lg p-2">
              <Image
                alt="error"
                src={'/assets/salmanassets/danger_conflict.svg'}
                height={30}
                width={30}
              />
              <div className="text-foreground text-sm font-medium">
                {`You're Stripe account has not been connected.`}
              </div>
              {loader ? (
                <CircularProgress size={20} />
              ) : (
                <button
                  className={cn(
                    'bg-brand-primary text-white rounded-md p-2 outline-none border-none',
                    'text-xs font-medium hover:bg-brand-primary/90 transition-colors',
                  )}
                  onClick={() => {
                    handleVerifyClick()
                  }}
                >
                  Connect Now
                </button>
              )}
            </div>
          </div>
        )
      )}
      <div className="agency-sidebar h-screen w-[250px] min-w-[250px] max-w-[250px] flex flex-col items-center justify-between px-3 bg-white border border-[#EDEDED]">
        <div
          className="w-full p-0 flex flex-col items-center !bg-transparent"
          style={{
            maxHeight: '90vh',
            overflow: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="w-full flex flex-row gap-3 items-center justify-start">
            <div className="w-10/12 flex flex-col items-end">
              {agencyLogoUrl ? (
                // Show logo if available
                (<div className="w-full flex justify-start items-center h-[60px]">
                  <Image
                    src={agencyLogoUrl}
                    alt="agency logo"
                    height={32}
                    width={120}
                    style={{ objectFit: 'contain', maxHeight: '32px', maxWidth: '120px' }}
                    unoptimized={true}
                  />
                </div>)
              ) : (
                // Show agency name if no logo
                (<div className="w-full">
                  <EditAgencyName />
                </div>)
              )}
              {/* Only show "Powered by" label if no logo is present */}
              {!agencyLogoUrl && (
                <Image
                  src={'/agencyIcons/poweredByIcon.png'}
                  alt="powered by logo"
                  height={33}
                  width={140}
                  objectFit="contain"
                />
              )}
            </div>
          </div>

          <div
            ref={navListContainerRef}
            className="relative w-full mt-8 flex flex-col items-center gap-1 overflow-auto !bg-transparent"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseLeave={() => setNavHoveredIndex(null)}
          >
            {navHoveredIndex !== null && navPillStyle && (
              <div
                className={cn(
                  'agency-sidebar-pill absolute z-0 rounded-xl bg-[#f9f9f9] pointer-events-none transition-all duration-200 ease-out',
                  navPillScaleIn ? 'scale-100' : 'scale-[0.95]',
                )}
                style={{
                  left: navPillStyle.left,
                  top: navPillStyle.top,
                  width: navPillStyle.width,
                  height: 40,
                }}
              />
            )}
            {!permissionsLoaded && isInvitee ? (
              // Show loading state while checking permissions
              <div className="w-full flex flex-col items-center justify-center py-8 !bg-transparent">
                <CircularProgress size={24} />
              </div>
            ) : (
              allAgencyLinks.map((item, index) => (
                <div
                  key={item.id}
                  ref={(el) => { navItemRefs.current[index] = el }}
                  onMouseEnter={() => setNavHoveredIndex(index)}
                  className="w-full !bg-transparent"
                >
                  {!isInvitee ? (
                    <NavLinkItem item={item} isActive={isActive} />
                  ) : (
                    <PermissionNavLink
                      item={item}
                      isActive={isActive}
                      hasAccess={menuPermissions[item.id] || false}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* <div>
          <button onClick={requestNotificationPermission}>
            Req Not
          </button>
        </div> */}
        </div>

        <div className="w-full flex flex-col items-center pt-2 !bg-transparent">
          {/* Code for Check list menu bar */}
          <div className="w-full border-b border-border !bg-transparent">
            {reduxUser && <AgencyChecklist userDetails={reduxUser} />}
          </div>
          <Link
            href={'/agency/dashboard/myAccount'}
            className="w-11/12  flex flex-row items-start gap-3 px-4 py-2 truncate outline-none text-start" //border border-[#00000015] rounded-[10px]
            style={{
              textOverflow: 'ellipsis',
              textDecoration: 'none',
            }}
          >
            {reduxUser?.thumb_profile_image ? (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%', // Ensures circular shape
                  overflow: 'hidden', // Clips any overflow from the image
                  display: 'flex', // Centers the image if needed
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={reduxUser?.thumb_profile_image}
                  alt="*"
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            ) : (
              <div className="h-[32px] flex-shrink-0 w-[32px] rounded-full bg-foreground text-primary-foreground flex flex-row items-center justify-center">
                {reduxUser?.name?.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div>
            <div className="truncate text-[15px] font-medium text-foreground w-[100px]">
              {reduxUser?.name?.split(' ')[0]}
            </div>
            <div className="truncate w-[120px] text-[15px] font-medium text-muted-foreground">
              {reduxUser?.email}
            </div>
            </div>
          </Link>
        </div>
      </div>
      <AgencyWalkThrough
        open={showAgencyWalkThrough}
        onClose={updateWalkthroughWatched}
      />
      <Modal
        open={showPaymentFailedPopup}
        onClose={() => setShowPaymentFailedPopup(false)}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="flex justify-center items-center w-full h-full">
          <div className="bg-card rounded-2xl p-6 max-w-lg w-[90%] relative shadow-2xl">
            <div className="flex flex-row justify-between items-center w-full">
              <div className="text-[22px] font-semibold text-foreground">
                Payment Failed
              </div>
              <CloseBtn onClick={() => setShowPaymentFailedPopup(false)} />
            </div>
            <div className="mt-4 text-base font-normal text-foreground">
              Your subscription payment has failed, please update your payment
              method to prevent service interruption. Your account is at risk of
              being canceled.
            </div>

            <div className="w-full">
              <button
                className={cn(
                  'bg-brand-primary text-white px-4 h-[40px] rounded-lg mt-4 w-full',
                  'hover:bg-brand-primary/90 transition-colors',
                )}
                onClick={() => {
                  setShowAddPaymentPopup(true)
                  setShowPaymentFailedPopup(false)
                }}
              >
                Update Payment Method
              </button>
            </div>
          </div>
        </Box>
      </Modal>
      <Modal
        open={showAddPaymentPopup} //addPaymentPopUp
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-8/12  sm:w-full w-full" sx={styles.paymentModal}>
          <div className="flex flex-row justify-center items-center w-full h-full">
            <div
              className={cn(
                'sm:w-7/12 w-full bg-white p-5 rounded-[13px]',
              )}
            >
              <div className="flex flex-row justify-between items-center">
                <div className="text-[22px] font-semibold text-foreground">
                  Payment Details
                </div>
                <CloseBtn onClick={() => setShowAddPaymentPopup(false)} />
              </div>
              <Elements stripe={stripePromise}>
                <AddCardDetails
                  //selectedPlan={selectedPlan}
                  // stop={stop}
                  // getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={(result) => {
                    if (result) {
                      setShowAddPaymentPopup(false)
                      setSuccessSnack('Payment method updated')
                      setShowSuccessSnack(true)
                    } else {
                      setShowAddPaymentPopup(false)
                      setErrorSnack('Failed to update payment method')
                      setShowErrorSnack(true)
                    }
                  }}
                  // togglePlan={""}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}


// Main component wrapped with PermissionProvider
const AgencyNavBar = () => {
  return (
    <PermissionProvider>
      <AgencyNavBarContent />
    </PermissionProvider>
  )
}

export default AgencyNavBar
