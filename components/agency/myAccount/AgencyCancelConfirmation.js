import { renderBrandedIcon } from '@/utilities/iconMasking'
import moment from 'moment'
import Image from 'next/image'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import PlanFeatureCheckRow from '@/components/userPlans/PlanFeatureCheckRow'

import React, { useEffect, useState } from 'react'

function AgencyCancelConfirmation({
  handleContinue,
  currentPlanDetails,
  userLocalData,
  selectedAgency,
  onClose = null,
}) {
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [features, setFeatures] = useState([])
  const [nxtCharge, setNxtChage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserData()
    loadCurrentPlanFeatures()
  }, [currentPlanDetails])

  const getUserData = () => {
    if (userLocalData?.nextChargeDate) {
      let date = moment(userLocalData.nextChargeDate).format('MM/DD/YYYY')
      setNxtChage(date)
    }
  }

  const loadCurrentPlanFeatures = async () => {
    try {
      setLoading(true)

      if (currentPlanDetails) {
        // Extract features directly from current plan details
        if (currentPlanDetails.features && Array.isArray(currentPlanDetails.features)) {
          const planFeatures = currentPlanDetails.features
            .filter((feature) => feature.thumb === true && feature.text)
            .map((feature, index) => ({
              id: index + 1,
              title: feature.text,
              ...(feature.subtext ? { info: feature.subtext } : {}),
            }))

          setFeatures(planFeatures)
        } else {
          // Fallback to default features if plan features not found
          setFeatures(getDefaultFeatures())
        }
      } else {
        // Fallback to default features if no plan found
        setFeatures(getDefaultFeatures())
      }
    } catch (error) {
      console.error('Error loading current plan features:', error)
      // Fallback to default features on error
      setFeatures(getDefaultFeatures())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultFeatures = () => {
    return [
      { id: 1, title: 'AI Credits' },
      { id: 2, title: 'AI Agents' },
      { id: 3, title: 'Team Seats' },
      { id: 4, title: 'Sub Accounts' },
      { id: 5, title: 'Priority Support' },
      { id: 6, title: 'Lead Source' },
      { id: 7, title: 'RAG Knowledge Base' },
      { id: 8, title: 'Success Manager' },
      { id: 9, title: 'Zoom Support Webinar' },
      { id: 10, title: 'GHL Subaccount & Snapshots' },
    ]
  }

  const featureList = (
    <>
      {loading ? (
        <div className="flex w-full items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-brand-primary" />
            <div className="text-xs text-muted-foreground">
              Loading features...
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid w-full grid-cols-2 gap-x-2 gap-y-1 text-left">
          {Array.isArray(features) &&
            features.map((item, index) => (
              <PlanFeatureCheckRow
                key={item.id ?? index}
                text={item.title}
                info={item.info}
              />
            ))}
        </div>
      )}
    </>
  )

  const footerSection = (
    <div className="flex w-full flex-shrink-0 flex-col gap-3 border-t border-[#eaeaea] bg-background px-4 py-3">
      <div className="flex w-full flex-row items-start justify-start gap-2">
        <button
          type="button"
          className="mt-0.5 flex-shrink-0"
          onClick={() => {
            setConfirmChecked(!confirmChecked)
          }}
        >
          {confirmChecked ? (
            <div
              className="flex flex-row items-center justify-center rounded border-2 border-brand-primary bg-brand-primary"
              style={{ height: '20px', width: '20px' }}
            >
              <Image
                src="/assets/whiteTick.png"
                alt=""
                width={12}
                height={12}
                className="object-contain"
              />
            </div>
          ) : (
            <div
              className="flex flex-row items-center justify-center rounded border-2 border-input bg-transparent"
              style={{ height: '20px', width: '20px' }}
            />
          )}
        </button>

        <div className="text-left text-sm font-normal text-muted-foreground">
          I confirm that my account will be cancelled and lose access.
        </div>
      </div>

      <button
        type="button"
        className={`flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${!confirmChecked ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'bg-brand-primary text-white hover:opacity-90'}`}
        style={{ outline: 'none' }}
        disabled={!confirmChecked}
        onClick={() => {
          handleContinue()
        }}
      >
        Confirm Cancellation
      </button>
    </div>
  )

  if (onClose) {
    return (
      <div className="flex h-auto flex-col">
        <div className="flex flex-shrink-0 flex-row items-center justify-between border-b border-[#eaeaea] px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">
            Confirm Your Cancellation
          </h2>
          <CloseBtn onClick={onClose} />
        </div>

        <div
          className="overflow-x-hidden px-4 py-4 text-sm text-muted-foreground"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex flex-col items-center">
            {renderBrandedIcon('/otherAssets/IconAccount.png', 48, 48)}
            <div className="mt-3 w-full text-center leading-snug">
              {`Cancelling means you'll lose access to the features below starting `}
              {nxtCharge ? (
                <span className="font-semibold text-foreground">{nxtCharge}</span>
              ) : null}
              . Still want to move forward?
            </div>
            <div className="mt-3 w-full text-center font-normal text-foreground">
              You&apos;ll lose access to
            </div>
            {featureList}
          </div>
        </div>

        {footerSection}
      </div>
    )
  }

  return (
    <div className="flex h-auto flex-col gap-2 lg:gap-3">
      <div
        className="overflow-x-hidden"
        style={{
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex flex-col items-center px-3 pb-3 lg:px-0 lg:pb-4">
          {renderBrandedIcon('/otherAssets/IconAccount.png', 48, 48)}

          <div className="mt-1 text-center text-lg font-semibold lg:mt-2 lg:text-xl">
            Confirm Your Cancellation
          </div>

          <div className="mt-1 flex w-full flex-col items-center justify-center lg:mt-2">
            <div className="text-center text-sm font-normal leading-snug lg:text-base">
              {`Cancelling means you'll lose access to the features below starting `}
              {nxtCharge ? (
                <span className="font-semibold text-foreground">{nxtCharge}</span>
              ) : null}
              . Still want to move forward?
            </div>

            <div className="mt-2 text-center text-sm font-normal lg:mt-3 lg:text-base">
              You&apos;ll lose access to
            </div>

            {featureList}
          </div>
        </div>
      </div>

      {footerSection}
    </div>
  )
}

export default AgencyCancelConfirmation
