'use client'

import dynamic from 'next/dynamic.js'
import React, { useEffect, useState } from 'react'

import BackgroundVideo from '@/components/general/BackgroundVideo.js'

const AddCalender = dynamic(
  () => import('../../components/pipeline/AddCalender.js'),
)
const Pipeline1 = dynamic(
  () => import('../../components/pipeline/Pipeline1.js'),
)
const Pipeline2 = dynamic(
  () => import('../../components/pipeline/Pipeline2.js'),
)

const Page = () => {
  const [index, setIndex] = useState(1)
  const [isSubaccount, setIsSubaccount] = useState(false)
  let components = [AddCalender, Pipeline1, Pipeline2]

  let CurrentComp = components[index]

  useEffect(() => {
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
      } catch (error) {
        console.log('Error parsing user data:', error)
      }
    }
  }, [])

  // Function to proceed to the next step
  const handleContinue = () => {
    // //console.log;
    setIndex(index + 1)
  }

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1)
  }

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100vh',
    overflow: 'none',
    // backgroundColor: 'red'
  }

  return (
    <div
      style={{ ...backgroundImage }}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1, // Ensure the video stays behind content
        }}
      >
        {isSubaccount ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
                  ? `linear-gradient(to bottom left, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary) / 0.3) 100%)`
                  : `radial-gradient(circle at top right, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary) / 0.3) 100%)`,
            }}
          />
        ) : (
          <BackgroundVideo />
        )}
      </div>
      <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
    </div>
    // <div className='w-full h-screen' style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems:" center" }}>
    //     <div style={{width: "90%", height: "80%"}}>

    //     </div>
    // </div>
  )
}

export default Page
