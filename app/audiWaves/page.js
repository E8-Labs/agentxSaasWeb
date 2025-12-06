'use client'

import React from 'react'

import { AudioWaveActivity } from '@/components/askSky/askskycomponents/AudioWaveActivity'

const Page = () => {
  return (
    <div>
      <div className="text-2xl font-bold">Testing the audio waves</div>
      <div>
        <AudioWaveActivity isActive={true} />
      </div>
    </div>
  )
}

export default Page
