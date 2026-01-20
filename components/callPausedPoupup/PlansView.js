import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { duration } from '@/utilities/PlansService'

import Apis from '../apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import { getUserPlans } from '../userPlans/UserPlanServices'

/**
 * PlansView Component
 *
 * Usage:
 * <PlansView
 *   handleClose={() => {}}
 *   onPlanSelect={(selectedPlan) => {
 *     console.log('Selected plan:', selectedPlan);
 *     // Handle the selected plan here
 *   }}
 *   selectedPlan={preSelectedPlan} // Optional: pre-select a plan
 *   setSelectedPlan={setSelectedPlan} // Optional: update parent state
 * />
 *
 * The selected plan value is sent back through:
 * 1. onPlanSelect callback - called immediately when plan is selected
 * 2. setSelectedPlan function - updates parent component state
 * 3. Console logs - for debugging purposes
 */
function PlansView({
  handleClose,
  onPlanSelect, // Callback function that receives the selected plan
  selectedPlan, // Pre-selected plan (optional)
  setSelectedPlan, // Function to update selected plan in parent (optional)
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [mutlipleChargeLoading, setMulitpleChargeLoading] = useState(false)
  const [showMessage, setShowMessage] = useState({
    message: null,
    type: null,
  })
  const [selectedDuration, setSelectedDuration] = useState(duration[0])
  const [currentSelectedPlan, setCurrentSelectedPlan] = useState(null)

  // API-based plan states
  const [monthlyPlans, setMonthlyPlans] = useState([])
  const [quaterlyPlans, setQuaterlyPlans] = useState([])
  const [yearlyPlans, setYearlyPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)

  // Fetch plans from API on component mount
  useEffect(() => {
    getPlans()
  }, [])

  // Handle pre-selected plan
  useEffect(() => {
    if (selectedPlan && getCurrentPlans().length > 0) {
      const matchingPlan = getCurrentPlans().find(
        (plan) =>
          plan.id === selectedPlan.id ||
          plan.name === selectedPlan.name ||
          plan.planType === selectedPlan.planType,
      )
      if (matchingPlan) {
        setCurrentSelectedPlan(matchingPlan)
      }
    }
  }, [selectedPlan, monthlyPlans, quaterlyPlans, yearlyPlans])

  const getPlans = async () => {
    try {
      setPlansLoading(true)
      let plansList = await getUserPlans()
      if (plansList) {
        const monthly = []
        const quarterly = []
        const yearly = []
        let freePlan = null

        plansList.forEach((plan) => {
          switch (plan.billingCycle) {
            case 'monthly':
              monthly.push(plan)
              if (!plan.discountPrice) {
                freePlan = plan
              }
              break
            case 'quarterly':
              quarterly.push(plan)
              break
            case 'yearly':
              yearly.push(plan)
              break
            default:
              break
          }
        })

        if (freePlan) {
          quarterly.unshift({ ...freePlan, billingCycle: 'quarterly' })
          yearly.unshift({ ...freePlan, billingCycle: 'yearly' })
        }

        setMonthlyPlans(monthly)
        setQuaterlyPlans(quarterly)
        setYearlyPlans(yearly)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setPlansLoading(false)
    }
  }

  const handleDontUpgrade = async () => {
    setIsLoading(true)
    await handleAutoCharge()
    handleClose()
    setIsLoading(false)
  }

  const handlePauseCall = async (action) => {
    try {
      setMulitpleChargeLoading(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)

        let apidata = {
          action: action,
        }

        const response = await axios.post(Apis.handleMultipleCharge, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          if (response.data.status === true) {
            setShowMessage({
              message: response.data.message,
              type: SnackbarTypes.Success,
            })
            handleClose()
          } else {
            setShowMessage({
              message: response.data.message,
              type: SnackbarTypes.Error,
            })
          }
        }
      }
    } catch (e) {} finally {
      setMulitpleChargeLoading(false)
    }
  }

  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    return []
  }

  const isPlanCurrent = (plan) => {
    // This would typically check against the user's current plan
    // For now, returning false as we don't have access to current user plan
    return false
  }

  const handleTogglePlanClick = (plan, index) => {
    setCurrentSelectedPlan(plan)

    // Update the selectedPlan prop if setSelectedPlan is provided
    if (setSelectedPlan) {
      setSelectedPlan(plan)
    }

    // Call the onPlanSelect callback with the selected plan
    if (onPlanSelect) {
      onPlanSelect(plan)
    }
  }

  // Function to get the currently selected plan
  const getSelectedPlan = () => {
    return currentSelectedPlan
  }

  // Log selected plan changes
  useEffect(() => {
    if (currentSelectedPlan) {}
  }, [currentSelectedPlan])

  return (
    <div>
      <AgentSelectSnackMessage
        isVisible={showMessage.message != null}
        hide={() => {
          setShowMessage({
            message: null,
            type: null,
          })
        }}
        message={showMessage.message}
        type={showMessage.type}
      />
      <div className="flex flex-col items-center gap-4 w-full z-10 relative mt-5">
        <h1 className="text-[20px] font-semibold text-center mt-4">
          {`We've Paused Your Calls to Save You Money`}
        </h1>
        <Image
          src={'/otherAssets/callPausedIcon.jpg'}
          alt="call paused icon"
          width={69}
          height={69}
        />
        <div className="text-center text-[14px] font-[400] text-black max-w-xl">
          {`We noticed you've renewed your current plan`}{' '}
          <span className="font-semibold">twice</span> in the last{' '}
          <span className="font-semibold">24 hours</span>.
          {` To ensure you get the best value, we've temporarily paused your calls.`}
        </div>
      </div>
      <div className="w-full flex flex-col items-center gap-4 z-10 relative">
        <div className="text-xl font-semibold text-center mb-4 mt-7">
          Upgrade to unlock better rates and more calls
        </div>
        <div className="flex flex-row justify-between w-full gap-5">
          <div className="w-full flex flex-row items-end justify-end">
            <div className="flex flex-col items-center plan-duration-container">
              {/* Discount labels row */}
              <div
                className="flex flex-row items-center mb-1"
                style={{ gap: '8px' }}
              >
                {duration.map((item) => (
                  <div
                    key={`discount-${item.id}`}
                    className="flex items-center justify-center"
                    style={{ minWidth: '70px' }}
                  >
                    {item.save ? (
                      <div
                        className={`bg-white/40 shadow-[0px_4px_15.5px_0px_rgba(0,0,0,0.11)] backdrop-blur-[10px] rounded-tl-xl rounded-tr-xl px-2 py-0.5`}
                      >
                        <div
                          className={`text-[11px] font-medium whitespace-nowrap ${selectedDuration?.id === item.id ? 'text-purple' : 'text-neutral-400'}`}
                        >
                          Save {item.save}
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '24px' }}></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Duration buttons row */}
              <div
                className="flex flex-row items-center border bg-neutral-100 px-1 py-0.5 rounded-full"
                style={{ gap: '8px' }}
              >
                {duration.map((item) => (
                  <div
                    key={`button-${item.id}`}
                    className="flex items-center justify-center"
                    style={{ minWidth: '70px' }}
                  >
                    <button
                      className={`px-1 py-[3px] w-full ${selectedDuration?.id === item.id ? 'text-white text-[13px] font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full' : 'text-black'}`}
                      onClick={() => {
                        setSelectedDuration(item)
                        // getCurrentPlans();
                      }}
                    >
                      {item.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full flex flex-row gap-3 mt-3"
          style={{
            scrollbarWidth: 'none',
          }}
        >
          {plansLoading ? (
            <div className="w-full flex justify-center items-center py-8">
              <CircularProgress size={24} />
              <span className="ml-2 text-gray-600">Loading plans...</span>
            </div>
          ) : (
            getCurrentPlans().map((item, index) => {
              const isCurrentPlan = isPlanCurrent(item)
              return (
                <button
                  className={`w-3/12 flex flex-col items-start justify-between border-2 p-3 rounded-lg text-left transition-all duration-300
                                                        ${
                                                          isCurrentPlan
                                                            ? 'border-gray-300 cursor-not-allowed opacity-60'
                                                            : currentSelectedPlan?.id ===
                                                                item.id
                                                              ? 'border-purple bg-gradient-to-r from-purple-25 to-purple-50 shadow-lg shadow-purple-100'
                                                              : 'border-gray-200 hover:border-purple hover:shadow-md'
                                                        }`}
                  key={item.id}
                  onClick={() => handleTogglePlanClick(item, index)}
                  disabled={isCurrentPlan}
                >
                  <div className="w-full flex flex-row items-center justify-between">
                    <div className="text-[15px] font-semibold">{item.name}</div>

                    <div className="text-[15px] font-semibold">
                      {`$${item.discountPrice}`}
                    </div>
                  </div>

                  <div className="text-[13px] font-[500] mt-1">
                    {item.details}
                  </div>

                  <div className="text-[12px] text-gray-600 mt-1">
                    {item.mints || item.mins} AI Credits • {item.calls} calls
                  </div>

                  <div
                    className={`py-2 mt-2 flex flex-col items-center justify-center w-full rounded-lg text-[13px] font-semibold
                                                        ${
                                                          isCurrentPlan
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-purple text-white'
                                                        }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="w-full flex flex-col justify-center items-center mt-4">
          {mutlipleChargeLoading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <button
                className="text-purple text-base font-medium bg-transparent"
                onClick={() => {
                  handlePauseCall('continue')
                }}
              >
                {`Don't Upgrade and Continue on current plan`}
              </button>

              <button
                className="text-gray-500 text-base font-medium mt-2"
                onClick={() => {
                  handlePauseCall('pause_until_subscription')
                }}
              >
                {`Pause Calls Until Next Subscription`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlansView

export const handleAutoCharge = async () => {
  try {
    let data = localStorage.getItem('User')
    if (data) {
      // setIsLoading(true);
      let userData = JSON.parse(data)

      let ApiPath = Apis.confirmContinueCharging

      const response = await axios.post(
        ApiPath,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        },
      )

      if (response.data.status) {
        return true
      }
    }
  } catch (error) {} finally {
    // setIsLoading(false);
  }
}
