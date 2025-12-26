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
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      {/* Star Icons */}
      <div className="flex flex-row items-center justify-center gap-2 mb-4">
        <Image
          alt="*"
          src={'/otherAssets/starsIcon2.png'}
          height={24}
          width={24}
          className="object-contain"
        />
        <Image
          alt="*"
          src={'/otherAssets/starsIcon2.png'}
          height={24}
          width={24}
          className="object-contain"
        />
      </div>

      {/* Title */}
      <div
        className="font-bold text-center mb-3"
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#000000',
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      <div
        className="text-center mb-8 max-w-2xl"
        style={{
          fontSize: '16px',
          fontWeight: '400',
          color: '#000000',
          lineHeight: '1.5',
        }}
      >
        {subTitle}
      </div>

      {/* Upgrade Button */}
      <button
        className="rounded-lg text-white text-center flex flex-row items-center justify-center transition-colors"
        style={{
          fontSize: '16px',
          fontWeight: '500',
          backgroundColor: 'hsl(var(--brand-primary))',
          height: '50px',
          padding: '0 32px',
          minWidth: '180px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary) / 0.9)`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `hsl(var(--brand-primary))`
        }}
        onClick={() => {
          setShowUpgradePlanModal(true)
        }}
      >
        Upgrade Plan
      </button>

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

