'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

import DashboardSlider from '@/components/animations/DashboardSlider'
import SubAccountBarServices from '@/components/dashboard/subaccount/myAccount/SubAccountBarServices'
import SubAccountBilling from '@/components/dashboard/subaccount/myAccount/SubAccountBilling'
import SubAccountPlansAndPayments from '@/components/dashboard/subaccount/myAccount/SubAccountPlansAndPayments'
import BillingHistory from '@/components/myAccount/BillingHistory'
import TwilioTrustHub from '@/components/myAccount/TwilioTrustHub'

import AdminBasicInfo from './AdminProfileData/AdminBasicInfo'
import AdminBilling from './AdminProfileData/AdminBilling'
import AdminPhoneNumber from './AdminProfileData/AdminPhoneNumber'
import AdminXbarServices from './AdminProfileData/AdminXbarServices'
import AdminSendFeedback from './AdminSendFeedback'
import { TypographyH1, TypographyH3 } from '@/lib/typography'

function AdminProfileData({ selectedUser, from }) {
  let searchParams = useSearchParams()
  const router = useRouter()

  const [xbarTitle, setXbarTitle] = useState('X Bar Services')



  const [tabSelected, setTabSelected] = useState(1)

  let manuBar = []

  manuBar = [
    {
      id: 1,
      heading: 'Basic Information',
      subHeading: 'Manage personal information ',
      icon: '/otherAssets/profileCircle.png',
      permissionKey: null, // Basic info is always accessible
    },
    {
      id: 2,
      heading: 'Plans & Payment',
      subHeading: 'Manage your plans and payment method',
      icon: '/otherAssets/walletIcon.png',
      permissionKey: 'subaccount.payment.manage',
    },
    {
      id: 3,
      heading: 'Billing',
      subHeading: 'Manage your billing transactions',
      icon: '/otherAssets/billingIcon.png',
      permissionKey: 'subaccount.billing.view',
    },
    {
      id: 4,
      heading: 'Phone Numbers',
      subHeading: 'All agent phone numbers',
      icon: '/assets/unSelectedCallIcon.png',
      permissionKey: 'subaccount.phone_numbers.manage',
    },
    {
      id: 5,
      heading: 'Twilio Trust Hub',
      subHeading: 'Caller ID & compliance for trusted calls',
      icon: '/svgIcons/twilioHub.svg',
      permissionKey: 'subaccount.phone_numbers.manage', // Same key as for phone numbers since they do the same thing
    },
    {
      id: 6,
      heading: xbarTitle || 'Bar Services',
      subHeading: 'Our version of the genius bar',
      icon: '/svgIcons/agentXIcon.svg',
      permissionKey: null, // No specific permission for this
    },
  ]

  const [selectedManu, setSelectedManu] = useState(manuBar[tabSelected])


  useEffect(() => {
    getXbarTitle()
  }, [selectedManu])
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
  }


  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)

  // Check if the selectedUser is a subaccount
  const isSubaccount = selectedUser?.userRole === 'AgencySubAccount' || from === 'subaccount'



  const renderComponent = () => {
    // setTabSelected(selectedMenuId);

    switch (tabSelected) {
      case 1:
        return <AdminBasicInfo selectedUser={selectedUser} />
      case 2:
        // return <AdminBilling selectedUser={selectedUser} from={from} />;
        return (
          <div>
            {isSubaccount ? (
              <SubAccountPlansAndPayments
                selectedUser={selectedUser}
                hideBtns={true}
                agencyView={true}
              />
            ) : (
              <AdminBilling selectedUser={selectedUser} from={from} />
            )}
          </div>
        )
      case 3:
        // return <AdminBilling selectedUser={selectedUser} from={from} />;
        return (
          <div>
            {isSubaccount ? (
              <BillingHistory hideBtns={true} selectedUser={selectedUser} />
            ) : (
              <BillingHistory selectedUser={selectedUser} from={from} />
            )}
          </div>
        )
      case 4:
        return <AdminPhoneNumber selectedUser={selectedUser} />
      case 5:
        return <TwilioTrustHub selectedUser={selectedUser} />
      case 6:
        if (isSubaccount) {
          return <SubAccountBarServices selectedUser={selectedUser} />
        } else {
          return <AdminXbarServices selectedUser={selectedUser} />
        }

      default:
        return <div>Please select an option.</div>
    }
  }

  return (
    // <Suspense>
    // </Suspense>
    <div
      className="w-full flex flex-col items-center"
      style={{ overflow: 'hidden', height: '100vh' }}
    >
      {/* Slider code<div
                style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0
                }}>
                <DashboardSlider
                    needHelp={false} />
            </div> */}
      <div
        className=" w-full flex flex-row justify-between items-center py-2"
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <TypographyH3>
          My Account
        </TypographyH3>
      </div>
      <div className="w-12/12 h-full"></div>
      <div className="w-full flex flex-row item-center pl-4 h-full">
        <div
          className="w-4/12 items-center flex flex-col pt-4 pr-2 h-[85%] overflow-auto"
          style={{ scrollbarWidth: 'none' }}
        >
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
                  setTabSelected(index + 1)
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
                      style={{ fontSize: 15, fontWeight: '500', color: '#000' }}
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
          className="w-8/12 h-fu''"
          style={{
            overflow: 'auto',
            height: '90%',
            borderLeftWidth: 1,
            borderBottomColor: '#00000010',
          }}
        >
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default AdminProfileData
