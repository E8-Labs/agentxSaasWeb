import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { PersistanceKeys } from '@/constants/Constants'
import UpgradeModal from '@/constants/UpgradeModal'

import AdminGetProfileDetails from '../admin/AdminGetProfileDetails'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import VapiChatWidget from '../askSky/VapiChatWidget'
import { SupportWidget } from '../askSky/support-widget'
import UnlockPremiunFeatures from '../globalExtras/UnlockPremiunFeatures'

const DashboardSlider = ({
  onTop = false,
  needHelp = true,
  closeHelp,
  autoFocus = true,
  selectedUser = null,
}) => {
  const [visible, setVisible] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  //stores local data
  const [userDetails, setUserDetails] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)

  const [showAskSkyModal, setShowAskSkyModal] = useState(false)
  const [shouldStartCall, setShouldStartCall] = useState(false)

  const [showAskSkyConfirmation, setShowAskSkyConfirmation] = useState(false)
  const [showVapiChatWidget, setShowVapiChatWidget] = useState(false)
  const [openUpgradePlan, setOpenUpgradePlan] = useState(false)
  const [showUnlockPremiumFeaturesPopup, setShowUnlockPremiumFeaturesPopup] =
    useState(false)

  // initial loder for user settings
  const [initialLoader, setInitialLoader] = useState(false)

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

  const [buttons, setButtons] = useState([
    {
      id: 1,
      label: 'Resource Hub',
      image: '/svgIcons/resourceHubBlack.svg',
      image2: '/svgIcons/resourceHubBlue.svg',
      url: PersistanceKeys.ResourceHubUrl,
      height: 18,
      width: 18,
    },
    {
      id: 2,
      label: 'Support Webinar',
      image: '/svgIcons/supportBlack.svg',
      image2: '/svgIcons/supportBlue.svg',
      url: PersistanceKeys.SupportWebinarUrl,
    },
    // {
    //   id: 3,
    //   label: "Ask Sky for Help",
    //   image: "/svgIcons/askSkyBlack.svg",
    //   image2: "/svgIcons/askSkyBlue.svg",
    //   url: PersistanceKeys.SupportWebinarUrl,
    // },
    // {
    //   id: 4,
    //   label: "Chat Sky for Help",
    //   image: "/svgIcons/askSkyBlack.svg",
    //   image2: "/svgIcons/askSkyBlue.svg",
    //   url: PersistanceKeys.SupportWebinarUrl,
    // },
    {
      id: 4,
      label: 'Give Feedback',
      image: '/svgIcons/feedbackIcon.svg',
      image2: '/svgIcons/feedBackIconBlue.svg',
      url: PersistanceKeys.FeedbackFormUrl,
    },
    {
      id: 5,
      label: 'Hire the Team',
      image: '/svgIcons/hireTeamBlack.svg',
      image2: '/svgIcons/hireTeamBlue.svg',
      url: PersistanceKeys.HireTeamUrl,
    },
    {
      id: 6,
      label: 'Billing Support',
      image: '/otherAssets/billingIcon.png',
      image2: '/otherAssets/billingIconBlue.png',
      url: PersistanceKeys.BillingSupportUrl,
    },
  ])

  //fetch local details
  useEffect(() => {
    initializeDashboardSlider()
  }, [selectedUser])

  const initializeDashboardSlider = async () => {
    if (selectedUser) {
      setInitialLoader(true)
      let data = await AdminGetProfileDetails(selectedUser?.id)
      if (data) {
        setUserDetails(data)
        processUserSettings(data)
        // Fetch branding data if user is Agency or AgencySubAccount
        if (data?.userRole === 'Agency' || data?.userRole === 'AgencySubAccount') {
          // await fetchBrandingData(data.id)
        }
      }
      setInitialLoader(false)
    } else {
      fetchLocalDetails()
    }
  }

  // Fetch branding data for support widget logo
  const fetchBrandingData = async (userId = null) => {
    try {
      const Auth = AuthToken()
      let apiUrl = Apis.getAgencyBranding
      if (userId) {
        apiUrl += `?userId=${userId}`
      }
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: 'Bearer ' + Auth,
          'Content-Type': 'application/json',
        },
      })
      if (response?.data?.status === true) {
        const branding = response?.data?.data?.branding
        // Update userDetails with branding data
        setUserDetails((prev) => ({
          ...prev,
          agencyBranding: branding,
        }))
      }
    } catch (error) {
      console.error('Error fetching branding data:', error)
    }
  }

  useEffect(() => {
    if (needHelp) {
      setShowIcon(false)
      setVisible(true)
    } else {
      setVisible(false)
      setShowIcon(true)
    }
  }, [needHelp])

  //check if the call was initated then keep the slider and vapi-widget open
  useEffect(() => {
    const vapiValue = localStorage.getItem(PersistanceKeys.showVapiModal)
    if (vapiValue) {
      const d = JSON.parse(vapiValue)
      console.log('Vapi-value is', d)
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      if (onTop) {
        closeHelp()
      }
    }, 300)
    setTimeout(() => {
      if (!onTop) {
        setShowIcon(true)
      }
    }, 1000) // show icon after 1 sec
  }

  const handleReopen = () => {
    setShowIcon(false)
    setVisible(true)
    fetchLocalDetails()
  }

  const snackbarVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  }

  //get position bassed on the components
  const getPosition = () => {
    if (onTop) {
      const style = { position: 'fixed', top: 50, right: 8, zIndex: 1000 }
      return style
    } else {
      const style = { position: 'fixed', bottom: 20, right: 8, zIndex: 1000 }
      return style
    }
  }

  console.log('openUpgradePlan', openUpgradePlan)

  const handleOnClick = (item) => {
    const currentUser = selectedUser || userDetails

    if (item.id === 3 || item.label === 'Ask Sky for Help') {
      setShowAskSkyModal(true)
      setShouldStartCall(true)
    } else if (
      item.id == 2 ||
      item.label === 'Support Webinar' ||
      item.label?.includes('Support Webinar')
    ) {
      if (!currentUser?.plan?.price) {
        console.log('open')
        setOpenUpgradePlan(true)
      } else {
        if (typeof window !== 'undefined' && item.url) {
          window.open(item.url, '_blank')
        }
      }
    } else {
      if (typeof window !== 'undefined' && item.url) {
        window.open(item.url, '_blank')
      }
    }
  }

  const handleCloseUpgrade = () => {
    setOpenUpgradePlan(false)
  }

  // Process user settings for dynamic buttons
  const processUserSettings = (user) => {
    console.log('user in processUserSettings', user)
    if (user?.userRole === 'AgencySubAccount') {
      const dynamicButtons = []
      const Data = user?.agencySettings

      if (Data?.supportWebinarCalendar) {
        dynamicButtons.push({
          id: crypto.randomUUID(),
          label: Data.supportWebinarTitle || 'Support Webinar',
          url:
            Data.supportWebinarCalendarUrl || PersistanceKeys.SupportWebinarUrl,
          image: '/svgIcons/supportBlack.svg',
          image2: '/svgIcons/supportBlue.svg',
        })
      }

      if (Data?.giveFeedback) {
        dynamicButtons.push({
          id: crypto.randomUUID(),
          label: Data.giveFeedbackTitle || 'Give Feedback',
          url: Data.giveFeedbackUrl || PersistanceKeys.FeedbackFormUrl,
          image: '/svgIcons/feedbackIcon.svg',
          image2: '/svgIcons/feedBackIconBlue.svg',
        })
      }

      if (Data?.hireTeam) {
        dynamicButtons.push({
          id: crypto.randomUUID(),
          label: Data.hireTeamTitle || 'Hire the Team',
          url: Data.hireTeamUrl || PersistanceKeys.HireTeamUrl,
          image: '/svgIcons/hireTeamBlack.svg',
          image2: '/svgIcons/hireTeamBlue.svg',
        })
      }

      if (Data?.billingAndSupport) {
        dynamicButtons.push({
          id: crypto.randomUUID(),
          label: Data.billingAndSupportTitle || 'Billing Support',
          url: Data.billingAndSupportUrl || PersistanceKeys.BillingSupportUrl,
          image: '/otherAssets/billingIcon.png',
          image2: '/otherAssets/billingIconBlue.png',
        })
      }

      if (Data?.resourceHub) {
        dynamicButtons.push({
          id: crypto.randomUUID(),
          label: Data.resourceHubTitle || 'Resource Hub',
          url: Data.resourceHubUrl,
          image: '/svgIcons/resourceHubBlack.svg',
          image2: '/svgIcons/resourceHubBlue.svg',
        })
      }

      // Always set buttons for AgencySubAccount (even if empty array to show "No Support Widgets Found")
      setButtons(dynamicButtons)
    }
  }

  //fetch user local data
  const fetchLocalDetails = async () => {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetailsLD = JSON.parse(localData)
      // //console.log;
      setInitialLoader(true)
      setUserDetails(UserDetailsLD.user)
      AuthToken = UserDetailsLD.token
      console.log(
        'Checking local data in slider',
        UserDetailsLD?.user?.userRole,
      )
      processUserSettings(UserDetailsLD.user)
      // Fetch branding data if user is Agency or AgencySubAccount
      if (UserDetailsLD?.user?.userRole === 'Agency' || UserDetailsLD?.user?.userRole === 'AgencySubAccount') {
        // await fetchBrandingData()
      }
      setInitialLoader(false)
    }
  }

  const renderViews = () => {
    if (showAskSkyModal) {
      return (
        <SupportWidget
          user={selectedUser || userDetails}
          shouldStart={shouldStartCall}
          setShowAskSkyModal={setShowAskSkyModal}
          setShouldStartCall={setShouldStartCall}
          loadingChanged={(loading) => {
            console.log(`Loading state changed`, loading)
            if (loading) {
              // TODO: Hamza show the loader here
            } else {
              // TODO: Hamza hide the loader here
            }
          }}
        />
      )
    } else if (showVapiChatWidget) {
      return <VapiChatWidget setShowVapiChatWidget={setShowVapiChatWidget} />
    } else {
      return (
        <div className="flex flex-col items-end justify-end w-full gap-3">
          <div
            className="w-full mt-5 bg-white shadow-lg text-black w-full"
            style={{
              borderRadius: '8px',
              padding: '16px 24px',
            }}
          >
            {selectedUser?.userRole === 'AgencySubAccount' ||
            userDetails?.userRole === 'AgencySubAccount' ||
            (selectedUser && initialLoader) ? (
              <div className="w-full">
                {initialLoader ? (
                  <div className="w-full flex flex-row items-center justify-center h-[100px] gap-2">
                    <CircularProgress size={30} />
                  </div>
                ) : buttons.length > 0 ? (
                  <div className="w-full flex flex-col items-start gap-4">
                    {buttons.map((item, index) => (
                      <div
                        key={index}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                      >
                        <button
                          className="w-full flex flex-row items-center gap-2 "
                          onClick={() => handleOnClick(item, index)}
                        >
                          {renderBrandedIcon(
                            index === hoverIndex ? item.image2 : item.image,
                            item.width || item.height || 24,
                            item.height || item.width || 24,
                          )}
                          <div
                            className="text-black hover:text-brand-primary whitespace-nowrap"
                            style={{ fontSize: 15, fontWeight: '500' }}
                          >
                            {item.label}
                          </div>
                          {(item.id === 3 ||
                            item.label === 'Ask Sky for Help') && (
                            <div className="px-3 py-1 rounded-lg bg-brand-primary text-white text-[12px] font-[300] ml-5">
                              Beta
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="text-black text-[16px] font-semibold text-center w-full">
                      No Support Widgets Found
                    </div>
                    <div className="text-black text-[12px] font-medium mt-2 text-center w-full">
                      Please contact your admin user to get access to the
                      support widget.
                    </div>
                    <button
                      className="text-white bg-brand-primary outline-none rounded-lg w-full mt-4"
                      style={{ height: '40px' }}
                      onClick={() => {
                        setShowUnlockPremiumFeaturesPopup(true)
                      }}
                    >
                      Request
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col items-start gap-4">
                {buttons.map((item, index) => (
                  <div
                    key={index}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <button
                      className="w-full flex flex-row items-center gap-2"
                      onClick={() => handleOnClick(item, index)}
                    >
                      {renderBrandedIcon(
                        index === hoverIndex ? item.image2 : item.image,
                        item.width || 24,
                        item.height || 24,
                      )}
                      <div
                        className="text-black hover:text-brand-primary whitespace-nowrap"
                        style={{ fontSize: 15, fontWeight: '500' }}
                      >
                        {item.label}
                      </div>
                      {(item.id === 3 || item.label === 'Ask Sky for Help') && (
                        <div className="px-3 py-1 rounded-lg bg-brand-primary text-white text-[12px] font-[300] ml-5">
                          Beta
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showUnlockPremiumFeaturesPopup && (
              <UnlockPremiunFeatures
                title={'Unlock Live Support Webinar'}
                open={showUnlockPremiumFeaturesPopup}
                handleClose={() => {
                  setShowUnlockPremiumFeaturesPopup(false)
                }}
              />
            )}
          </div>
          <CloseBtn onClick={handleClose} showWhiteCross={false} />
        </div>
      )
    }
  }

  return (
    <div>
      {/* Snackbar */}
      <div style={getPosition()}>
        <AnimatePresence>
          {visible && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={snackbarVariants}
              transition={{ type: 'tween', duration: 0.4 }}
              drag="x"
              dragConstraints={{ left: 0, right: 100 }} // limit drag range
              onDragEnd={(event, info) => {
                if (info.offset.x > 100) {
                  handleClose() // close only if dragged right enough
                }
              }}
              className="flex"
              style={{
                width: '300px',
                touchAction: 'pan-y', // allow horizontal pan
              }}
            >
              <div
                className="flex flex-col items-end justify-end w-full gap-3"
                style={{ flex: 1 }}
              >
                {renderViews()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Icon Button (bottom-left) */}
      <AnimatePresence>
        {showIcon && !showAskSkyModal && !visible && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4 }}
            // className="shadow-lg flex flex-row items-center gap-2"
            style={{
              position: 'fixed',
              bottom: 30,
              right: 10,
              zIndex: 998,

              border: 'none',

              fontSize: '16px',
              cursor: 'pointer',

              outline: 'none',
            }}
          >
            <GetHelpBtn
              handleReopen={handleReopen}
              customLogo={
                (userDetails?.userRole === 'AgencySubAccount' ||
                  userDetails?.userRole === 'Agency') &&
                userDetails?.agencyBranding?.supportWidgetLogoUrl
                  ? userDetails.agencyBranding.supportWidgetLogoUrl
                  : null
              }
              customTitle={
                (userDetails?.userRole === 'AgencySubAccount' ||
                  userDetails?.userRole === 'Agency') &&
                userDetails?.agencyBranding?.supportWidgetTitle
                  ? userDetails.agencyBranding.supportWidgetTitle
                  : null
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={false}
        onClose={() => {
          setShowVapiChatWidget(false)
        }}
        hideBackdrop
      >
        <VapiChatWidget setShowVapiChatWidget={setShowVapiChatWidget} />
      </Modal>

      <UpgradeModal
        title={'Unlock Live Support Webinar'}
        subTitle={
          'Upgrade to join live support webinars and get pro tips from our team'
        }
        buttonTitle={'No Thanks. Continue on free plan'}
        open={openUpgradePlan}
        handleClose={handleCloseUpgrade}
      />

      <Modal
        open={false}
        onClose={() => {
          setShowAskSkyModal(false)
          setShouldStartCall(false)
        }}
        hideBackdrop
        sx={{ pointerEvents: 'none', backgroundColor: 'transparent' }} // allows VapiWidget to handle its own clicks
      >
        <div
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'transparent',
            height: '100%',
            width: '100%',
          }}
        >
          <SupportWidget
            isEmbed={false}
            user={selectedUser || userDetails}
            shouldStart={shouldStartCall}
            setShowAskSkyModal={setShowAskSkyModal}
            setShouldStartCall={setShouldStartCall}
            loadingChanged={(loading) => {
              console.log(`Loading state changed`, loading)
              if (loading) {
                // TODO: Hamza show the loader here
              } else {
                // TODO: Hamza hide the loader here
              }
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default DashboardSlider

const styles = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: '700',
  },
}

export const GetHelpBtn = ({
  text = 'Get Help',
  avatar = null,
  handleReopen,
  customLogo = null,
  customTitle = null,
}) => {
  // Use custom logo if provided, otherwise use avatar, otherwise default
  const logoUrl = customLogo || avatar || '/agentXOrb.gif'
  // Use custom title if provided, otherwise use text prop
  const displayText = customTitle || text

  return (
    <button
      className="flex flex-row bg-white items-center pe-4 ps-4 py-2 rounded-full shadow-md relative overflow-hidden"
      onClick={handleReopen}
    >
      {/* Stars */}
      <Image
        src="/otherAssets/getHelpStars.png"
        height={20}
        width={20}
        alt="Stars"
        className="absolute top-0 left-12 z-10 bg-transparent"
      />

      {/* Orb */}
      <div className="relative z-0 bg-white shadow-lg rounded-full w-[46px] h-[46px] overflow-hidden flex-shrink-0">
        <Image
          src={logoUrl}
          fill
          alt="Orb"
          className="object-cover"
        />
      </div>

      {/* Text */}
      <p className="text-[16px] font-bold text-brand-primary cursor-pointer ms-2">
        {displayText}
      </p>
    </button>
  )
}
