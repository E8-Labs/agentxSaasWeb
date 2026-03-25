import { CircularProgress, Modal } from '@mui/material'
import Box from '@mui/material/Box'
import { PauseCircle, PlayCircle } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'

import Apis from '../apis/Apis'
import voicesList from './Voices'

const CreateAgentVoice = ({ handleBack, user }) => {
  let synthKey = process.env.NEXT_PUBLIC_SynthFlowApiKey

  const router = useRouter()
  const [toggleClick, setToggleClick] = useState(null)
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [voices, setVoices] = useState([])
  const [voicesLoader, setVoicesLoader] = useState(false)
  const [selectedVoiceId, setSelectedVoiceId] = useState('')
  const [preview, setPreview] = useState(null)
  const [agentDetails, setAgentDetails] = useState(null)
  const [shouldContinue, setShouldContinue] = useState(true)
  const [audio, setAudio] = useState(null)

  const [showNoAudioModal, setShowNoAudioModal] = useState(null)
  const [shouldShowGradient, setShouldShowGradient] = useState(false)
  const [gradientBackground, setGradientBackground] = useState(null)

  // Function to get brand primary color from CSS variable
  const getBrandColor = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return 'hsl(270, 75%, 50%)'
    try {
      const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
      if (computedColor) {
        if (computedColor.startsWith('hsl')) {
          return computedColor
        } else {
          return `hsl(${computedColor})`
        }
      }
    } catch (error) {}
    return 'hsl(270, 75%, 50%)'
  }

  // Function to create gradient string
  const getGradientString = (brandColor) => {
    const hslMatch = brandColor.match(/hsl\(([^)]+)\)/)
    if (hslMatch) {
      let hslValues = hslMatch[1].trim()
      if (!hslValues.includes(',')) {
        const parts = hslValues.split(/\s+/)
        hslValues = parts.join(', ')
      }
      const baseColor = `hsl(${hslValues})`
      const colorWithOpacity = `hsla(${hslValues}, 0.4)`
      const gradientType = process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
        ? 'linear-gradient(to bottom left'
        : 'radial-gradient(circle at top right'
      return `${gradientType}, ${baseColor} 0%, ${colorWithOpacity} 100%)`
    }
    const gradientType = process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
      ? 'linear-gradient(to bottom left'
      : 'radial-gradient(circle at top right'
    return `${gradientType}, hsl(270, 75%, 50%) 0%, hsla(270, 75%, 50%, 0.4) 100%)`
  }

  // Check if user is subaccount or agency and set gradient
  useEffect(() => {
    const checkUserRole = () => {
      if (typeof window === 'undefined') return false
      
      const userData = localStorage.getItem('User')
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            return true
          }
        } catch (error) {}
      }
      
      const localUser = localStorage.getItem('LocalStorageUser')
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser)
          const userRole = parsed?.user?.userRole || parsed?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            return true
          }
        } catch (error) {}
      }
      
      const subAccountData = localStorage.getItem('SubaccoutDetails')
      if (subAccountData) {
        try {
          const parsed = JSON.parse(subAccountData)
          if (parsed) {
            return true
          }
        } catch (error) {}
      }
      
      return false
    }

    const initGradient = () => {
      const isSubaccountOrAgency = checkUserRole()
      if (isSubaccountOrAgency) {
        const brandColor = getBrandColor()
        const gradientStr = getGradientString(brandColor)
        setShouldShowGradient(true)
        setGradientBackground(gradientStr)
      } else {
        setShouldShowGradient(false)
        setGradientBackground(null)
      }
    }

    initGradient()
    const timeout = setTimeout(initGradient, 500)
    
    return () => clearTimeout(timeout)
  }, [isSubaccount])

  useEffect(() => {
    setVoices(voicesList)
    // Check if user is subaccount
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setIsSubaccount(
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
              parsedUser?.userRole === 'AgencySubAccount',
          )
        }
      } catch (error) {}
    }
  }, [])

  useEffect(() => {
    if (selectedVoiceId) {
      setShouldContinue(false)
    }
  }, [selectedVoiceId])

  useEffect(() => {
    // //console.log;
    const localData = localStorage.getItem('agentDetails')
    if (localData) {
      const agentData = JSON.parse(localData)
      // //console.log;
      setAgentDetails(agentData)
    }
  }, [])

  const handleToggleClick = (id, item) => {
    setToggleClick((prevId) => (prevId === id ? null : id))
    //// //console.log;
    setSelectedVoiceId(item.name)
  }

  const handleContinue = async () => {
    // e.preventDefaults();
    try {
      setVoicesLoader(true)
      let AuthToken = null
      let mainAgentId = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }

      // //console.log;

      const mainAgentData = localStorage.getItem('agentDetails')
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData)
        // //console.log;
        mainAgentId = Data.id
      }

      const ApiPath = Apis.updateAgent
      // const ApiData = {}
      const formData = new FormData()
      // //console.log;
      formData.append('mainAgentId', mainAgentId)
      // return
      formData.append('voiceId', selectedVoiceId)

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          // "Content-Type": "application/json"
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          //   router.push("/sellerskycquestions");
          // } else {
          //   // //console.log;
          //   router.push("/customerkycquestions");
          // }

          // Check if we came from admin/agency and have a return URL
          // const isFromAdminOrAgency = localStorage.getItem(
          //   PersistanceKeys.isFromAdminOrAgency,
          // )
          // const returnUrl = localStorage.getItem(
          //   PersistanceKeys.returnUrlAfterAgentCreation,
          // )

          // if (isFromAdminOrAgency) {
          //   // Parse the stored data to get subaccount info
          //   let subaccountData = null
          //   try {
          //     const parsed = JSON.parse(isFromAdminOrAgency)
          //     subaccountData = parsed?.subAccountData
          //   } catch (error) {
          //     console.log('Error parsing isFromAdminOrAgency:', error)
          //   }

          //   // Send event to parent window (opener) that agent was created
          //   if (window.opener && subaccountData) {
          //     try {
          //       window.opener.postMessage(
          //         {
          //           type: 'AGENT_CREATED',
          //           userId: subaccountData.id,
          //           agentId: mainAgentId,
          //         },
          //         '*', // In production, specify the exact origin
          //       )
          //       console.log('Sent AGENT_CREATED event to parent window')
          //     } catch (error) {
          //       console.log('Error sending message to parent window:', error)
          //     }
          //   }

          //   // Clean up the stored data
          //   localStorage.removeItem(PersistanceKeys.isFromAdminOrAgency)
          //   localStorage.removeItem(PersistanceKeys.returnUrlAfterAgentCreation)

          //   // Close the tab after a short delay to allow message to be sent
          //   setTimeout(() => {
          //     window.close()
          //   }, 500)
          // } else {
          router.push('/pipeline')
          // }

          localStorage.removeItem('claimNumberData')
        } else {
          setVoicesLoader(false)
        }
      }
    } catch (error) {
      // console.error("ERror occured in api is error0", error);
      setVoicesLoader(false)
    } finally {
    }
  }

  const playVoice = (url) => {
    if (audio) {
      audio.pause()
    }
    const ad = new Audio(url) // Create a new Audio object with the preview URL
    ad.play()
    setAudio(ad) // Play the audio

    // Handle when the audio ends
    ad.addEventListener('ended', () => {
      setPreview(null)
    })
  }

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '700',
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#000000',
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: '500',
      color: '#00000070',
    },
    callBackStyles: {
      height: '71px',
      width: '210px',
      border: '1px solid #15151550',
      borderRadius: '20px',
      fontWeight: '600',
      fontSize: 15,
    },
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  const getImageHeight = (item) => {
    // console.log('item is', item.name)
    return 45
    if (item.name === 'Ava') {
      return 50
    } else if (item.name === 'Zane') {
      return 50
    } else if (item.name === 'Trinity') {
      return 36 // Increased from 30
    } else if (item.name === 'Dax') {
      return 75 // Increased from 70
    } else if (item.name === 'Mia') {
      return 30
    } else if (item.name === 'Kaia') {
      return 30
    } else if (item.name === 'Axel') {
      return 28 // Reduced by 20% from 30
    } else if (item.name === 'Aria') {
      return 60
    } else if (item.name === 'Luna') {
      return 50
    } else if (item.name === 'Max') {
      return 26 // Reduced by 20% from 30
    }

    return 70
  }
  const getImageWidth = (item) => {
    return 45
    if (item.name === 'Ava') {
      return 50
    } else if (item.name === 'Zane') {
      return 50
    } else if (item.name === 'Trinity') {
      return 62 // Increased from 55
    } else if (item.name === 'Dax') {
      return 65 // Increased from 60
    } else if (item.name === 'Mia') {
      return 55
    } else if (item.name === 'Kaia') {
      return 50
    } else if (item.name === 'Axel') {
      return 28 // Reduced by 20% from 35
    } else if (item.name === 'Aria') {
      return 58
    } else if (item.name === 'Luna') {
      return 50
    } else if (item.name === 'Max') {
      return 32 // Reduced by 20% from 40
    }

    return 60
  }

  const addMarginTop = (item) => {
    return 0
    if (item.name === 'Trinity') {
      return 5
    } else if (item.name === 'Dax') {
      return 3
    } else if (item.name === 'Axel') {
      return 0
    } else if (item.name === 'Niko') {
      return 5
    } else if (item.name === 'Lex') {
      return 2
    } else if (item.name === 'Xen') {
      return 6
    } else if (item.name === 'Elon') {
      return 8
    } else if (item.name === 'Aria') {
      return 12
    }

    return 0
  }

  const addMariginLeft = (item) => {
    return 0
    if (item.name === 'Niko') {
      return 4
    } else if (item.name === 'Lex') {
      return 4
    } else if (item.name === 'Dax') {
      return 3
    } else if (item.name === 'Xen') {
      return 6
    } else if (item.name === 'Elon') {
      return 5
    }
    return 0
  }

  const VoiceListItem = ({ item, index }) => {
    const isSelected = item.name === selectedVoiceId
    const isPlaying = Boolean(item.preview) && preview === item.preview

    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        className={[
          // Reduced elevation ~60% vs previous; padding top/bottom 16px
          'w-full text-left rounded-[12px] bg-white px-3 py-4 shadow-[0px_4px_88px_rgba(0,0,0,0.024)] transition-all duration-150',
          'hover:bg-black/[0.01] active:scale-[0.995]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30',
        ].join(' ')}
        style={{
          border: isSelected ? '2px solid hsl(var(--brand-primary))' : '1px solid rgba(0,0,0,0.10)',
          backgroundColor: isSelected ? 'hsl(var(--brand-primary) / 0.06)' : '#ffffff',
        }}
        onClick={() => {
          handleToggleClick(index, item)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggleClick(index, item)
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar block */}
          <div className="h-[80px] w-[80px] shrink-0 rounded-[12px] bg-black/[0.02] flex items-center justify-center overflow-hidden">
            <div className="h-[54px] w-[54px] rounded-full bg-white shadow-[0px_3px_12px_rgba(0,0,0,0.08)] flex items-center justify-center">
              <Image
                src={item.img}
                height={getImageHeight(item)}
                width={getImageWidth(item)}
                alt=""
                style={{
                  borderRadius: '9999px',
                  marginTop: addMarginTop(item),
                  marginLeft: addMariginLeft(item),
                }}
              />
            </div>
          </div>

          {/* Copy */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="text-[14px] font-normal text-black truncate">{item.name}</div>
              {item.status ? (
                <div className="px-2 py-[2px] bg-brand-primary/12 rounded-[8px]">
                  <div className="text-[12px] font-semibold leading-[16px] tracking-[-0.36px] text-brand-primary">
                    {String(item.status).toUpperCase()}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-1 text-[14px] font-normal leading-[1.6] text-[#666] truncate">
              {item.Dialect}
            </div>
          </div>

          {/* Play pill */}
          <button
            type="button"
            className={[
              'shrink-0 rounded-[64px] bg-white shadow-[0px_13px_33.9px_rgba(0,0,0,0.08)] px-3 py-2 flex items-center gap-3',
              'transition-all duration-150 hover:shadow-[0px_16px_40px_rgba(0,0,0,0.10)] active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30',
            ].join(' ')}
            onClick={(e) => {
              e.stopPropagation()

              if (!item.preview) {
                setShowNoAudioModal(item)
                return
              }

              if (isPlaying) {
                if (audio) audio.pause()
                setPreview(null)
                return
              }

              setPreview(item.preview)
              playVoice(item.preview)
            }}
            aria-label={isPlaying ? 'Pause voice preview' : 'Play voice preview'}
          >
            <div
              aria-hidden="true"
              className={[
                'fc-waveform flex items-end gap-[3px] h-[14px] w-[52px]',
                isPlaying ? 'is-playing text-brand-primary' : 'text-black/30',
              ].join(' ')}
              style={{
                color: isPlaying ? 'hsl(var(--brand-primary))' : 'rgba(0,0,0,0.30)',
              }}
            >
              <span className="fc-wavebar h-[6px]" />
              <span className="fc-wavebar h-[10px]" />
              <span className="fc-wavebar h-[14px]" />
              <span className="fc-wavebar h-[12px]" />
              <span className="fc-wavebar h-[9px]" />
              <span className="fc-wavebar h-[7px]" />
              <span className="fc-wavebar h-[10px]" />
              <span className="fc-wavebar h-[13px]" />
              <span className="fc-wavebar h-[9px]" />
              <span className="fc-wavebar h-[6px]" />
            </div>
            <div className="h-7 w-7 rounded-full bg-brand-primary flex items-center justify-center">
              {isPlaying ? (
                <PauseCircle size={16} color="#ffffff" weight="fill" />
              ) : (
                <PlayCircle size={16} color="#ffffff" weight="fill" />
              )}
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white w-full h-[100svh] overflow-hidden">
      <style jsx global>{`
        .fc-waveform .fc-wavebar {
          width: 3px;
          border-radius: 9999px;
          background: currentColor;
          transform-origin: bottom;
          transform: scaleY(1);
        }

        @keyframes fcWavePulse {
          0% {
            transform: scaleY(0.45);
            opacity: 0.55;
          }
          35% {
            transform: scaleY(1);
            opacity: 1;
          }
          70% {
            transform: scaleY(0.6);
            opacity: 0.75;
          }
          100% {
            transform: scaleY(0.45);
            opacity: 0.55;
          }
        }

        .fc-waveform.is-playing .fc-wavebar {
          animation: fcWavePulse 900ms ease-in-out infinite;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(1) {
          animation-delay: -120ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(2) {
          animation-delay: -260ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(3) {
          animation-delay: -420ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(4) {
          animation-delay: -180ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(5) {
          animation-delay: -340ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(6) {
          animation-delay: -520ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(7) {
          animation-delay: -220ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(8) {
          animation-delay: -460ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(9) {
          animation-delay: -300ms;
        }
        .fc-waveform.is-playing .fc-wavebar:nth-child(10) {
          animation-delay: -560ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .fc-waveform.is-playing .fc-wavebar {
            animation: none;
          }
        }
      `}</style>
      <div className="relative flex w-full h-[100svh]">
        {/* Left panel */}
        <div className="relative bg-[#f9f9f9] w-full lg:basis-[65%] lg:flex-[0_0_65%] flex flex-col h-[100svh] overflow-hidden">
          {/* header */}
          <div className="sticky top-0 z-40 shrink-0 bg-[#f9f9f9] shadow-[0_1px_0_0_rgba(21,21,21,0.08)]">
            <Header variant="createAgentToolbar" />
          </div>

          {/* body wrapper */}
          <div className="flex-1 w-full flex justify-center overflow-y-auto">
            <div className="w-full max-w-[600px] flex flex-col items-center gap-3 p-6">
              <div className="w-full text-center text-[22px] font-semibold leading-[30px] tracking-[-0.77px] text-black">
                Choose a Voice.
              </div>

              <div
                className="w-full flex flex-col items-start gap-3 pb-6 pt-3"
                style={{ scrollbarWidth: 'none' }}
              >
                {/* Voice list to be refactored below */}
                <div className="w-full flex flex-col gap-3">
                  {voices.map((item, index) => (
                    <VoiceListItem key={index} item={item} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* Modal for video */}
        <Modal
          open={showNoAudioModal}
          onClose={() => setShowNoAudioModal(null)}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="sm:w-full w-full"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                }}
              >
                <div className="flex flex-row justify-end">
                  <button
                    onClick={() => {
                      setShowNoAudioModal(null)
                    }}
                  >
                    <Image
                      src={'/assets/crossIcon.png'}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>

                <div
                  className="text-center sm:font-24 font-16"
                  style={{ fontWeight: '700' }}
                >
                  Learn more about assigning leads
                </div>

                <div className="mt-6 text-red text-center font-[600] text-xl">
                  No voice added by{' '}
                  <span className="underline">{showNoAudioModal?.name}</span>
                </div>

                {/* Can be use full to add shadow */}
                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
              </div>
            </div>
          </Box>
        </Modal>

          {/* bottom */}
          <div className="sticky bottom-0 z-40 bg-[#f9f9f9] w-full">
            <div className="border-t border-black/10">
              <ProgressBar value={33} />
            </div>
            <div className="border-t border-black/10 h-[65px] flex items-center justify-end px-8">
              {voicesLoader ? (
                <div className="w-[100px] flex items-center justify-center">
                  <CircularProgress size={22} />
                </div>
              ) : (
                <button
                  type="button"
                  disabled={shouldContinue}
                  className="h-9 min-h-[36px] rounded-[8px] px-4 text-[14px] font-semibold tracking-[0.07px] text-white bg-brand-primary hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:bg-black/10 disabled:text-black/60 disabled:hover:opacity-100 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                  onClick={handleContinue}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden lg:block lg:basis-[35%] lg:flex-[0_0_35%] bg-brand-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-1/2 -translate-x-1/2 top-[230px] w-[1146px] h-[570px] border border-white/30 bg-white/[0.01]" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[-30px] w-[460px] h-[1090px] border border-white/30 bg-white/[0.01]" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[460px] h-[481px] border-t-4 border-white bg-gradient-to-b from-white/10 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAgentVoice
