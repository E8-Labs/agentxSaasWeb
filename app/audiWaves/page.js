"use client"
import { AudioWaveActivity } from '@/components/askSky/askskycomponents/AudioWaveActivity'
import React from 'react';


const Page = () => {
    return (
        <div>
            <div className='text-2xl font-bold'>
                Testing the audio waves
            </div>
            <div>
                <AudioWaveActivity isActive={true} />
            </div>
        </div>
    )
}

export default Page;
