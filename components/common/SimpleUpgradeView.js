'use client'

import { Elements } from '@stripe/react-stripe-js'
import Image from 'next/image'
import React, { useState } from 'react'

import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { getStripe } from '@/lib/stripe'
import { useUser } from '@/hooks/redux-hooks'

function SimpleUpgradeView({
  title = 'Unlock Feature',
  subTitle = 'Upgrade your plan to access this feature',
  onUpgradeSuccess,
}) {
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)
  const { user: reduxUser } = useUser()

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center -mt-16">
      {/* Image */}
      <Image
        src={'/otherAssets/noTemView.png'}
        height={280}
        width={240}
        alt="*"
      />
      
      {/* Upgrade UI Section */}
      <div className="w-full flex flex-col items-center -mt-12 gap-4">
        <Image
          src={'/otherAssets/starsIcon2.png'}
          height={30}
          width={30}
          alt="*"
        />
        <div style={{ fontWeight: '700', fontSize: 22 }}>
          {title}
        </div>
        <div
          style={{
            fontWeight: '400',
            fontSize: 15,
            textAlign: 'center',
          }}
        >
          {subTitle}
        </div>
      </div>
      
      {/* Upgrade Button */}
      <div className="mt-8">
        <button
          className="rounded-lg text-white bg-brand-primary"
          style={{
            fontWeight: '500',
            fontSize: '16',
            height: '50px',
            width: '173px',
          }}
          onClick={() => {
            setShowUpgradePlanModal(true)
          }}
        >
          Upgrade Plan
        </button>
      </div>

      {/* UpgradePlan Modal */}
      <Elements stripe={getStripe()}>
        <UpgradePlan
          open={showUpgradePlanModal}
          handleClose={async (upgradeResult) => {
            setShowUpgradePlanModal(false)
            if (upgradeResult && onUpgradeSuccess) {
              await onUpgradeSuccess()
            }
          }}
          plan={null}
          currentFullPlan={reduxUser?.user?.plan || reduxUser?.plan}
          setSelectedPlan={() => {}}
        />
      </Elements>
    </div>
  )
}

export default SimpleUpgradeView

