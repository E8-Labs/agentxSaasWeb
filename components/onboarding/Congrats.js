import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'

import AppLogo from '@/components/common/AppLogo'

// import Lottie from 'lottie-react';
import congratsAnimation from '../../public/congratsanimation.json'

// const lottie = dynamic(() => import('lottie-react'), {
//     ssr: false,
// });

const Congrats = () => {
  const lottieRef = useRef()
  const router = useRouter()

  const handleNext = (e) => {
    e.preventDefault()
    
    // Check if user is on mobile
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    const SM_SCREEN_SIZE = 640
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    )
    
    if (screenWidth <= SM_SCREEN_SIZE || isMobileDevice) {
      // Mobile: Navigate to payment step (step 4) to allow subscription
      router.push('/createagent?step=4')
    } else {
      // Desktop: Navigate to createagent
      router.push('/createagent')
    }
  }

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div className="bg-white rounded-2xl mx-2 w-full md:w-10/12 h-[90vh] py-4 pb-22 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
        <div className="px-4 flex flex-row justify-between items-center pt-8">
          <AppLogo
            height={29}
            width={122}
            alt="logo"
          />
        </div>
        {/* Body */}
        <div className="flex flex-col items-center justify-center px-4 w-full h-[85%]">
          <div className="mt-8 gap-4 flex flex-col overflow-hidden">
            {/* <Image src={"/assets/congrats.png"} style={{ height: "318px", width: "466px", resize: "contain" }} height={318} width={466} alt='*' /> */}
            <Image
              src={'/agentXOrb.gif'}
              style={{ height: '280px', width: '300px', resize: '' }}
              height={280}
              width={300}
              alt="*"
            />
          </div>
          <div
            className="mt-6 md:text-4xl text-lg font-[600]"
            style={{ textAlign: 'center' }}
          >
            Congrats!
          </div>
          <div
            className="mt-8 text-[#15151580]"
            style={{ fontWeight: '600', fontSize: 15 }}
          >
            Your account is created!
          </div>
          <div className="rounded-xl text-white bg-purple mt-8 flex justify-center items-center">
            <button
              className="text-white flex justify-center items-center rounded-xl"
              style={{
                fontWeight: '700',
                fontSize: '16',
                height: '50px',
                width: '191px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={handleNext}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Congrats
