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
        <div 
            className='w-full h-full flex flex-col items-center justify-center px-4 sm:px-6'
            style={{ gap:4}}
        >
            <div 
                className="flex items-center justify-center"
                style={{ 
                    width: "clamp(16px, 24px, 30px)", 
                    height: "clamp(16px, 24px, 30px)" 
                }}
            >
                <Image
                    alt="*"
                    src={"/otherAssets/starsIcon2.png"}
                    fill={false}
                    height={32}
                    width={30}
                    className="flex-shrink-0 object-contain"
                    style={{ 
                        maxWidth: "100%", 
                        height: "auto",
                    }}
                />
            </div>

            <div 
                className='font-semibold text-center'
                style={{ 
                    fontSize: "clamp(10px, 14vw, 18px)",
                }}
            >
                {title}
            </div>
            <div 
                className='font-normal text-center w-full sm:w-[85%] md:w-[75%] leading-relaxed max-w-2xl'
                style={{ 
                    fontSize: "clamp(10px, 14px, 18px)",
                    lineHeight: "1.5"
                }}
            >
                {subTitle}
            </div>

            <button 
                className='flex flex-col text-white items-center justify-center w-[60%] sm:w-[50%] md:w-[45%] bg-purple rounded-lg font-medium hover:bg-purple/90 transition-colors shadow-lg hover:shadow-xl'
                style={{ 
                    height: "clamp(35px, 45px, 55px)",
                    fontSize: "clamp(10px, 13px, 16px)"
                }}
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