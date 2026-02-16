'use client'

import { Box, CircularProgress, Modal } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import axios from 'axios'

import { ArrowUpRight, ChevronRight } from 'lucide-react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { cn } from '@/lib/utils'
import { PersistanceKeys } from '@/constants/Constants'
import { SupportWidget } from '@/components/askSky/support-widget'
import { toast } from '@/utils/toast'
import Apis from '@/components/apis/Apis'
import { AuthToken } from '@/components/agency/plan/AuthDetails'

const AgencySupportWidget = ({
  onTop = false,
  needHelp = true,
  closeHelp,
  autoFocus = true,
  selectedUser = null,
}) => {
  const [visible, setVisible] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [userDetails, setUserDetails] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [pillStyle, setPillStyle] = useState(null)
  const [pillScaleIn, setPillScaleIn] = useState(false)
  const supportListContainerRef = useRef(null)
  const supportItemRefs = useRef([])
  const [showAskSkyModal, setShowAskSkyModal] = useState(false)
  const [shouldStartCall, setShouldStartCall] = useState(false)
  const [agencyBranding, setAgencyBranding] = useState(null)

  // Sliding pill position (same interaction as agency sidebar nav)
  useLayoutEffect(() => {
    if (hoverIndex === null || !supportListContainerRef.current) {
      setPillStyle(null)
      setPillScaleIn(false)
      return
    }
    const itemEl = supportItemRefs.current[hoverIndex]
    const containerEl = supportListContainerRef.current
    if (!itemEl || !containerEl) return
    const itemRect = itemEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()
    setPillStyle({
      left: itemRect.left - containerRect.left,
      top: itemRect.top - containerRect.top,
      width: itemRect.width,
      height: itemRect.height,
    })
    setPillScaleIn(false)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPillScaleIn(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [hoverIndex])

  // Agency-specific support options
  const [buttons, setButtons] = useState([
    {
      id: 1,
      label: 'Skool (Resource)',
      image: '/svgIcons/resourceHubBlack.svg',
      image2: '/svgIcons/resourceHubBlue.svg',
      url: PersistanceKeys.AgencySkoolUrl,
      height: 16,
      width: 16,
    },
    {
      id: 2,
      label: 'Agency Partner',
      image: '/svgIcons/supportBlack.svg',
      image2: '/svgIcons/supportBlue.svg',
      url: PersistanceKeys.AgencyPartnerUrl,
    },
    {
      id: 3,
      label: 'Billing Support',
      image: '/otherAssets/billingIcon.png',
      image2: '/otherAssets/billingIconBlue.png',
      url: PersistanceKeys.AgencyBillingSupportUrl,
    },
    {
      id: 4,
      label: 'Support Ticket',
      image: '/svgIcons/feedbackIcon.svg',
      image2: '/svgIcons/feedBackIconBlue.svg',
      url: PersistanceKeys.AgencySupportTicketUrl,
    },
    {
      id: 5,
      label: 'Speak to a Geek',
      image: '/svgIcons/askSkyBlack.svg',
      image2: '/svgIcons/askSkyBlue.svg',
      url: null, // Will trigger AI support
    },
  ])

  useEffect(() => {
    if (needHelp) {
      setShowIcon(false)
      setVisible(true)
    } else {
      setVisible(false)
      setShowIcon(true)
    }
  }, [needHelp])

  useEffect(() => {
    fetchLocalDetails()
  }, [selectedUser])

  // Fetch branding when userDetails is available
  useEffect(() => {
    const currentUser = selectedUser || userDetails
    if (currentUser && (currentUser?.userRole === 'Agency' || currentUser?.userRole === 'AgencySubAccount')) {
      fetchBrandingData(currentUser?.id)
    }
  }, [selectedUser, userDetails])

  // Listen for branding updates from AgencySupportAndWidget
  useEffect(() => {
    const handleBrandingUpdate = async (event) => {
      const { userId, branding } = event.detail || {}
      const currentUserId = selectedUser?.id || userDetails?.id
      
      // Only refresh if the update is for the current user (or no userId specified for current user)
      if (!userId || userId === currentUserId) {
        // If branding is provided in the event, update directly
        if (branding) {
          setAgencyBranding(branding)
        } else {
          // Otherwise, fetch fresh branding data
          await fetchBrandingData(userId || currentUserId)
        }
      }
    }

    window.addEventListener('SupportWidgetBrandingUpdated', handleBrandingUpdate)
    
    return () => {
      window.removeEventListener('SupportWidgetBrandingUpdated', handleBrandingUpdate)
    }
  }, [selectedUser?.id, userDetails?.id])

  const fetchLocalDetails = () => {
    if (selectedUser) {
      setUserDetails(selectedUser)
    } else {
      const localData = localStorage.getItem('User')
      if (localData) {
        const UserDetailsLD = JSON.parse(localData)
        setUserDetails(UserDetailsLD.user)
      }
    }
  }

  // Fetch branding data for support widget logo and title
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
        setAgencyBranding(branding)
      }
    } catch (error) {
      console.error('Error fetching branding data:', error)
    }
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      if (onTop) {
        closeHelp?.()
      }
    }, 300)
    setTimeout(() => {
      if (!onTop) {
        setShowIcon(true)
      }
    }, 1000)
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

  const getPosition = () => {
    if (onTop) {
      return { position: 'fixed', top: 50, right: 8, zIndex: 1000 }
    } else {
      return { position: 'fixed', bottom: 20, right: 8, zIndex: 1000 }
    }
  }

  // Function to render icon with branding using mask-image
  const renderBrandedIcon = (iconPath, width, height) => {
    if (typeof window === 'undefined') {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')

    if (!brandColor || !brandColor.trim()) {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

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

  const handleOnClick = (item) => {
    if (item.id === 5 || item.label === 'Speak to a Geek') {
      // Open AI support widget
      //Show Toast Message
      toast.success('AI support is not available yet. Please try again later.')
    //   setShowAskSkyModal(true)
    //   setShouldStartCall(true)
    } else if (item.url) {
      if (typeof window !== 'undefined') {
        window.open(item.url, '_blank')
      }
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
          loadingChanged={(loading) => {}}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-end justify-end w-full gap-3">
          <div
            className="w-auto m-0 bg-white shadow-lg text-black"
            style={{
              borderRadius: '8px',
            }}
          >
            <div
              ref={supportListContainerRef}
              className="relative w-[300px] flex flex-col items-center gap-1 rounded-[12px] border px-3 py-3 text-[14px] !bg-transparent"
              style={{
                // Medium elevation (reference for future annotations): 1px border #eaeaea, shadow 1px -5px 30px rgba(0,0,0,0.08)
                borderColor: '#eaeaea',
                boxShadow: '1px -5px 30px rgba(0, 0, 0, 0.08)',
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {hoverIndex !== null && pillStyle && (
                <div
                  className={cn(
                    'agency-sidebar-pill absolute z-0 rounded-xl bg-[#f9f9f9] pointer-events-none transition-all duration-200 ease-out',
                    pillScaleIn ? 'scale-100' : 'scale-[0.95]',
                  )}
                  style={{
                    left: pillStyle.left,
                    top: pillStyle.top,
                    width: pillStyle.width,
                    height: pillStyle.height ?? 40,
                  }}
                  aria-hidden
                />
              )}
              {buttons.map((item, index) => (
                <div
                  key={index}
                  ref={(el) => { supportItemRefs.current[index] = el }}
                  onMouseEnter={() => setHoverIndex(index)}
                  className="agency-support-widget-row relative z-10 w-full flex flex-col justify-center rounded-xl !bg-transparent py-5"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <button
                    type="button"
                    className="w-full h-full flex flex-row items-center gap-2 rounded-xl !bg-transparent active:scale-[0.95] transition-transform duration-150 ease-out origin-center px-[12px]"
                    style={{ backgroundColor: 'transparent' }}
                    onClick={() => handleOnClick(item, index)}
                  >
                    {(item.id === 5 || item.label === 'Speak to a Geek') ? (
                      <ArrowUpRight
                        className={cn('flex-shrink-0', index === hoverIndex ? 'text-brand-primary' : 'text-black/80')}
                        size={16}
                        aria-hidden
                      />
                    ) : (
                      renderBrandedIcon(
                        index === hoverIndex ? item.image2 : item.image,
                        item.width || 16,
                        item.height || 16,
                      )
                    )}
                    <div
                      className={cn(
                        'text-[14px] font-medium whitespace-nowrap flex-1 text-left',
                        index === hoverIndex ? 'text-brand-primary' : 'text-black/80',
                      )}
                    >
                      {item.label}
                    </div>
                    {index === hoverIndex && (
                      <ChevronRight className="flex-shrink-0 text-brand-primary" size={16} aria-hidden />
                    )}
                    {(item.id === 5 || item.label === 'Speak to a Geek') && (
                      <div className="ml-auto px-3 py-1 rounded-lg bg-brand-primary text-white text-[12px] font-[300]">
                        AI
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <CloseBtn onClick={handleClose} showWhiteCross={false} />
        </div>
      )
    }
  }

  return (
    <div>
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
              dragConstraints={{ left: 0, right: 100 }}
              onDragEnd={(event, info) => {
                if (info.offset.x > 100) {
                  handleClose()
                }
              }}
              className="flex"
              style={{
                width: '300px',
                touchAction: 'pan-y',
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
      {/* Icon Button (bottom-right) */}
      <AnimatePresence>
        {showIcon && !showAskSkyModal && !visible && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4 }}
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
                ((selectedUser?.userRole === 'AgencySubAccount' ||
                  selectedUser?.userRole === 'Agency') ||
                 (userDetails?.userRole === 'AgencySubAccount' ||
                  userDetails?.userRole === 'Agency')) &&
                agencyBranding?.supportWidgetLogoUrl
                  ? agencyBranding.supportWidgetLogoUrl
                  : null
              }
              customTitle={
                ((selectedUser?.userRole === 'AgencySubAccount' ||
                  selectedUser?.userRole === 'Agency') ||
                 (userDetails?.userRole === 'AgencySubAccount' ||
                  userDetails?.userRole === 'Agency')) &&
                agencyBranding?.supportWidgetTitle
                  ? agencyBranding.supportWidgetTitle
                  : null
              }

              titleColor = "hsl(var(brand-primary))"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        open={showAskSkyModal}
        onClose={() => {
          setShowAskSkyModal(false)
          setShouldStartCall(false)
        }}
        hideBackdrop
        sx={{ pointerEvents: 'none', backgroundColor: 'transparent' }}
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
            loadingChanged={(loading) => {}}
          />
        </div>
      </Modal>
    </div>
  );
}

export default AgencySupportWidget

// Get Help Button Component
export const GetHelpBtn = ({
  text = 'Get Help',
  avatar = null,
  handleReopen,
  customLogo = null,
  customTitle = null,
}) => {
  const logoUrl = customLogo || avatar || '/agentXOrb.gif'
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

