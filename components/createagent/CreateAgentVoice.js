import { CircularProgress, Modal } from '@mui/material'
//import for input drop down menu
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { PauseCircle, PlayCircle } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { UserTypes } from '@/constants/UserTypes'

import Apis from '../apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'
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

  const avatarImages = [
    '/assets/avatar1.png',
    '/assets/avatar2.png',
    '/assets/avatar3.png',
    // "/assets/avatar4.png",
    // "/assets/avatar5.png",
    // "/assets/avatar6.png",
    // "/assets/avatar7.png",
    // "/assets/avatar8.png",
    // "/assets/avatar9.png",
    // "/assets/avatar10.png",
  ]

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

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        ...(shouldShowGradient && gradientBackground ? { background: gradientBackground } : {}),
      }}
      className={`overflow-y-hidden flex flex-row justify-center items-center ${shouldShowGradient ? '' : 'bg-brand-primary'}`}
    >
      <div className="bg-white rounded-2xl w-10/12 h-[100%] sm:h-[95%] py-4 flex flex-col relative">
        <div className="h-[95svh] sm:h-[92svh] overflow-hidden pb-24">
          {/* header */}
          <div className="h-[10%]">
            <Header />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[95%]">
            <div
              className="w-11/12 md:text-4xl text-lg font-[700] mt-6"
              style={{
                textAlign: 'center',
                marginTop: isSubaccount ? '-40px' : undefined,
              }}
            >
              Choose a voice for {agentDetails?.name}
            </div>
            <div className="w-full flex flex-row  justify-center min-h-0">
              <div
                className="pt-8 pb-8 w-full max-w-2xl gap-1 flex flex-col flex overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
                style={{ scrollbarWidth: 'none' }}
              >
                {voices.map((item, index) => (
                  <button
                    key={index}
                    style={{
                      border:
                        item.name === selectedVoiceId
                          ? '2px solid hsl(var(--brand-primary))'
                          : '',
                      backgroundColor:
                        item.name === selectedVoiceId ? 'hsl(var(--brand-primary) / 0.1)' : '',
                    }}
                    className="flex flex-row items-center border mt-4 p-2 justify-between h-[100px] px-2 rounded-xl outline-none"
                    onClick={(e) => {
                      handleToggleClick(index, item)
                      // playVoice(item.preview);
                    }}
                  >
                    <div className="flex flex-row items-center gap-4">
                      <div
                        className="flex flex-row items-center justify-center"
                        style={{
                          height: '50px',
                          width: '50px',
                          borderRadius: '50%',
                          // backgroundColor:
                          //   item.name === selectedVoiceId
                          //     ? 'white'
                          //     : '#d3d3d380',
                        }}
                      >
                        {/* <Image src={"/assets/warning.png"} height={40} width={35} alt='*' /> */}
                        <Image
                          // src={avatarImages[index % avatarImages.length]} // Deterministic selection
                          src={item.img} // Deterministic selection
                          height={getImageHeight(item)}
                          width={getImageWidth(item)}
                          style={{
                            // backgroundColor:'red',
                            borderRadius: '50%',
                            // marginTop: addMarginTop(item),
                            // marginLeft: addMariginLeft(item),
                          }}
                          alt="*"
                        />
                      </div>
                      <div>
                        <div
                          className="text-start flex flex-row items-center gap-2"
                          style={{
                            fontSize: 17,
                            fontWeight: '700',
                          }}
                        >
                          {item.name}
                          {item.status && (
                            <div className="text-start text-white text-sm font-[500] bg-brand-primary rounded-full px-2 w-fit-content">
                              {item.status}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                          }}
                        >
                          {item.Dialect}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      <div>
                        <svg
                          width="23"
                          height="15"
                          viewBox="0 0 23 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-brand-primary"
                          style={{ color: 'hsl(var(--brand-primary))' }}
                        >
                          <rect x="0" y="10" width="3" height="5" rx="1.5" fill="currentColor" />
                          <rect x="5" y="7" width="3" height="8" rx="1.5" fill="currentColor" />
                          <rect x="10" y="4" width="3" height="11" rx="1.5" fill="currentColor" />
                          <rect x="15" y="6" width="3" height="9" rx="1.5" fill="currentColor" />
                          {/* <rect x="20" y="9" width="3" height="6" rx="1.5" fill="currentColor" /> */}
                        </svg>
                      </div>
                      {item.preview ? (
                        <div>
                          {preview === item.preview ? (
                            <div
                              onClick={() => {
                                if (audio) {
                                  audio.pause()
                                  audio.removeEventListener('ended', () => {})
                                }
                                setPreview(null)
                              }}
                            >
                              <PauseCircle size={38} weight="regular" />
                            </div>
                          ) : (
                            <div
                              onClick={(e) => {
                                setPreview(item.preview)
                                playVoice(item.preview)
                              }}
                            >
                              <Image
                                src={'/assets/play.png'}
                                height={25}
                                width={25}
                                alt="*"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div
                            onClick={(e) => {
                              setShowNoAudioModal(item)
                            }}
                          >
                            <Image
                              src={'/assets/play.png'}
                              height={25}
                              width={25}
                              alt="*"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* {
                            voicesLoader ?
                                <div className='w-full flex flex-row justify-center mt-8'>
                                    <CircularProgress size={35} />
                                </div> :
                                
                        } */}
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

        {/* Fixed Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="px-4 pt-3 pb-2">
            <ProgressBar value={33} />
          </div>
          <div className="flex items-center justify-between w-full " style={{ minHeight: '50px' }}>
            <Footer
              handleContinue={handleContinue}
              handleBack={handleBack}
              registerLoader={voicesLoader}
              shouldContinue={shouldContinue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAgentVoice
