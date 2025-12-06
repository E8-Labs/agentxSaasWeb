'use client'

import axios from 'axios'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import Congrats from '@/components/onboarding/Congrats'
import FocusArea from '@/components/onboarding/FocusArea'
import SignUpForm from '@/components/onboarding/SignUpForm'
import UserService from '@/components/onboarding/UserService'
import UserType from '@/components/onboarding/UserType'

const Page = ({ params }) => {
  const [index, setIndex] = useState(0)

  let components = [UserType, UserService, FocusArea, SignUpForm, Congrats]

  let CurrentComp = components[index]

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
    backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100svh',
    overflow: 'hidden',
  }

  return (
    <div
      style={backgroundImage}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
    </div>
  )
}

export default Page
