import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image'
import React, { useState } from 'react'

function UpgardView({
    title,
    subTitle
}) {

    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);

    const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)



    return (
        <div className='w-full flex flex-col items-center justify-center gap-3 px-6 mt-8'>
            <Image
                alt="*"
                src={"/otherAssets/starsIcon2.png"}
                height={28}
                width={26}
            />

            <div className='text-lg font-semibold'>
                {title}
            </div>
            <div className='text-[14px] font-normal text-center w-[70%]'>
                {subTitle}
            </div>

            <button className='flex flex-col text-white items-center justify-center h-[50px] mt-6 w-[50%] bg-purple rounded-lg'
            onClick={() => {
               setShowUpgradePlanPopup(true)
              }}
            >
                Upgrade Plan
            </button>


            <Elements stripe={stripePromise}>
            <UpgradePlan
                open={showUpgradePlanPopup}
                handleClose={() => {
                    setShowUpgradePlanPopup(false)
                }}


            />
        </Elements>

        </div>
    )
}

export default UpgardView