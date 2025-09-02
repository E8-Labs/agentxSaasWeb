import { pauseSubscription } from '@/components/userPlans/UserPlanServices';
import { CircularProgress } from '@mui/material';
import moment from 'moment';
import Image from 'next/image';
import React, { useState } from 'react'

function PauseSubscription({
    handleContinue,
}) {

    const next30Days = moment().add(30, "days").format("MM/DD/YYYY");

    const [pauseLoading, setPuaseLoading] = useState(false)

    const handlePause = async () => {
        setPuaseLoading(true)
        await pauseSubscription()
        let nextAction = "closeModel"
        handleContinue(nextAction)
        setPuaseLoading(false)
    }

    return (
        <div className='w-full flex flex-col items-center gap-2'>

            <Image src={'/otherAssets/pauseIcon.png'}
                height={72} width={72} alt="*"
            />

            <div className='text-xl font-semibold mt-2'>
                Pause Subscription Instead
            </div>

            <div className='text-base font-normal text-center'>
                Need some time off? No problem. You can take a short break instead or end your subscription now. Your data is safe, your billing’s on hold, and your account will automatically resume
                in 30 days on <span className='font-bold'>{`[${next30Days}]`}.</span>
            </div>
            <div className=' flex flex-col px-6 w-full mt-8'>
                {
                    pauseLoading ? (
                        <CircularProgress size={20} />
                    ) : (
                        <button className='flex flex-col items-center justify-center h-[50px] w-full bg-purple rounded-lg text-base font-normal text-white mt-2 '
                            onClick={handlePause}
                        >
                            Pause Subscription
                        </button>
                    )
                }


                <button className='flex flex-col items-center justify-center h-[50px] w-full border rounded-lg text-base font-normal mt-4'
                    onClick={()=>{
                        let nextAction = "claimGift"
                        handleContinue(nextAction)
                    }}
                >
                    Continue to Cancel
                </button>
            </div>
        </div>
    )
}

export default PauseSubscription