import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

function AgencyCancelConfirmation({
  handleContinue,
  currentPlanDetails,
  userLocalData,
  selectedAgency,
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
          // Filter features where thumb is true and extract the text
          const featuresToLose = currentPlanDetails.features
            .filter((feature) => feature.thumb === true)
            .map((feature) => feature.text)
            .filter((text) => text) // Remove any undefined/null values

          console.log('🔍 [CANCELATION FLOW] Features to lose:', featuresToLose)
          
          // Convert to the format expected by the UI
          const planFeatures = featuresToLose.map((feature, index) => ({
            id: index + 1,
            title: feature,
          }))

          console.log('🔍 [CANCELATION FLOW] Plan features:', planFeatures)

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

  return (
    <div className="grid grid-rows-[1fr_auto] h-full gap-2 lg:gap-3">
      {/* Scrollable content area */}
      <div
        className="overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex flex-col items-center px-1 lg:px-0 pb-3 lg:pb-4">
          <Image
            src={'/otherAssets/IconAccount.png'}
            height={48}
            width={48}
            alt="*"
            className="h-10 w-10 lg:h-12 lg:w-12"
          />
          <div className="text-center mt-1 lg:mt-2 text-lg lg:text-xl font-semibold">
            Confirm Your Cancellation
          </div>

          <div className="flex flex-col items-center justify-center w-full mt-1 lg:mt-2">
            <div className="text-center text-sm lg:text-base font-normal leading-tight lg:leading-normal">
              {`Cancelling means you'll lose access to the features below starting `}
              {nxtCharge ? <span className="font-bold">{nxtCharge}</span> : ''}.
              Still want to move forward?
            </div>

            <div className="text-center text-sm lg:text-base font-normal mt-2 lg:mt-3">
              {`You'll lose access to`}
            </div>

            {loading ? (
              <div className="flex items-center justify-center w-full mt-3 lg:mt-4 py-6 lg:py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-purple mx-auto mb-2"></div>
                  <div className="text-xs lg:text-sm text-gray-600">
                    Loading features...
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-y-2 lg:gap-y-3 w-full mt-3 lg:mt-4">
                {Array.isArray(features) &&
                  features.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-row items-center gap-1.5 lg:gap-2 flex-1 basis-1/2 min-w-0"
                    >
                      <Image
                        src="/svgIcons/selectedTickBtn.svg"
                        height={24}
                        width={24}
                        alt="cross"
                        className="flex-shrink-0 h-5 w-5 lg:h-6 lg:w-6"
                      />
                      <div className="text-xs lg:text-[13px] font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.title}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom section with checkbox and button */}
      <div className="flex-shrink-0 flex flex-col w-full gap-2 lg:gap-3 pt-3 lg:pt-4 border-t border-gray-200 bg-white">
        <div className="flex flex-row items-center w-full justify-start gap-2">
          <button
            onClick={() => {
              setConfirmChecked(!confirmChecked)
            }}
          >
            {confirmChecked ? (
              <div
                className="bg-purple flex flex-row items-center justify-center rounded"
                style={{ height: '20px', width: '20px' }}
              >
                <Image
                  src={'/assets/whiteTick.png'}
                  height={8}
                  width={10}
                  alt="*"
                  className="h-2 w-2.5"
                />
              </div>
            ) : (
              <div
                className="bg-none border-2 flex flex-row items-center justify-center rounded"
                style={{ height: '20px', width: '20px' }}
              ></div>
            )}
          </button>

          <div className="text-xs font-normal">
            I confirm that my account will be cancelled and lose access.
          </div>
        </div>

        <button
          className={`w-full flex items-center rounded-lg justify-center border h-[44px] lg:h-[50px] ${!confirmChecked ? 'bg-gray-300 text-black' : 'bg-purple text-white'}`}
          style={{
            fontWeight: '400',
            fontSize: 14,
            outline: 'none',
          }}
          disabled={!confirmChecked}
          onClick={() => {
            handleContinue()
          }}
        >
          Confirm Cancellation
        </button>
      </div>
    </div>
  )
}

export default AgencyCancelConfirmation
