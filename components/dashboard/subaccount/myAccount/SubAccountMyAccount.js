'use client'

import { Button, CircularProgress, Drawer } from '@mui/material'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

import BarServices from '@/components/myAccount/BarServices'
import BasicInfo from '@/components/myAccount/BasicInfo'
import Billing from '@/components/myAccount/Billing'
import BillingHistory from '@/components/myAccount/BillingHistory'
import InviteAgentX from '@/components/myAccount/InviteAgentX'
import MyPhoneNumber from '@/components/myAccount/MyPhoneNumber'
import SendFeedback from '@/components/myAccount/SendFeedback'
import Support from '@/components/myAccount/Support'
import TwilioTrustHub from '@/components/myAccount/TwilioTrustHub'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'

import SubAccountBarServices from './SubAccountBarServices'
import SubAccountBasicInfo from './SubAccountBasicInfo'
import SubAccountBilling from './SubAccountBilling'
import SubAccountInviteAgentX from './SubAccountInviteAgentX'
import SubAccountMyPhoneNumber from './SubAccountMyPhoneNumber'
import SubAccountPlansAndPayments from './SubAccountPlansAndPayments'
import SubAccountPrivacy from './SubAccountPrivacy'
import SubAccountSendFeedback from './SubAccountSendFeedback'
import SubAccountSupport from './SubAccountSupport'
import SubAccountTerms from './SubAccountTerms'
import SubAccountCancellationRefund from './SubAccountCancellationRefund'
import { UserRole } from '@/constants/UserRole'

function SubAccountMyAccount() {
  let searchParams = useSearchParams()
  const router = useRouter()

  // tabSelected now stores menu item ID instead of index
  const [tabSelected, setTabSelected] = useState(2) // Default to ID 2 (Plans & Payment)
  const [initialLoader, setInitialLoader] = useState(true)
  const [navBar, setNavBar] = useState([])
  const [xbarTitle, setXbarTitle] = useState('Bar Services') // Default title

  // Get Xbar title from branding
  useEffect(() => {
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
    
    // Listen for branding updates
    const handleBrandingUpdate = () => {
      getXbarTitle()
    }
    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

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
      icon: '/otherAssets/walletIcon.png',
    },
    {
      id: 4,
      heading: xbarTitle,
      subHeading: 'Our version of the genius bar',
      icon: '/assets/X.svg',
    },
    {
      id: 5,
      heading: 'My Phone Numbers',
      subHeading: 'All agent phone numbers',
      icon: '/assets/unSelectedCallIcon.png',
    },
    // {
    //   id: 6,
    //   heading: "Invite Agents",
    //   subHeading: "Get 60 credits ",
    //   icon: "/otherAssets/inviteAgentIcon.png",
    // },
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
      heading: 'Terms & Conditions',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 8,
      heading: 'Privacy Policy',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 9,
      heading: 'Twilio Trust Hub',
      subHeading: 'Caller ID & compliance for trusted calls',
      icon: '/svgIcons/twilioHub.svg',
    },
    {
      id: 10,
      heading: 'Cancellation & Refund',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
  ]

  const manuBar2 = [
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
      icon: '/otherAssets/walletIcon.png',
    },
    {
      id: 4,
      heading: xbarTitle,
      subHeading: 'Our version of the genius bar',
      icon: '/assets/X.svg',
    },
    {
      id: 5,
      heading: 'My Phone Numbers',
      subHeading: 'All agent phone numbers',
      icon: '/assets/unSelectedCallIcon.png',
    },
    // {
    //   id: 6,
    //   heading: "Invite Agents",
    //   subHeading: "Get 60 credits ",
    //   icon: "/otherAssets/inviteAgentIcon.png",
    // },
    {
      id: 6,
      heading: 'Twilio Trust Hub',
      subHeading: 'Caller ID & compliance for trusted calls',
      icon: '/svgIcons/twilioHub.svg',
    },
    {
      id: 7,
      heading: 'Terms & Conditions',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 8,
      heading: 'Privacy Policy',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 9,
      heading: 'Cancellation & Refund',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
  ]

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)
  const [selectedUserData, setSelectedUSerData] = useState(null)

  // Function to update URL parameters with menu ID
  const setParamsInSearchBar = (menuId = 2) => {
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', menuId.toString()) // Set or update the 'tab' parameter with menu ID

    // Push the updated URL
    router.push(`/dashboard/myAccount?${params.toString()}`)
  }

  //load the local storage data
  useEffect(() => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const Data = JSON.parse(localData)
      const D = Data.user
      console.log(
        `user role is ${D.userRole} and allow twilio status is ${D.allowSubaccountTwilio}`,
      )
      // Update menu arrays with current xbar title
      const updatedManuBar = manuBar.map(item => 
        item.id === 4 ? { ...item, heading: xbarTitle } : item
      )
      const updatedManuBar2 = manuBar2.map(item => 
        item.id === 4 ? { ...item, heading: xbarTitle } : item
      )
      
      if (
        D.userRole === UserRole.AgencySubAccount &&
        D.allowSubaccountTwilio === false
      ) {
        setNavBar(updatedManuBar2)
      } else {
        setNavBar(updatedManuBar)
      }
      setInitialLoader(false)
    } else {
      setInitialLoader(false)
      console.log('couldNotFetch local data')
    }
    // console.log("Test check fail")
  }, [xbarTitle])

  useEffect(() => {
    const tab = searchParams.get('tab') // Get the value of 'tab'
    const userData = localStorage.getItem('User')
    if (userData) {
      const d = JSON.parse(userData)
      setSelectedUSerData(d.user)
    }

    // Find menu item by ID from URL param, validate it exists in current navBar
    if (tab) {
      const tabId = Number(tab)
      // Check if this ID exists in the current navBar (will be set after navBar is populated)
      // We'll validate this in a separate effect that runs after navBar is set
      setTabSelected(tabId)
    } else {
      // Default to ID 2 (Plans & Payment)
      setTabSelected(2)
      setParamsInSearchBar(2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Validate tabSelected exists in navBar after navBar is set
  useEffect(() => {
    if (navBar.length > 0 && tabSelected) {
      const menuItemExists = navBar.find((item) => item.id === tabSelected)
      if (!menuItemExists) {
        // If selected tab doesn't exist in current navBar, default to ID 2
        const defaultId = 2
        setTabSelected(defaultId)
        setParamsInSearchBar(defaultId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navBar, tabSelected])

  const renderComponent = () => {
    // Switch on menu item ID instead of index
    switch (tabSelected) {
      case 1: // Basic Information
        return <SubAccountBasicInfo />
      case 2: // Plans & Payment
        return (
          <SubAccountPlansAndPayments
          // selectedUser={selectedUserData}
          />
        )
      case 3: // Billing
        return <BillingHistory selectedUser={selectedUserData} />
      case 4: // Bar Services
        return <SubAccountBarServices selectedUser={selectedUserData} />
      case 5: // My Phone Numbers
        return <SubAccountMyPhoneNumber />
      case 6: // Invite Agents (if enabled)
      return <TwilioTrustHub />
      case 7: // Terms & Conditions
        return <SubAccountTerms />
      case 8: // Privacy Policy
        return <SubAccountPrivacy />
      case 9: // Cancellation & Refund
        return <SubAccountCancellationRefund />
      default:
        return <div>Please select an option.</div>
    }
  }

  const handleTabSelect = async (item) => {
    // For all menu items, set the selected tab using menu ID to display in the right panel
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

      <div className="w-full flex flex-row item-center pl-4">
        {initialLoader ? (
          <div className="w-4/12 flex flex-row items-center justify-center">
            <CircularProgress />
          </div>
        ) : (
          <div className="w-4/12 items-center flex flex-col pt-4 pr-2 overflow-y-auto h-[90%] pb-22">
            {navBar.map((item, index) => (
              <div key={item.id} className="w-full">
                <button
                  className="w-full outline-none"
                  style={{
                    textTransform: 'none', // Prevents uppercase transformation
                    fontWeight: 'normal', // Optional: Adjust the font weight
                  }}
                  onClick={() => {
                    handleTabSelect(item)
                  }}
                >
                  <div
                    className="p-4 rounded-lg flex flex-row gap-2 items-start mt-4 w-full"
                    style={{
                      backgroundColor:
                        item.id === tabSelected ? 'hsl(var(--brand-primary) / 0.1)' : 'transparent',
                    }}
                  >
                    <Image src={item.icon} height={24} width={24} alt="icon" />
                    <div
                      className="flex flex-col gap-1 items-start"
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: '#000',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.heading}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: '#000',
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
        )}

        <div
          className="w-8/12 "
          style={{
            overflow: 'auto',
            height: '92vh',
            borderLeftWidth: 1,
            borderBottomColor: '#00000010',
          }}
        >
          {renderComponent()}
        </div>
      </div>
    </div>
    // </Suspense>
  )
}

export default SubAccountMyAccount
