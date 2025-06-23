"use client"
import TwilioIntegrations from '@/components/twiliohub/twilioIntegrations/TwilioIntegrations'
import TwilioHeader from '@/components/twiliohub/twilioglobalcomponents/TwilioHeader'
import React from 'react'

const Page = () => {
    return (
        <div>
            <div className='w-full px-8 h-[10vh] border-b'>
                <TwilioHeader />
            </div>
            <div className='h-[90vh]'>
                <TwilioIntegrations />
            </div>
        </div>
    )
}

export default Page
