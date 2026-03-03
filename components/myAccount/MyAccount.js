'use client'

import { Button, Drawer, CircularProgress } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState, useMemo } from 'react'

import Apis from '@/components/apis/Apis'
import { usePermission } from '@/contexts/PermissionContext'

import SubAccountPlansAndPayments from '@/components/dashboard/subaccount/myAccount/SubAccountPlansAndPayments'
import MyPhoneNumber from '@/components/myAccount/MyPhoneNumber'
import { isSubaccountTeamMember } from '@/constants/teamTypes/TeamTypes'
import { getPolicyUrls } from '@/utils/getPolicyUrls'

import { getUserLocalData } from '../constants/constants'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import StandardHeader from '../common/StandardHeader'
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

  // Permission checking state for Invitee users
  const permissionContext = usePermission()
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  const [menuPermissions, setMenuPermissions] = useState({})
  const [userRole, setUserRole] = useState(null)
  const [isInvitee, setIsInvitee] = useState(false)

  // Get user role to check if they're an Invitee
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('User')
      if (localData) {
        try {
          const userData = JSON.parse(localData)
          const role = userData.user?.userRole || userData.userRole
          setUserRole(role)
          setIsInvitee(role === 'Invitee')
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
  }, [])

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
                setXbarTitle(branding.xbarTitle)
                return
              }
            }
          } catch (error) {}
        }
      } catch (error) {}
      
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
        } catch (error) {}
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
  // Memoize to prevent unnecessary re-renders
  const manuBar = useMemo(() => [
    {
      id: 1,
      heading: 'Basic Information',
      subHeading: 'Manage personal information ',
      icon: '/otherAssets/profileCircle.png',
      permissionKey: null, // Always available
    },
    {
      id: 2,
      heading: 'Plans & Payment',
      subHeading: 'Manage your plans and payment method ',
      icon: '/otherAssets/walletIcon.png',
      permissionKey: 'agentx.payment.manage',
    },
    {
      id: 3,
      heading: 'Billing',
      subHeading: 'Manage your billing transactions',
      icon: '/otherAssets/billingIcon.png',
      permissionKey: 'agentx.billing.view',
    },
    {
      id: 4,
      heading: xbarTitle,
      subHeading: 'Our version of the genius bar',
      icon: '/svgIcons/agentXIcon.svg',
      permissionKey: null, // Always available
    },
    {
      id: 5,
      heading: 'My Phone Numbers',
      subHeading: 'All agent phone numbers',
      icon: '/assets/unSelectedCallIcon.png',
      permissionKey: 'agentx.phone_numbers.manage',
    },
    {
      id: 6,
      heading: 'Invite Agents',
      subHeading: 'Get 60 credits ',
      icon: '/otherAssets/inviteAgentIcon.png',
      permissionKey: 'agentx.teams.manage',
    },
    {
      id: 7,
      heading: 'Twilio Trust Hub',
      subHeading: 'Caller ID & compliance for trusted calls',
      icon: '/svgIcons/twilioHub.svg',
      permissionKey: 'agentx.phone_numbers.manage', // Same as phone numbers
    },
    {
      id: 8,
      heading: 'Terms & Conditions',
      subHeading: '',
      icon: '/svgIcons/info.svg',
      permissionKey: null, // Always available (terms/privacy are public)
    },
    {
      id: 9,
      heading: 'Privacy Policy',
      subHeading: '',
      icon: '/svgIcons/info.svg',
      permissionKey: null, // Always available
    },
    {
      id: 10,
      heading: 'Cancellation & Refund',
      subHeading: '',
      icon: '/svgIcons/info.svg',
      permissionKey: null, // Always available
    },
  ], [xbarTitle])

  // Pre-check all permissions for Invitee users to prevent flicker
  useEffect(() => {
    if (!isInvitee || !permissionContext) {
      // Non-Invitee users have all permissions, or no permission context
      setPermissionsLoaded(true)
      return
    }
    
    const checkAllPermissions = async () => {
      const permissions = {}
      const permissionChecks = manuBar.map(async (item) => {
        try {
          if (item.permissionKey) {
            const hasAccess = await permissionContext.hasPermission(item.permissionKey)
            permissions[item.id] = hasAccess
          } else {
            // Items without permission keys are always accessible
            permissions[item.id] = true
          }
        } catch (error) {
          console.error('[MyAccount][Permissions] Error checking item', {
            id: item.id,
            name: item.heading,
            permissionKey: item.permissionKey,
            error: error?.message,
          })
          permissions[item.id] = false
        }
      })
      
      await Promise.all(permissionChecks)
      setMenuPermissions(permissions)
      setPermissionsLoaded(true)
    }
    
    checkAllPermissions().catch((error) => {
      console.error('[MyAccount][Permissions] Error in checkAllPermissions', error)
      setPermissionsLoaded(true)
    })
  }, [isInvitee, permissionContext, manuBar])

  // Filter menu items based on permissions for Invitee users
  const accessibleMenuItems = useMemo(() => {
    if (!isInvitee || !permissionsLoaded) {
      // For non-Invitee users or while loading, show all items
      return manuBar
    }
    
    // Filter items based on pre-checked permissions
    return manuBar.filter((item) => {
      // Items without permission keys are always accessible
      if (!item.permissionKey) {
        return true
      }
      // Check if user has permission for this item
      return menuPermissions[item.id] === true
    })
  }, [isInvitee, permissionsLoaded, manuBar, menuPermissions])

  const [selectedManu, setSelectedManu] = useState(null)
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)
  const [userLocalData, setUserLocalData] = useState(null)
  
  //select the invite teams by default
  useEffect(() => {
    const data = getUserLocalData()
    setUserLocalData(data.user)

    const tab = searchParams.get('tab')
    const number = Number(tab)

    // Use accessibleMenuItems instead of manuBar to check if tab exists
    const exists = accessibleMenuItems.find((item) => item.id === number)
    if (exists) {
      setTabSelected(number)
      setSelectedManu(exists)
    } else {
      // Find first accessible menu item, or default to Basic Information (id: 1)
      const firstAccessible = accessibleMenuItems.find(item => item.id === 1) || accessibleMenuItems[0]
      if (firstAccessible) {
        setTabSelected(firstAccessible.id)
        setParamsInSearchBar(firstAccessible.id)
        setSelectedManu(firstAccessible)
      }
    }
  }, [xbarTitle, accessibleMenuItems])

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

  const handleTabSelect = async (item, index) => {
    const { termsUrl, privacyUrl, cancellationUrl } = await getPolicyUrls()

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
    setTabSelected(item.id)
    setParamsInSearchBar(item.id)
  }

  return (
    // <Suspense>
    // </Suspense>
    <div
      className="w-full flex flex-col items-center"
      style={{ overflow: 'hidden', height: '100vh' }}
    >
      <StandardHeader title="My Account" showTasks={true} />
      <div className="w-full flex flex-row item-center pl-4 h-[100%] bg-white">
        <div className="w-3/12 items-center flex flex-col pt-4 pr-2 overflow-y-auto h-[90%] pb-22">
          {!permissionsLoaded && isInvitee ? (
            // Show loading state while checking permissions
            <div className="w-full flex flex-col items-center justify-center py-8">
              <CircularProgress size={24} />
            </div>
          ) : (
            accessibleMenuItems.map((item, index) => {
              // Find the index in accessibleMenuItems for highlighting
              const isSelected = item.id === tabSelected
              
              return (
                <div key={item.id} className="w-full">
                  <button
                    className="w-full outline-none"
                    style={{
                      textTransform: 'none', // Prevents uppercase transformation
                      fontWeight: 'normal', // Optional: Adjust the font weight
                    }}
                    onClick={async () => {
                      await handleTabSelect(item, index)
                    }}
                  >
                    <div
                      className="p-4 rounded-lg flex flex-row gap-2 items-start mt-4 w-full"
                      style={{
                        backgroundColor:
                          isSelected ? 'hsl(var(--brand-primary) / 0.1)' : 'transparent',
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
              )
            })
          )}
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
  );
}

export default MyAccount
