import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import OldCnamVoiceStir from '@/components/twiliohub/twilioExtras/OldCnamVoiceStir'

const TwilioIntegrations = ({
  showVoiceIntegration,
  trustProducts,
  handleClose,
}) => {
  const [selectedVoiceIntegrity, setSelectedVoiceIntegrity] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [loader, setLoader] = useState(false)

  const [friendlyName, setFriendlyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [averageCallsPerDay, setAverageCallsPerDay] = useState('')
  //show snack
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  //reset one field value to null when the other is filled
  useEffect(() => {
    // Only reset if one field has a value and the other is being set
    if (friendlyName && friendlyName.trim() !== '') {
      setSelectedVoiceIntegrity('')
    }
  }, [friendlyName])

  useEffect(() => {
    // Only reset if one field has a value and the other is being set
    if (
      selectedVoiceIntegrity &&
      String(selectedVoiceIntegrity).trim() !== ''
    ) {
      setFriendlyName('')
      setCompanySize('')
      setAverageCallsPerDay('')
    }
  }, [selectedVoiceIntegrity])

  //disable continue
  useEffect(() => {
    if (
      selectedVoiceIntegrity &&
      String(selectedVoiceIntegrity).trim() !== ''
    ) {
      setIsDisabled(false)
    } else if (!friendlyName || !companySize) {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [friendlyName, companySize, selectedVoiceIntegrity])

  //add integration
  const handleAddVoiceIntegration = async () => {
    try {
      setLoader(true)

      // If user selected an existing Voice Integrity product, use select API
      if (
        selectedVoiceIntegrity &&
        String(selectedVoiceIntegrity).trim() !== ''
      ) {
        // Import AddSelectedProduct API
        console.log('drodown selected')
        const { AddSelectedProduct } = await import(
          '@/apiservicescomponent/twilioapis/AddSelectedProduct'
        )
        const response = await AddSelectedProduct(selectedVoiceIntegrity)

        setLoader(false)
        if (response.status === true) {
          setShowSnack({
            type: SnackbarTypes.Success,
            message: response.message,
            isVisible: true,
          })
          // handleClose(response);
          setTimeout(() => {
            handleClose(response)
          }, 300)
        } else {
          setShowSnack({
            type: SnackbarTypes.Error,
            message:
              response.message || 'Failed to select Voice Integrity product',
            isVisible: true,
          })
        }
      } else {
        console.log('manually added voice integrity')
        // If user entered new product details, use create API
        const token = AuthToken()
        const ApiPath = Apis.createVoiceIntegrity
        const ApiData = {
          friendlyName: friendlyName,
          // "country": "US",
          companySize: companySize,
          averageCallsPerDay: averageCallsPerDay,
        }
        const response = await axios.post(ApiPath, ApiData, {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
        })

        if (response) {
          setLoader(false)
          console.log('response of add voice api is')
          const ApiResponse = response.data
          if (ApiResponse.status === true) {
            setShowSnack({
              type: SnackbarTypes.Success,
              message: ApiResponse.message,
              isVisible: true,
            })
            // handleClose(response);
            setTimeout(() => {
              handleClose(ApiResponse)
            }, 300)
          } else {
            console.log('got err')
            setShowSnack({
              message:
                ApiResponse.message ||
                'Failed to create Voice Integrity product',
              type: SnackbarTypes.Error,
              isVisible: true,
            })
          }
        }
      }
    } catch (error) {
      setLoader(false)
      console.log('Error occured in add voice api is', error)
      let errorMessage = 'An unexpected error occurred'

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with a status other than 2xx
          errorMessage =
            error.response.data?.message || JSON.stringify(error.response.data)
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'No response received from server.'
        } else {
          // Something happened in setting up the request
          errorMessage = error.message
        }
      } else {
        errorMessage = error.message || String(error)
      }
      setShowSnack({
        message: errorMessage,
        isVisible: true,
        type: SnackbarTypes.Error,
      })
    }
  }

  //stylles
  const styles = {
    normalTxt: {
      fontWeight: '500',
      fontSize: 15,
    },
    regular: {
      fontWeight: '500',
      fontSize: 15,
    },
  }

  return (
    <Modal
      open={showVoiceIntegration}
      onClose={() => {
        handleClose()
      }}
      BackdropProps={{
        timeout: 200,
        sx: {
          backgroundColor: '#00000020',
          backdropFilter: 'blur(20px)',
        },
      }}
      sx={{
        zIndex: 1300,
        // backgroundColor: "red"
      }}
    >
      <Box
        className="rounded-xl max-w-2xl w-full shadow-lg bg-white border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-6"
        // className="w-full h-[100%]"
      >
        <div className="h-[80svh] w-full flex flex-col items-center justify-between">
          <AgentSelectSnackMessage
            type={showSnack.type}
            message={showSnack.message}
            isVisible={showSnack.isVisible}
            hide={() => {
              setShowSnack({
                message: '',
                isVisible: false,
                type: SnackbarTypes.Error,
              })
            }}
          />
          <div className="w-full max-h-[80%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2">
            <div className="w-full flex flex-row items-center justify-between">
              <div style={{ fontWeight: '700', fontSize: 22 }}>
                New Voice Integrity Registration
              </div>
              <CloseBtn
                onClick={() => {
                  handleClose()
                }}
              />
            </div>
            {/* Select Voice Integrity from list */}
            {trustProducts?.voiceIntegrity?.all?.length > 1 && (
              <div className="mt-4">
                <div className="mb-2" style={styles.normalTxt}>
                  Select Voice Integrity from list
                </div>
                <OldCnamVoiceStir
                  twilioLocalData={trustProducts.voiceIntegrity.all}
                  value={selectedVoiceIntegrity}
                  setValue={setSelectedVoiceIntegrity}
                />
              </div>
            )}
            <div className="mt-6" style={styles.normalTxt}>
              Voice integrity friendly name*
            </div>
            <div className="w-full mt-2">
              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200"
                style={styles.normalTxt}
                placeholder="Voice integrity friendly name*"
                value={friendlyName}
                onChange={(e) => {
                  setFriendlyName(e.target.value)
                }}
              />
            </div>
            <div
              className="pt-4 mt-4 w-full"
              style={{
                fontWeight: '700',
                fontSize: 18,
                borderTop: '2px solid #00000010',
              }}
            >
              Company Information
            </div>
            <div
              className="mt-2"
              style={{ ...styles.regular, color: '#00000060' }}
            >
              This information may be sent to analytic vendors to register your
              numbers.
            </div>
            <div className="mt-4" style={styles.normalTxt}>
              {`Company size (Number of employes)*`}
            </div>
            <div className="w-full mt-2">
              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200"
                inputMode="numeric"
                type="number"
                pattern="[0-9]*"
                style={styles.normalTxt}
                placeholder="Enter numbers only"
                value={companySize}
                onChange={(e) => {
                  setCompanySize(e.target.value)
                }}
              />
              {companySize <= 0 && (
                <div className="flex flex-row items-center gap-2 mt-2">
                  <Image
                    alt="*"
                    src={'/twiliohubassets/errorInfo.jpg'}
                    height={15}
                    width={15}
                  />
                  <div className="text-red" style={styles.regular}>
                    Please enter a numerical value greate than 0
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4" style={styles.normalTxt}>
              {`Average calls per day*`}
            </div>
            <div className="w-full mt-2">
              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200"
                inputMode="numeric"
                type="number"
                pattern="[0-9]*"
                style={styles.normalTxt}
                placeholder="Enter numbers only"
                value={averageCallsPerDay}
                onChange={(e) => {
                  setAverageCallsPerDay(e.target.value)
                }}
              />
              {averageCallsPerDay <= 0 && (
                <div className="flex flex-row items-center gap-2 mt-2">
                  <Image
                    alt="*"
                    src={'/twiliohubassets/errorInfo.jpg'}
                    height={15}
                    width={15}
                  />
                  <div className="text-red" style={styles.regular}>
                    Please enter a numerical value greate than 0
                  </div>
                </div>
              )}
            </div>
            <div className="p-2 rounded-lg bg-[#00000005] mt-6">
              {`Twilio will approve your voice integrity registration based on the status of the associated business profile and submit these numbers to Verizon, AT&T, and T-Mobile. Carrier registration for active spam monitoring can take up to 48hrs. You’ll receive an email when the status is updated`}
            </div>
          </div>
          <div className="w-full flex flex-row items-center gap-4 mt-8 max-h-[20%]">
            <button
              className={`${isDisabled ? 'bg-btngray text-black' : 'bg-purple text-white'} w-full h-[50px] rounded-lg px-6 outline-none border-none`}
              onClick={handleAddVoiceIntegration}
              disabled={loader || isDisabled}
            >
              {loader ? (
                <CircularProgress size={25} sx={{ color: 'white' }} />
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default TwilioIntegrations
