import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from './CloseBtn'

const UnlockPremiunFeatures = ({
  open,
  handleClose,
  title,
  from,
  handleConfirmDownGrade,
}) => {
  const [requestLoader, setRequestLoader] = useState(false)
  //code for snack messages
  const [snackMsg, setSnackMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error)
  const [featureTitleValue, setFeatureTitleValue] = useState('')

  //todo @hamza ask from salman where is embedagent and calendar as calendar is in toolsandactions

  let localUserData = null

  useEffect(() => {
    fetchLocalUserData()
    const Data = localUserData?.agencyCapabilities
    if (localUserData?.userRole === 'AgencySubAccount') {
      if (title === 'Enable Live Transfer') {
        if (!Data?.allowLiveCallTransfer) {
          setFeatureTitleValue('LiveTransfer')
        }
      } else if (title === 'Enable Dialer') {
        setFeatureTitleValue('Dialer')
      } else if (title === 'Unlock Actions') {
        if (!Data?.allowToolsAndActions) {
          setFeatureTitleValue('ToolsAndActions')
        }
      } else if (
        title === 'Unlock Knowledge Base' ||
        title === 'Add Knowledge Base'
      ) {
        if (!Data?.allowKnowledgeBases) {
          setFeatureTitleValue('Knowledgebase')
        }
      } else if (title === 'Unlock Voicemail' || title === 'Enable Voicemail') {
        if (!Data?.allowVoicemail) {
          setFeatureTitleValue('Voicemail')
        }
      } else if (title === 'Unlock Live Support Webinar') {
        setFeatureTitleValue('SupportSettings')
        // if (!Data?.allowLiveSupportWebinar) {
        // }
      } else if (title === 'Unlock Calendar Integration') {
        if (!Data?.allowCalendarIntegration) {
          setFeatureTitleValue('CalendarIntegration')
        }
      } else if (title === 'Unlock Lead Scoring') {
        if (!Data?.allowLeadScoring) {
          setFeatureTitleValue('LeadScoring')
        }
      } else if (
        title === 'AI Text & Messages' ||
        title === 'Enable AI Text & Messages' ||
        title === 'Unlock AI Email & Text'
      ) {
        setFeatureTitleValue('AiEmailAndText')
      } else {
        setFeatureTitleValue(title)
      }
    }
  }, [localUserData])

  const fetchLocalUserData = (attempt = 1, maxAttempts = 5) => {
    const localStorageUser = localStorage.getItem('User')

    if (localStorageUser) {
      try {
        const Data = JSON.parse(localStorageUser)
        localUserData = Data?.user

        if (localUserData) {
          return
        } else {
          console.warn(
            `⚠️ localStorage "user" found but invalid on attempt ${attempt}`,
          )
        }
      } catch (error) {
        console.error(`❌ JSON parse failed on attempt ${attempt}:`, error)
      }
    } else {
      console.warn(`⚠️ No localStorage "user" found on attempt ${attempt}`)
    }

    // Retry if not found and attempts remain
    if (attempt < maxAttempts) {
      setTimeout(() => fetchLocalUserData(attempt + 1, maxAttempts), 300)
    } else {
      console.error('❌ Max attempts reached. Could not fetch local data.')
    }
  }

  const requestFeatureFromAgency = async () => {
    try {
      setRequestLoader(true)
      setSnackMsg(null)
      const Token = AuthToken()
      const ApiPath = Apis.requestFeatureFromAgency
      // Map display title to backend feature key (e.g. "Enable Dialer" -> "Dialer")
      const featureKey =
        featureTitleValue ||
        (title === 'Enable Dialer' ? 'Dialer' : title)
      const ApiData = {
        featureTitle: featureKey,
      }
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: `Bearer ${Token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.data.status === true) {
        setRequestLoader(false)
        setSnackMsg('Request sent successfully. Your agency has been notified.')
        setSnackMsgType(SnackbarTypes.Success)
        // Keep modal open briefly so user sees snackbar, then dismiss
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else if (response.data.status === false) {
        setRequestLoader(false)
        setSnackMsg(response.data.message || 'Request failed. Please try again.')
        setSnackMsgType(SnackbarTypes.Error)
      }
    } catch (error) {
      setRequestLoader(false)
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.'
      setSnackMsg(errorMessage)
      setSnackMsgType(SnackbarTypes.Error)
      console.error('Error occurred in request feature api:', error)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      sx={{
        zIndex: 10000, // Higher than dropdown menu (9999) and LeadDetails Drawer (1400) to appear on top
      }}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000040',
          backdropFilter: 'blur(10px)',
          zIndex: 10000, // Match Modal z-index
        },
      }}
    >
      <Box 
        className="flex justify-center items-center w-full h-full"
        sx={{
          position: 'relative',
          zIndex: 10001, // Higher than backdrop (10000) to appear on top
        }}
      >
        <div 
          className="bg-white rounded-2xl p-8 max-w-lg w-[90%] relative shadow-2xl"
          style={{
            zIndex: 10001, // Ensure content is above backdrop
          }}
        >
          {/* Show snack message */}
          <AgentSelectSnackMessage
            isVisible={snackMsg !== null}
            message={snackMsg}
            hide={() => {
              setSnackMsg(null)
            }}
            type={snackMsgType}
          />
          {/* Header with Title and Close Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-black text-2xl font-bold">
              {from === 'agencyPayments'
                ? '⚠️ Sub Accounts Exceed Limit'
                : 'Contact Your Agency'}
            </div>
            <CloseBtn
              onClick={() => {
                handleClose()
              }}
            />
          </div>

          {/* Plan Offer Section */}
          <div className="flex items-start gap-4 mb-8">
            {/* Icon */}
            <Image
              src={'/otherAssets/premiumFeatures.png'}
              alt="premium-feature"
              width={107}
              height={107}
            />
            <div>
              <div className="text-black text-xl font-bold">
                {from === 'agencyPayments'
                  ? 'Action Needed'
                  : 'Unlock Premium Features'}
              </div>
              <div className="text-md text-gray-600">
                {from === 'agencyPayments'
                  ? `The plan you’re trying to downgrade to includes fewer sub accounts and agents. Please remove the extra sub accounts before continuing.`
                  : 'This feature is only available on premium plans. Your agency will need to enable this for you. You can request this below.'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}

          {requestLoader ? (
            <div className="flex items-center justify-center">
              <CircularProgress size={20} />
            </div>
          ) : (
            <button
              onClick={() => {
                if (from === 'agencyPayments') {
                  handleConfirmDownGrade()
                } else {
                  requestFeatureFromAgency()
                }
              }}
              className="w-full bg-brand-primary text-white py-3 px-6 rounded-xl text-[15px] font-bold transition-colors"
            >
              {from === 'agencyPayments' ? 'Continue' : 'Request'}
            </button>
          )}
        </div>
      </Box>
    </Modal>
  )
}

export default UnlockPremiunFeatures
