'use client'

import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Link,
  Modal,
  Snackbar,
  Typography,
} from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import { initializeApp } from 'firebase/app'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
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

const stripePromise = getStripe()

const AgencyNavBar = () => {
  // const [user, setUser] = useState(null)

  const router = useRouter()
  const pathname = usePathname()

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
      console.log('Stripe status is', stripeStatus)
      setCheckStripeStatus(!stripeStatus)
      setCheckStripeStatusLoader(false)
    } catch (error) {
      setCheckStripeStatusLoader(false)
      console.log('Eror in gettin stripe status', error)
    }
  }

  const getShowWalkThrough = () => {
    console.log('rigered the intro video')
    const localData = localStorage.getItem('User')
    if (localData) {
      const UserDetails = JSON.parse(localData)
      const watched = UserDetails?.user?.walkthroughWatched

      if (
        UserDetails?.user?.plan &&
        (watched === false || watched === 'false')
      ) {
        console.log('✅ should show intro video')
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
    } catch (error) {
      console.log('Error occured in update catch api is', error)
    }
  }

  //get agency plans list
  const getAgencyPlans = async () => {
    try {
      console.log('trying to get plans')
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
            console.log('plans list is: ', response.data.data)
            let plansList = response.data.data
            localStorage.setItem('agencyPlansList', JSON.stringify(plansList))
          } else {
            console.log('Error in getting plans: ', response.data.message)
          }
        }
      }
    } catch (error) {
      console.log('Error in getPlans: ', error)
    }
  }

  const getUserProfile = async () => {
    const data = localStorage.getItem('User')
    if (data) {
      const LocalData = JSON.parse(data)
      let stripeStatus = LocalData?.user?.canAcceptPaymentsAgencyccount || false
      console.log('Stripe status is', stripeStatus)
      if (showAgencyWalkThrough) return //if walkthrough is shown, don't check stripe status
      setCheckStripeStatus(!stripeStatus)
      // setUserDetails(LocalData);

      const agencyProfile = await getProfileDetails()
      if (agencyProfile) {
        console.log('Agency profile details are', agencyProfile)

        // route  on plans if paymnet failed 3 times
        const agencyProfileData = agencyProfile.data.data

        // Check profile_status from API response
        if (
          agencyProfileData?.profile_status &&
          agencyProfileData.profile_status !== 'active'
        ) {
          console.log(
            '❌ [getUserProfile] Profile status is not active:',
            agencyProfileData.profile_status,
          )
          setErrorSnack('Your account has been frozen.')
          setShowErrorSnack(true)
          // Show snackbar briefly before logout
          setTimeout(() => {
            logout('Profile status is not active')
          }, 2000)
          return
        }
        console.log(
          'agencyProfileData.plan?.status',
          agencyProfileData.plan?.status,
        )
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
      } else {
        console.log('No profile detail found yet')
      }
      console.log(
        'LocalData.user.profile_status',
        LocalData.user.profile_status,
      )
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
    console.log('called from useeffect')
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
      } catch (error) {
        console.log('Error parsing user data:', error)
      }

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
        } catch (error) {
          console.log('Error parsing agencyBranding cookie:', error)
        }
      }

      // Fallback to localStorage
      if (!branding) {
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            branding = JSON.parse(storedBranding)
          } catch (error) {
            console.log('Error parsing agencyBranding from localStorage:', error)
          }
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
        } catch (error) {
          console.log('Error parsing user data for agencyBranding:', error)
        }
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
      console.log('Working')
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
          console.log('Need to subscribe plan')
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

  const agencyLinks = [
    {
      id: 1,
      name: 'Dashboard',
      href: '/agency/dashboard',
      selected: '/agencyNavbarIcons/selectdDashboardIcon.png', //agencyNavbarIcons
      uneselected: '/agencyNavbarIcons/unSelectedDashboardIcon.png',
    },
    {
      id: 2,
      name: 'Integrations',
      href: '/agency/dashboard/integration',
      selected: '/agencyNavbarIcons/integrationFocus.png',
      uneselected: '/agencyNavbarIcons/integrationsUnFocus.png',
    },
    {
      id: 3,
      name: 'Plans',
      href: '/agency/dashboard/plans',
      selected: '/agencyNavbarIcons/selectedPlansIcon.png',
      uneselected: '/agencyNavbarIcons/unSelectedPlansIcon.png',
    },
    {
      id: 4,
      name: 'Sub Account',
      href: '/agency/dashboard/subAccounts',
      selected: '/agencyNavbarIcons/selectedSubAccountIcon.png',
      uneselected: '/agencyNavbarIcons/unSelectedSubAccountIcon.png',
    },
    {
      id: 5,
      name: 'Activity',
      href: '/agency/dashboard/callLogs',
      selected: '/otherAssets/selectedActivityLog.png',
      uneselected: '/otherAssets/activityLog.png',
    },
    {
      id: 6,
      name: 'Teams',
      href: '/agency/dashboard/teams',
      selected: '/agencyNavbarIcons/selectedTeam.png',
      uneselected: '/agencyNavbarIcons/unSelectedTeamIcon.png',
    },
    {
      id: 7,
      name: 'Whitelabel',
      href: '/agency/dashboard/whitelabel',
      selected: '/agencyNavbarIcons/selectedWhitelabelling.png',
      uneselected: '/agencyNavbarIcons/unSelectedWhitelabelling.png',
    },
  ]

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
          style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 9999 }}
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
              right: 10,
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

      <div className="h-screen w-full flex flex-col items-center justify-between">
        <div
          className="w-full pt-5 flex flex-col items-center ps-4"
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
                <div className="w-full flex justify-start items-center">
                  <Image
                    src={agencyLogoUrl}
                    alt="agency logo"
                    height={32}
                    width={120}
                    style={{ objectFit: 'contain', maxHeight: '32px', maxWidth: '120px' }}
                  />
                </div>
              ) : (
                // Show agency name if no logo
                <div className="w-full">
                  <EditAgencyName />
                </div>
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
            className="w-full mt-8 flex flex-col items-center gap-3 overflow-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {agencyLinks.map((item) => (
              <div key={item.id} className="w-full flex flex-col pl-3">
                <Link
                  sx={{ cursor: 'pointer', textDecoration: 'none' }}
                  href={item.href}
                  // onClick={() => {
                  //   router.prefetch(item.href);
                  //   if (pathname !== item.href) {
                  //     setNavigatingTo(item.href);
                  //     router.push(item.href);
                  //   }
                  // }}
                >
                  <div
                    className={cn(
                      'w-full flex flex-row gap-2 items-center py-1 rounded-full',
                    )}
                  >
                    <div
                      className={cn(
                        pathname === item.href
                          ? 'icon-brand-primary'
                          : 'icon-black',
                      )}
                      style={
                        pathname === item.href
                          ? {
                              '--icon-mask-image': `url(${
                                pathname === item.href
                                  ? item.selected
                                  : item.uneselected
                              })`,
                            }
                          : {}
                      }
                    >
                      <Image
                        src={
                          pathname === item.href
                            ? item.selected
                            : item.uneselected
                        }
                        height={24}
                        width={24}
                        alt="icon"
                      />
                    </div>
                    <div
                      className={cn(
                        'text-sm font-medium',
                        pathname === item.href
                          ? 'text-brand-primary'
                          : 'text-black',
                      )}
                    >
                      {item.name}
                    </div>

                    {/*navigatingTo === item.href && (
                      <CircularProgress size={14} />
                    )*/}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* <div>
          <button onClick={requestNotificationPermission}>
            Req Not
          </button>
        </div> */}
        </div>

        <div className="w-full flex flex-col items-center pt-2">
          {/* Code for Check list menu bar */}
          <div className="w-full border-b border-border">
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
                    console.log('result is', result)
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
  )
}

export default AgencyNavBar
