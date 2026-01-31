'use client'

import 'react-phone-input-2/lib/style.css'

import { Box, CircularProgress, Modal } from '@mui/material'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import axios from 'axios'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { usePathname } from 'next/navigation'
// import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import LoaderAnimation from '@/components/animations/LoaderAnimation'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { AgentXOrb } from '@/components/common/AgentXOrb'
import AppLogo from '@/components/common/AppLogo'
import SendVerificationCode from '@/components/onboarding/services/AuthVerification/AuthService'
import SnackMessages from '@/components/onboarding/services/AuthVerification/SnackMessages'
import {
  getLocalLocation,
  getLocation,
} from '@/components/onboarding/services/apisServices/ApiService'
import { Progress } from '@/components/ui/progress'
import { PersistanceKeys, setUserType, userType } from '@/constants/Constants'
import { setCookie } from '@/utilities/cookies'
import { clearLogoutFlag } from '@/utilities/UserUtility'
import { getPolicyUrls } from '@/utils/getPolicyUrls'
import { forceApplyBranding } from '@/utilities/applyBranding'
import { hexToHsl, calculateIconFilter } from '@/utilities/colorUtils'

import ShootingStarLoading from '../animations/ShootingStarLoading'
import getProfileDetails from '../apis/GetProfile'

// import { useRouter, useSearchParams } from "next/navigation";

const LoginComponent = ({ length = 6, onComplete }) => {
  let width = 3760
  let height = 4684
  let searchParams = useSearchParams()
  const [redirect, setRedirect] = useState(null)

  const verifyInputRef = useRef([])
  const timerRef = useRef()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [msgType, setMsgType] = useState(null)
  let [response, setResponse] = useState({})
  const [countryCode, setCountryCode] = useState('us') // Default country
  const [userPhoneNumber, setUserPhoneNumber] = useState('')
  const userPhoneNumberRef = useRef('')
  const [sendcodeLoader, setSendcodeLoader] = useState(false)
  const [SendCodeMessage, setSendCodeMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoader, setLocationLoader] = useState(false)
  const [loginLoader, setLoginLoader] = useState(false)
  const [phoneNumberLoader, setPhoneNumberLoader] = useState(false)
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [enterPressed, setEnterPressed] = useState(false)

  const [loaderTitle, setLoaderTitle] = useState('Launching your account...')
  // const length = 6;
  const [VerifyCode, setVerifyCode] = useState(Array(length).fill(''))
  const [showVerifyPopup, setShowVerifyPopup] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authProgressValue, setAuthProgressValue] = useState(0)

  // Agency branding state
  const [agencyBranding, setAgencyBranding] = useState(null)
  // Track if we've determined domain type (to prevent flash of Terms & Privacy)
  const [domainTypeDetermined, setDomainTypeDetermined] = useState(false)
  const [isAssignxDomain, setIsAssignxDomain] = useState(false)


  //code for detecting the window inner width
  const [InnerWidth, setInnerWidth] = useState('')

  useEffect(() => {
    const redirect = searchParams.get('redirect') // Get the value of 'tab'
    // let number = Number(tab) || 6;
    // //console.log;
    setRedirect(redirect)
  }, [])

  // Get agency branding from cookie/localStorage (set by middleware) or fetch from API
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Determine if current domain is an assignx domain
    const hostname = window.location.hostname
    const isAssignx = hostname === 'dev.assignx.ai' || hostname === 'app.assignx.ai'
    setIsAssignxDomain(isAssignx)

    // Helper to get cookie value
    const getCookie = (name) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    }

    const fetchBranding = async () => {
      // Always fetch fresh branding from API on first load to ensure we have the latest data
      // This ensures we get updated branding even if cookies are stale
      const fetchFromAPI = async () => {
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_API_URL ||
            (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
              ? 'https://apimyagentx.com/agentx/'
              : 'https://apimyagentx.com/agentxtest/')

          const bodyData = {
            customDomain: window.location.hostname,
          }

          const lookupResponse = await fetch(
            `${baseUrl}api/agency/lookup-by-domain`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(bodyData),
            },
          )

          if (lookupResponse.ok) {
            const lookupData = await lookupResponse.json()
            if (lookupData.status && lookupData.data?.branding) {
              const brandingData = lookupData.data.branding
              // Store in both cookie and localStorage
              localStorage.setItem(
                'agencyBranding',
                JSON.stringify(brandingData),
              )
              setAgencyBranding(brandingData)

              // Apply branding CSS variables
              if (typeof document !== 'undefined') {
                try {
                  const primaryColor = brandingData.primaryColor || '#7902DF'
                  const secondaryColor = brandingData.secondaryColor || '#8B5CF6'
                  const primaryHsl = hexToHsl(primaryColor)
                  const secondaryHsl = hexToHsl(secondaryColor)
                  document.documentElement.style.setProperty('--brand-primary', primaryHsl)
                  document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
                  document.documentElement.style.setProperty('--primary', primaryHsl)
                  document.documentElement.style.setProperty('--secondary', secondaryHsl)
                  const iconFilter = calculateIconFilter(primaryColor)
                  document.documentElement.style.setProperty('--icon-filter', iconFilter)
                } catch (error) {}
              }

              return true
            }
          }
        } catch (error) {}
        return false
      }

      // Helper function to apply branding CSS variables
      const applyBrandingStyles = (brandingData) => {
        if (!brandingData || typeof document === 'undefined') return
        
        try {
          const primaryColor = brandingData.primaryColor || '#7902DF'
          const secondaryColor = brandingData.secondaryColor || '#8B5CF6'

          // Convert hex to HSL
          const primaryHsl = hexToHsl(primaryColor)
          const secondaryHsl = hexToHsl(secondaryColor)

          // Set CSS variables immediately
          document.documentElement.style.setProperty('--brand-primary', primaryHsl)
          document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
          document.documentElement.style.setProperty('--primary', primaryHsl)
          document.documentElement.style.setProperty('--secondary', secondaryHsl)

          // Calculate and set icon filter
          const iconFilter = calculateIconFilter(primaryColor)
          document.documentElement.style.setProperty('--icon-filter', iconFilter)
        } catch (error) {}
      }

      // First, check localStorage for immediate display (works for both assignx and custom domains)
      const storedBranding = localStorage.getItem('agencyBranding')
      if (storedBranding) {
        try {
          const brandingData = JSON.parse(storedBranding)
          setAgencyBranding(brandingData)

          // Apply branding styles if it's a custom domain
          if (!isAssignx && brandingData) {
            applyBrandingStyles(brandingData)
          }

          // For custom domains, still fetch from API in background to ensure latest data
          if (!isAssignx) {
            fetchFromAPI().then((fetched) => {
              if (fetched) {
                const updatedBranding = JSON.parse(localStorage.getItem('agencyBranding'))
                if (updatedBranding) {
                  setAgencyBranding(updatedBranding)
                  applyBrandingStyles(updatedBranding)
                }
              }
            })
          }
          return
        } catch (error) {}
      }

      // For custom domains, fetch from API if no localStorage branding found
      if (!isAssignx) {
        const fetched = await fetchFromAPI()
        if (fetched) {
          const brandingData = JSON.parse(localStorage.getItem('agencyBranding'))
          if (brandingData) {
            applyBrandingStyles(brandingData)
          }
        }
        // Set domain type determined after checking for branding
        setDomainTypeDetermined(true)
      } else {
        // For assignx domains, no branding means show Terms & Privacy
        setDomainTypeDetermined(true)
      }
    }

    // Always call fetchBranding to check localStorage and fetch if needed
    fetchBranding()
    // Listen for branding updates from other components (e.g., BrandConfig)
    const handleBrandingUpdate = (event) => {
      const updatedBranding = event.detail
      // Update cookie and localStorage
      if (updatedBranding) {
        const cookieValue = encodeURIComponent(JSON.stringify(updatedBranding))
        // document.cookie = `agencyBranding=${cookieValue}; path=/; max-age=${60 * 60 * 24}`
        localStorage.setItem('agencyBranding', JSON.stringify(updatedBranding))
        setAgencyBranding(updatedBranding)
        
        // Apply branding styles if it's a custom domain
        if (!isAssignxDomain) {
          const applyBrandingStyles = (brandingData) => {
            if (!brandingData || typeof document === 'undefined') return
            try {
              const primaryColor = brandingData.primaryColor || '#7902DF'
              const secondaryColor = brandingData.secondaryColor || '#8B5CF6'
              const primaryHsl = hexToHsl(primaryColor)
              const secondaryHsl = hexToHsl(secondaryColor)
              document.documentElement.style.setProperty('--brand-primary', primaryHsl)
              document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
              document.documentElement.style.setProperty('--primary', primaryHsl)
              document.documentElement.style.setProperty('--secondary', secondaryHsl)
              const iconFilter = calculateIconFilter(primaryColor)
              document.documentElement.style.setProperty('--icon-filter', iconFilter)
            } catch (error) {}
          }
          applyBrandingStyles(updatedBranding)
        }
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  // Apply branding CSS variables when agencyBranding is set and it's a custom domain
  useEffect(() => {
    if (!agencyBranding || isAssignxDomain || typeof document === 'undefined') return

    try {
      const primaryColor = agencyBranding.primaryColor || '#7902DF'
      const secondaryColor = agencyBranding.secondaryColor || '#8B5CF6'
      const primaryHsl = hexToHsl(primaryColor)
      const secondaryHsl = hexToHsl(secondaryColor)

      document.documentElement.style.setProperty('--brand-primary', primaryHsl)
      document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
      document.documentElement.style.setProperty('--primary', primaryHsl)
      document.documentElement.style.setProperty('--secondary', secondaryHsl)

      const iconFilter = calculateIconFilter(primaryColor)
      document.documentElement.style.setProperty('--icon-filter', iconFilter)
    } catch (error) {}
  }, [agencyBranding, isAssignxDomain])

  useEffect(() => {
    //console.log;
    userPhoneNumberRef.current = userPhoneNumber
  }, [userPhoneNumber])
  useEffect(() => {
    if (params && params.username) {
      // //console.log;
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          PersistanceKeys.LocalStorageCampaignee,
          params.username,
        )
      }
    } else {
      // router.replace("/login");
    }
  }, [params])

  useEffect(() => {
    const handleEnterPress = async () => {
      if (enterPressed) {
        if (checkPhoneResponse === false) {
          handleVerifyPopup()
        } else {
          await checkPhoneNumber(userPhoneNumber)
        }
        setEnterPressed(false)
      }
    }
    handleEnterPress()
  }, [enterPressed, checkPhoneResponse])

  useEffect(() => {
    // Check authentication status
    const checkAuthStatus = async () => {
      if (typeof window === 'undefined') {
        setIsCheckingAuth(false)
        return
      }

      // CRITICAL: Check for logout flag in sessionStorage (persists for browser session)
      // This prevents auto-login even if localStorage gets repopulated after logout
      const logoutFlag = typeof sessionStorage !== 'undefined' 
        ? sessionStorage.getItem('_logout_flag') 
        : null
      
      // CRITICAL: If user just logged out (either via URL param or sessionStorage flag), skip auto-login
      const logoutParam = searchParams.get('logout')
      if (logoutParam || logoutFlag) {
        // Clear any remaining localStorage data (safety check)
        localStorage.removeItem('User')
        // Clear Redux persist storage
        try {
          localStorage.removeItem('persist:root')
        } catch (e) {
          console.warn('Could not clear Redux persist storage:', e)
        }
        setIsCheckingAuth(false)
        return
      }

      const localData = localStorage.getItem('User')
      if (localData) {
        try {
          let d = JSON.parse(localData)

          // Check if token exists before making API call
          if (!d.token) {
            // No token, clear localStorage and show login form
            localStorage.removeItem('User')
            setIsCheckingAuth(false)
            return
          }

          // Verify the user data is still valid by calling the profile API
          // Add timeout to prevent hanging
          const profileResponse = await Promise.race([
            getProfileDetails(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Profile check timeout')),
                5000,
              ),
            ),
          ]).catch((error) => {
            console.error('Error or timeout checking authentication:', error)
            return null
          })

          // If profile API fails (returns null or 404), user is not authenticated
          if (!profileResponse || profileResponse?.data?.status !== true) {
            // Clear invalid localStorage data
            localStorage.removeItem('User')
            setIsCheckingAuth(false)
            return
          }

          // CRITICAL: Profile is valid - clear logout flag since token is verified
          // This allows auto-login to proceed since the token is confirmed valid
          clearLogoutFlag()

          // Profile is valid, update local data and route
          const updatedData = JSON.parse(
            localStorage.getItem('User') || localData,
          )
          d = updatedData

          // Safety check: ensure user object exists
          if (!d || !d.user) {
            console.error('Invalid user data structure, clearing localStorage')
            localStorage.removeItem('User')
            setIsCheckingAuth(false)
            return
          }

          // Determine redirect path based on user type
          let redirectPath = '/dashboard'
          if (d.user.userType == 'admin') {
            redirectPath = '/admin'
          } else if (
            d.user.userRole == 'Agency' ||
            d.user.agencyTeammember === true
          ) {
            redirectPath = '/agency/dashboard'
          } else if (d.user.userRole == 'AgencySubAccount') {
            if (d.user.plan) {
              redirectPath = '/dashboard'
            } else {
              redirectPath = '/subaccountInvite/subscribeSubAccountPlan'
            }
          }

          // Check if we're already on the correct path (or a subpath)
          // This prevents redirect loops
          if (
            pathname === redirectPath ||
            pathname.startsWith(redirectPath + '/')
          ) {
            setIsCheckingAuth(false)
            return
          }

          // IMPORTANT: Set cookie before redirecting so middleware can see it
          if (typeof document !== 'undefined' && d.user) {
            setCookie(d.user, document)
          }

          // Use window.location.href for hard redirect to ensure navigation happens
          // This will completely reload the page and clear the loading state
          window.location.href = redirectPath
          return
        } catch (error) {
          // If there's an error, clear localStorage and show login form
          console.error('Error checking authentication:', error)
          localStorage.removeItem('User')
          setIsCheckingAuth(false)
          return
        }
      }

      // User is not logged in, show login form
      setIsCheckingAuth(false)

      const localLoc = localStorage.getItem(
        PersistanceKeys.LocalStorageUserLocation,
      )
      if (!localLoc) {
        // getLocation();
        // getLocation2();
      } else if (localLoc) {
        // const L = JSON.parse(localLoc);
        // setCountryCode(L.location);
        let Data = getLocalLocation()
        if (userPhoneNumber == '') {
          // setCountryCode(Data);
        }
      }
    }

    checkAuthStatus()
  }, [searchParams, pathname])

  //get location
  const getLocation2 = async () => {
    // setLocationLoader(true);
    try {
      //console.log;
      const location = await getCurrentLocation()
      //console.log;
      const { latitude, longitude } = location
      localStorage.setItem('CompleteLocation', JSON.stringify(location))
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      )
      const data = await response.json()
      //console.log;
      localStorage.setItem(
        PersistanceKeys.LocalStorageCompleteLocation,
        JSON.stringify(data),
      )
      const locationData = {
        location: data.countryCode.toLowerCase(),
      }
      if (userPhoneNumberRef.current === '') {}

      // //console.log;
      if (data && data.countryCode) {
        localStorage.setItem('userLocation', JSON.stringify(locationData))
        // //console.log;
      } else {
        // console.error("Unable to fetch country code.");
      }

      //console.log;
      return data // Return the fetched data
    } catch (error) {
      //console.log;
      return null
    }
  }

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'))
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          },
          (error) => reject(error),
        )
      }
    })
  }

  // useEffect(() => {
  //   // //console.log;

  //   const timer = setTimeout(() => {
  //     const loc = localStorage.getItem("userLocation");

  //     if (loc) {
  //       // //console.log;
  //       const L = JSON.parse(loc);
  //       // //console.log;
  //       // //console.log;
  //       // //console.log;

  //       // if (userPhoneNumber == "") {
  //       //   setCountryCode(L.location);
  //       // }
  //       // //console.log;
  //     }

  //     // //console.log;
  //   }, 300);

  //   return () => clearTimeout(timer);
  // }, []);

  //action detects inner width
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // //console.log;
      setInnerWidth(window.innerWidth)
    }
  }, [InnerWidth])

  const handlePhoneNumberChange = (phone) => {
    // //console.log;
    setUserPhoneNumber(phone)
    validatePhoneNumber(phone)
    setCheckPhoneResponse(null)

    if (!phone) {
      setErrorMessage('')
      setCheckPhoneResponse(null)
    }
  }

  //number validation
  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
      setErrorMessage('')
      return
    }

    // Try to parse as US first
    const parsedUs = parsePhoneNumberFromString(`+${phoneNumber}`, 'US')

    // Try to parse as CA
    const parsedCa = parsePhoneNumberFromString(`+${phoneNumber}`, 'CA')

    // Try to parse as MX
    const parsedMx = parsePhoneNumberFromString(`+${phoneNumber}`, 'MX')

    // Try to parse as AU
    const parsedAu = parsePhoneNumberFromString(`+${phoneNumber}`, 'AU')

    // Try to parse as GB
    const parsedGb = parsePhoneNumberFromString(`+${phoneNumber}`, 'GB')

    // Try to parse without country code (auto-detect)
    const parsedAuto = parsePhoneNumberFromString(`+${phoneNumber}`)

    const isValid =
      (parsedUs &&
        parsedUs.isValid() &&
        (parsedUs.country === 'US' ||
          parsedUs.country === 'CA' ||
          parsedUs.country === 'MX' ||
          parsedUs.country === 'AU' ||
          parsedUs.country === 'GB')) ||
      (parsedCa &&
        parsedCa.isValid() &&
        (parsedCa.country === 'US' ||
          parsedCa.country === 'CA' ||
          parsedCa.country === 'MX' ||
          parsedCa.country === 'AU' ||
          parsedCa.country === 'GB')) ||
      (parsedMx &&
        parsedMx.isValid() &&
        (parsedMx.country === 'US' ||
          parsedMx.country === 'CA' ||
          parsedMx.country === 'MX' ||
          parsedMx.country === 'AU' ||
          parsedMx.country === 'GB')) ||
      (parsedAu &&
        parsedAu.isValid() &&
        (parsedAu.country === 'US' ||
          parsedAu.country === 'CA' ||
          parsedAu.country === 'MX' ||
          parsedAu.country === 'AU' ||
          parsedAu.country === 'GB')) ||
      (parsedGb &&
        parsedGb.isValid() &&
        (parsedGb.country === 'US' ||
          parsedGb.country === 'CA' ||
          parsedGb.country === 'MX' ||
          parsedGb.country === 'AU' ||
          parsedGb.country === 'GB')) ||
      (parsedAuto &&
        parsedAuto.isValid() &&
        (parsedAuto.country === 'US' ||
          parsedAuto.country === 'CA' ||
          parsedAuto.country === 'MX' ||
          parsedAuto.country === 'AU' ||
          parsedAuto.country === 'GB'))

    if (!isValid) {
      setErrorMessage('Invalid')
    } else {
      setErrorMessage('')

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        checkPhoneNumber(phoneNumber)
      }, 300)
    }
  }

  // focus the first verification input when popup opens (after portal mounts)
  useEffect(() => {
    if (!showVerifyPopup) return
    const focusTimer = setTimeout(() => {
      verifyInputRef.current[0]?.focus()
    }, 50)
    return () => clearTimeout(focusTimer)
  }, [showVerifyPopup])

  //code to show verify popup

  const handleVerifyPopup = async () => {
    let retryAttempts = 0
    //console.log;
    try {
      setShowVerifyPopup(true)
      setSendcodeLoader(true)
      let response = await SendVerificationCode(userPhoneNumber, true)
      // //console.log;
      // return
      // setResponse(response);
      setIsVisible(true)
      // //console.log;

      if (response.status === true) {
        setMsgType(SnackbarTypes.Success)
        setSnackMessage('Code sent')
      } else if (response.status === false) {
        setSnackMessage(response.message)
        setMsgType(SnackbarTypes.Error)
      }
    } catch (error) {
      // console.error("Error occured", error);
      retryAttempts++
      if (retryAttempts < 3) {
        await handleVerifyPopup()
      } else {
        setErrorMessage(error.response?.data?.message || 'Login failed')
      }
    } finally {
      setSendcodeLoader(false)
    }
  }

  //code to login
  const handleLoginOld = async () => {
    try {
      setLoginLoader(true)
      const ApiPath = Apis.LogIn
      const AipData = {
        phone: userPhoneNumber,
        verificationCode: VerifyCode.join(''),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
      // //console.log;

      const response = await axios.post(ApiPath, AipData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        let screenWidth = innerWidth

        if (screenWidth < 640) {
          setMsgType(SnackbarTypes.Warning)
          setSnackMessage('Access your AI on Desktop')
        } else {
          setMsgType(SnackbarTypes.Success)
          setSnackMessage(response.data.message)
        }

        setIsVisible(true)

        if (response.data.status === true) {
          setLoaderTitle('Redirecting to dashboard...')
          // if (
          //   response.data.data.user.userType !== "RealEstateAgent" &&
          //   response.data.data.user.userRole !== "Invitee"
          // ) {
          if (response.data.data.user.waitlist) {
            // //console.log;

            const twoHoursFromNow = new Date()
            twoHoursFromNow.setTime(twoHoursFromNow.getTime() + 2 * 60 * 1000)
            if (typeof document !== 'undefined') {
              setCookie(response.data.data.user, document, twoHoursFromNow)
              window.location.href = '/onboarding/WaitList'
              return
            }
          } else {
            // //console.log;
            // let routeTo = ""

            // CRITICAL: Clear logout flag on successful login
            clearLogoutFlag()

            localStorage.setItem('User', JSON.stringify(response.data.data))

            // Extract and store agency branding immediately after login
            const userData = response.data.data
            const agencyBranding =
              userData?.user?.agencyBranding ||
              userData?.agencyBranding ||
              userData?.user?.agency?.agencyBranding

            if (agencyBranding) {
              localStorage.setItem('agencyBranding', JSON.stringify(agencyBranding))
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('agencyBrandingUpdated'))
              }
            } else {
              const authToken = userData?.token || userData?.user?.token
              const userRole = userData?.user?.userRole
              if (authToken && (userRole === 'AgencySubAccount' || userRole === 'Agency')) {
                fetch(Apis.getAgencyBranding, {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                })
                  .then(res => res.json())
                  .then(data => {
                    if (data?.status === true && data?.data?.branding) {
                      localStorage.setItem('agencyBranding', JSON.stringify(data.data.branding))
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('agencyBrandingUpdated'))
                      }
                    }
                  })
                  .catch(() => {})
              }
            }

            //set cokie on locastorage to run middle ware
            if (typeof document !== 'undefined') {
              // //console.log;

              setCookie(response.data.data.user, document)
              let w = innerWidth
              if (w < 540) {
                // //console.log;
                router.push('/createagent/desktop')
              } else if (w > 540) {
                // //console.log;

                if (redirect) {
                  router.push(redirect)
                } else {
                  // setUserType()
                  if (response.data.data.user.userType == 'admin') {
                    router.push('/admin')
                  } else {
                    router.push('/dashboard/leads')
                  }
                }
              }
            } else {
              // //console.log;
            }
          }
        } else {
          setLoginLoader(false)
        }
      }
    } catch (error) {
      setLoginLoader(false)
      // console.error("ERror occured in login api is :", error);
    } finally {
      // setLoginLoader(false);
    }
  }

  const handleLogin = async () => {
    try {
      const ApiData = {
        phone: userPhoneNumber,
        verificationCode: VerifyCode.join(''),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
      setLoginLoader(true)
      const response = await axios.post(Apis.LogIn, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: "include", // Ensures cookies (JWT) are stored securely
      })
      // setLoginLoader(false);
      //console.log;
      if (response) {
        // console.log;
        // Redirect user or update state as needed
        let screenWidth = innerWidth

        if (screenWidth < 640) {
          setMsgType(SnackbarTypes.Warning)
          setSnackMessage('Access your AI on Desktop')
        } else {
          setMsgType(
            response.data.status === true
              ? SnackbarTypes.Success
              : SnackbarTypes.Error,
          )

          setSnackMessage(response.data.message)
        }

        setIsVisible(true)

        if (response.data.status === true) {
          if (response.data.data.user.profile_status === 'paused') {
            setLoginLoader(false)
            setMsgType(SnackbarTypes.Error)
            setSnackMessage('Your account has been frozen.')
            return
          }
          setLoaderTitle('Redirecting to dashboard...')
          // if (
          //   response.data.data.user.userType !== "RealEstateAgent" &&
          //   response.data.data.user.userRole !== "Invitee"
          // ) {
          if (response.data.data.user.waitlist) {
            // //console.log;

            const twoHoursFromNow = new Date()
            twoHoursFromNow.setTime(twoHoursFromNow.getTime() + 2 * 60 * 1000)
            if (typeof document !== 'undefined') {
              setCookie(response.data.data.user, document, twoHoursFromNow)
              window.location.href = '/onboarding/WaitList'
              return
            }
          } else {
            // CRITICAL: Clear logout flag on successful login
            clearLogoutFlag()

            localStorage.setItem('User', JSON.stringify(response.data.data))

            // Set user cookie for middleware
            if (typeof document !== 'undefined') {
              setCookie(response.data.data.user, document)
              let w = innerWidth

              // Determine redirect path
              let redirectPath = '/dashboard/myAgentX'

              if (w < 540) {
                redirectPath = '/createagent/desktop'
              } else if (w > 540) {
                if (redirect) {
                  redirectPath = redirect
                } else {
                  if (response.data.data.user.userType == 'admin') {
                    redirectPath = '/admin'
                  } else if (
                    response.data.data.user.userRole == 'AgencySubAccount'
                  ) {
                    if (response.data.data.user.plan) {
                      redirectPath = '/dashboard'
                    } else {
                      redirectPath = '/subaccountInvite/subscribeSubAccountPlan'
                    }
                  } else if (
                    response.data.data.user.userRole == 'Agency' ||
                    response.data.data.user.agencyTeammember === true
                  ) {
                    redirectPath = '/agency/dashboard'
                  } else {
                    redirectPath = '/dashboard/myAgentX'
                  }
                }
              }

              window.location.href = redirectPath
              return
            }

            // For non-agency users, redirect immediately
            window.location.href = redirectPath
            return
          }
        } else {
          setLoginLoader(false)
        }
      } else {
        // console.error("Login failed:", data.error);
        setLoginLoader(false)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Axios error while login api:',
          error.response?.data || error.message,
        )
      } else {
        console.error('General error while login api:', error)
      }
      setLoginLoader(false)
    }
  }

  //code to check number
  const checkPhoneNumber = async (value, retryAttempts = 0) => {
    try {
      setPhoneNumberLoader(true)
      const ApiPath = Apis.CheckPhone

      const ApiData = {
        phone: value,
      }

      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // //console.log;
          setCheckPhoneResponse(response.data.status)
        } else if (response.data.status === false) {
          //console.log;
          setCheckPhoneResponse(response.data.status)
        }
      }
    } catch (error) {
      retryAttempts++
      if (retryAttempts < 3) {
        await checkPhoneNumber(value, retryAttempts)
      } else {
        setErrorMessage(error.response?.data?.message || 'User not found')
      }
      // console.error("Error occured in check phone api is :", error);
    } finally {
      setPhoneNumberLoader(false)
    }
  }

  //verify code
  // const handleVerifyInputChange = (e, index) => {
  //   const { value } = e.target;
  //   if (!/[0-9]/.test(value) && value !== "") return; // Allow only numeric input

  //   const newValues = [...VerifyCode];
  //   newValues[index] = value;
  //   setVerifyCode(newValues);

  //   // Move focus to the next field if a number is entered
  //   if (value && index < length - 1) {
  //     verifyInputRef.current[index + 1].focus();
  //   }

  //   // Trigger onComplete callback if all fields are filled
  //   if (newValues.every((num) => num !== "") && onComplete) {
  //     onComplete(newValues.join("")); // Convert array to a single string here
  //   }
  // };

  const handleVerifyInputChange = (e, index) => {
    const { value } = e.target

    // If value is longer than 1, assume it's a paste/autofill
    if (value.length > 1) {
      const newValues = Array(length).fill('')
      value
        .slice(0, length)
        .split('')
        .forEach((char, i) => {
          if (/[0-9]/.test(char)) {
            newValues[i] = char
          }
        })

      setVerifyCode(newValues)

      // Focus last filled or next empty
      const lastFilledIndex = newValues.findLastIndex((val) => val !== '')
      const focusIndex = Math.min(lastFilledIndex + 1, length - 1)
      verifyInputRef.current[focusIndex]?.focus()

      // Trigger onComplete if all fields filled
      if (newValues.every((num) => num !== '') && onComplete) {
        onComplete(newValues.join(''))
      }

      return
    }

    // Normal single digit input
    if (!/[0-9]/.test(value) && value !== '') return

    const newValues = [...VerifyCode]
    newValues[index] = value
    setVerifyCode(newValues)

    if (value && index < length - 1) {
      verifyInputRef.current[index + 1]?.focus()
    }

    if (newValues.every((num) => num !== '') && onComplete) {
      onComplete(newValues.join(''))
    }
  }

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace') {
      if (VerifyCode[index] === '' && index > 0) {
        verifyInputRef.current[index - 1].focus()
      }
      const newValues = [...VerifyCode]
      newValues[index] = ''
      setVerifyCode(newValues)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault() // Prevent default behavior to avoid issues with pasting
    const pastedText = e.clipboardData.getData('text').slice(0, length) // Get the pasted text and slice to length
    const newValues = pastedText
      .split('')
      .map((char) => (/[0-9]/.test(char) ? char : '')) // Filter non-numeric characters

    setVerifyCode(newValues) // Update the state with the new values

    // Set each input's value and move focus to the last filled input
    newValues.forEach((char, index) => {
      if (verifyInputRef.current[index]) {
        verifyInputRef.current[index].value = char
        // Focus on the last input field that gets filled
        if (index === newValues.length - 1) {
          verifyInputRef.current[index].focus()
        }
      }
    })

    // If all inputs are filled, trigger the onComplete callback
    if (newValues.every((num) => num !== '') && onComplete) {
      onComplete(newValues.join(''))
    }
  }

  const handleVerifyCode = () => {
    // //console.log);
    // setPhoneVerifiedSuccessSnack(true);
    handleLogin()
  }

  const backgroundImage = {
    backgroundImage: 'url("/assets/bg2.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    // backgroundPosition: "50% 50%",
    backgroundPosition: 'center',
    width: '55svw',
    height: '90svh',
    overflow: 'hidden',
    borderRadius: '15px',
  }

  const styles = {
    errmsg: {
      fontSize: 12,
      fontWeight: '500',
      borderRadius: '7px',
    },
    verifyPopup: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  // Animate progress bar for indeterminate effect when checking auth
  useEffect(() => {
    if (!isCheckingAuth) {
      setAuthProgressValue(0)
      return
    }

    const interval = setInterval(() => {
      setAuthProgressValue((prev) => {
        if (prev >= 90) {
          return 0
        }
        // Smaller increments for smoother animation
        return prev + 2
      })
    }, 50) // More frequent updates for smoother animation
    return () => clearInterval(interval)
  }, [isCheckingAuth])

  // Show loading screen while checking authentication
  if (isCheckingAuth || loginLoader) {
    return <ShootingStarLoading open={isCheckingAuth || loginLoader} />
  }

  return (
    <div className="flex flex-row w-full justify-center h-[100svh]">
      {/* <div className='w-6/12 ms-8 flex flex-row justify-center ' style={backgroundImage}>
        <div className='w-11/12'>
          <div className='h-[433px] w-[494px] md:w-[594px] bg-white mt-16'>
          </div>
          <div className='text-white sm:text-4xl md:text-4xl lg:text-5xl mt-8' style={{ fontWeight: "600" }}>
            Building your persona <br />lead gen assistant
          </div>
          <div className='mt-8' style={{ fontSize: 11.6, fontWeight: "500" }}>
            By signing up to the AgentX platform you understand and agree to our Terms and <br /> Conditions and Privacy Policy. This site is protected by Google reCAPTCHA to<br /> ensure you are not a bot. Learn more
          </div>
        </div>
      </div> */}
      <div className="w-11/12 flex flex-col items-center h-[95svh] ">
        <div className="w-full gap-3 h-[10%] flex flex-row items-end">
          <AppLogo
            height={50}
            width={150}
            maxWidth={200}
            alt="logo"
          />
          {/* <Image className='hidden md:flex' src="/agentXOrb.gif" style={{ height: "69px", width: "75px", resize: "contain" }} height={69} width={69} alt='*' /> */}
        </div>
        <div className="w-full  h-[80%] flex flex-row items-center justify-center">
          <div className="w-full">
            <div className="flex flex-col w-full items-center gap-4 pb-6">
              <Image
                src={'/assets/signinAvatar.png'}
                height={100}
                width={260}
                alt="avtr"
              />
              {/* Hide orb gif if agency has logo (for subaccounts) or if it's a custom domain */}
              {!agencyBranding?.logoUrl && isAssignxDomain && (
                <AgentXOrb
                  size={69}
                  alt="gif"
                />
              )}
            </div>

            {/* Code for phone input field */}
            <div className="flex flex-row items-center justify-center gap-2 w-full">
              <div className="flex flex-row items-center gap-2 border rounded-lg w-full sm:w-4/12 justify-between pe-4">
                <div className="w-[90%]">
                  <PhoneInput
                    className="outline-none bg-transparent focus:ring-0"
                    country={'us'} // Default country
                    onlyCountries={['us', 'ca', 'mx', 'au', 'gb','sv', 'ec']} // Allow US, Canada, Mexico, Australia, and UK
                    disableDropdown={false} // Enable dropdown to switch between US/CA/MX/AU/GB
                    countryCodeEditable={false}
                    disableCou ntryCode={false}
                    value={userPhoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder={
                      locationLoader
                        ? 'Loading location ...'
                        : 'Enter Phone Number'
                    }
                    disabled={loading} // Disable input if still loading
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userPhoneNumber) {
                        setEnterPressed(true)
                      }
                      // setShowVerifyPopup(true)
                    }}
                    style={{
                      borderRadius: '7px',
                      outline: 'none', // Ensure no outline on wrapper
                      boxShadow: 'none', // Remove any shadow
                    }}
                    inputStyle={{
                      width: '100%',
                      borderWidth: '0px',
                      backgroundColor: 'transparent',
                      paddingLeft: '60px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      height: '50px',
                      outline: 'none', // Remove outline on input
                      boxShadow: 'none', // Remove shadow as well
                    }}
                    buttonStyle={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none', // Ensure no outline on button
                    }}
                    dropdownStyle={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}
                    preferredCountries={['us', 'ca', 'mx', 'au', 'gb']}
                    defaultMask={locationLoader ? 'Loading...' : undefined}
                  />
                </div>
                {loginLoader ? (
                  <div className="flex flex-row justify-center">
                    <CircularProgress size={15} />
                  </div>
                ) : errorMessage ? (
                  <div className="text-center" style={styles.errmsg}>
                    {errorMessage}
                  </div>
                ) : (
                  <button
                    className="text-black bg-transparent border border-[#000000] rounded-full"
                    style={{ fontSize: 16, fontWeight: '600' }}
                    onClick={() => {
                      if (checkPhoneResponse === false) {
                        handleVerifyPopup()
                      }
                      // setShowVerifyPopup(true)
                      // handleVerifyPopup();
                    }}
                  >
                    <ArrowRight size={20} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            {/* Code for error messages */}
            <div className="flex flex-row items-center w-full justify-center mt-4">
              <div>
                {errorMessage ? (
                  <div className="text-center" style={styles.errmsg}>
                    {errorMessage}
                  </div>
                ) : (
                  <div>
                    {phoneNumberLoader ? (
                      <div className="text-center" style={styles.errmsg}>
                        Checking
                      </div>
                    ) : (
                      <div
                        style={{
                          ...styles.errmsg,
                          color:
                            checkPhoneResponse?.status === false
                              ? 'green'
                              : 'red',
                          height: '20px',
                        }}
                      >
                        {checkPhoneResponse && (
                          <div className="text-center">
                            {checkPhoneResponse === true
                              ? 'User not found'
                              : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex flex-row items-center justify-center gap-1 mt-[40px]"
              style={{ fontWeight: '500', fontSize: 15 }}
            >
              <div //onClick={() => setShowVerifyPopup(true)}
              >
                {`Don't have an account?`}
              </div>
              <Link
                className=""
                href={'/onboarding'}
                // onClick={() => {
                //   router.push("/onboarding");
                // }}
                style={{ fontWeight: 'bold', fontSize: 15 }}
              >
                Sign Up
              </Link>
            </div>

            {/* Login with calendar */}
            <div></div>
          </div>
        </div>

        <div
          className="mt-6 h-[10%] flex flex-row items-end justify-end w-full gap-2 overflow-auto flex-shrink-0 hidden sm:flex"
          style={{ fontWeight: '500', fontSize: 11.6 }}
        >
          <div className="flex-shrink-0">
            Copyrights @ 2026 {agencyBranding?.companyName || 'AssignX'}. All Rights Reserved.
          </div>
          {domainTypeDetermined && isAssignxDomain && !agencyBranding && (
            <>
              <button
                className="flex-shrink-0 outline-none"
                onClick={async () => {
                  if (typeof window !== 'undefined') {
                    const { termsUrl } = await getPolicyUrls()
                    window.open(termsUrl, '_blank')
                  }
                }}
              >
                | Terms & Conditions
              </button>
              <button
                className="flex-shrink-0 outline-none"
                onClick={async () => {
                  if (typeof window !== 'undefined') {
                    const { privacyUrl } = await getPolicyUrls()
                    window.open(privacyUrl, '_blank')
                  }
                }}
              >
                | Privacy Policy
              </button>
            </>
          )}
        </div>

        <div className="h-[10%]  w-full flex flex-col items-center justify-center sm:hidden">
          {domainTypeDetermined && isAssignxDomain && !agencyBranding && (
            <div
              className="mt-6 flex flex-row items-center justify-end gap-2 overflow-auto flex-shrink-0"
              style={{ fontWeight: '500', fontSize: 11.6 }}
            >
              <button
                className="flex-shrink-0 outline-none"
                onClick={async () => {
                  if (typeof window !== 'undefined') {
                    const { termsUrl } = await getPolicyUrls()
                    window.open(termsUrl, '_blank')
                  }
                }}
              >
                Terms & Conditions
              </button>
              <button
                className="flex-shrink-0 outline-none"
                onClick={async () => {
                  if (typeof window !== 'undefined') {
                    const { privacyUrl } = await getPolicyUrls()
                    window.open(privacyUrl, '_blank')
                  }
                }}
              >
                | Privacy Policy
              </button>
            </div>
          )}
          <div
            className="flex-shrink-0 text-center"
            style={{ fontWeight: '500', fontSize: 11.6 }}
          >
            Copyrights @ 2026 {agencyBranding?.companyName || 'AssignX'}. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* Modals code goes here */}
      <Modal
        open={showVerifyPopup}
        // onClose={() => setAddKYCQuestion(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
            padding: 0,
            margin: 0,
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-10/12 w-10/12" sx={styles.verifyPopup}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-end">
                <button
                  onClick={() => {
                    setShowVerifyPopup(false)
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
                style={{
                  fontSize: 26,
                  fontWeight: '700',
                }}
              >
                Verify phone number
              </div>
              <div
                className="mt-8"
                style={{ ...styles.inputStyle, color: '#00000060' }}
              >
                Enter code that was sent to number ending with *
                {userPhoneNumber.slice(-4)}.
              </div>

              <div
                className="mt-8 w-ful flex flex-row items-center gap-2 overflow-auto"
                style={{ display: 'flex', gap: '8px' }}
              >
                {Array.from({ length }).map((_, index) => (
                  <input
                    className=" focus:outline-none focus:ring-0"
                    key={index}
                    ref={(el) => (verifyInputRef.current[index] = el)}
                    autoFocus={index === 0}
                    type="tel"
                    inputMode="numeric"
                    // type="tel"
                    maxLength="1"
                    value={VerifyCode[index]}
                    onChange={(e) => handleVerifyInputChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    onKeyUp={(e) => {
                      // Check if the Enter key is pressed and all inputs are filled
                      if (
                        e.key === 'Enter' &&
                        VerifyCode.every((value) => value.trim() !== '')
                      ) {
                        handleVerifyCode()
                      }
                    }}
                    onPaste={handlePaste}
                    placeholder="-"
                    style={{
                      width: InnerWidth < 540 ? '40px' : '40px',
                      height: InnerWidth < 540 ? '40px' : '40px',
                      textAlign: 'center',
                      fontSize: InnerWidth < 540 ? 15 : 20,
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                    }}
                  />
                ))}
              </div>
              <div
                className="mt-8 flex flex-row items-center gap-1"
                style={styles.inputStyle}
              >
                {`Didn't receive code?`}
                {sendcodeLoader ? (
                  <CircularProgress size={17} />
                ) : (
                  <button
                    className="outline-none border-none text-brand-primary"
                    onClick={handleVerifyPopup}
                  >
                    Resend
                  </button>
                )}
              </div>

              <button
                className="text-white bg-brand-primary outline-none rounded-xl w-full mt-8"
                style={{ height: '50px' }}
                onClick={handleVerifyCode}
              >
                Continue
              </button>
            </div>
          </div>
        </Box>
      </Modal>

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
    </div>
  )
}

export default LoginComponent
