import { CircularProgress } from '@mui/material'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

import { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { pauseSubscription } from '@/components/userPlans/UserPlanServices'
import { next30Days } from '@/constants/Constants'
import { renderBrandedIcon } from '@/utilities/iconMasking'

function PauseSubscription({ handleContinue, setShowSnak, selectedUser }) {
  const [pauseLoading, setPuaseLoading] = useState(false)
  const [nxtCharge, setNxtChage] = useState(null)

  useEffect(() => {
    getUserData()
  }, [])

  const getUserData = () => {
    let data = localStorage.getItem('User')

    if (data) {
      let u = JSON.parse(data)
      let date = u.user.nextChargeDate

      date = moment(date).format('MM/DD/YYYY')
      setNxtChage(date)
      console.log('date', date)
    }
  }

  const handlePause = async () => {
    setPuaseLoading(true)
    let response = await pauseSubscription(selectedUser)
    let nextAction = 'closeModel'
    if (response) {
      setShowSnak({
        message: response.message,
        type: SnackbarTypes.Success,
      })
    }
    handleContinue(nextAction)
    setPuaseLoading(false)
  }

  const handleContinueCancel = () => {
    let nextAction = 'claimGift'
    handleContinue(nextAction)
  }

  return (
    <div className="w-full flex flex-col items-center gap-2">

    {renderBrandedIcon('/otherAssets/pauseIcon.png', 72, 72)}


      <div className="text-xl font-semibold mt-2">
        Pause Subscription Instead
      </div>

      <div className="text-base font-normal text-center">
        {` Need some time off? No problem. You can take a short break instead or end your subscription now. Your data is safe, your billing’s on hold, and your account will automatically resume
                in 30 days on`}{' '}
        <span className="font-bold">{`[${next30Days}]`}.</span>
      </div>
      <div className=" flex flex-col px-6 w-full mt-8">
        {pauseLoading ? (
          <CircularProgress size={20} />
        ) : (
          <button
            className="flex flex-col items-center justify-center h-[50px] w-full bg-brand-primary rounded-lg text-base font-normal text-white mt-2 "
            onClick={handlePause}
          >
            Pause Subscription
          </button>
        )}

        <button
          className="flex flex-col items-center justify-center h-[50px] w-full border rounded-lg text-base font-normal mt-4"
          onClick={() => {
            handleContinueCancel()
          }}
        >
          Continue to Cancel
        </button>
      </div>
    </div>
  )
}

export default PauseSubscription
