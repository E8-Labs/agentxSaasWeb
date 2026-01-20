import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import getProfileDetails from '@/components/apis/GetProfile'
import { UpdateProfile } from '@/components/apis/UpdateProfile'
import { copyAgencyOnboardingLink } from '@/components/constants/constants'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import AgencyLinkWarning from '@/components/globalExtras/AgencyLinkWarning'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { useUser } from '@/hooks/redux-hooks'

import UPSell from '../integrations/UPSell'
import BrandConfig from './BrandConfig'
import DomainConfig from './DomainConfig'
import EmailConfig from './EmailConfig'
import PrivacyConfig from './PrivacyConfig'
import SupportWidgetConfig from './SupportWidgetConfig'
import TermsConfig from './TermsConfig'
import TutorialConfig from './TutorialConfig'
import NotificationConfig from './WhiteLabelingCustomNotifications/NotificationConfig'
import CancellationRefundConfig from './CancellationRefundConfig'
import AppLogo from '@/components/common/AppLogo'
import { renderBrandedIcon } from '@/utilities/iconMasking'
import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails'

const WhiteLabel = ({ selectedAgency }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedWhiteLabelTabs, setSelectedWhiteLabelTabs] = useState(1)

  // Copy Agency Link state
  const [linkCopied, setLinkCopied] = useState(false)
  const [showCopyLinkWarning, setShowCopyLinkWarning] = useState(false)
  const [agencyData, setAgencyData] = useState(null)
  const [copyLinkLoader, setCopyLinkLoader] = useState(false)
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  const [showSnackMessage, setShowSnackMessage] = useState({
    type: SnackbarTypes.Error,
    message: '',
    isVisible: false,
  })

  // Fetch local data for Copy Agency Link
  useEffect(() => {
    getLocalData()
  }, [selectedAgency])

  const getLocalData = (retries = 5, delay = 300) => {
    let attempt = 0

    const tryFetch = () => {
      // If selectedAgency is provided (admin view), use it; otherwise use localStorage
      if (selectedAgency) {
        setAgencyData(selectedAgency)
        return
      }
      
      let data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        setAgencyData(u.user)
      } else {
        attempt++
        if (attempt < retries) {
          console.warn(`Attempt ${attempt} failed, retrying...`)
          setTimeout(tryFetch, delay)
        } else {
          console.error('❌ Failed to fetch User data after 5 attempts')
        }
      }
    }

    tryFetch()
  }

  const handleCopyClick = async () => {
let targetUser = null;
    if(selectedAgency) {

       targetUser =await AdminGetProfileDetails(selectedAgency?.id)
    }
    else {
      targetUser = reduxUser;
    }

    if (!targetUser?.twilio?.twilAuthToken) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Connect your Twilio first',
        isVisible: true,
      })
      return
    }
    console.log(
      'reduxUser?.planCapabilities?.maxSubAccounts',
      targetUser?.planCapabilities?.maxSubAccounts,
    )
    console.log('reduxUser?.plan?.title', targetUser?.plan?.title)
    if (
      targetUser?.plan?.title !== 'Scale' &&
      targetUser?.planCapabilities?.maxSubAccounts < 1000 &&
      agencyData?.agencyOnboardingLink === null
    ) {
      setShowCopyLinkWarning(true)
      upgradeProfile()
    } else {
      await copyAgencyOnboardingLink({ setLinkCopied, targetUser, selectedAgency })
      setShowSnackMessage({
        type: SnackbarTypes.Success,
        message: 'Agency link copied',
        isVisible: true,
      })
    }
  }

  // Upgrade copy link
  const upgradeProfile = async () => {
    try {
      let UUIDLink = ''
      const d = localStorage.getItem('User')
      const BasePath =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
          ? 'https://app.assignx.ai/'
          : 'http://dev.assignx.ai/'
      if (d) {
        const Data = JSON.parse(d)
        UUIDLink = BasePath + `onboarding/${Data.user.agencyUuid}`
      }
      setCopyLinkLoader(true)
      const apidata = {
        agencyOnboardingLink: UUIDLink,
      }
      const response = await UpdateProfile(apidata)
      if (response) {
        if (response.status === true) {
          getLocalData()
          setCopyLinkLoader(false)
        }
      }
    } catch (err) {
      setCopyLinkLoader(false)
    }
  }

  // Initialize tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      const tabNumber = parseInt(tabParam, 10)
      if (tabNumber >= 1 && tabNumber <= 10) {
        setSelectedWhiteLabelTabs(tabNumber)
      }
    }
  }, [searchParams])

  // Handle tab change and update URL
  const handleTabChange = (item) => {
    if (item.comingSoon) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'This feature is coming soon',
        isVisible: true,
      })
      return
    }
    const tabId = item.id
    setSelectedWhiteLabelTabs(tabId)
    
    // If in admin mode (selectedAgency provided), update URL query params without navigation
    // to avoid triggering agency layout which causes hydration errors
    if (selectedAgency) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('tab', tabId.toString())
      // Use router.replace with current pathname to update URL without full navigation
      // This prevents Next.js from loading the agency layout inside admin layout
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      })
    } else {
      // Normal agency user flow - navigate to agency whitelabel route
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('tab', tabId.toString())
      router.push(`/agency/dashboard/whitelabel?${newSearchParams.toString()}`, {
        scroll: false,
      })
    }
  }

  const WhiteLabelTabs = [
    { id: 1, title: 'Brand', comingSoon: false }, //process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production" ? true : false },
    {
      id: 2,
      title: 'Domain',
      comingSoon:
        false,
    },
    { id: 3, title: 'Email Config', comingSoon: false },
    { id: 4, title: 'Notification Config', comingSoon: false },
    { id: 5, title: 'Tutorial Videos', comingSoon: false },
    { id: 6, title: 'Support widget', comingSoon: false },
    { id: 7, title: 'Upsell', comingSoon: false },
    { id: 8, title: 'Privacy Policy', comingSoon: false },
    { id: 9, title: 'Terms & Conditions', comingSoon: false },
    { id: 10, title: 'Cancellation & Refund', comingSoon: false },
  ]

  return (
    <div className="w-full h-[100svh]">
      <AgentSelectSnackMessage
        isVisible={showSnackMessage.isVisible}
        hide={() => {
          setShowSnackMessage({
            type: SnackbarTypes.Error,
            message: '',
            isVisible: false,
          })
        }}
        message={showSnackMessage.message}
        type={showSnackMessage.type}
      />
      <div className="w-full flex flex-row items-center justify-between px-5 py-5 border-b h-[10svh]">
        <div style={styles.semiBoldHeading}>Whitelabel</div>
        <div className="flex flex-row items-center gap-2">
          <NotficationsDrawer />
        </div>
      </div>
      <div className="flex flex-row items-start h-[90svh] relative">
        <div className="w-[20%] px-4 pt-4 h-full border-r flex flex-col">
          {WhiteLabelTabs.map((item) => {
            return (
              <button
                key={item.id}
                className={`${selectedWhiteLabelTabs === item.id ? 'text-brand-primary bg-brand-primary/10 rounded-lg' : 'text-black'} outline-none text-start h-[48px] px-2 flex flex-row items-center`}
                onClick={() => {
                  handleTabChange(item)
                }}
                style={{
                  ...styles.regular,
                  ...(selectedWhiteLabelTabs === item.id
                    ? {
                        backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                      }
                    : {}),
                }}
              >
                <span>{item.title}</span>
                {item.comingSoon && (
                  <div className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap">
                    Coming Soon
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="w-[80%] h-full px-4 pt-4 overflow-auto scrollbar-hidden">
          {selectedWhiteLabelTabs === 1 && (
            <div className="w-full h-full">
              <BrandConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 2 && (
            <div className="w-full h-full">
              <DomainConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 3 && (
            <div className="w-full h-full">
              <EmailConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 4 && (
            <div className="w-full h-full">
              <NotificationConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 5 && (
            <div className="w-full h-full">
              <TutorialConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 6 && (
            <div className="w-full h-full">
              <SupportWidgetConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 7 && (
            <div className="w-full h-full">
              <UPSell selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 8 && (
            <div className="w-full h-full">
              <PrivacyConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 9 && (
            <div className="w-full h-full">
              <TermsConfig selectedAgency={selectedAgency} />
            </div>
          )}
          {selectedWhiteLabelTabs === 10 && (
            <div className="w-full h-full">
              <CancellationRefundConfig selectedAgency={selectedAgency} />
            </div>
          )}
        </div>

        {/* Copy Agency Link - Fixed Overlay Panel */}
        <div
          className="fixed right-4 shadow-lg rounded-lg"
          style={{
            zIndex: 10,
            top: 'calc(10svh + 16px)',
            width: '420px',
            backgroundColor: 'hsl(var(--brand-primary))',
          }}
        >
          <div className="w-full flex flex-row items-center justify-between px-4 py-4 gap-4">
            <div className="flex flex-row items-center gap-3 flex-1">
              <div className="flex items-center justify-center flex-shrink-0">
                <Image
                  alt="AssignX Icon"
                  src="/assets/newAssignX.png"
                  height={45}
                  width={45}
                />
              </div>
              <div className="flex-1">
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                  }}
                >
                  Agency Link
                </div>
                <div
                  style={{ fontSize: '12px', fontWeight: '400', color: '#ffffffcc' }}
                >
                  Use this link to sign up users
                </div>
              </div>
            </div>
            <button
              className="flex flex-row items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors flex-shrink-0 bg-white hover:bg-gray-50"
              onClick={async () => {
               handleCopyClick()
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                }}
              >
                {/* <Image
                  alt="*"
                  src={'/assets/copyIconPurple.png'}
                  height={16}
                  width={16}
                /> */}
                {
                  renderBrandedIcon('/assets/copyIconPurple.png', 16, 16)
                    
                }
              </div>
              <div
                style={{ fontSize: '14px', fontWeight: '500', color: 'hsl(var(--brand-primary))' }}
              >
                {linkCopied ? 'Link Copied' : 'Copy Link'}
              </div>
            </button>
          </div>
        </div>
      </div>
      {showCopyLinkWarning && (
        <AgencyLinkWarning
          open={showCopyLinkWarning}
          copyLinkLoader={copyLinkLoader}
          linkCopied={linkCopied}
          handleClose={() => {
            setShowCopyLinkWarning(false)
          }}
          handleCopyLink={async () => {
            await copyAgencyOnboardingLink({ setLinkCopied, reduxUser, selectedAgency })
            setTimeout(() => {
              setShowCopyLinkWarning(false)
            }, 500)
            getLocalData()
          }}
          userData={reduxUser}
        />
      )}
    </div>
  );
}

export default WhiteLabel

const styles = {
  semiBoldHeading: {
    fontSize: 22,
    fontWeight: '600',
  },
  regular: {
    fontSize: 15,
    fontWeight: '500',
  },
}