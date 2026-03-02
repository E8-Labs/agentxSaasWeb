import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getStripeLink } from '@/components/onboarding/services/apisServices/ApiService'
import { getBrandPrimaryHex, getBrandPrimaryHsl } from '@/utilities/colorUtils'
import { PersistanceKeys } from '@/constants/Constants'

const AgencyWalkThrough = ({ open, onClose }) => {
  const router = useRouter()
  const [checklist, setChecklist] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loader, setLoader] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [playedVideos, setPlayedVideos] = useState(new Set())

  // Get brand color for checkmark icons
  const getBrandColor = () => {
    if (typeof window === 'undefined') return 'hsl(270 75% 50%)'
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()
    return brandColor && brandColor.length >= 3 ? `hsl(${brandColor})` : 'hsl(270 75% 50%)'
  }

  const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  useEffect(() => {
    getChecklistData()
  }, [])

  // Reset video loading state when step changes
  useEffect(() => {
    const currentItem = checklist[currentStep]
    if (currentItem?.videoUrl) {
      setVideoLoading(true)
    } else {
      setVideoLoading(false)
    }
  }, [currentStep, checklist])

  const getChecklistData = () => {
    setChecklist([
      {
        id: 1,
        label: 'Platform Walkthrough',
        videoUrl: '/videos/Platformwalkthrough.mp4',
        route: null,
      },
      {
        id: 2,
        label: 'Connecting Stripe',
        videoUrl: '/videos/stripVideo.mp4',
        route: null,
      },
      {
        id: 3,
        label: 'Connecting Twilio',
        videoUrl: '/videos/twilioVideo.mp4',
        route: '/agency/dashboard/integration',
      },
      {
        id: 4,
        label: 'Join us on Skool',
        videoUrl: null,
        route: PersistanceKeys.AgencySkoolUrl,
      },
    ])
  }

  const handleItemClick = (item, index) => {
    setCurrentStep(index)
  }

  const handleJoinCommunity = (skoolUrl) => {
    window.open(skoolUrl, '_blank')
    setPlayedVideos((prev) => new Set([...prev, 4]))
  }

  const handleVideoPlay = () => {
    const currentItem = checklist[currentStep]
    if (currentItem && currentItem.id) {
      setPlayedVideos((prev) => prev.add(currentItem.id))
    }
  }

  const handleNext = async () => {
    const currentItem = checklist[currentStep]

    // Prevent moving forward if video is still loading (for steps with videos)
    if (currentItem?.videoUrl && videoLoading) {
      return
    }

    if (currentItem.id === 1) {
      // Platform Walkthrough - move to next step
      if (currentStep < checklist.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } else if (currentItem.id === 2) {
      // Connecting Stripe - move to next step
      if (currentStep < checklist.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } else if (currentItem.id === 3) {
      // Connecting Twilio - move to next step (Skool)
      if (currentStep < checklist.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } else if (currentItem.id === 4) {
      // Join us on Skool - mark walkthrough as shown and close
      localStorage.setItem('agencyWalkthroughShown', 'true')
      onClose()
    }
  }

  const handleClose = () => {
    // Mark walkthrough as shown when user closes it
    localStorage.setItem('agencyWalkthroughShown', 'true')
    onClose()
  }

  const currentVideoUrl = checklist[currentStep]?.videoUrl
  const skoolItem = checklist.find((item) => item.id === 4)
  const isSkoolStep = checklist[currentStep]?.id === 4

  return (
    <>
      {/* Main Walkthrough Modal */}
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000040',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box className="w-7/12" sx={modalStyles}>
          <div
            className="sm:w-full w-full"
            style={{
              backgroundColor: '#ffffff',
              padding: 24,
              borderRadius: '13px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Close Button */}
            <div className="flex flex-row justify-between items-start mb-4">
              <div className="flex flex-col gap-2">
                {/* Title */}
                <div style={{ fontWeight: '700', fontSize: 22 }}>
                  {'Lets get started in 3 quick steps!'}
                </div>

                {/* Description */}
                <div
                  className="text-gray-600"
                  style={{ fontWeight: '400', fontSize: 16 }}
                >
                  Watch these short video tutorials to properly setup your
                  agency.{' '}
                  <span
                    className="text-brand-primary cursor-pointer hover:underline"
                    onClick={() => {
                      window.open(skoolItem?.route, '_blank')
                    }}
                  >
                    Join us on Skool for more tutorials
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="outline-none border-none"
              >
                <Image
                  src="/assets/crossIcon.png"
                  height={40}
                  width={40}
                  alt="Close"
                />
              </button>
            </div>

            {/* Two Column Layout */}
            <div className="flex flex-row gap-6 flex-1 overflow-hidden">
              {/* Left Column - Checklist */}
              <div className="flex flex-col w-2/5 min-w-[300px]">
                {/* Checklist */}
                <div className="relative flex flex-col gap-6 flex-1 overflow-y-auto pr-4">
                  {/* Vertical connecting line */}
                  {checklist.length > 1 && (
                    <div
                      className="absolute left-2.5 top-6 w-0.5 z-0"
                      style={{
                        backgroundColor: getBrandPrimaryHex(),
                        height: `${(checklist.length - 1) * 42}px`, // 56px per item (24px icon + 24px gap + 8px spacing)
                      }}
                    />
                  )}

                  {checklist.map((item, index) => {
                    const isActive = currentStep === index
                    const isPlayed = playedVideos.has(item.id)

                    return (
                      <button
                        key={item.id}
                        className="relative flex flex-row items-center gap-4 outline-none border-none w-full group cursor-pointer"
                        onClick={() => handleItemClick(item, index)}
                      >
                        {/* Circular icon container */}
                        <div className="relative flex-shrink-0 border-3 z-10">
                          {/* Checkmark or empty state */}
                          {isPlayed ? (
                            <div
                              className="rounded-full relative flex p-2 items-center justify-center"
                              style={{
                                width: 24,
                                height: 24,
                                minWidth: 24,
                                minHeight: 24,
                                backgroundColor: getBrandColor(),
                                border: '5px solid #fff',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s ease-in-out',
                              }}
                            >
                              {/* White checkmark overlay */}
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ position: 'absolute', zIndex: 1 }}
                              >
                                <path
                                  d="M10 3L4.5 8.5L2 6"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div
                              className="rounded-full"
                              style={{
                                width: 24,
                                height: 24,
                                minWidth: 24,
                                minHeight: 24,
                                backgroundColor: 'hsl(0 0% 80%)',
                                border: '5px solid #fff',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s ease-in-out',
                              }}
                            />
                          )}
                        </div>

                        {/* Label */}
                        <div className="flex-1 text-left">
                          <div
                            className={`font-regular text-[16px] ${
                              isActive ? 'text-brand-primary' : 'text-gray-700'
                            } transition-colors`}
                          >
                            {item.label}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Next Button */}
                {
                  <button
                    onClick={handleNext}
                    disabled={loader || (currentVideoUrl && videoLoading)}
                    className="w-full bg-brand-primary text-white rounded-lg py-3 px-4 font-semibold text-base mt-4 hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loader || (currentVideoUrl && videoLoading) ? (
                      <>
                        <CircularProgress
                          size={20}
                          style={{ color: 'white' }}
                        />
                        <span>Loading...</span>
                      </>
                    ) : currentStep === checklist.length - 1 ||
                      currentStep === checklist.length - 1 ? (
                      'Done'
                    ) : (
                      'Next'
                    )}
                  </button>
                }
              </div>

              {/* Right Column - Video Player or Skool UI */}
              <div className="flex flex-col w-3/5 flex-1 min-h-0">
                {isSkoolStep ? (
                  <div
                    className="w-full h-full flex items-center justify-center rounded-lg min-h-[300px]"
                    style={{
                      backgroundColor: '#F2F9FF',
                      padding: 48,
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 24,
                    }}
                  >
                    {/* Skool Logo */}
                    <div className="flex items-center justify-center">
                      <Image
                        src="/otherAssets/skool-logo.svg"
                        alt="Skool"
                        height={80}
                        width={200}
                        className="object-contain"
                      />
                    </div>

                    {/* Join Community Button */}
                    <button
                      onClick={() => handleJoinCommunity(skoolItem?.route)}
                      className="w-full bg-brand-primary text-white rounded-lg py-4 px-6 font-semibold text-lg hover:bg-brand-primary/90 transition-colors"
                      style={{
                        maxWidth: '400px',
                      }}
                    >
                      Join Community
                    </button>
                  </div>
                ) : currentVideoUrl ? (
                  <div className="relative w-full h-[40vh] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      key={currentVideoUrl}
                      controls
                      autoPlay
                      muted={false}
                      onLoadStart={() => setVideoLoading(true)}
                      onLoadedData={() => setVideoLoading(false)}
                      onCanPlay={() => setVideoLoading(false)}
                      onError={() => setVideoLoading(false)}
                      onPlay={handleVideoPlay}
                      className="w-full h-[40vh]"
                      style={{
                        maxHeight: '70vh',
                        borderRadius: 15,
                      }}
                    >
                      <source src={currentVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg min-h-[400px]">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-semibold mb-2">
                        No video available
                      </p>
                      <p className="text-sm">
                        Select a step to view the tutorial
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  )
}

export default AgencyWalkThrough
