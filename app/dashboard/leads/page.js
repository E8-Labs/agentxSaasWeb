'use client'

import axios from 'axios'
import React, { Suspense, useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import Leads1 from '@/components/dashboard/leads/Leads1'
import SimpleUpgradeView from '@/components/common/SimpleUpgradeView'
import { useUser } from '@/hooks/redux-hooks'

const Page = ({ params }) => {
  const [index, setIndex] = useState(0)
  const { user: reduxUser, setUser: setReduxUser } = useUser()

  let components = [Leads1]

  let CurrentComp = components[index]

  const [showPlansPopup, setShowPlansPopup] = useState(false)

  useEffect(() => {
    getProfile()
  }, [])

  // Function to proceed to the next step
  const handleContinue = () => {
    // //console.log;
    setIndex(index + 1)
  }

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1)
  }

  //function to get user profile details
  const getProfile = async () => {
    try {
      let response = await getProfileDetails()

      // //console.log;

      if (response) {
        if (response?.data?.data?.plan?.status === 'cancelled') {
          setShowPlansPopup(true)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
  }

  // Function to refresh user data after upgrade
  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails()
      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')
        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }
        setReduxUser(updatedUserData)
        localStorage.setItem('User', JSON.stringify(updatedUserData))
        return true
      }
      return false
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return false
    }
  }

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100svh',
    overflow: 'hidden',
  }

  // Check if user should see upgrade UI
  const userRole = reduxUser?.userRole || reduxUser?.user?.userRole
  const maxLeads = reduxUser?.planCapabilities?.maxLeads ?? reduxUser?.user?.planCapabilities?.maxLeads
  const shouldShowUpgrade = userRole === 'AgentX' && maxLeads === 0

  return (
    <Suspense>
      <div
        style={backgroundImage}
        className="overflow-y-none flex flex-row justify-center items-center bg-white"
      >
        {shouldShowUpgrade ? (
          <div className="w-full h-full">
          <SimpleUpgradeView
            title="Unlock Leads Feature"
            subTitle="Upgrade your plan to add and manage leads in your CRM"
            onUpgradeSuccess={refreshUserData}
          />
          </div>
        ) : (
          <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
        )}
      </div>
    </Suspense>
  )
}

export default Page
