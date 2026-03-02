'use client'

import { Alert, Button, CircularProgress, Fade, Snackbar, Tooltip } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import ClaimNumber from '@/components/dashboard/myagentX/ClaimNumber'
import IntroVideoModal from '@/components/createagent/IntroVideoModal'
import { HowToVideoTypes } from '@/constants/Constants'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'
import { Play } from 'lucide-react'

function AgencyPhoneNumbers({ selectedAgency }) {
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [globalNumber, setGlobalNumber] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null) // Track which action is loading
  const [showClaimPopup, setShowClaimPopup] = useState(false)
  const [snackMsg, setSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    fetchPhoneNumbers()
  }, [])

  const fetchPhoneNumbers = async () => {
    try {
      setLoading(true)
      const token = AuthToken()
      if (!token) {
        setSnackMsg({
          type: SnackbarTypes.Error,
          message: 'Authentication token not found',
          isVisible: true,
        })
        return
      }

      const response = await axios.get(Apis.getAgencyPhoneNumbers, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response?.data?.status === true) {
        const data = response.data.data
        setPhoneNumbers(data.phoneNumbers || [])
        setGlobalNumber(data.globalNumber || null)
      } else {
        setSnackMsg({
          type: SnackbarTypes.Error,
          message: response?.data?.message || 'Failed to fetch phone numbers',
          isVisible: true,
        })
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error)
      setSnackMsg({
        type: SnackbarTypes.Error,
        message:
          error?.response?.data?.message ||
          'An error occurred while fetching phone numbers',
        isVisible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetGlobalNumber = async (phoneNumberId) => {
    try {
      setActionLoading(`set-${phoneNumberId}`)
      const token = AuthToken()
      if (!token) {
        setSnackMsg({
          type: SnackbarTypes.Error,
          message: 'Authentication token not found',
          isVisible: true,
        })
        return
      }

      const response = await axios.post(
        Apis.setAgencyGlobalNumber,
        { phoneNumberId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response?.data?.status === true) {
        const data = response.data.data
        setSnackMsg({
          type: SnackbarTypes.Success,
          message: data.alreadySet
            ? 'This number is already set as the global number'
            : 'Global number updated successfully',
          isVisible: true,
        })
        // Refresh the list
        await fetchPhoneNumbers()
      } else {
        setSnackMsg({
          type: SnackbarTypes.Error,
          message: response?.data?.message || 'Failed to set global number',
          isVisible: true,
        })
      }
    } catch (error) {
      console.error('Error setting global number:', error)
      setSnackMsg({
        type: SnackbarTypes.Error,
        message:
          error?.response?.data?.message ||
          'An error occurred while setting global number',
        isVisible: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnsetGlobalNumber = async () => {
    try {
      setActionLoading('unset')
      const token = AuthToken()
      if (!token) {
        setSnackMsg({
          type: SnackbarTypes.Error,
          message: 'Authentication token not found',
          isVisible: true,
        })
        return
      }

      const response = await axios.post(
        Apis.unsetAgencyGlobalNumber,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response?.data?.status === true) {
        setSnackMsg({
          type: SnackbarTypes.Success,
          message: 'Global number unset successfully',
          isVisible: true,
        })
        // Refresh the list
        await fetchPhoneNumbers()
      } else {
        setSnackMsg({
          type: SnackbarTypes.Error,
          message: response?.data?.message || 'Failed to unset global number',
          isVisible: true,
        })
      }
    } catch (error) {
      console.error('Error unsetting global number:', error)
      setSnackMsg({
        type: SnackbarTypes.Error,
        message:
          error?.response?.data?.message ||
          'An error occurred while unsetting global number',
        isVisible: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getSourceLabel = (source) => {
    switch (source) {
      case 'agentx':
        return 'AgentX'
      case 'user_twilio':
        return 'Your Twilio'
      case 'imported':
        return 'Imported'
      default:
        return source || 'Unknown'
    }
  }

  const formatPhoneNumber = (phone) => {
    // Format phone number for display (e.g., +1 (555) 123-4567)
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false)
  }

  // Get user data - either from selectedAgency or localStorage
  const getUserData = () => {
    if (selectedAgency) {
      return selectedAgency
    }
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const u = JSON.parse(localData)
        return u?.user || null
      }
    } catch (error) {
      console.error('Error reading user data from localStorage:', error)
    }
    return null
  }

  const userData = getUserData()

  // Check if Twilio is connected
  // For agencies, check isTwilioConnected property from user profile
  const isTwilioConnected = userData?.userRole === 'Agency' && userData?.isTwilioConnected === true

  return (
    <div
      className="flex  flex-col w-full p-8  overflow-y-hidden"
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* Video Modal */}
      <IntroVideoModal
        open={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoTitle={
          getTutorialByType(HowToVideoTypes.SettingGlobalNumber)?.title ||
          'Setting Global Number'
        }
        videoUrl={
          getVideoUrlByType(HowToVideoTypes.SettingGlobalNumber) || ''
        }
      />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-row items-center gap-3 mb-2">
            <div
              className="text-2xl font-semibold"
              style={{ color: '#000' }}
            >
              Phone Numbers List
            </div>
            <div className="flex flex-row items-center gap-2">
              <button
                className="text-[13px] font-[500] text-brand-primary outline-none border-none cursor-pointer"
                onClick={() => {
                  setShowVideoModal(true)
                }}
              >
                Learn how to setup Global Numbers
              </button>
              <Play
                onClick={() => {
                  setShowVideoModal(true)
                }}
                size={16}
                weight="bold"
                className="text-brand-primary cursor-pointer"
                style={{ color: 'hsl(var(--brand-primary))' }}
              />
            </div>
          </div>
          <div className="text-sm" style={{ color: '#666' }}>
            Manage your agency global phone numbers. The global number will be
            visible to all subaccounts.
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip
            title={
              !isTwilioConnected
                ? 'Please connect your Twilio account first to get a global number'
                : ''
            }
            arrow
          >
            <span>
              <Button
                variant="contained"
                onClick={() => setShowClaimPopup(true)}
                disabled={!isTwilioConnected}
                style={{
                  backgroundColor: isTwilioConnected
                    ? 'hsl(var(--brand-primary))'
                    : '#d0d0d0',
                  color: '#fff',
                  textTransform: 'none',
                  minWidth: '150px',
                  cursor: isTwilioConnected ? 'pointer' : 'not-allowed',
                }}
              >
                Get Global Number
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Global Number Info Banner */}
      {/* {globalNumber && (
        <div
          className="mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: "#7902DF10",
            border: "1px solid #7902DF30",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: "#7902DF" }}>
                Current Global Number
              </div>
              <div className="text-lg font-medium" style={{ color: "#000" }}>
                {formatPhoneNumber(globalNumber.phone)}
              </div>
            </div>
            <Button
              variant="outlined"
              onClick={handleUnsetGlobalNumber}
              disabled={actionLoading === "unset"}
              style={{
                borderColor: "#7902DF",
                color: "#7902DF",
                textTransform: "none",
              }}
            >
              {actionLoading === "unset" ? (
                <CircularProgress size={20} style={{ color: "#7902DF" }} />
              ) : (
                "Unset Global Number"
              )}
            </Button>
          </div>
        </div>
      )} */}

      {/* Phone Numbers List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <CircularProgress style={{ color: 'hsl(var(--brand-primary))' }} />
        </div>
      ) : phoneNumbers.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg"
          style={{ backgroundColor: '#f5f5f5' }}
        >
          <div className="text-lg font-medium mb-2" style={{ color: '#666' }}>
            No phone numbers found
          </div>
          <div className="text-sm" style={{ color: '#999' }}>
            Add phone numbers to your account to get started.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto w-full min-w-0">
          {phoneNumbers.map((number) => {
            const isGlobal = number.isAgencyGlobalNumber
            const isSubaccountNumber = number.subaccountNumber
            const isDisabled = number.disabled === true
            const isLoading = actionLoading === `set-${number.id}`
            const isA2PVerified = number.isA2PVerified === true || number.a2pVerificationStatus === 'verified'

            return (
              <div
                key={number.id}
                className="flex w-full sm:w-[80%] md:w-1/2 min-w-0 px-4 py-5 rounded-lg border-2 transition-all items-center justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap"
                style={{
                  borderColor: isGlobal ? 'hsl(var(--brand-primary))' : isDisabled ? '#d0d0d0' : '#e0e0e0',
                  backgroundColor: isGlobal ? 'hsl(var(--brand-primary) / 0.1)' : isDisabled ? '#f9f9f9' : '#fff',
                  opacity: isDisabled ? 0.7 : 1,
                }}
              >
                {/* Left Section - Phone Number Info */}
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  {isGlobal && (
                    <div
                      className="-ml-1 px-2 py-0.5 rounded-full text-[10px] leading-4 font-semibold whitespace-nowrap bg-brand-primary text-white"
                    >
                      Global Number
                    </div>
                  )}
                  {isA2PVerified && (
                    <div
                      className="-ml-1 px-2 py-0.5 rounded-full text-[10px] leading-4 font-semibold whitespace-nowrap"
                      style={{ backgroundColor: '#10b981', color: '#fff' }}
                    >
                      A2P
                    </div>
                  )}
                  {isDisabled && (
                    <div
                      className="-ml-1 px-2 py-0.5 rounded-full text-[10px] leading-4 font-semibold whitespace-nowrap"
                      style={{ backgroundColor: '#999', color: '#fff' }}
                    >
                      Disabled
                    </div>
                  )}
                  <div
                    className="text-base md:text-lg font-semibold truncate min-w-0"
                    style={{ color: isDisabled ? '#999' : '#000' }}
                    title={formatPhoneNumber(number.phone)}
                  >
                    {formatPhoneNumber(number.phone)}
                  </div>
                </div>

                {/* Right Section - Action Button or Subaccount Info */}
                <div className="flex-shrink-0 min-w-0 max-w-full">
                  {isSubaccountNumber ? (
                    <div
                      className="text-sm py-2 px-3 sm:px-4 text-center rounded truncate max-w-full"
                      style={{
                        color: '#666',
                        fontWeight: '500',
                        backgroundColor: '#f5f5f5',
                      }}
                      title={number.subaccountName || 'Subaccount'}
                    >
                      {number.subaccountName || 'Subaccount'}
                    </div>
                  ) : isDisabled ? (
                    <div
                      className="text-sm py-2 px-3 sm:px-4 text-center rounded"
                      style={{
                        color: '#999',
                        fontWeight: '500',
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      Disabled
                    </div>
                  ) : !isGlobal ? (
                    <Button
                      variant="contained"
                      onClick={() => handleSetGlobalNumber(number.id)}
                      disabled={isLoading}
                      className="shrink-0"
                      style={{
                        backgroundColor: 'hsl(var(--brand-primary))',
                        color: '#fff',
                        textTransform: 'none',
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={20} style={{ color: '#fff' }} />
                      ) : (
                        'Set Global Number'
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Snackbar for messages */}
      <AgentSelectSnackMessage snackMsg={snackMsg} setSnackMsg={setSnackMsg} />

      {/* Claim Number Modal */}
      {showClaimPopup && (
        <ClaimNumber
          showClaimPopup={showClaimPopup}
          handleCloseClaimPopup={handleCloseClaimPopup}
          setOpenCalimNumDropDown={() => {}}
          setSelectNumber={() => {}}
          setPreviousNumber={() => {}}
          previousNumber={[]}
          AssignNumber={async (phoneNumber) => {
            // After purchase, refresh the phone numbers list
            await fetchPhoneNumbers()
            setShowClaimPopup(false)
          }}
          selectedUSer={userData}
        />
      )}
    </div>
  )
}

export default AgencyPhoneNumbers
