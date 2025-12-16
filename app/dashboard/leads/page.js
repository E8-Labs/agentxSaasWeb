'use client'

import axios from 'axios'
import React, { Suspense, useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import Leads1 from '@/components/dashboard/leads/Leads1'

const Page = ({ params }) => {
  const [index, setIndex] = useState(0)

  let components = [Leads1]

  let CurrentComp = components[index]

  const [showPlansPopup, setShowPlansPopup] = useState(false)

  useEffect(() => {
    getProfile()
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

  //function to get user profile details
  const getProfile = async () => {
    try {
      let response = await getProfileDetails()

      // //console.log;

      if (response) {
        if (response?.data?.data?.plan?.status === 'cancelled') {
          setShowPlansPopup(true)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
  }

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100svh',
    overflow: 'hidden',
  }

  return (
    <Suspense>
      <div
        style={backgroundImage}
        className="overflow-y-none flex flex-row justify-center items-center bg-white"
      >
        <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
      </div>
    </Suspense>
  )
}

export default Page
