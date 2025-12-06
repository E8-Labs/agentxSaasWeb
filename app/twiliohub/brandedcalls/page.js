'use client'

import React from 'react'

import BrandedCallsAnimation from '@/components/twiliohub/brandedCalls/BrandedCallsAnimation'
import TwilioCustomerProfileAnimation from '@/components/twiliohub/customerprofile/TwilioCustomerProfileAnimation'
import TwilioHeader from '@/components/twiliohub/twilioglobalcomponents/TwilioHeader'

const Page = () => {
  return (
    <div className="h-screen w-full">
      <div className="w-full px-8 h-[10vh] border-b">
        <TwilioHeader />
      </div>
      <div className="h-[90vh] flex flex-row items-start flex flex-row justify-center overflow-hidden">
        <div className="w-10/12 pt-8 flex flex-row items-start justify-center h-[100%]">
          <BrandedCallsAnimation />
        </div>
      </div>
    </div>
  )
}

export default Page
