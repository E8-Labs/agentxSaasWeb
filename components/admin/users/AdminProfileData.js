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
import CloseBtn from '@/components/globalExtras/CloseBtn'
import DelAdminUser from '@/components/onboarding/extras/DelAdminUser'
import AdminGetProfileDetails from '../AdminGetProfileDetails'
import { CircularProgress } from '@mui/material'
import Apis from '@/components/apis/Apis'
import axios from 'axios'

import AdminBasicInfo from './AdminProfileData/AdminBasicInfo'
import AdminBilling from './AdminProfileData/AdminBilling'
import AdminPhoneNumber from './AdminProfileData/AdminPhoneNumber'
import AdminXbarServices from './AdminProfileData/AdminXbarServices'
import AdminSendFeedback from './AdminSendFeedback'
import { TypographyH1, TypographyH3 } from '@/lib/typography'
import { getPolicyUrls } from '@/utils/getPolicyUrls'

function AdminProfileData({ selectedUser, from, agencyUser = false, handleDel, handlePauseUser, handleClose, isAgencyView = false, embedded = false }) {
  let searchParams = useSearchParams()
  const router = useRouter()

  console.log('from passed in AdminProfileData is', from)

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AdminProfileData.js:25', message: 'AdminProfileData props', data: { agencyUser, from, hasHandleClose: !!handleClose, hasHandleDel: !!handleDel, hasHandlePauseUser: !!handlePauseUser, selectedUserId: selectedUser?.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'L' }) }).catch(() => { });
  }, [agencyUser, from, handleClose, handleDel, handlePauseUser, selectedUser?.id])
  // #endregion

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
  const [xbarTitle, setXbarTitle] = useState('X Bar Services')
  const [tabSelected, setTabSelected] = useState(1)
  const [selectedManu, setSelectedManu] = useState(null)
  const [user, setUser] = useState(null)
  const [pauseLoader, setPauseLoader] = useState(false)
  const [delLoader, setDelLoader] = useState(false)
  const [showPauseConfirmationPopup, setShowPauseConfirmationPopup] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)


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
      heading: xbarTitle || 'Bar Services',
      subHeading: 'Our version of the genius bar',
      icon: '/svgIcons/agentXIcon.svg',
      permissionKey: null, // No specific permission for this
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
  }, [agencyUser, isInvitee, from, hasPaymentPermission, hasBillingPermission, hasPhoneNumbersPermission, xbarTitle])


  // Fetch user details
  useEffect(() => {
    const getData = async () => {
      if (selectedUser?.id) {
        let d = await AdminGetProfileDetails(selectedUser.id)
        if (d) {
          setUser(d)
        }
      }
    }
    getData()
  }, [selectedUser])

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

  //manu click function
  const handleTabSelect = async (item, index) => {
    const { termsUrl, privacyUrl, cancellationUrl } = await getPolicyUrls(selectedUser || null);

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
  }

  // Handle pause user
  const handlePause = async () => {
    setPauseLoader(true)
    try {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        let apidata = {
          userId: selectedUser.id,
        }

        const response = await axios.post(Apis.pauseProfile, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
            'Content-Type': 'application/json',
          },
        })

        if (response) {
          if (response.data.status === true) {
            if (selectedUser) {
              selectedUser.profile_status = selectedUser.profile_status === 'paused' ? 'active' : 'paused'
            }
            setPauseLoader(false)
            setShowPauseConfirmationPopup(false)
            // Refresh user data
            if (selectedUser?.id) {
              const refreshedData = await AdminGetProfileDetails(selectedUser.id)
              if (refreshedData) {
                setUser(refreshedData)
              }
            }
            // Call callback if provided
            if (handlePauseUser) {
              handlePauseUser()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error pausing user:', error)
      setPauseLoader(false)
    }
  }

  // Handle delete user
  const handleDelete = async () => {
    setDelLoader(true)
    try {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        let apidata = {
          userId: selectedUser.id,
        }

        const response = await axios.post(Apis.deleteProfile, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
            'Content-Type': 'application/json',
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            setDelLoader(false)
            setShowDeleteModal(false)
            // Call callback if provided
            if (handleDel) {
              handleDel()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setDelLoader(false)
    }
  }

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)

  // Check if the selectedUser is a subaccount
  const isSubaccount = selectedUser?.userRole === 'AgencySubAccount' || from === 'subaccount'



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
        return <AdminBasicInfo selectedUser={selectedUser} isAgencyView={isAgencyView} />
      case 2:
        // return <AdminBilling selectedUser={selectedUser} from={from} />;
        return (
          <div>
            {isSubaccount ? (
              <SubAccountPlansAndPayments
                selectedUser={selectedUser}
                hideBtns={true}
                agencyView={true}
                isAgencyView={isAgencyView}
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

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AdminProfileData.js:322', message: 'AdminProfileData render', data: { agencyUser, from, hasHandleClose: !!handleClose, hasHandleDel: !!handleDel, hasHandlePauseUser: !!handlePauseUser, selectedUserId: selectedUser?.id, willShowButtons: agencyUser }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'M' }) }).catch(() => { });
  }, [])
  // #endregion

  return (
    // <Suspense>
    // </Suspense>
    <div
      className={embedded ? 'w-full flex flex-col items-center h-[100vh]' : 'w-full flex flex-col items-center h-[100vh]'}
      style={{
        overflow: 'hidden',
        // height: embedded ? '100%' : ''
      }}
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
        className=" w-full flex flex-row justify-between items-center py-2 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <TypographyH3>
          My Account
        </TypographyH3>
      </div>
      <div className={`w-12/12 ${(isAgencyView || from === "admin") ? 'h-[calc(100svh-25svh)]' : 'h-[calc(100vh-4rem)]'} flex flex-row items-stretch pl-2 w-full`}>
        <div
          className={`w-4/12 ${(isAgencyView || from === "admin") ? 'h-[calc(100svh-25svh)]' : 'h-[calc(100vh-4rem)]'} flex flex-col items-center pr-2 overflow-y-auto`}
          style={{
            borderRightWidth: 1,
            borderBottomColor: '#00000010',
            scrollbarWidth: 'thin',
          }}
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
                  // setTabSelected(item.id)
                  handleTabSelect(item, index)
                }}
              >
                <div
                  className="p-4 rounded-lg flex flex-row gap-2 items-start w-full mt-4"
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
          className={`w-8/12 ${(isAgencyView || from === "admin") ? 'h-[calc(100svh-25svh)]' : 'h-[calc(100vh-4rem)]'} overflow-y-auto`}
        >
          {renderComponent()}
        </div>
      </div>

      {/* Pause Confirmation Modal */}
      {showPauseConfirmationPopup && (
        <DelAdminUser
          showPauseModal={showPauseConfirmationPopup}
          handleClosePauseModal={() => {
            setShowPauseConfirmationPopup(false)
          }}
          handlePaueUser={handlePause}
          pauseLoader={pauseLoader}
          selectedUser={user || selectedUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DelAdminUser
          showDeleteModal={showDeleteModal}
          handleClose={() => {
            setShowDeleteModal(false)
          }}
          handleDeleteUser={handleDelete}
          delLoader={delLoader}
          selectedUser={user || selectedUser}
        />
      )}
    </div>
  );
}

export default AdminProfileData
