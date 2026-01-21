'use client'

import {
  Alert,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material'
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InputAdornment from '@mui/material/InputAdornment'
import { CaretDown, CaretUp, Copy } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'

import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CallWorthyReviewsPopup from '@/components/dashboard/leads/CallWorthyReviewsPopup'
import { Scopes } from '@/components/dashboard/myagentX/Scopes'
import { Searchbar } from '@/components/general/MuiSearchBar'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { connectGmailAccount } from '@/components/pipeline/TempleteServices'
import { allIntegrations } from '@/constants/Constants'
import { generateOAuthState } from '@/utils/oauthState'
import { getAgencyCustomDomain } from '@/utils/getAgencyCustomDomain'
import { useUser } from '@/hooks/redux-hooks'
import getProfileDetails from '@/components/apis/GetProfile'
import SimpleUpgradeView from '@/components/common/SimpleUpgradeView'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { getStripe } from '@/lib/stripe'
import { TypographyH3 } from '@/lib/typography'
import StandardHeader from '@/components/common/StandardHeader'

function Page() {
  const [showKeysBox, setshowKeysBox] = useState(false)
  const [myKeys, setMyKeys] = useState([])
  const [keyLoader, setKeyLoader] = useState(false)
  const [genratekeyLoader, setGenrateeyLoader] = useState(false)
  const [genratekeyLoader2, setGenrateeyLoader2] = useState(false)
  const [showCopySnak, setShowCopySnak] = useState(null)

  //test

  const [showCallReviewPopup, setShowCallReviewPopup] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)

  const [search, setSearch] = useState('')
  const [integrations, setIntegrations] = useState(allIntegrations)

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false)

  // Google auth states
  const [googleAuthLoader, setGoogleAuthLoader] = useState(false)

  // Upgrade modal states
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)

  useEffect(() => {
    getMyApiKeys()
  }, [])

  useEffect(() => {
    if (search) {
      let searched = allIntegrations.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()),
      )
      setIntegrations(searched)
    } else {
      setIntegrations(allIntegrations)
    }
  }, [search])

  const getMyApiKeys = async () => {
    // //console.log;
    try {
      const data = localStorage.getItem('User')
      setKeyLoader(true)
      let u = JSON.parse(data)
      // //console.log;

      let path = Apis.myApiKeys
      // //console.log;

      const response = await axios.get(path, {
        headers: {
          Authorization: 'Bearer ' + u.token,
        },
      })

      if (response) {
        setKeyLoader(false)

        if (response.data.status) {
          setMyKeys(response.data.data)
        } else {}
      }
    } catch (e) {
      setKeyLoader(false)
    }
  }

  const genrateApiKey = async () => {
    try {
      const data = localStorage.getItem('User')

      let u = JSON.parse(data)
      // //console.log;

      let apidata = {
        email: u.email,
        name: u.name,
        phone: u.phone,
        farm: u.farm,
        brokerage: u.brokerage,
        averageTransactionPerYear: u.averageTransactionPerYear,
        agentService: u.agentService,
        areaOfFocus: u.areaOfFocus,
        userType: u.userType,
      }

      // return

      const response = await axios.post(Apis.genrateApiKey, apidata, {
        headers: {
          Authorization: 'Bearer ' + u.token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setGenrateeyLoader(false)
        setGenrateeyLoader2(false)

        if (response.data.status) {
          setShowCopySnak('Api key generated successfully')
          setMyKeys((prevKeys) => [...prevKeys, response.data.data])
        } else {
          setShowCopySnak(
            response?.data?.message || 'Failed to generate API key',
          )
        }
      }
    } catch (e) {
      setGenrateeyLoader2(false)
      setGenrateeyLoader(false)
      setShowCopySnak(e.message || 'Failed to generate API key')
    }
  }

  // const myKeys = [
  //   {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }, {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }, {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }
  // ]

  // funtion for mask keys

  const maskId = (id) => {
    const maskedId = id.slice(0, -4).replace(/./g, '*') + id.slice(-4)
    // //console.log;
    // //console.log;
    return maskedId
  }

  // Function to refresh user data after upgrade
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
        localStorage.setItem('User', JSON.stringify(updatedUserData))
        return true
      }
      return false
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return false
    }
  }

  // Check if user has API access
  const allowAPIAccess = reduxUser?.planCapabilities?.allowAPIAccess ?? reduxUser?.user?.planCapabilities?.allowAPIAccess
  const shouldShowAPIKeys = allowAPIAccess === true

  // Google OAuth handler
  const handleGoogleAuth = async () => {
    const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_ID
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_REDIRECT_URI

    // Get agency custom domain from API
    const { agencyId, customDomain, subaccountId } = await getAgencyCustomDomain()

    // Also check if current hostname is a custom domain or subdomain
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : null
    const isCustomDomain = currentHostname && 
      !currentHostname.includes('app.assignx.ai') && 
      !currentHostname.includes('dev.assignx.ai') &&
      !currentHostname.includes('localhost') &&
      !currentHostname.includes('127.0.0.1')

    // Always use current domain to avoid cross-domain redirects
    // If on custom domain, use it. If on dev/app.assignx.ai, use that instead of custom domain from DB
    // This ensures state is always generated and popup context is preserved
    const domainToUse = currentHostname

    // Generate state parameter (provider signal). Keep it even if agencyId is missing,
    // because middleware relies on `state.provider` to route the callback correctly.
    let stateParam = null
    if (domainToUse) {
      stateParam = generateOAuthState({
        agencyId,
        customDomain: domainToUse,
        provider: 'google',
        subaccountId: subaccountId, // Include subaccountId if user is a subaccount
        originalRedirectUri: null,
      })
    }

    const params = new URLSearchParams({
      client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: Scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    })

    // Add state parameter only if we have it (custom domain flow)
    if (stateParam) {
      params.set('state', stateParam)
    }

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` + params.toString()

    const popup = window.open(oauthUrl, '_blank', 'width=500,height=600')

    const listener = async (event) => {
      if (event.data?.type === 'google-auth-code') {
        window.removeEventListener('message', listener)

        try {
          setGoogleAuthLoader(true)
          const res = await fetch(
            `/api/google/exchange-token?code=${event.data.code}`,
          )
          const { tokens } = await res.json()

          if (tokens?.access_token) {
            const userInfoRes = await fetch(
              'https://www.googleapis.com/oauth2/v2/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              },
            )
            const userInfo = await userInfoRes.json()

            const googleLoginData = {
              ...tokens,
              ...userInfo,
            }

            let response = await connectGmailAccount(googleLoginData)
            setGoogleAuthLoader(false)

            if (response && response.data && response.data.status == true) {
              setShowCopySnak(response.data.message)
            } else {
              setShowCopySnak(
                response?.data?.message || 'Failed to connect Google account',
              )
            }
          }
        } catch (err) {
          console.error('Google OAuth error:', err)
          setGoogleAuthLoader(false)

          // Check if error has response with message
          if (err.response && err.response.data && err.response.data.message) {
            setShowCopySnak(err.response.data.message)
          } else {
            setShowCopySnak(
              'Failed to connect Google account. Please try again.',
            )
          }
        }
      }
    }

    window.addEventListener('message', listener)
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <AgentSelectSnackMessage
        isVisible={showCopySnak}
        hide={() => setShowCopySnak(null)}
        message={showCopySnak}
        type={SnackbarTypes.Success}
      />
      <StandardHeader
        title="Integration"
        showTasks={true}
      />

      {/* <div className='w-full flex flex-row items-center justify-end p-6'>
        {
          genratekeyLoader ? (
            <CircularProgress size={30} />
          ) : (
            <button
              onClick={() => {
                setGenrateeyLoader(true)
                genrateApiKey()
              }}
            >
              <div style={{ fontSize: 16, fontWeight: '500', color: '#7902df', textDecorationLine: 'underline' }}>
                Create New Api Key
              </div>
            </button>
          )
        }

      </div> */}
      <div
        className="w-full flex flex-col h-[80vh] mt-8"
        style={{ overflow: 'auto', scrollbarWidth: 'none' }}
      >
        <div className="w-full pl-5 pr-8">
          <div className="flex flex-row justify-between items-start">
            <Searchbar
              placeholder={'Search your favorite integrations'}
              value={search}
              setValue={(search) => {
                setSearch(search)
              }}
            />
            <div className="border w-4/12 p-3 relative">
              <button
                className="w-full"
                onClick={() => {
                  // Only open dropdown if user has API access
                  if (shouldShowAPIKeys) {
                    setshowKeysBox(!showKeysBox)
                  } else {
                    // Open upgrade modal if no access
                    setShowUpgradePlanModal(true)
                  }
                }}
              >
                <div className="flex flex-row items-center justify-between ">
                  <div> API Keys</div>
                  <div className="flex flex-row items-center gap-2">
                    {!shouldShowAPIKeys && (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium cursor-pointer text-brand-primary"
                        style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.1)' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowUpgradePlanModal(true)
                        }}
                      >
                        Upgrade
                      </span>
                    )}
                    {shouldShowAPIKeys && (
                      <>
                        {showKeysBox ? (
                          <CaretUp size={20} />
                        ) : (
                          <CaretDown size={20} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </button>

              {showKeysBox && shouldShowAPIKeys && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-4">
                  {/* {
                    myKeys.map((item, index) => {

                      const maskId = (id) => {
                        const maskedId = id.slice(0, -4).replace(/./g, '*') + id.slice(-4);
                        //console.log;
                        //console.log;
                        return maskedId;
                      }

                      return (
                        <button className='flex text-start flex-row items-center justify-between w-full mt-5' key={index}
                          onClick={() => {
                            navigator.clipboard
                              .writeText(item.key)
                              .then(() => setShowCopySnak(true))
                              .catch((err) =>
                                console.error("Failed to copy API key:", err)
                              );
                          }}
                        >
                          <div
                            className='w-[90%] truncate '
                            style={{
                              fontFamily: "'Courier New', monospace", // Monospace font
                              lineHeight: '1.5', // Line height for proper spacing
                              verticalAlign: 'middle', // Align text vertically
                              whiteSpace: 'nowrap', // Prevent wrapping of the text
                            }}
                          >
                            {maskId(item.key)}
                          </div>
                          <Copy size={20} color='#7920fd' />
                        </button>
                      )
                    })
                  } */}

                  {myKeys.length > 0 && (
                    <button
                      className="flex text-start flex-row items-center justify-between w-full mt-5"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(myKeys[myKeys.length - 1].key)
                          .then(() =>
                            setShowCopySnak('Api key copied successfully'),
                          )
                          .catch((err) =>
                            console.error('Failed to copy API key:', err),
                          )
                      }}
                    >
                      <div
                        className="w-[90%] truncate "
                        style={{
                          fontFamily: "'Courier New', monospace", // Monospace font
                          lineHeight: '1.5', // Line height for proper spacing
                          verticalAlign: 'middle', // Align text vertically
                          whiteSpace: 'nowrap', // Prevent wrapping of the text
                        }}
                      >
                        {/* {item.key} */}
                        {maskId(myKeys[myKeys.length - 1].key)}
                      </div>
                      <Copy size={20} color="hsl(var(--brand-primary))" />
                    </button>
                  )}

                  {genratekeyLoader2 ? (
                    <CircularProgress style={{ margin: 10 }} size={20} />
                  ) : (
                    <button
                      className="mt-5"
                      onClick={() => {
                        setGenrateeyLoader2(true)
                        genrateApiKey()
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: 'hsl(var(--brand-primary))',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {myKeys.length > 0 ? 'Refresh' : 'Generate'}
                      </div>
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* <div className='pl-10 flex flex-col items-center w-7/12' style={{ alignSelf: 'flex-start' }}>
          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/twiloImage.png'}
                height={47}
                width={47}
                alt='twilo'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  Twilio
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  Get a phone num from Twilio
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'
              onClick={() => { setShowCallReviewPopup(true) }}
            >
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>

          </div>

          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/calenderImage.png'}
                height={47}
                width={47}
                alt='calender'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  Calender
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  Connect to Cal.me, Calendly, smtp to google or apple calendar
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>
          </div>

          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>

            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/fubImage.png'}
                height={47}
                width={47}
                alt='fub'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  FUB
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  API Keys to send hot leads and booked meetings
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>
          </div>
        </div> */}

        <div className="flex flex-row w-full flex-wrap gap-3 p-5">
          {integrations.length > 0 ? (
            integrations.map((integration, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 flex flex-row gap-3 items-start border"
              >
                <img
                  src={integration.icon}
                  alt={integration.title}
                  className="w-12 h-12 object-contain"
                />
                <div className="flex flex-col gap-2">
                  <div style={{ fontSize: '1vw', fontWeight: '500' }}>
                    {integration.title}
                  </div>
                  <div
                    style={{ fontSize: '1vw', fontWeight: '500' }}
                    className="flex-wrap text-gray-600 w-[20vw]"
                  >
                    {integration.description}
                  </div>
                  <button
                    onClick={() => {
                      if (integration.title === 'Google') {
                        handleGoogleAuth()
                        return
                      }
                      // if (integration.title === "GHL") {
                      //   setShowCopySnak("Comming soon");
                      //   return;
                      // }
                      if (typeof window !== 'undefined') {
                        window.open(integration.url, '_blank')
                      }
                    }}
                    className="w-full bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                    disabled={
                      googleAuthLoader && integration.title === 'Google'
                    }
                  >
                    {googleAuthLoader && integration.title === 'Google' ? (
                      <>
                        <CircularProgress size={16} color="inherit" />
                        Connecting...
                      </>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-0 w-full items-center mt-10">
              <Image
                className="grayscale"
                height={220}
                width={340}
                alt="*"
                src={'/assets/noIntegrationIcon.png'}
              ></Image>
              <div>{`No Results Found`}</div>
              <div className="font-bold text-[22px] mt-2">{`Can't find what you're looking for.`}</div>

              <button
                className="w-[23wh] px-8 py-2 mt-4 rounded-md bg-brand-primary text-white text-[16px] font-meduim"
                onClick={() => {
                  window.open(
                    'https://zapier.com/apps/myagentx/integrations',
                    '_blank',
                  )
                }}
              >
                Search Here
              </button>
            </div>
          )}
        </div>

        <div></div>
      </div>

      {/* UpgradePlan Modal */}
      <Elements stripe={getStripe()}>
        <UpgradePlan
          open={showUpgradePlanModal}
          handleClose={async (upgradeResult) => {
            setShowUpgradePlanModal(false)
            if (upgradeResult) {
              await refreshUserData()
            }
          }}
          plan={null}
          currentFullPlan={reduxUser?.user?.plan || reduxUser?.plan}
          setSelectedPlan={() => {}}
        />
      </Elements>
    </div>
  )
}

export default Page
