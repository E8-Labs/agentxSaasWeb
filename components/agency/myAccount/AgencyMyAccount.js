'use client'

import { Button, Drawer } from '@mui/material'
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
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import {
  agencyCancellationAndRefundUrl,
  agencyPrivacyPolicyUrl,
  agencyTermsAndConditionUrl,
} from '@/constants/Constants'

import AgencyBarServices from './AgencyBarServices'
import AgencyBasicInfo from './AgencyBasicInfo'
import AgencyBilling from './AgencyBilling'
import AgencyInviteAgentX from './AgencyInviteAgentX'
import AgencyMyPhoneNumber from './AgencyMyPhoneNumber'
import AgencyPhoneNumbers from './AgencyPhoneNumbers'
import AgencyPlansPayments from './AgencyPlansPayments'
import AgencySendFeedback from './AgencySendFeedback'
import AgencySupport from './AgencySupport'

function AgencyMyAccount({ selectedAgency }) {
  let searchParams = useSearchParams()
  const router = useRouter()

  const [tabSelected, setTabSelected] = useState(2)

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
      heading: 'Phone Numbers List',
      subHeading: 'Manage agency global phone numbers',
      icon: '/svgIcons/call.svg',
    },
    {
      id: 5,
      heading: 'Terms & Conditions',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 6,
      heading: 'Privacy Policy',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
    {
      id: 7,
      heading: 'Cancellation & Refund',
      subHeading: '',
      icon: '/svgIcons/info.svg',
    },
  ]

  const [selectedManu, setSelectedManu] = useState(manuBar[tabSelected])
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab') // Get the value of 'tab'
    console.log('Value of tab is', tab)
    let number = Number(tab) || 2
    // //console.log;
    setTabSelected(number)
    if (!tab) {
      setParamsInSearchBar(2)
    }
  }, [])

  const setParamsInSearchBar = (index = 1) => {
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', index) // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/agency/dashboard/myAccount?${params.toString()}`)

    // //console.log;
  }

  const renderComponent = () => {
    // setTabSelected(selectedMenuId);

    switch (tabSelected) {
      case 1:
        return <AgencyBasicInfo selectedAgency={selectedAgency} />
      case 2:
        return <AgencyPlansPayments selectedAgency={selectedAgency} />
      case 3:
        return <BillingHistory selectedUser={selectedAgency} />
      case 4:
        return <AgencyPhoneNumbers selectedAgency={selectedAgency} />

      // case 3:
      //   return <AgencySupport />;
      // case 4:
      //   return <AgencySendFeedback />;
      // case 5:
      //   return <AgencyInviteAgentX />;
      // case 6:
      //   return <AgencyBarServices />;
      default:
        return <div>Please select an option.</div>
    }
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
        <div className="w-4/12 items-center flex flex-col pt-4 pr-2">
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
                  if (item.id === 5) {
                    window.open(agencyTermsAndConditionUrl, '_blank')
                    return
                  } else if (item.id === 6) {
                    window.open(agencyPrivacyPolicyUrl, '_blank')
                    return
                  } else if (item.id === 7) {
                    window.open(agencyCancellationAndRefundUrl, '_blank')
                    return
                  }
                  setTabSelected(item.id)
                  setParamsInSearchBar(item.id)
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
                      style={{ fontSize: 13, fontWeight: '500', color: '#000' }}
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
          className="w-full"
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

export default AgencyMyAccount
