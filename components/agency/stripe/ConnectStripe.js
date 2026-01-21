'use client'

import { CircularProgress } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import getProfileDetails from '@/components/apis/GetProfile'
import IntroVideoModal from '@/components/createagent/IntroVideoModal'
import VideoCard from '@/components/createagent/VideoCard'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { getStripeLink } from '@/components/onboarding/services/apisServices/ApiService'
import { HowToVideoTypes } from '@/constants/Constants'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'
import StripeDetailsCard from './StripeDetailsCard'
import { Play } from 'lucide-react'

const ConnectStripe = ({ fullScreen = false }) => {
  const router = useRouter()
  const [loader, setLoader] = useState(false)
  const [checkStripeStatus, setCheckStripeStatus] = useState(false)
  const [checkStripeStatusLoader, setCheckStripeStatusLoader] = useState(false)
  const [agencydata, setAgencyData] = useState(null)
  const [snackMsg, setSnackMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Warning)
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    checkStripe()
  }, [])

  const checkStripe = async () => {
    try {
      setCheckStripeStatusLoader(true)
      const agencyProfile = await getProfileDetails()
      const stripeStatus =
        agencyProfile?.data?.data?.canAcceptPaymentsAgencyccount

      setAgencyData(agencyProfile?.data?.data)
      setCheckStripeStatus(Boolean(stripeStatus))
    } catch (error) {} finally {
      setCheckStripeStatusLoader(false)
    }
  }

  const handleSkip = () => {
    router.push('/agency/dashboard')
  }

  const handleVerifyClick = async () => {
    const popupWindow = window.open(
      'about:blank',
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes',
    )

    if (popupWindow) {
      popupWindow.document.write(
        '<html><body><div style="text-align:center;margin-top:50px;"><h2>Connecting to Stripe...</h2><p>Please wait while we redirect you to Stripe Connect.</p></div></body></html>',
      )
    }

    await getStripeLink(setLoader, popupWindow)
  }

  const styles = {
    btnText: {
      fontSize: '15px',
      fontWeight: '500',
      outline: 'none',
      border: 'none',
    },
  }

  const connectBankTutorial = getTutorialByType(
    HowToVideoTypes.ConnectBankAgency,
  )
  const connectBankVideoUrl =
    getVideoUrlByType(HowToVideoTypes.ConnectBankAgency) ||
    connectBankTutorial?.videoUrl

  return (
    <div
      className={`w-full flex flex-row items-center justify-center ${fullScreen ? 'h-screen' : ''}`}
    >
      <IntroVideoModal
        open={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoTitle={
          connectBankTutorial?.title || 'Learn how to connect your Stripe account'
        }
        videoUrl={connectBankVideoUrl}
        videoDescription={connectBankTutorial?.description}
      />
      <AgentSelectSnackMessage
        isVisible={snackMsg !== null}
        message={snackMsg}
        hide={() => {
          setSnackMsg(null)
        }}
        type={snackMsgType}
      />
      <div className="h-full w-full flex flex-row items-center justify-center">
        {checkStripeStatusLoader ? (
          <CircularProgress size={30} />
        ) : (
          <div className="h-full w-full flex flex-col gap-4 items-center justify-center">

            {checkStripeStatus ? (
              <StripeDetailsCard
                stripeData={agencydata?.stripeAccount}
                fromDashboard={false}
              />
            ) : (
              <div
                className={`w-[28rem] rounded-2xl shadow-lg bg-white border border-gray-200 ${fullScreen ? '' : 'mt-6'}`}
              >
                <div
                  className="w-full flex flex-row items-start justify-end rounded-t-2xl h-[200px]"
                  style={{
                    backgroundImage: "url('/agencyIcons/stripeNotConnected.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <button className="bg-white p-2 rounded-full px-2 py-1 mt-4 me-4 flex flex-row items-center justify-center">
                    <Image
                      alt="*"
                      src={'/agencyIcons/redDot.png'}
                      height={20}
                      width={20}
                    />
                    <p
                      className="text-black"
                      style={{ fontSize: '12px', fontWeight: '400' }}
                    >
                      Not Connected
                    </p>
                  </button>
                </div>
                <div
                  className="flex flex-row items-center justify-center"
                  style={{ marginTop: '-35px' }}
                >
                  <Image
                    alt="*"
                    src={'/agencyIcons/stripeLogo.png'}
                    height={70}
                    width={70}
                  />
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '15px',
                      color: '#000000',
                    }}
                  >
                    Your agency account is created.
                  </div>
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '15px',
                      color: '#000000',
                    }}
                  >
                    Lets add your Stripe detail for payouts.
                  </div>
                  {loader ? (
                    <div className="mt-4">
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 w-full mt-4">
                      <button
                        className="bg-purple text-white py-2 px-4 rounded-md w-full h-[40px]"
                        style={styles.btnText}
                        onClick={() => {
                          if (agencydata?.canAcceptPaymentsAgencyccount) {
                            setSnackMsg('Stripe already connected.')
                          } else {
                            handleVerifyClick()
                          }
                        }}
                      >
                        Add Stripe
                      </button>
                      {fullScreen ? (
                        <button
                          className="text-gray-600 py-2 px-4 rounded-md w-full h-[40px] border border-gray-300 hover:bg-gray-50 transition-colors"
                          style={styles.btnText}
                          onClick={handleSkip}
                        >
                          Skip for now
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}



<div className="flex flex-row items-center gap-4">
          <button
            className="text-[15px] font-[500] text-brand-primary outline-none border-none cursor-pointer"
            onClick={() => {
              setShowVideoModal(true)
            }}
          >
            {'Learn how to connect your Stripe account'}
          </button>
          <Play onClick={() => {
              setShowVideoModal(true)
            }} size={18} 
          weight='bold'
          className="text-brand-primary cursor-pointer"
          
          style={{ color: 'hsl(var(--brand-primary))' }}
          />
          {/* <Image
            src="/otherAssets/playIcon.jpg"
            alt="info"
            width={10}
            height={10}
            className="cursor-pointer"
            onClick={() => setIntroVideoModal2(true)}
          /> */}
        </div>

            {/* <div className="w-full flex items-center justify-center">
              <VideoCard
                horizontal={false}
                title={
                  connectBankTutorial?.title ||
                  'Connect your bank account with Stripe'
                }
                duration={connectBankTutorial?.description || '4:00'}
                playVideo={() => setShowVideoModal(true)}
              />
            </div> */}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectStripe
