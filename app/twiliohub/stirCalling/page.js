"use client"
import StirCalling from '@/components/twiliohub/stirCalling/StirCalling'
import TwilioHeader from '@/components/twiliohub/twilioglobalcomponents/TwilioHeader'
import React from 'react'

const Page = () => {
    return (
        <div className='h-screen'>
            <div className='w-full px-8 h-[10vh] border-b'>
                <TwilioHeader />
            </div>
            <div className='h-[90vh]'>
                <StirCalling />
            </div>
        </div>
    )
}

export default Page;
