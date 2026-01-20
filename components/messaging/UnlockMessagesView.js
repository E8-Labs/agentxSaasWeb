import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import React, { useState } from 'react'

import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { useUser } from '@/hooks/redux-hooks'

function UnlockMessagesView() {
  const [showUpgradePlan, setShowUpgradePlan] = useState(false)
  const { user: reduxUser } = useUser()
  const stripePromise = getStripe()

  return (
    <>
      <div className='w-full h-full flex flex-col items-center justify-center gap-3'>
        <Image src='/otherAssets/noTemView.png' alt='no tem view' width={240} height={240} />
        <div className='text-2xl font-bold'>Unlock Messages</div>
        <div className='text-sm text-gray-500'>Upgrade to unlock this feature and start sending SMS messages to your leads.</div>
        <button 
          className='bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity'
          onClick={() => setShowUpgradePlan(true)}
        >
          Upgrade
        </button>
      </div>
      <Elements stripe={stripePromise}>
        <UpgradePlan
          open={showUpgradePlan}
          handleClose={(upgradeResult) => {
            setShowUpgradePlan(false)
            if (upgradeResult) {}
          }}
          plan={null}
          currentFullPlan={reduxUser?.user?.plan || reduxUser?.plan}
          setSelectedPlan={() => {}}
        />
      </Elements>
    </>
  );
}

export default UnlockMessagesView