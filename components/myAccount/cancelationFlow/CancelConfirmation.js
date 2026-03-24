import moment from 'moment'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { getUserPlans } from '@/components/userPlans/UserPlanServices'
import { next30Days } from '@/constants/Constants'
import { useUser } from '@/hooks/redux-hooks'
import { getFeaturesToLose, getFreePlan } from '@/utilities/PlanComparisonUtils'
import PlanFeatureCheckRow from '@/components/userPlans/PlanFeatureCheckRow'
import { renderBrandedIcon } from '@/utilities/iconMasking'

function CancelConfirmation({
  handleContinue,
  isSubaccount = false,
  selectedUser = null,
  onClose = null,
}) {
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [features, setFeatures] = useState([])
  const [nxtCharge, setNxtChage] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  const { user: reduxUser } = useUser()

  useEffect(() => {
    getUserData()
    loadCurrentPlanFeatures()
  }, [])

  useEffect(() => { }, [reduxUser])

  useEffect(() => { }, [selectedUser])

  const getUserData = () => {
    let data = localStorage.getItem('User')

    if (data) {
      let u = JSON.parse(data)
      let date = u.user.nextChargeDate

      date = moment(date).format('MM/DD/YYYY')
      setNxtChage(date)
    }
  }

  const loadCurrentPlanFeatures = async () => {
    try {
      setLoading(true)

      // Get current user plan - try Redux first, fallback to localStorage
      let userPlan = reduxUser?.plan

      // If Redux doesn't have plan data or shows Free plan, check localStorage
      if (!userPlan || userPlan.name === 'Free') {
        const localData = localStorage.getItem('User')
        if (localData) {
          const userData = JSON.parse(localData)
          userPlan = userData.user?.plan
        }
      }

      if (userPlan) {
        setCurrentPlan(userPlan)

        // Get all plans to find the current plan details
        const allPlans = await getUserPlans()
        const currentPlanDetails = allPlans.find(
          (plan) => plan.id === userPlan.planId,
        )

        if (currentPlanDetails && !isSubaccount) {
          // Get free plan for comparison (cancellation means going to free)
          let freePlan = allPlans.find(
            (plan) => plan.name === 'Free' || plan.isFree === 1,
          )

          // If free plan doesn't have proper capabilities, create a fallback
          if (freePlan && !freePlan.capabilities) {
            freePlan = {
              ...freePlan,
              capabilities: {
                maxAgents: 1,
                maxLeads: 500,
                maxTeamMembers: 0,
                allowPrioritySupport: false,
                allowZoomSupport: false,
                allowGHLSubaccounts: false,
                allowLeadSource: false,
                allowKnowledgeBases: false,
                allowSuccessManager: false,
              },
            }
          }

          // Use getFeaturesToLose function to get actual features that will be lost
          const featuresToLose = getFeaturesToLose(currentPlanDetails, freePlan)

          const planFeatures = featuresToLose.map((title, index) => {
            let info
            if (Array.isArray(currentPlanDetails.features)) {
              const match = currentPlanDetails.features.find(
                (f) => f.text === title,
              )
              if (match?.subtext) {
                info = match.subtext
              }
            }
            return {
              id: index + 1,
              title,
              ...(info ? { info } : {}),
            }
          })

          setFeatures(planFeatures)
        } else if (isSubaccount) {
          let raw = currentPlanDetails?.features
          if (typeof raw === 'string') {
            raw = JSON.parse(raw)
          }
          if (!Array.isArray(raw)) {
            raw = []
          }
          const featuresToLose = raw
            .map((feature, index) => {
              if (typeof feature === 'string') {
                return { id: index, title: feature }
              }
              return {
                id: index,
                title: feature?.text,
                ...(feature?.subtext ? { info: feature.subtext } : {}),
              }
            })
            .filter((f) => f.title)

          setFeatures(featuresToLose)
        } else {
          // Fallback to default features if plan details not found
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
      { id: 1, title: 'Mins of AI Credits' },
      { id: 2, title: 'Unlimited AI Agents' },
      { id: 3, title: 'Unlimited Team' },
      { id: 4, title: 'LLMs' },
      { id: 5, title: 'AI Powered CRM' },
      { id: 6, title: 'Lead Enrichment' },
      { id: 7, title: '10,000+ Integrations' },
      { id: 8, title: 'Custom Voicemails' },
      { id: 9, title: 'Geo-Based Phone Access' },
      { id: 10, title: 'DNC Check' },
      { id: 11, title: 'Lead Source' },
      { id: 12, title: 'AI Powered Message' },
      { id: 13, title: 'AI Powered Email' },
      { id: 14, title: 'Zoom Support' },
      { id: 15, title: 'Priority Support' },
      { id: 16, title: 'Tech Support' },
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

  const confirmationRow = (
    <div className="flex flex-row items-center justify-start gap-2">
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
  )

  const footerSection = (
    <div className="flex w-full flex-shrink-0 flex-col gap-3 border-t border-[#eaeaea] bg-background px-4 py-3">
      {!onClose ? confirmationRow : null}

      <button
        type="button"
        className={`flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${!confirmChecked ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'bg-brand-primary text-white hover:opacity-90'}`}
        style={{ outline: 'none' }}
        disabled={!confirmChecked}
        onClick={() => {
          const nextAction = 'finalStep'
          handleContinue(nextAction)
        }}
      >
        Confirm Cancellation
      </button>
    </div>
  )

  if (onClose) {
    return (
      <div className="flex h-auto flex-col">
        <div className="flex flex-shrink-0 flex-row items-center px-4 py-2">
          <div className="ml-auto flex items-center gap-3">
            <div className="flex">{confirmationRow}</div>
            <CloseBtn onClick={onClose} />
          </div>
        </div>

        <div
          className="overflow-x-hidden px-4 py-4 text-sm text-muted-foreground"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex flex-col items-center">
            {renderBrandedIcon('/otherAssets/IconAccount.png', 48, 48)}
            <h2 className="mt-2 w-full text-center text-base font-semibold text-foreground">
              Confirm Your Cancellation
            </h2>
            <div className="mt-3 w-full text-center leading-snug">
              {`Cancelling means you'll lose access to the features below starting `}
              <span className="font-semibold text-foreground">{nxtCharge}</span>
              {`. Still want to move forward?`}
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
        className="overflow-x-hidden px-4"
        style={{
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex flex-col items-center pb-3 pt-1 lg:pb-4">
          {renderBrandedIcon('/otherAssets/IconAccount.png', 48, 48)}
          <div className="mt-1 text-center text-lg font-semibold lg:mt-2 lg:text-xl">
            Confirm Your Cancellation
          </div>

          <div className="mt-1 flex w-full flex-col items-center justify-center lg:mt-2">
            <div className="text-center text-sm font-normal leading-snug lg:text-base">
              {`Cancelling means you'll lose access to the features below starting `}
              <span className="font-semibold text-foreground">{nxtCharge}</span>
              {` . Still want to move forward?`}
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

export default CancelConfirmation
