'use client'

import { Button, Drawer } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'

import SubAccountPlansAndPayments from '@/components/dashboard/subaccount/myAccount/SubAccountPlansAndPayments'
import MyPhoneNumber from '@/components/myAccount/MyPhoneNumber'
import { isSubaccountTeamMember } from '@/constants/teamTypes/TeamTypes'
import { getPolicyUrls } from '@/utils/getPolicyUrls'

import { getUserLocalData } from '../constants/constants'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import BarServices from './BarServices'
import BasicInfo from './BasicInfo'
import Billing from './Billing'
import BillingHistory from './BillingHistory'
import InviteAgentX from './InviteAgentX'
import NewBilling from './NewBilling'
import SendFeedback from './SendFeedback'
import Support from './Support'
import TwilioTrustHub from './TwilioTrustHub'

function MyAccount() {
  let searchParams = useSearchParams()
  const router = useRouter()

  const [tabSelected, setTabSelected] = useState(6)
  const [xbarTitle, setXbarTitle] = useState('Bar Services') // Default title

  // Get Xbar title from branding
  useEffect(() => {
    // Fetch branding from API and update xbar title
    const fetchBrandingAndUpdateTitle = async () => {
      try {
        const localData = localStorage.getItem('User')
        let authToken = null

        if (localData) {
          const userData = JSON.parse(localData)
          authToken = userData.token
        }

        if (authToken) {
          try {
            const response = await axios.get(Apis.getAgencyBranding, {
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (response?.data?.status === true && response?.data?.data?.branding) {
              const branding = response.data.data.branding
              
              // Update localStorage with fresh branding data
              localStorage.setItem('agencyBranding', JSON.stringify(branding))
              
              // Update xbar title if available
              if (branding?.xbarTitle) {
                console.log('✅ [MyAccount] Fetched xbarTitle from API:', branding.xbarTitle)
                setXbarTitle(branding.xbarTitle)
                return
              }
            }
          } catch (error) {
            console.log('⚠️ [MyAccount] Error fetching branding from API:', error)
            // Fall through to localStorage check
          }
        }
      } catch (error) {
        console.log('❌ [MyAccount] Error in fetchBrandingAndUpdateTitle:', error)
      }
      
      // Fallback: Get Xbar title from localStorage
      const getXbarTitle = () => {
        try {
          const storedBranding = localStorage.getItem('agencyBranding')
          if (storedBranding) {
            const branding = JSON.parse(storedBranding)
            if (branding?.xbarTitle) {
              setXbarTitle(branding.xbarTitle)
              return
            }
          }
          // Fallback: check user data
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            const branding = parsedUser?.user?.agencyBranding || parsedUser?.agencyBranding
            if (branding?.xbarTitle) {
              setXbarTitle(branding.xbarTitle)
              return
            }
          }
        } catch (error) {
          console.log('Error getting xbar title from branding:', error)
        }
        // Default title
        setXbarTitle('Bar Services')
      }
      
      getXbarTitle()
    }
    
    // Fetch branding on mount
    fetchBrandingAndUpdateTitle()
    
    // Listen for branding updates
    const handleBrandingUpdate = (event) => {
      if (event?.detail?.xbarTitle) {
        console.log('✅ [MyAccount] Setting xbarTitle from event:', event.detail.xbarTitle)
        setXbarTitle(event.detail.xbarTitle)
        // Also update localStorage
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            const branding = JSON.parse(storedBranding)
            const updatedBranding = { ...branding, xbarTitle: event.detail.xbarTitle }
            localStorage.setItem('agencyBranding', JSON.stringify(updatedBranding))
          } catch (error) {
            console.error('Error updating localStorage from event:', error)
          }
        }
      } else {
        // Fallback: re-fetch from localStorage
        fetchBrandingAndUpdateTitle()
      }
    }
    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  // Create menu bar dynamically with current xbar title
  const manuBar = [
    {
      id: 1,
      heading: 'Basic Information',
      subHeading: 'Manage personal information ',
      icon: '/otherAssets/profileCircle.png',
    },
    {
      id: 2,
      heading: 'Plans & Payment',
      subHeading: 'Manage your plans and payment method ',
      icon: '/otherAssets/walletIcon.png',
    },
    {
      id: 3,
      heading: 'Billing',
      subHeading: 'Manage your billing transactions',
      icon: '/otherAssets/billingIcon.png',
    },
    {
      id: 4,
      heading: xbarTitle,
      subHeading: 'Our version of the genius bar',
      icon: '/svgIcons/agentXIcon.svg',
    },
    {
      id: 5,
      heading: 'My Phone Numbers',
      subHeading: 'All agent phone numbers',
      icon: '/assets/unSelectedCallIcon.png',
    },
    {
      id: 6,
      heading: 'Invite Agents',
      subHeading: 'Get 60 credits ',
      icon: '/otherAssets/inviteAgentIcon.png',
    },
    // {
    //   id: 6,
    //   heading: "Support",
    //   subHeading: "Get in touch with our team and get help",
    //   icon: "/otherAssets/headPhoneIcon.png",
    // },
    // {
    //   id: 7,
    //   heading: "Send Feedback",
    //   subHeading: "Report bugs, new features and more",
    //   icon: "/otherAssets/feedbackIcon.png",
    // },
    {
      id: 7,
      heading: 'Twilio Trust Hub',
      subHeading: 'Caller ID & compliance for trusted calls',
      icon: '/svgIcons/twilioHub.svg',
    },
    {
      id: 8,
      heading: 'Terms & Conditions',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 9,
      heading: 'Privacy Policy',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 10,
      heading: 'Cancellation & Refund',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
  ]

  const [selectedManu, setSelectedManu] = useState(null)
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)
  const [userLocalData, setUserLocalData] = useState(null)
  //select the invite teams by default
  useEffect(() => {
    const data = getUserLocalData()
    setUserLocalData(data.user)

    const tab = searchParams.get('tab')
    const number = Number(tab)

    const exists = manuBar.find((item) => item.id === number)
    if (exists) {
      setTabSelected(number)
      setSelectedManu(exists)
    } else {
      setTabSelected(6) // Default to Invite Agents
      setParamsInSearchBar(6)
      setSelectedManu(manuBar.find(item => item.id === 6))
      // console.log("Setting the tab value");
    }
  }, [xbarTitle])

  const setParamsInSearchBar = (index = 1) => {
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', index) // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/dashboard/myAccount?${params.toString()}`)

    // //console.log;
  }

  const renderComponent = () => {
    // setTabSelected(selectedMenuId);

    switch (tabSelected) {
      case 1:
        return <BasicInfo />
      case 2:
        if (isSubaccountTeamMember(userLocalData)) {
          return <SubAccountPlansAndPayments />
        } else {
          return <NewBilling />
        }
        return <NewBilling />
      case 3:
        return <BillingHistory />
      case 4:
        return <BarServices />
      case 5:
        return <MyPhoneNumber />
      case 6:
        return <InviteAgentX />
      case 7:
        return <TwilioTrustHub />
      default:
        return <div>Please select an option.</div>
    }
  }

  const handleTabSelect = (item, index) => {
    const { termsUrl, privacyUrl, cancellationUrl } = getPolicyUrls()
    
    if (item.id === 8) {
      window.open(termsUrl, '_blank')
      return
    } else if (item.id === 9) {
      window.open(privacyUrl, '_blank')
      return
    } else if (item.id === 10) {
      window.open(cancellationUrl, '_blank')
      return
    }
    console.log('Index is', index)
    setTabSelected(item.id)
    setParamsInSearchBar(item.id)
  }

  return (
    // <Suspense>
    <div
      className="w-full flex flex-col items-center"
      style={{ overflow: 'hidden', height: '100vh' }}
    >
      <div
        className=" w-full flex flex-row justify-between items-center py-4 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>My Account</div>

        <div className="flex flex-col">
          <NotficationsDrawer />
        </div>
      </div>

      <div className="w-full flex flex-row item-center pl-4 h-[100%]">
        <div className="w-3/12 items-center flex flex-col pt-4 pr-2 overflow-y-auto h-[90%] pb-22">
          {manuBar.map((item, index) => (
            <div key={item.id} className="w-full">
              <button
                className="w-full outline-none"
                style={{
                  textTransform: 'none', // Prevents uppercase transformation
                  fontWeight: 'normal', // Optional: Adjust the font weight
                }}
                onClick={() => {
                  //   setSelectedManu(index + 1);
                  handleTabSelect(item, index)
                }}
              >
                <div
                  className="p-4 rounded-lg flex flex-row gap-2 items-start mt-4 w-full"
                  style={{
                    backgroundColor:
                      index === tabSelected - 1 ? 'hsl(var(--brand-primary) / 0.1)' : 'transparent',
                  }}
                >
                  <Image src={item.icon} height={24} width={24} alt="icon" />
                  <div
                    className="flex flex-col gap-1 items-start text-start"
                    // style={{
                    //   whiteSpace: "nowrap",
                    //   overflow: "hidden",
                    //   textOverflow: "ellipsis",
                    // }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: '#000',
                        textAlign: 'left',
                      }}
                    >
                      {item.heading}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: '#000',
                        textAlign: 'left',
                      }}
                    >
                      {item.subHeading}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div
          className="w-9/12 "
          style={{
            overflow: 'auto',
            height: '92vh',
            borderLeftWidth: 1,
            borderBottomColor: '#00000012',
          }}
        >
          {renderComponent()}
        </div>
      </div>
    </div>
    // </Suspense>
  )
}

export default MyAccount
