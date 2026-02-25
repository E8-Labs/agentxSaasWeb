'use client'

import { CircularProgress, Drawer, Modal, Tooltip } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { MessageSquare, MessageCircle, AtSign, Mail, MessageSquareDot, PhoneCall } from 'lucide-react'

import { NotificationTypes } from '@/constants/NotificationTypes'
import { PersistanceKeys } from '@/constants/Constants'
import { getSupportUrlFor } from '@/utilities/UserUtility'
import { GetFormattedDateString } from '@/utilities/utility'

import Apis from '../apis/Apis'
import getProfileDetails from '../apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import LeadDetails from '../dashboard/leads/extras/LeadDetails'
import CloseBtn from '../globalExtras/CloseBtn'
import { useUser } from '@/hooks/redux-hooks'
import { getBrandPrimaryHex } from '@/utilities/colorUtils'

function NotficationsDrawer({ close }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)

  const [snackMessage, setSnackMessage] = useState('')

  //variables to show the lead details modal
  const [selectedLeadsDetails, setselectedLeadsDetails] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { user: reduxUser } = useUser()

  // Function to render icon with branding using mask-image
  const renderBrandedIcon = (iconPath, width, height) => {
    if (typeof window === 'undefined') {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')

    if (!brandColor || !brandColor.trim()) {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

    // Use mask-image approach: background color with icon as mask
    // This works for both SVG and PNG icons
    return (
      <div
        style={{
          width: width,
          height: height,
          minWidth: width,
          minHeight: height,
          backgroundColor: `hsl(${brandColor.trim()})`,
          WebkitMaskImage: `url(${iconPath})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(${iconPath})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          transition: 'background-color 0.2s ease-in-out',
          flexShrink: 0,
        }}
      />
    )
  }

  // Function to render Lucide icon with branding color
  const renderBrandedLucideIcon = (IconComponent, size = 22) => {
    if (typeof window === 'undefined') {
      return <IconComponent size={size} />
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')

    // Use brand color or fallback to default purple
    const iconColor = brandColor && brandColor.trim()
      ? `hsl(${brandColor.trim()})`
      : 'hsl(270 75% 50%)' // Default purple

    return (
      <IconComponent
        size={size}
        style={{
          color: iconColor,
          stroke: iconColor,
          flexShrink: 0,
          transition: 'color 0.2s ease-in-out, stroke 0.2s ease-in-out',
        }}
      />
    )
  }

  useEffect(() => {
    getUserData()
  }, [])
  const getUserData = async () => {
    // let data = localStorage.getItem("User")
    // if(data){
    // let u = JSON.parse(data)
    //// //console.log
    // }
    let data = await getProfileDetails()
    console.log("data?.data?.data?.unread", data?.data?.data?.unread);
    setUnread(data?.data?.data?.unread)
    // setUnread(12);
  }

  const getNotifications = async () => {
    try {
      let offset = notifications.length

      //code for get and set data from local
      const not = localStorage.getItem('userNotifications')
      if (not) {
        const D = JSON.parse(not)
        // //console.log;
        setNotifications(D)
      }

      //code to stop if no more notifications
      // const moreNot = localStorage.getItem("hasMoreNotification");
      // if (moreNot) {
      //   const M = JSON.parse(moreNot);
      //   if (M === "false") {
      //     return
      //   }
      // }

      const user = localStorage.getItem('User')

      if (user) {
        let u = JSON.parse(user)
        // //console.log;

        // if (hasMore === true) {
        if (!notifications.length > 0 && !not) {
          setLoading(true)
        }

        const ApiPath = `${Apis.getNotifications}?offset=${offset}`
        // //console.log;

        const response = await axios.get(ApiPath, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setLoading(false)
          if (response.data.status === true) {
            // setNotifications(response.data.data.notifications);
            localStorage.setItem(
              'userNotifications',
              JSON.stringify([
                ...notifications,
                ...response.data.data.notifications,
              ]),
            )
            setNotifications([
              ...notifications,
              ...response.data.data.notifications,
            ])
            u.user.unread = 0
            localStorage.setItem('User', JSON.stringify(u))
            setUnread(0)
            // setUnread(response.data.data.unread)
            // console.log(
            //   "Length of notifications is",
            //   response.data.data.notifications.length
            // );
            if (response.data.data.notifications.length < 40) {
              localStorage.setItem(
                'hasMoreNotification',
                JSON.stringify('false'),
              )
              setHasMore(false)
            }
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      setLoading(false)
      // //console.log;
    }
  }

  useEffect(() => {
    // //console.log;
  }, [hasMore])

  //function to get support
  const getSupport = () => {
    let url = getSupportUrlFor()
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }

  function giveFeedback() {
    // Logic:
    // - For agency subaccounts: Use URL from agencySettings.giveFeedbackUrl if available
    // - For main accounts and agency accounts: Always use MainUserFeedbackUrl (ClickUp form)
    const userData = localStorage.getItem('User')
    let feedbackUrl = PersistanceKeys.MainUserFeedbackUrl // Default to ClickUp form URL

    if (userData) {
      try {
        const user = JSON.parse(userData)
        const userRole = user?.user?.userRole || user?.userRole
        
        // Only for subaccounts: use agency feedback URL if available
        if (userRole === 'AgencySubAccount') {
          if (
            user?.user?.agencySettings?.giveFeedbackUrl &&
            user.user.agencySettings.giveFeedbackUrl.trim() !== '' &&
            !user.user.agencySettings.giveFeedbackUrl.includes('forms.gle')
          ) {
            feedbackUrl = user.user.agencySettings.giveFeedbackUrl
          }
        }
        // For main accounts (AgentX) and agency accounts (Agency), always use MainUserFeedbackUrl
        // This ensures they get the ClickUp form URL
      } catch (error) {
        console.error('Error parsing user data for feedback URL:', error)
      }
    }

    // Always open the feedback URL in a new tab
    if (feedbackUrl.startsWith('http://') || feedbackUrl.startsWith('https://')) {
      window.open(feedbackUrl, '_blank')
    } else {
      router.push(feedbackUrl)
    }
  }

  const getNotificationImage = (item) => {
    if (item.type === NotificationTypes.RedeemedAgentXCode) {
      return renderBrandedIcon('/svgIcons/minsNotIcon.svg', 32, 32)
    } else if (item.type === NotificationTypes.RedeemedAgentXCodeMine) {
      return renderBrandedIcon('/svgIcons/minsNotIcon.svg', 32, 32)
    } else if (item.type === NotificationTypes.NoCallsIn3Days) {
      return renderBrandedIcon('/svgIcons/callsNotIcon.svg', 37, 37)
    } else if (item.type === NotificationTypes.LeadReplied) {
      return renderBrandedLucideIcon(MessageSquare, 20)
    } else if (item.type === NotificationTypes.LeadReplyEmail) {
      return renderBrandedLucideIcon(Mail, 20)
    } else if (item.type === NotificationTypes.LeadReplySms) {
      return renderBrandedLucideIcon(MessageSquareDot, 20)
    }
    else if (item.type === NotificationTypes.InviteAccepted) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: 'capitalize' }}
        >
          {item.title[0]}
        </div>
      )
    } else if (
      item.type === NotificationTypes.Hotlead ||
      item.type === NotificationTypes.FirstLeadUpload ||
      item.type === NotificationTypes.SocialProof
    ) {
      return renderBrandedIcon('/svgIcons/hotLeadNotIcon.svg', 37, 37)
    } else if (item.type === NotificationTypes.TotalHotlead) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: 'capitalize' }}
        >
          {item.title[0]}
        </div>
      )
    } else if (item.type === NotificationTypes.MeetingBooked) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: 'capitalize' }}
        >
          {item.title[0]}
        </div>
      )
    } else if (item.type === NotificationTypes.PaymentFailed) {
      return renderBrandedIcon('/svgIcons/urgentNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.CallsMadeByAgent) {
      return <PhoneCall size={22} color={getBrandPrimaryHex()} /> //renderBrandedIcon('/svgIcons/aiNotIcon.svg', 40, 40)
    } else if (item.type === NotificationTypes.LeadCalledBack) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: 'capitalize' }}
        >
          {item.title[0]}
        </div>
      )
    } else if (item.type === NotificationTypes.Trial30MinTicking) {
      return renderBrandedIcon('/svgIcons/Trial30MinTickingNotIcon.svg', 22, 22)
    } else if (
      item.type === NotificationTypes.X3MoreLikeyToWin ||
      item.type === NotificationTypes.ThousandCalls ||
      item.type === NotificationTypes.CompetitiveEdge
    ) {
      return renderBrandedIcon('/svgIcons/3xMoreLikeyToWinNotIcon.svg', 22, 22)
    } else if (
      item.type === NotificationTypes.NeedHand ||
      item.type === NotificationTypes.NeedHelpDontMissOut ||
      item.type === NotificationTypes.TrainingReminder ||
      item.type === NotificationTypes.Inactive5Days
    ) {
      return renderBrandedIcon('/svgIcons/NeedHandNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.TrialReminder) {
      return renderBrandedIcon('/svgIcons/TrialReminderNotIcon.svg', 22, 22)
    } else if (
      item.type === NotificationTypes.LastChanceToAct ||
      item.type === NotificationTypes.FOMOAlert
    ) {
      return renderBrandedIcon('/svgIcons/LastChanceToActNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.LastDayToMakeItCount) {
      return renderBrandedIcon('/svgIcons/LastDayToMakeItCountNotIcon.svg', 22, 22)
    } else if (
      item.type === NotificationTypes.TrialTime2MinLeft ||
      item.type === NotificationTypes.TwoThousandCalls
    ) {
      return renderBrandedIcon('/svgIcons/TrialTime2MinLeftNotIcon.svg', 22, 22)
    } else if (
      item.type === NotificationTypes.PlanRenewed ||
      NotificationTypes.SubscriptionRenewed === item.type
    ) {
      return renderBrandedIcon('/svgIcons/PlanRenewedNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.FirstAppointment) {
      return renderBrandedIcon('/svgIcons/FirstAppointmentNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.ThreeAppointments) {
      return renderBrandedIcon('/svgIcons/SevenAppointmentsNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.SevenAppointments) {
      return renderBrandedIcon('/svgIcons/SevenAppointmentsNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.Day14FeedbackRequest) {
      return renderBrandedIcon('/svgIcons/Day14FeedbackRequestNotIcon.svg', 22, 22)
    } else if (
      item.type === NotificationTypes.PlanUpgradeSuggestionFor30MinPlan
    ) {
      return renderBrandedIcon('/svgIcons/PlanUpgradeSuggestionFor30MinPlanNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.TestAINotification) {
      return renderBrandedIcon('/svgIcons/TestAINotificationNotIcon.svg', 22, 22)
    } else if (item.type === NotificationTypes.Exclusivity) {
      return renderBrandedIcon('/svgIcons/TeritaryTraining.svg', 18, 22)
    } else if (item.type === NotificationTypes.TerritoryUpdate) {
      return renderBrandedIcon('/svgIcons/2Listings.svg', 22, 22)
    } else if (
      item.type === NotificationTypes.PlanUpgraded ||
      item.type === NotificationTypes.PlanSubscribed
    ) {
      return renderBrandedIcon('/svgIcons/chevrons-up.svg', 22, 22)
    } else if (item.type === NotificationTypes.PlanDowngraded) {
      return renderBrandedIcon('/svgIcons/chevrons-down.svg', 22, 22)
    } else if (item.type === NotificationTypes.PlanCancelled) {
      return renderBrandedIcon('/svgIcons/cancel.svg', 22, 22)
    } else if (item.type === NotificationTypes.AccountPaused) {
      return renderBrandedIcon('/svgIcons/pause.svg', 22, 22)
    } else if (item.type === NotificationTypes.AccountResumed) {
      return renderBrandedIcon('/svgIcons/resume.svg', 22, 22)
    } else if (item.type === NotificationTypes.LeadReplied) {
      return renderBrandedLucideIcon(MessageSquare, 22)
    } else if (item.type === NotificationTypes.LeadReplyEmail) {
      return renderBrandedLucideIcon(Mail, 22)
    } else if (item.type === NotificationTypes.LeadReplySms) {
      return renderBrandedLucideIcon(MessageSquareDot, 22)
    } else if (item.type === NotificationTypes.TeamMemberMentioned) {
      return renderBrandedLucideIcon(AtSign, 22)
    }

    //2Listings
  }

  const handleShowDetails = useCallback((item) => {
    //console.log;
    if (
      // item.pipelineId === null ||
      // item.id === undefined ||
      !item.lead
    ) {
      setSnackMessage('Lead has been deleted')
    } else {
      setselectedLeadsDetails(item)
      setShowDetailsModal(true)
    }
  }, [])

  const getNotificationBtn = (item) => {
    if (
      item.type === NotificationTypes.Hotlead ||
      item.type === NotificationTypes.MeetingBooked ||
      item.type === NotificationTypes.LeadCalledBack
    ) {
      return (
        <button
          onClick={() => {
            handleShowDetails(item)
            // getSupport()
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            View Now
          </div>
        </button>
      )
    } else if (item.type === NotificationTypes.PaymentFailed) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true
            // localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push('/dashboard/myAccount?tab=2')
            setShowNotificationDrawer(false)
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Resolve Now
          </div>
        </button>
      )
    } else if (item.type === NotificationTypes.NoCallsIn3Days) {
      // Get support workshop URL from agency or user settings
      const userData = localStorage.getItem('User')
      let supportWorkshopUrl = null
      let isAgencyUser = false

      if (userData) {
        try {
          const user = JSON.parse(userData)
          isAgencyUser = !!user?.user?.agencySettings
          // Check agency settings first (for subaccounts)
          if (user?.user?.agencySettings?.supportWorkshopUrl) {
            supportWorkshopUrl = user.user.agencySettings.supportWorkshopUrl
          }
          // Then check user's own settings
          else if (user?.user?.userSettings?.supportWorkshopUrl) {
            supportWorkshopUrl = user.user.userSettings.supportWorkshopUrl
          }
        } catch (error) {
          console.error('Error parsing user data for support workshop URL:', error)
        }
      }

      // Fallback to main user support URL if no agency URL
      const finalUrl = supportWorkshopUrl || PersistanceKeys.MainUserSupportUrl
      // Show unavailable only if agency user doesn't have supportWorkshopUrl configured
      const isUnavailable = isAgencyUser && !supportWorkshopUrl

      return (
        <Tooltip
          title={isUnavailable ? 'Unavailable' : ''}
          placement="top"
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: '#ffffff',
                color: '#333',
                fontSize: '14px',
                padding: '10px 15px',
                borderRadius: '8px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              },
            },
            arrow: { sx: { color: '#ffffff' } },
          }}
        >
          <button
            className="outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (finalUrl) {
                if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
                  window.open(finalUrl, '_blank')
                } else {
                  router.push(finalUrl)
                }
                setShowNotificationDrawer(false)
              }
            }}
            disabled={isUnavailable}
          >
            <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
              View Agents
            </div>
          </button>
        </Tooltip>
      )
    } else if (
      NotificationTypes.Trial30MinTicking === item.type ||
      NotificationTypes.TrialReminder === item.type ||
      NotificationTypes.LastDayToMakeItCount === item.type ||
      NotificationTypes.FirstLeadUpload === item.type ||
      NotificationTypes.TwoThousandCalls === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            router.push('/dashboard/leads')
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Start Calling
          </div>
        </button>
      )
    } else if (
      NotificationTypes.X3MoreLikeyToWin === item.type ||
      NotificationTypes.ThousandCalls === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            router.push('/dashboard/leads')
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Upload Leads
          </div>
        </button>
      )
    } else if (NotificationTypes.NeedHand === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            getSupport()
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Support
          </div>
        </button>
      )
    } else if (NotificationTypes.NeedHelpDontMissOut === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true
            // localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push('/dashboard/myAccount?tab=2')
            setShowNotificationDrawer(false)
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Live Support
          </div>
        </button>
      )
    } else if (
      NotificationTypes.LastChanceToAct === item.type ||
      NotificationTypes.FirstAppointment === item.type ||
      NotificationTypes.ThreeAppointments === item.type ||
      NotificationTypes.SevenAppointments === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            item.type == NotificationTypes.Day14FeedbackRequest
              ? giveFeedback()
              : getSupport()
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Live Help
          </div>
        </button>
      )
    } else if (NotificationTypes.Day14FeedbackRequest === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            giveFeedback()
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Give Feedback
          </div>
        </button>
      )
    }

    else if (
      item.type === NotificationTypes.PlanUpgradeSuggestionFor30MinPlan
    ) {
      return (
        <button
          className="outline-none"
          onClick={(e) => {
            e.preventDefault()
            router.push('/dashboard/myAccount?tab=2')
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Live Help
          </div>
        </button>
      )
    } else if (
      NotificationTypes.TrialTime2MinLeft === item.type ||
      NotificationTypes.PlanRenewed === item.type ||
      NotificationTypes.SubscriptionRenewed === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true
            // localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push('/dashboard/myAccount?tab=2')
            setShowNotificationDrawer(false)
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Manage Plan
          </div>
        </button>
      )
    } else {
      return <div className="w-3/12"></div>
    }
  }

  const handleNotificationClick = (item) => {
    // Handle LeadReplied, LeadReplyEmail, LeadReplySms and TeamMemberMentioned notification click - route to messaging page
    if (
      item.type === NotificationTypes.LeadReplied ||
      item.type === NotificationTypes.LeadReplyEmail ||
      item.type === NotificationTypes.LeadReplySms ||
      item.type === NotificationTypes.TeamMemberMentioned
    ) {
      if (item.threadId) {
        // Build query params for thread and message
        const params = new URLSearchParams()
        params.set('threadId', item.threadId.toString())
        if (item.messageId) {
          params.set('messageId', item.messageId.toString())
        }
        
        // Close the drawer and navigate to messaging page
        setShowNotificationDrawer(false)
        router.push(`/dashboard/messages?${params.toString()}`)
      } else {
        // Fallback: just navigate to messages page if threadId is missing
        setShowNotificationDrawer(false)
        router.push('/dashboard/messages')
      }
    }
  }

  const renderItem = (item, index) => {
    const isClickable = 
      (item.type === NotificationTypes.LeadReplied ||
       item.type === NotificationTypes.LeadReplyEmail || 
       item.type === NotificationTypes.LeadReplySms || 
       item.type === NotificationTypes.TeamMemberMentioned) && 
      item.threadId
    
    return (
      <div
        key={index}
        className={`w-full flex flex-row justify-between items-start mt-10 ${
          isClickable ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2' : ''
        }`}
        onClick={() => isClickable && handleNotificationClick(item)}
      >
        <div className="flex flex-row items-start gap-6 w-[80%]">
          {getNotificationImage(item)}

          <div className={`w-full`}>
            <div className="flex flex-col gap-1 items-start">
              <div className="flex flex-col w-full gap-1">
                <div
                  className="flex flex-wrap items-center"
                  style={{ fontSize: 16, fontWeight: '600' }}
                >
                  {item.title}
                </div>
              </div>

              {(item.body || item.type === NotificationTypes.Day14FeedbackRequest) && (
                <div
                  className=" flex flex col gap-2"
                  style={{ fontSize: 15, fontWeight: '500' }}
                >
                  {item.type === NotificationTypes.Day14FeedbackRequest
                    ? 'Tell us about your experience'
                    : item.body}
                </div>
              )}

              <div
                style={{ fontSize: 13, fontWeight: '500', color: '#00000060' }}
              >
                {GetFormattedDateString(item?.createdAt, true)}
              </div>
            </div>
          </div>
        </div>
        <div className="w-[20%]">{getNotificationBtn(item)}</div>
      </div>
    )
  }

  return (
    <div className='flex ' //style={{ zIndex: 1304 }}
    >
      {snackMessage && (
        <AgentSelectSnackMessage
          message={snackMessage}
          type={SnackbarTypes.Warning}
          isVisible={snackMessage}
          hide={() => {
            setSnackMessage('')
          }}
        />
      )}

      <button
        onClick={() => {
          setShowNotificationDrawer(true)
          getNotifications()
        }}
        className="mb-1 h-10 px-3 py-3 rounded-lg bg-black/[0.02] hover:opacity-70 transition-opacity flex-shrink-0 flex items-center justify-center"
      >
        <div className="flex flex-row relative">
          <Image
            src="/svgIcons/notificationIcon.svg"
            height={20}
            width={20}
            alt="Notification Icon"
          />
          {unread > 0 && (
            <div
              className="absolute -top-1 -right-1 flex rounded-full min-w-[18px] px-1 h-[18px] flex-row items-center justify-center text-white flex-shrink-0 bg-brand-primary text-[11px] font-semibold"
              style={{
                marginTop: -10,
                marginLeft: -12,
              }}
            >
              {unread < 100 ? unread : '99+'}
            </div>
          )}
        </div>
      </button>

      <Drawer
        anchor="right"
        sx={{
          zIndex: 1301, // Above AdminUsers SelectedUserDetails modal (1300) when drawer is open
          '& .MuiDrawer-paper': {
            width: '35%', // Drawer width
            boxSizing: 'border-box', // Ensure padding doesn't shrink content
          },
        }}
        open={showNotificationDrawer}
        onClose={() => {
          setShowNotificationDrawer(false)
        }}
        BackdropProps={{
          // timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex flex-row items-center justify-between p-6">
            <div className="flex flex-row gap-2 items-center">
              <div className="flex flex-row ">
                <Image
                  src="/svgIcons/notificationIcon.svg"
                  height={22}
                  width={22}
                  alt="Notification Icon"
                />
                {unread > 0 && (
                  <div
                    className="flex bg-red-500 rounded-full min-w-[24px] px-[2px] h-8 items-center justify-center text-white font-medium"
                    style={{
                      fontSize: '12px', // Ensure font-size is smaller to fit within the circle
                      marginTop: '-13px', // Adjust position as needed
                      alignSelf: 'flex-start',
                      marginLeft: '-15px',
                      lineHeight: '1', // Prevent extra spacing inside the circle
                    }}
                  >
                    {unread < 100 ? unread : '99+'}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 22, fontWeight: '600' }}>
                Notifications
              </div>
            </div>
            <CloseBtn
              onClick={() => {
                setShowNotificationDrawer(false)
              }}
            />
          </div>

          <div
            style={{ height: 1, width: '100%', background: '#00000010' }}
          ></div>

          <div
            className="flex flex-col px-6 overflow-y-auto"
            style={{ height: '90vh', paddingBottom: 100 }}
            id="scrollableDiv1"
          >
            {loading ? (
              <div className="flex w-full items-center flex-col mt-10">
                <CircularProgress size={35} />
              </div>
            ) : !notifications.length > 0 ? (
              <div
                className="h-screen flex flex-col items-center justify-center w-full" //style={{ fontSize: 20, fontWeight: "700", padding: 20 }}
              >
                <Image
                  src={'/svgIcons/notNotificationImg.svg'}
                  height={297}
                  width={364}
                  alt="*"
                />
                <div
                  className="-mt-8"
                  style={{
                    fontSize: 16.8,
                    fontWeight: '700',
                  }}
                >
                  Nothing to see here... yet!
                </div>
                <div
                  className="mt-2"
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                  }}
                >
                  {`You’ll find all your notifications here`}
                </div>
              </div>
            ) : (
              <div style={{ scrollbarWidth: 'none' }}>
                <InfiniteScroll
                  className="lg:flex hidden flex-col w-full h-[100%]"
                  endMessage={
                    <p
                      style={{
                        textAlign: 'center',
                        paddingTop: '10px',
                        fontWeight: '400',
                        fontFamily: 'inter',
                        fontSize: 16,
                        color: '#00000060',
                      }}
                    >
                      {`You're all caught up`}
                    </p>
                  }
                  scrollableTarget="scrollableDiv1"
                  dataLength={notifications.length}
                  next={() => {
                    // //console.log;
                    getNotifications()
                  }} // Fetch more when scrolled
                  hasMore={hasMore} // Check if there's more data
                  loader={
                    <div className="w-full flex flex-row justify-center mt-8">
                      <CircularProgress size={35} />
                    </div>
                  }
                  style={{ overflow: 'unset' }}
                >
                  {notifications.map((item, index) => {
                    return (
                      <div key={index} className="w-full h-[100%]">
                        {renderItem(item, index)}
                      </div>
                    )
                  })}
                  {showDetailsModal && (
                    <LeadDetails
                      selectedLead={selectedLeadsDetails?.lead?.id}
                      pipelineId={selectedLeadsDetails?.pipelineId}
                      showDetailsModal={showDetailsModal}
                      setShowDetailsModal={setShowDetailsModal}
                      hideDelete={true}
                      noBackDrop={true}
                    />
                  )}
                </InfiniteScroll>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default NotficationsDrawer

export const notLeadDetails = () => {
  return <div>Hamza</div>
}
