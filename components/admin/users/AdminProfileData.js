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
import { useHasPermission } from '@/contexts/PermissionContext'

import AdminBasicInfo from './AdminProfileData/AdminBasicInfo'
import AdminBilling from './AdminProfileData/AdminBilling'
import AdminPhoneNumber from './AdminProfileData/AdminPhoneNumber'
import AdminXbarServices from './AdminProfileData/AdminXbarServices'
import AdminSendFeedback from './AdminSendFeedback'

function AdminProfileData({ selectedUser, from, agencyUser = false }) {
  let searchParams = useSearchParams()
  const router = useRouter()

  // Check if logged-in user is an Invitee (team member)
  const [isInvitee, setIsInvitee] = useState(false)
  useEffect(() => {
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        setIsInvitee(userData.user?.userRole === 'Invitee')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }, [])

  // Permission checks for subaccount menu items (only for Invitee users when viewing from agency)
  const [hasPaymentPermission] = useHasPermission(
    isInvitee && agencyUser && from === 'subaccount' ? 'subaccount.payment.manage' : '',
    isInvitee && agencyUser && from === 'subaccount' ? selectedUser?.id : null
  )
  const [hasBillingPermission] = useHasPermission(
    isInvitee && agencyUser && from === 'subaccount' ? 'subaccount.billing.view' : '',
    isInvitee && agencyUser && from === 'subaccount' ? selectedUser?.id : null
  )
  const [hasPhoneNumbersPermission] = useHasPermission(
    isInvitee && agencyUser && from === 'subaccount' ? 'subaccount.phone_numbers.manage' : '',
    isInvitee && agencyUser && from === 'subaccount' ? selectedUser?.id : null
  )

  let allMenuItems = [
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
      heading: 'Bar Services',
      subHeading: 'Our version of the genius bar',
      icon: '/svgIcons/agentXIcon.svg',
      permissionKey: null, // No specific permission for this
    },
  ]

  // Filter menu items based on permissions when viewing from agency as Invitee
  const manuBar = React.useMemo(() => {
    if (!agencyUser || !isInvitee || from !== 'subaccount') {
      // For non-agency context or non-Invitee users, show all items
      return allMenuItems
    }

    // For Invitee users viewing from agency, filter based on permissions
    return allMenuItems.filter((item) => {
      if (!item.permissionKey) {
        return true // Always show items without permission keys
      }

      // Check permission based on permission key
      if (item.permissionKey === 'subaccount.payment.manage') {
        return hasPaymentPermission
      } else if (item.permissionKey === 'subaccount.billing.view') {
        return hasBillingPermission
      } else if (item.permissionKey === 'subaccount.phone_numbers.manage') {
        return hasPhoneNumbersPermission
      }

      return true // Default to showing if permission check is unclear
    })
  }, [agencyUser, isInvitee, from, hasPaymentPermission, hasBillingPermission, hasPhoneNumbersPermission])

  const [tabSelected, setTabSelected] = useState(1)
  const [selectedManu, setSelectedManu] = useState(null)

  // Update selectedManu when manuBar changes
  useEffect(() => {
    if (manuBar.length > 0) {
      const selectedItem = manuBar.find((item) => item.id === tabSelected)
      if (selectedItem) {
        setSelectedManu(selectedItem)
      } else {
        // If current tab is not available, default to first item
        setTabSelected(manuBar[0].id)
        setSelectedManu(manuBar[0])
      }
    }
  }, [manuBar, tabSelected])
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)

  const renderComponent = () => {
    // Check permission for the selected tab when viewing from agency as Invitee
    if (agencyUser && isInvitee && from === 'subaccount') {
      const selectedMenuItem = allMenuItems.find((item) => item.id === tabSelected)
      if (selectedMenuItem?.permissionKey) {
        let hasPermission = false
        if (selectedMenuItem.permissionKey === 'subaccount.payment.manage') {
          hasPermission = hasPaymentPermission
        } else if (selectedMenuItem.permissionKey === 'subaccount.billing.view') {
          hasPermission = hasBillingPermission
        } else if (selectedMenuItem.permissionKey === 'subaccount.phone_numbers.manage') {
          hasPermission = hasPhoneNumbersPermission
        }

        if (!hasPermission) {
          return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Access Denied</h2>
              <p>You do not have permission to access this section.</p>
            </div>
          )
        }
      }
    }

    switch (tabSelected) {
      case 1:
        return <AdminBasicInfo selectedUser={selectedUser} />
      case 2:
        // return <AdminBilling selectedUser={selectedUser} from={from} />;
        return (
          <div>
            {from === 'subaccount' ? (
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
            {from === 'subaccount' ? (
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
        if (from === 'subaccount') {
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
        className=" w-full flex flex-row justify-between items-center py-4 px-10 h-full"
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>My Account</div>
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
                  setTabSelected(item.id)
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
    // </Suspense>
  )
}

export default AdminProfileData
