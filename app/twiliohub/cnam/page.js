"use client"

import Cnammain from '@/components/twiliohub/cnamtab/Cnammain'
import TwilioHeader from '@/components/twiliohub/twilioglobalcomponents/TwilioHeader'
import React from 'react'

const Page = () => {
  return (
    <div>
      <div className='w-full px-8 h-[10vh] border-b'>
        <TwilioHeader />
      </div>
      <div className='h-[90vh]'>
        <Cnammain />
      </div>
    </div>
  )
}

export default Page
