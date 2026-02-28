import { CircularProgress } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { HowtoVideos, PersistanceKeys } from '@/constants/Constants'

import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import { getUserLocalData } from '../constants/constants'
import IntroVideoModal from '../createagent/IntroVideoModal'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import Ap2MessagingDetails from '../twiliohub/getProfile/Ap2MessagingDetails'
import BrandedCallsDetails from '../twiliohub/getProfile/BrandedCallsDetails'
import CenamDetails from '../twiliohub/getProfile/CenamDetails'
import CustomerProfile from '../twiliohub/getProfile/CustomerProfile'
import StirDetails from '../twiliohub/getProfile/StirDetails'
import VoiceIntegrityDetails from '../twiliohub/getProfile/VoiceIntegrityDetails'
import TwillioUpgradeView from './TwillioUpgradeView'

const TwilioTrustHub = ({
  isFromAgency,
  hotReloadTrustProducts,
  setHotReloadTrustProducts,
  removeTrustHubData,
  setRemoveTrustHubData,
  selectedUser,
}) => {
  useEffect(() => {
    getBusinessProfile()

    // Start polling every 6 seconds (silent polling)
    const interval = setInterval(() => {
      getBusinessProfile(true)
    }, 3000)

    setPollingInterval(interval)

    // Cleanup on unmount
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [])

  const [twilioHubData, setTwilioHubData] = useState(null)
  const [profileStatus, setProfileStatus] = useState(true)
  const [loader, setLoader] = useState(false)
  const [disconnectLoader, setDisConnectLoader] = useState(false)
  const [pollingInterval, setPollingInterval] = useState(null)
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })
  const [isFreePlan, setIsFreePlan] = useState(false)

  useEffect(() => {
    let data = getUserLocalData()
    if (data) {
      // Check if either allowTwilioIntegration or allowTwilioTrusthub is true
      const hasTwilioAccess =
        data.user.planCapabilities?.allowTwilioIntegration === true ||
        data.user.planCapabilities?.allowTwilioTrusthub === true
      // Show upgrade view if user doesn't have Twilio access
      let isFree = !hasTwilioAccess
      setIsFreePlan(isFree)
    }
  }, [])

  //triger the get business profile
  useEffect(() => {
    if (hotReloadTrustProducts) {
      getBusinessProfile()
    }
  }, [hotReloadTrustProducts])

  //remove trust hub data
  useEffect(() => {
    if (removeTrustHubData) {
      setTwilioHubData(null)
      setProfileStatus(true)
      // Clear all product status localStorage items when trust hub data is removed
      localStorage.removeItem('CNAMStatusReview')
      localStorage.removeItem('VoiceIntegrityStatusReview')
      localStorage.removeItem('StirStatusReview')
      if (typeof setRemoveTrustHubData === 'function') {
        setRemoveTrustHubData(false)
      }
    }
  }, [removeTrustHubData])

  //get the twilio profile details
  const getBusinessProfile = async (isPolling = false, d = null) => {
    if (typeof setHotReloadTrustProducts === 'function') {
      setHotReloadTrustProducts(false)
    }
    try {
      // Only show loader on initial load, not during polling
      if (!twilioHubData && !isPolling) {
        setLoader(true)
      }
      const token = AuthToken()
      let ApiPath = Apis.getBusinessProfile
      if (selectedUser) {
        ApiPath = `${Apis.getBusinessProfile}?userId=${selectedUser.id}`
      }
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // Only hide loader if it was shown (not during polling)
        if (!isPolling) {
          setLoader(false)
        }
        const ApiResponse = response.data
        if (ApiResponse.status === true) {
          // console.log("ApiResponse.data passed is", ApiResponse.data)
          setTwilioHubData(ApiResponse.data)
          const twilioHubData = PersistanceKeys.twilioHubData
          localStorage.setItem(twilioHubData, JSON.stringify(ApiResponse.data))
          if (ApiResponse?.data?.profile?.status === 'twilio-approved') {
            setProfileStatus(false)
          }
        }
        if (d) {
          setShowSnack({
            message: d.message,
            isVisible: true,
            type: SnackbarTypes.Success,
          })
        }
      }
    } catch (error) {
      // Only hide loader if it was shown (not during polling)
      if (!twilioHubData && !isPolling) {
        setLoader(false)
      }
      if (typeof setHotReloadTrustProducts === 'function') {
        setHotReloadTrustProducts(false)
      }
    }
  }

  //disconnect the twilio profile
  const handleDisconnectTwilio = async () => {
    try {
      setDisConnectLoader(true)
      const token = AuthToken()
      let ApiPath = Apis.disconnectTwilio
      if (selectedUser) {
        ApiPath = `${Apis.disconnectTwilio}`
      }
      let ApiData = {}
      if (selectedUser) {
        ApiData = {
          userId: selectedUser.id,
        }
      }
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + token,
          // "Content-Type": "application/json"
        },
      })
      if (response) {
        const ApiResponse = response.data
        if (ApiResponse.status === true) {
          localStorage.removeItem(PersistanceKeys.twilioHubData)
          // Clear all product status localStorage items when Twilio is disconnected
          localStorage.removeItem('CNAMStatusReview')
          localStorage.removeItem('VoiceIntegrityStatusReview')
          localStorage.removeItem('StirStatusReview')
          setShowSnack({
            message: 'Twilio disconnected.', //ApiResponse.message
            isVisible: true,
            type: SnackbarTypes.Success,
          })
          setTwilioHubData(null)
          setProfileStatus(true)

          // Clear polling when disconnected
          if (pollingInterval) {
            clearInterval(pollingInterval)
            setPollingInterval(null)
          }
        } else {
          setShowSnack({
            message: ApiResponse.message,
            isVisible: true,
            type: SnackbarTypes.Success,
          })
        }
        setDisConnectLoader(false)
      }
    } catch (error) {
      setDisConnectLoader(false)
    }
  }

  return isFreePlan ? (
    <TwillioUpgradeView />
  ) : (
    <div
      className={`${!isFromAgency ? 'w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto' : 'w-full'}`}
      style={{
        paddingBottom: '50px',
        scrollbarWidth: 'none', // For Firefox
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <AgentSelectSnackMessage
        type={showSnack.type}
        message={showSnack.message}
        isVisible={showSnack.isVisible}
        hide={() => {
          setShowSnack({
            message: '',
            isVisible: false,
            type: SnackbarTypes.Success,
          })
        }}
      />

      {loader ? (
        <div className="w-full flex flex-row items-center justify-center mt-6">
          <CircularProgress size={35} />
        </div>
      ) : (
        <div className="w-full">
          <div className="w-full mt-2">
            <CustomerProfile
              twilioHubData={twilioHubData?.profile}
              getProfileData={(d) => {
                getBusinessProfile(d)
              }}
              profileStatus={profileStatus}
              disconnectLoader={disconnectLoader}
              handleDisconnectTwilio={handleDisconnectTwilio}
              isFromAgency={isFromAgency}
              selectedUser={selectedUser}
            />
          </div>
          <div className="w-full mt-4">
            <CenamDetails
              businessProfileData={twilioHubData?.profile}
              twilioHubData={twilioHubData?.cnam}
              trustProducts={twilioHubData?.trustProducts}
              // getProfileData={getBusinessProfile}
              getProfileData={(d) => {
                getBusinessProfile()
              }}
              profileStatus={profileStatus}
              selectedUser={selectedUser}
            />
          </div>
          <div className="w-full mt-4">
            <StirDetails
              businessProfileData={twilioHubData?.profile}
              twilioHubData={twilioHubData?.shakenStir}
              trustProducts={twilioHubData?.trustProducts}
              // getProfileData={getBusinessProfile}
              getProfileData={(d) => {
                getBusinessProfile()
              }}
              profileStatus={profileStatus}
              selectedUser={selectedUser}
            />
          </div>
          <div className="w-full mt-4">
            <VoiceIntegrityDetails
              businessProfileData={twilioHubData?.profile}
              twilioHubData={twilioHubData?.voiceIntegrity}
              trustProducts={twilioHubData?.trustProducts}
              // getProfileData={getBusinessProfile}
              getProfileData={(d) => {
                getBusinessProfile()
              }}
              profileStatus={profileStatus}
              selectedUser={selectedUser}
            />
          </div>
          {/*<div className='w-full mt-4'>
                <BrandedCallsDetails />
            </div>*/}
          <div className="w-full mt-4">
            <Ap2MessagingDetails
              twilioHubData={twilioHubData?.a2pMessaging}
              businessProfileData={twilioHubData?.profile}
              profileStatus={profileStatus}
              selectedUser={selectedUser}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TwilioTrustHub
